
import React, { useState, useEffect, useCallback } from 'react';
import { Question, LeaderboardEntry } from '../types';
import { Shield, Clock, BrainCircuit, Loader2, Sparkles, AlertCircle, Trophy, History, RefreshCcw, Activity, GraduationCap, BarChart3, Settings2, Sliders, Download, FileText, CheckCircle2, XCircle, ArrowRight, Gauge, Check, Info } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { questions as staticQuestions } from '../data/questionData';
import { submitLeaderboardEntryCloud } from './cloudSync';


// Official CISSP Weights (2024 Standard)
const DOMAIN_WEIGHTS: { [key: string]: number } = {
  "Domain 1: Security and Risk Management": 0.15,
  "Domain 2: Asset Security": 0.10,
  "Domain 3: Security Architecture and Engineering": 0.13,
  "Domain 4: Communication and Network Security": 0.13,
  "Domain 5: Identity and Access Management (IAM)": 0.13,
  "Domain 6: Security Assessment and Testing": 0.12,
  "Domain 7: Security Operations": 0.13,
  "Domain 8: Software Development Security": 0.11
};

const PASSING_SCORE = 700; 
const SECONDS_PER_QUESTION = 72;

const getCombinedQuestions = (): Question[] => {
  const stored = localStorage.getItem('cissp_generated_questions');
  let generated: Question[] = [];
  if (stored) {
    try {
      generated = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse generated questions:", e);
    }
  }

  // Filter out any deleted static/custom question IDs
  const deletedStored = localStorage.getItem('cissp_deleted_question_ids');
  let deletedIds: string[] = [];
  if (deletedStored) {
    try {
      deletedIds = JSON.parse(deletedStored);
    } catch (e) {
      console.error("Failed to parse deleted question IDs:", e);
    }
  }

  const combined = [...staticQuestions, ...generated];
  if (deletedIds.length > 0) {
    const deletedSet = new Set(deletedIds);
    return combined.filter(q => !deletedSet.has(q.id));
  }
  return combined;
};

const shuffleOptions = (question: Question): Question => {
  const optionKeys = ['A', 'B', 'C', 'D'] as const;
  const originalCorrectText = question.options[question.correctOption as 'A' | 'B' | 'C' | 'D'];
  
  // Shuffle options randomly
  const shuffledKeys = [...optionKeys].sort(() => Math.random() - 0.5);
  const newOptions: { A: string; B: string; C: string; D: string } = {
    A: question.options[shuffledKeys[0]],
    B: question.options[shuffledKeys[1]],
    C: question.options[shuffledKeys[2]],
    D: question.options[shuffledKeys[3]],
  };

  // Find the new key of the original correct option text
  let newCorrectOption: 'A' | 'B' | 'C' | 'D' = 'C';
  for (const k of optionKeys) {
    if (newOptions[k] === originalCorrectText) {
      newCorrectOption = k;
      break;
    }
  }

  return {
    ...question,
    options: newOptions,
    correctOption: newCorrectOption,
  };
};

