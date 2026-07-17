
import React, { useState, useEffect } from 'react';
import { Question, QuizState, LeaderboardEntry } from '../types';
import { questions as staticQuestions } from '../data/questionData';
import { mindMapData } from '../data/mindMapData';
import { Play, Clock, CheckCircle, XCircle, Award, Target, Settings2, ArrowRight, RotateCcw, Check, Loader2, Sparkles, ChevronDown, ListChecks, BrainCircuit, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { submitLeaderboardEntryCloud } from './cloudSync';

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

const QuizDashboard: React.FC = () => {
  const [targetDomain, setTargetDomain] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const isAdminMode = sessionStorage.getItem('cissp_vault_admin') === 'true';
  const [selectedEngine, setSelectedEngine] = useState<string>(() => {
    if (sessionStorage.getItem('cissp_vault_admin') !== 'true') {
      return 'local-offline';
    }
    return localStorage.getItem('cissp_active_engine') || 'gemini-3.5-flash';
  });
  const [usedOfflineFallback, setUsedOfflineFallback] = useState<boolean>(false);
  const [state, setState] = useState<QuizState>({
    isActive: false,
    currentDomain: 'All',
    difficultyFilter: 'Moderate',
    questionStyle: 'Scenario',
    questions: [],
    currentIndex: 0,
    userAnswers: {},
    score: 0,
    isReview: false,
    timeRemaining: 1800,
  });

  const domains = Array.from(new Set(mindMapData.children?.map(d => d.label))).sort();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (state.isActive && !state.isReview && state.timeRemaining > 0) {
      timer = setInterval(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.isActive, state.isReview, state.timeRemaining]);

  const generateAIQuestions = async () => {
    setIsGenerating(true);
    setUsedOfflineFallback(false);

    if (selectedEngine === 'local-offline') {
      // Offline local engine setup
      setTimeout(() => {
        const targetDomains = targetDomain === 'All' ? domains : [targetDomain];
        let filtered = (getCombinedQuestions() as any[]).filter(q => 
          targetDomain === 'All' || q.domain === targetDomain || targetDomains.some(td => q.domain.includes(td) || td.includes(q.domain))
        );
        if (filtered.length < 10) {
          const remaining = (getCombinedQuestions() as any[]).filter(q => !filtered.some(fq => fq.id === q.id));
          filtered = [...filtered, ...remaining];
        }
        const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
        
        setState(prev => ({
          ...prev,
          isActive: true,
          questions: shuffled,
          currentIndex: 0,
          userAnswers: {},
          score: 0,
          isReview: false,
          timeRemaining: 1800
        }));
        setIsGenerating(false);
      }, 500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const targetDomains = targetDomain === 'All' ? domains : [targetDomain];
      const contextNodes = mindMapData.children?.filter(c => targetDomains.includes(c.label)) || [];
      const context = JSON.stringify(contextNodes);

      const styleInstruction = state.questionStyle === 'Scenario' 
        ? "Format: SCENARIO-BASED ONLY. Create a complex professional situation and ask for the BEST or MOST appropriate action/concept."
        : "Format: DIRECT CONCEPTUAL QUESTIONS. Ask directly about definitions, properties, hierarchy, or rules of the concepts without fluff.";

      const prompt = `
        You are a world-class CISSP Exam Architect. 
        Generate 10 unique, high-quality MCQs for the following CISSP Domains: ${targetDomains.join(", ")}.
        
        CONTEXT FROM STUDY GUIDE:
        ${context}

        STRICT REQUIREMENTS:
        1. Difficulty: ${state.difficultyFilter}.
        2. ${styleInstruction}
        3. Difficulty Profiles:
           - Basic: Foundational concepts and definitions.
           - Moderate: Application of principles and multi-step reasoning.
           - Hard: Expert-level synthesis and trade-off analysis.
        4. Options: 4 plausible choices (A, B, C, D).
        5. Rationale: Provide a detailed professional explanation.
      `;

      const response = await ai.models.generateContent({
        model: selectedEngine,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
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
        }
      });

      const generatedQuestions: Question[] = JSON.parse(response.text || "[]");
      if (generatedQuestions.length === 0) throw new Error("No questions generated");

      setState(prev => ({
        ...prev,
        isActive: true,
        questions: generatedQuestions,
        currentIndex: 0,
        userAnswers: {},
        score: 0,
        isReview: false,
        timeRemaining: 1800
      }));
    } catch (error) {
      console.warn("Quiz AI Generation failed, smoothly transitioning to Offline Curated Reserve Bank:", error);
      setUsedOfflineFallback(true);
      
      const targetDomains = targetDomain === 'All' ? domains : [targetDomain];
      let filtered = (getCombinedQuestions() as any[]).filter(q => 
        targetDomain === 'All' || q.domain === targetDomain || targetDomains.some(td => q.domain.includes(td) || td.includes(q.domain))
      );
      if (filtered.length < 10) {
        const remaining = (getCombinedQuestions() as any[]).filter(q => !filtered.some(fq => fq.id === q.id));
        filtered = [...filtered, ...remaining];
      }
      const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
      
      setState(prev => ({ 
        ...prev, 
        isActive: true, 
        questions: shuffled, 
        currentIndex: 0, 
        userAnswers: {}, 
        score: 0, 
        isReview: false, 
        timeRemaining: 1800 
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (optionKey: string) => {
    if (!state.questions[state.currentIndex]) return;
    setState(prev => ({ ...prev, userAnswers: { ...prev.userAnswers, [prev.questions[prev.currentIndex].id]: optionKey } }));
  };

  const submitQuiz = async () => {
    let score = 0;
    state.questions.forEach(q => { if (state.userAnswers[q.id] === q.correctOption) score++; });
    setState(prev => ({ ...prev, isReview: true, score }));

    // Record score on leaderboard
    if (state.questions.length > 0) {
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

      const scorePercent = Math.round((score / state.questions.length) * 100);
      const newEntry: LeaderboardEntry = {
        id: `quiz-${Date.now()}`,
        code: activeCode,
        name: candidateName,
        score: scorePercent,
        type: 'Practice Quiz',
        questionsCount: state.questions.length,
        timestamp: new Date().toISOString(),
        passed: scorePercent >= 70
      };

      await submitLeaderboardEntryCloud(newEntry);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!state.isActive) {
    return (
      <div className="p-3 sm:p-10 max-w-4xl mx-auto min-h-full flex items-center">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-12 border border-slate-100 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 sm:mb-10">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 w-fit"><Target className="w-6 h-6" /></div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Exam Simulator</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">Configure your AI-powered CISSP practice session.</p>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <Settings2 className="w-3 h-3" /> Select Domain
                </label>
                <div className="relative">
                  <select 
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 hover:border-indigo-100 rounded-2xl p-3.5 sm:p-4 text-slate-800 text-sm sm:text-base font-bold focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer transition-all pr-12"
                  >
                    <option value="All">All Loaded Domains</option>
                    {domains.map(d => (<option key={d} value={d}>{d}</option>))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <BrainCircuit className="w-3 h-3" /> Question Style
                </label>
                <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-1">
                  {['Direct', 'Scenario'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setState(prev => ({...prev, questionStyle: style as any}))}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all ${
                        state.questionStyle === style ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {style === 'Direct' ? 'Direct Concept' : 'Scenario Based'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Engine Picker */}
            {isAdminMode && (
              <div className="p-4 sm:p-5 bg-slate-50 rounded-[1.2rem] sm:rounded-[1.5rem] border border-slate-100 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" /> Active AI Agent / Engine
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
                    className="w-full appearance-none bg-white border border-slate-200 hover:border-indigo-100 rounded-xl p-3 text-slate-800 text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer transition-all pr-12"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard AI - Excellent Reasoning)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast AI - Recommended when traffic is high)</option>
                    <option value="local-offline">Local Offline Engine (100% Free - Bypasses AI API load entirely)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">
                  {selectedEngine === 'gemini-3.5-flash' && "• Uses standard high-demand model. If experiencing temporary 503 spikes, switch to Flash Lite or Local."}
                  {selectedEngine === 'gemini-3.1-flash-lite' && "• Uses high-speed lightweight model. Great for bypassing heavy traffic on standard models."}
                  {selectedEngine === 'local-offline' && "• No API load. Runs locally using curated offline bank questions."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <Award className="w-3 h-3" /> Exam Difficulty
                </label>
                <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-1">
                  {['Basic', 'Moderate', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setState(prev => ({...prev, difficultyFilter: diff}))}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all ${
                        state.difficultyFilter === diff ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  disabled={isGenerating}
                  onClick={generateAIQuestions}
                  className="w-full h-[52px] sm:h-[56px] bg-indigo-600 text-white rounded-2xl font-black text-sm sm:text-base hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing...</>) : (<><Sparkles className="w-5 h-5 fill-current" /> Start AI Simulation</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = state.questions[state.currentIndex];

  if (state.isReview) {
    const percentage = Math.round((state.score / state.questions.length) * 100);
    return (
      <div className="p-3 sm:p-8 max-w-5xl mx-auto h-full overflow-y-auto">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 ${percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {percentage}%
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Knowledge Review</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">You identified {state.score} of {state.questions.length} core concepts correctly.</p>
            </div>
          </div>
          <button onClick={() => setState(prev => ({...prev, isActive: false}))} className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm">
            <RotateCcw className="w-4 h-4" /> Restart Session
          </button>
        </div>
        <div className="space-y-4 sm:space-y-6 pb-12">
          {state.questions.map((q, idx) => {
            const userAns = state.userAnswers[q.id];
            const isCorrect = userAns === q.correctOption;
            return (
              <div key={q.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-8 border border-slate-100 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase mr-3">ITEM {idx + 1}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{q.domain} &raquo; {q.subdomain}</span>
                  </div>
                  {isCorrect ? <CheckCircle className="text-emerald-500 shrink-0 w-5 h-5 sm:w-6 sm:h-6" /> : <XCircle className="text-rose-500 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <p className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6 leading-relaxed">{q.stem}</p>
                <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-indigo-900 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-indigo-400">Professional Rationale</div>
                  <div className="whitespace-pre-line leading-relaxed">{q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-3 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 sm:mb-6 select-none">
        <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-start bg-white/50 border border-slate-100 px-3 py-2 rounded-2xl sm:bg-transparent sm:border-0 sm:p-0">
          <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
          <div className="flex-1 sm:flex-none w-24 sm:w-48 h-1.5 bg-slate-200 rounded-full mx-2">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{width: `${((state.currentIndex + 1) / state.questions.length) * 100}%`}}></div>
          </div>
          <span className="text-xs font-black text-slate-900 shrink-0">{state.currentIndex + 1} / {state.questions.length}</span>
        </div>
        <div className="flex items-center justify-center gap-2 font-black text-xs sm:text-sm text-slate-600 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-2xl self-end sm:self-auto">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" /> {formatTime(state.timeRemaining)}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex-1 flex flex-col overflow-hidden border border-slate-50">
        <div className="p-5 sm:p-12 flex-1 overflow-y-auto">
          {usedOfflineFallback && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Gemini API Load Spike Detected</p>
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tighter mt-0.5">
                  The simulator has seamlessly engaged the Offline Curated Question Bank. Your practice session remains fully active!
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-5 sm:mb-8">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{currentQ.domain}</span>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{currentQ.difficulty}</span>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{state.questionStyle}</span>
            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${
              usedOfflineFallback || selectedEngine === 'local-offline'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-extrabold'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              Engine: {usedOfflineFallback ? 'Offline Reserve' : selectedEngine === 'local-offline' ? 'Local' : selectedEngine === 'gemini-3.1-flash-lite' ? 'Flash Lite' : 'Gemini 3.5'}
            </span>
          </div>
          
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 leading-[1.3] mb-6 sm:mb-12">
            {currentQ.stem}
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {Object.entries(currentQ.options).map(([key, val]) => (
              <button 
                key={key}
                onClick={() => handleAnswer(key)}
                className={`w-full text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex items-start gap-3 sm:gap-4 group ${
                  state.userAnswers[currentQ.id] === key ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 transition-all ${
                  state.userAnswers[currentQ.id] === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}>
                  {key}
                </span>
                <span className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">{val}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between px-6 sm:px-12 select-none">
          <button disabled={state.currentIndex === 0} onClick={() => setState(prev => ({...prev, currentIndex: prev.currentIndex - 1}))} className="px-6 py-2.5 rounded-xl text-slate-400 font-bold hover:text-slate-900 transition-colors disabled:opacity-30 text-sm">Back</button>
          {state.currentIndex === state.questions.length - 1 ? (
            <button onClick={submitQuiz} className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm">Finish Exam</button>
          ) : (
            <button onClick={() => setState(prev => ({...prev, currentIndex: prev.currentIndex + 1}))} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-1.5 text-sm">Continue <ArrowRight className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