const getOfflineQuestion = (domain: string, difficulty: string, history: any[]): Question => {
  const usedIds = new Set(history.map(h => h.question.id));
  const cleanDomain = domain.toLowerCase();
  
  const combined = getCombinedQuestions();
  let candidates = combined.filter(q => {
    if (usedIds.has(q.id)) return false;
    const qDomain = q.domain.toLowerCase();
    const qSubdomain = q.subdomain?.toLowerCase() || '';
    return cleanDomain.includes(qDomain) || qDomain.includes(cleanDomain) || cleanDomain.includes(qSubdomain);
  });

  if (candidates.length === 0) {
    candidates = combined.filter(q => !usedIds.has(q.id));
  }

  if (candidates.length === 0) {
    candidates = [...combined];
  }

  let bestMatches = candidates.filter(q => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
  if (bestMatches.length === 0) {
    bestMatches = candidates;
  }

  const baseQuestion = bestMatches[Math.floor(Math.random() * bestMatches.length)];
  if (baseQuestion) {
    return shuffleOptions({
      ...baseQuestion,
      id: `${baseQuestion.id}-offline-${history.length}`
    });
  }

  return shuffleOptions({
    id: `fallback-q-${history.length}`,
    domain: domain,
    subdomain: "Security Management",
    difficulty: difficulty,
    stem: `As a CISSP professional addressing ${domain}, what is the critical first action when conducting risk assessment or aligning security under pressure?`,
    options: {
      A: "Immediately isolate affected systems and report the breach to regulatory authorities.",
      B: "Conduct a quantitative risk impact assessment to determine potential exposure first.",
      C: "Align the security controls with business objectives, ensuring senior management buy-in.",
      D: "Implement a defense-in-depth architecture regardless of cost to prevent any future occurrences."
    },
    correctOption: "C",
    explanation: "Business alignment and senior management approval/buy-in is always the foundational requirement for any security posture or decision in the CISSP curriculum."
  });
};

type ExamStatus = 'IDLE' | 'SETTINGS' | 'LOADING' | 'TESTING' | 'FINISHED';

interface CATState {
  status: ExamStatus;
  abilityEstimate: number;
  questionHistory: { question: Question; answer: string; isCorrect: boolean; weight: number }[];
  timeRemaining: number;
  currentDifficulty: 'Basic' | 'Moderate' | 'Hard';
  minItems: number;
  maxItems: number;
}

const ExamSimulator: React.FC = () => {
  const [state, setState] = useState<CATState>({
    status: 'IDLE',
    abilityEstimate: 500,
    questionHistory: [],
    timeRemaining: 10800, 
    currentDifficulty: 'Moderate',
    minItems: 100,
    maxItems: 150,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdminMode = sessionStorage.getItem('cissp_vault_admin') === 'true';
  const [selectedEngine, setSelectedEngine] = useState<string>(() => {
    if (sessionStorage.getItem('cissp_vault_admin') !== 'true') {
      return 'local-offline';
    }
    return localStorage.getItem('cissp_active_engine') || 'gemini-3.5-flash';
  });
  const [usedOfflineFallback, setUsedOfflineFallback] = useState<boolean>(false);

  // REAL EXAM MODE Logic: If 150 items is selected, hide performance metrics
  const isRealExamMode = state.maxItems === 150;

  useEffect(() => {
    let timer: any;
    if (state.status === 'TESTING' && state.timeRemaining > 0) {
      timer = setInterval(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    }
    if (state.timeRemaining <= 0 && state.status === 'TESTING') {
      setState(prev => ({ ...prev, status: 'FINISHED' }));
    }
    return () => clearInterval(timer);
  }, [state.status, state.timeRemaining]);

  // Leaderboard automatic submission
  useEffect(() => {
    if (state.status === 'FINISHED' && state.questionHistory.length > 0) {
      const activeCode = sessionStorage.getItem('cissp_vault_code') || 'CISSP2026';
      
      let candidateName = '';
      const storedCodes = localStorage.getItem('cissp_invite_codes');
      if (storedCodes) {
        try {
          const codes = JSON.parse(storedCodes);
          const matched = codes.find((c: any) => c.code.toUpperCase() === activeCode.toUpperCase());
          if (matched && matched.candidateName) {
            candidateName = matched.candidateName;
          }
        } catch (e) {}
      }
      
      if (!candidateName) {
        if (activeCode === 'ADMIN') {
          candidateName = 'System Administrator';
        } else if (activeCode === 'CISSP2026') {
          candidateName = 'Default Student';
        } else {
          candidateName = `Candidate (${activeCode})`;
        }
      }

      // Check if we already logged this specific finished session to avoid duplicates
      const sessionKey = `cissp_exam_session_${state.questionHistory.length}_${state.abilityEstimate}`;
      const isAlreadyLogged = sessionStorage.getItem(sessionKey) === 'true';
      if (!isAlreadyLogged) {
        sessionStorage.setItem(sessionKey, 'true');
        const newEntry: LeaderboardEntry = {
          id: `cat-${Date.now()}`,
          code: activeCode,
          name: candidateName,
          score: Math.round(state.abilityEstimate),
          type: 'CAT Exam',
          questionsCount: state.questionHistory.length,
          timestamp: new Date().toISOString(),
          passed: state.abilityEstimate >= PASSING_SCORE
        };

        // Fire and forget async call to submit score
        submitLeaderboardEntryCloud(newEntry).catch(e => console.error("Leaderboard submit failed", e));
      }
    }
  }, [state.status, state.abilityEstimate, state.questionHistory]);

  const getNextTargetDomain = (history: any[]) => {
    const domainCounts: { [key: string]: number } = {};
    Object.keys(DOMAIN_WEIGHTS).forEach(d => domainCounts[d] = 0);
    
    history.forEach(h => {
      const dKey = Object.keys(DOMAIN_WEIGHTS).find(k => k.includes(h.question.domain)) || h.question.domain;
      domainCounts[dKey] = (domainCounts[dKey] || 0) + 1;
    });

    const total = history.length || 1;
    const currentGaps = Object.keys(DOMAIN_WEIGHTS).map(d => ({
      name: d,
      gap: DOMAIN_WEIGHTS[d] - (domainCounts[d] / total)
    }));

    return currentGaps.sort((a, b) => b.gap - a.gap)[0].name;
  };

  const generateNextQuestion = useCallback(async (difficulty: string, history: any[], min: number, max: number) => {
    setState(prev => ({ ...prev, status: 'LOADING' }));
    const targetDomain = getNextTargetDomain(history);

    if (selectedEngine === 'local-offline') {
      // Simulate real engine calculation lag and load locally
      setTimeout(() => {
        const q = getOfflineQuestion(targetDomain, difficulty, history);
        setCurrentQuestion(q);
        setUsedOfflineFallback(false);
        setState(prev => ({ ...prev, status: 'TESTING' }));
      }, 600);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are the CISSP CAT Engine. 
        Item #${history.length + 1} for this candidate.
        
        PARAMETER CONSTRAINTS:
        - Primary Domain: ${targetDomain}
        - Difficulty Level: ${difficulty}
        - Perspective: Management/Business Alignment
        
        MANDATORY ITEM STRUCTURE:
        1. Scenario: Organizational situation (2-4 concise sentences).
        2. Stem: Ask for the BEST, MOST, or FIRST action.
        3. Options: 4 choices (A, B, C, D). All plausible, but only one is BEST.
      `;

      const response = await ai.models.generateContent({
        model: selectedEngine,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              domain: { type: Type.STRING },
              subdomain: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              stem: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
                required: ["A", "B", "C", "D"]
              },
              correctOption: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["id", "domain", "subdomain", "difficulty", "stem", "options", "correctOption", "explanation"]
          }
        }
      });

      const q = JSON.parse(response.text || "{}") as Question;
      setCurrentQuestion(q);
      setUsedOfflineFallback(false);
      setState(prev => ({ ...prev, status: 'TESTING' }));
    } catch (error) {
      console.warn("CAT Engine API error, triggering automated Offline Reserve Fallback:", error);
      // Smoothly activate Offline Reserve Fallback to save progress and avoid 503 disruption
      const fallbackQ = getOfflineQuestion(targetDomain, difficulty, history);
      setCurrentQuestion(fallbackQ);
      setUsedOfflineFallback(true);
      setState(prev => ({ ...prev, status: 'TESTING' }));
    }
  }, [selectedEngine]);

  const startExam = () => {
    const sessionTime = state.maxItems * SECONDS_PER_QUESTION;
    setUsedOfflineFallback(false);
    setState(prev => ({ ...prev, timeRemaining: sessionTime }));
    generateNextQuestion(state.currentDifficulty, [], state.minItems, state.maxItems);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;
    setIsSubmitting(true);

    const isCorrect = selectedOption === currentQuestion.correctOption;
    
    let abilityChange = 0;
    const diffWeights = { 'Basic': 25, 'Moderate': 45, 'Hard': 75 };
    const step = diffWeights[state.currentDifficulty] || 40;

    if (isCorrect) {
      abilityChange = step;
    } else {
      abilityChange = -step * 0.6;
    }

    const newAbility = Math.max(100, Math.min(1000, state.abilityEstimate + abilityChange));
    const newHistory = [...state.questionHistory, { question: currentQuestion, answer: selectedOption, isCorrect, weight: 1 }];
    
    let nextDifficulty = state.currentDifficulty;
    if (isCorrect) {
      if (state.currentDifficulty === 'Basic') nextDifficulty = 'Moderate';
      else nextDifficulty = 'Hard';
    } else {
      if (state.currentDifficulty === 'Hard') nextDifficulty = 'Moderate';
      else nextDifficulty = 'Basic';
    }

    const itemsCount = newHistory.length;
    if (itemsCount >= state.maxItems) {
      setState(prev => ({ ...prev, status: 'FINISHED', abilityEstimate: newAbility, questionHistory: newHistory }));
    } else {
      setState(prev => ({ 
        ...prev, 
        abilityEstimate: newAbility, 
        questionHistory: newHistory, 
        currentDifficulty: nextDifficulty 
      }));
      setSelectedOption(null);
      await generateNextQuestion(nextDifficulty, newHistory, state.minItems, state.maxItems);
    }
    setIsSubmitting(false);
  };

  const downloadTranscript = () => {
    const timestamp = new Date().toLocaleString();
    let content = `CISSP ADAPTIVE CAT EXAM TRANSCRIPT\n`;
    content += `====================================================\n`;
    content += `Generated: ${timestamp}\n`;
    content += `Final Ability Estimate: ${Math.round(state.abilityEstimate)}\n`;
    content += `Status: ${state.abilityEstimate >= PASSING_SCORE ? 'PROVISIONALLY PASSED' : 'BELOW PASSING STANDARD'}\n`;
    content += `Total Items Completed: ${state.questionHistory.length}\n`;
    content += `====================================================\n\n`;

    state.questionHistory.forEach((h, i) => {
      content += `ITEM ${i + 1}\n--------\n`;
      content += `Domain: ${h.question.domain}\n`;
      content += `Difficulty: ${h.question.difficulty}\n`;
      content += `Question: ${h.question.stem}\n\n`;
      Object.entries(h.question.options).forEach(([k, v]) => { content += `  [${k}] ${v}\n`; });
      content += `\nCorrect Answer: [${h.question.correctOption}]\n`;
      content += `Result: ${h.isCorrect ? 'CORRECT' : 'INCORRECT'}\n\n`;
      content += `Rationale: ${h.question.explanation}\n`;
      content += `\n----------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CISSP_CAT_Transcript_${Date.now()}.txt`;
    a.click();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (state.status === 'IDLE' || state.status === 'SETTINGS') {
    return (
      <div className="h-full flex items-center justify-center p-3 sm:p-4 bg-slate-50/50 overflow-y-auto">
        <div className="max-w-xl w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 p-5 sm:p-10 text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
             <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Adaptive Simulation</h2>
             <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
               Engineered to mirror the official ISC2 CAT experience. The system calibrates difficulty after every single item.
             </p>
          </div>

          <div className="bg-slate-50 rounded-[1.2rem] sm:rounded-[1.5rem] p-4 sm:p-6 space-y-4 sm:space-y-5 text-left border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Session Control</h3>
              </div>
              <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2 w-fit">
                <Clock className="w-3 h-3 text-rose-500" />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">{formatTime(state.maxItems * SECONDS_PER_QUESTION)} Limit</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Fixed Items</label>
                <input 
                  type="range" min="10" max="150" step="5"
                  value={state.maxItems}
                  onChange={(e) => setState(p => ({...p, maxItems: parseInt(e.target.value)}))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-900">
                  <span>10 items</span>
                  <span className="text-indigo-600 font-black">{state.maxItems} items</span>
                  <span>150 items</span>
                </div>
              </div>
            </div>
            {isRealExamMode && (
              <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-1">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[9px] sm:text-[10px] text-indigo-800 font-bold leading-tight uppercase tracking-tighter">
                  Real Exam Mode Engaged: Performance gauges and calibration stats will be hidden during this 150-item session.
                </p>
              </div>
            )}

            {/* AI Agent Engine Selector */}
            {isAdminMode && (
              <div className="space-y-2.5 pt-4 border-t border-slate-200/60 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                    Active AI Agent / Engine
                  </label>
                  {selectedEngine === 'local-offline' ? (
                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Zero API Load
                    </span>
                  ) : (
                    <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                      Live API Active
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <select 
                    value={selectedEngine}
                    onChange={(e) => {
                      setSelectedEngine(e.target.value);
                      localStorage.setItem('cissp_active_engine', e.target.value);
                    }}
                    className="w-full bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer transition-all pr-10"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard AI - Excellent Reasoning)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast AI - Recommended when traffic is high)</option>
                    <option value="local-offline">Local Offline Engine (100% Free - Bypasses AI API load entirely)</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">
                  {selectedEngine === 'gemini-3.5-flash' && "• Uses standard high-demand model. If experiencing temporary 503 spikes, switch to Flash Lite or Local."}
                  {selectedEngine === 'gemini-3.1-flash-lite' && "• Uses high-speed lightweight model. Great for bypassing heavy traffic on standard models."}
                  {selectedEngine === 'local-offline' && "• No API load. Runs locally using curated offline bank questions and custom calibration."}
                </p>
              </div>
            )}
          </div>

          <button onClick={startExam} className="w-full py-3.5 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl group">
             Initialize Simulation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'FINISHED') {
    const passed = state.abilityEstimate >= PASSING_SCORE;
    return (
      <div className="h-full overflow-hidden bg-slate-50 flex flex-col p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">
             <div className={`rounded-[2rem] p-10 shadow-2xl relative overflow-hidden text-white ${passed ? 'bg-emerald-600' : 'bg-rose-600'} animate-in slide-in-from-top-4`}>
                <div className="relative z-10 flex items-center gap-10">
                   <div className="w-32 h-32 rounded-full border-[8px] border-white/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-3xl font-black">{Math.round(state.abilityEstimate)}</span>
                      <span className="text-[9px] font-bold opacity-60 uppercase">Estimate</span>
                   </div>
                   <div className="flex-1 space-y-2">
                      <h2 className="text-3xl font-black uppercase tracking-tight">
                        {passed ? 'PROVISIONALLY PASSED' : 'BELOW PASSING STANDARD'}
                      </h2>
                      <p className="text-white/80 font-medium text-sm">
                        Session Concluded. Total items: {state.questionHistory.length}.
                      </p>
                      <div className="flex gap-2 pt-4">
                         <button onClick={downloadTranscript} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md transition-all">
                            <Download className="w-4 h-4" /> Download Transcript
                         </button>
                         <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md transition-all">
                            <RefreshCcw className="w-4 h-4" /> Restart
                         </button>
                      </div>
                   </div>
                </div>
             </div>
             {/* ... rest of review UI ... */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfdfe] overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 shrink-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
           <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {!isRealExamMode && (
                <div className="flex flex-col">
                  <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estimated Ability</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(state.abilityEstimate / 1000) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{Math.round(state.abilityEstimate)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Item Progress</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-slate-900 leading-none">{state.questionHistory.length + 1}</span>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">/ {state.maxItems}</span>
                </div>
              </div>

              {!isRealExamMode && (
                <div className="flex flex-col">
                  <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Calibration</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border ${
                      state.currentDifficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      state.currentDifficulty === 'Moderate' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {state.currentDifficulty}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Engine</span>
                <div className="flex items-center gap-1.5">
                  <div className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border ${
                    usedOfflineFallback || selectedEngine === 'local-offline'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-extrabold'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse'
                  }`}>
                    {usedOfflineFallback ? 'Offline Reserve' : selectedEngine === 'local-offline' ? 'Local Engine' : selectedEngine === 'gemini-3.1-flash-lite' ? 'Flash Lite' : 'Gemini 3.5'}
                  </div>
                </div>
              </div>
           </div>

           <div className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 w-fit ml-auto sm:ml-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span className="text-xs font-black font-mono text-slate-700">{formatTime(state.timeRemaining)}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {state.status === 'LOADING' ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in">
             <div className="relative mb-4">
               <div className="w-12 h-12 border-[4px] border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
               <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Synchronizing next challenge...</p>
          </div>
        ) : currentQuestion && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-12 custom-scrollbar">
               <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10">
                 {usedOfflineFallback && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 animate-in slide-in-from-top-2">
                       <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Gemini API Load Spike Detected</p>
                          <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tighter mt-0.5">
                             The simulator has seamlessly engaged the Offline Reserve Question Bank. Your CAT calibration and exam scoring remain active!
                          </p>
                       </div>
                    </div>
                 )}
                 <div className="flex items-center gap-2 flex-wrap animate-in fade-in">
                    <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-indigo-50 border border-indigo-100 rounded text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentQuestion.domain}</div>
                    {!isRealExamMode && <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-50 border border-slate-200 rounded text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentQuestion.difficulty} Target</div>}
                 </div>

                 <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 leading-[1.3] tracking-tight">{currentQuestion.stem}</h3>

                 <div className="grid grid-cols-1 gap-3">
                    {Object.entries(currentQuestion.options).map(([key, val]) => (
                      <button 
                        key={key}
                        onClick={() => setSelectedOption(key)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3 sm:gap-4 group relative ${
                          selectedOption === key ? 'border-indigo-600 bg-indigo-50/40' : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50'
                        }`}
                      >
                         <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-all ${
                           selectedOption === key ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                         }`}>{key}</span>
                         <span className={`mt-1 sm:mt-1.5 font-bold text-sm sm:text-base text-slate-600 leading-snug transition-colors ${selectedOption === key ? 'text-indigo-900' : 'group-hover:text-slate-900'}`}>{val}</span>
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between shrink-0 shadow-lg gap-3 select-none">
               <div className="flex items-center gap-2 pl-2 text-slate-300">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Active Exam Boundary (CAT Engine)</span>
               </div>
               <button 
                 disabled={!selectedOption || isSubmitting}
                 onClick={handleSubmitAnswer}
                 className="w-full sm:w-auto px-8 sm:px-16 py-3.5 sm:py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md disabled:opacity-20 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Commit Response <Sparkles className="w-4 h-4" /></>}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSimulator;
