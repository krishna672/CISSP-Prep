import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, Users, Trash2, PlusCircle, Copy, Check, 
  Settings, Lock, KeyRound, AlertTriangle, RefreshCw, Eye, EyeOff,
  Brain, Sparkles, Save, BookOpen, Award, AlertCircle, HelpCircle, Dices, ChevronDown, CheckCircle2, ListChecks
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';
import { questions as staticQuestions } from '../data/questionData';

interface InviteCode {
  code: string;
  createdAt: string;
  createdBy: string;
  usedCount: number;
  candidateName?: string;
}

const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';
const DEFAULT_INVITE_CODE = 'CISSP2026';

const DOMAINS_LIST = [
  "Domain 1: Security and Risk Management",
  "Domain 2: Asset Security",
  "Domain 3: Security Architecture and Engineering",
  "Domain 4: Communication and Network Security",
  "Domain 5: Identity and Access Management (IAM)",
  "Domain 6: Security Assessment and Testing",
  "Domain 7: Security Operations",
  "Domain 8: Software Development Security"
];

const AdminPanel: React.FC = () => {
  const [adminTab, setAdminTab] = useState<'invite' | 'ai-studio' | 'manual-studio'>('invite');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');
  const [codePendingDelete, setCodePendingDelete] = useState<string | null>(null);
  
  // Admin passcode rotation states
  const [adminPasscode, setAdminPasscode] = useState(DEFAULT_ADMIN_PASSCODE);
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);

  // AI Question Studio States
  const [selectedDomain, setSelectedDomain] = useState<string>('Domain 1: Security and Risk Management');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Basic' | 'Moderate' | 'Hard'>('Moderate');
  const [subdomainInput, setSubdomainInput] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<string>('gemini-3.5-flash');
  const [numQuestions, setNumQuestions] = useState<number>(1);
  const [generationError, setGenerationError] = useState<string>('');
  const [generatedPool, setGeneratedPool] = useState<Question[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});

  // Manual Custom Question States
  const [manualDomain, setManualDomain] = useState<string>('Domain 1: Security and Risk Management');
  const [manualDifficulty, setManualDifficulty] = useState<'Basic' | 'Moderate' | 'Hard'>('Moderate');
  const [manualSubdomain, setManualSubdomain] = useState<string>('');
  const [manualStem, setManualStem] = useState<string>('');
  const [manualOptionA, setManualOptionA] = useState<string>('');
  const [manualOptionB, setManualOptionB] = useState<string>('');
  const [manualOptionC, setManualOptionC] = useState<string>('');
  const [manualOptionD, setManualOptionD] = useState<string>('');
  const [manualCorrectOption, setManualCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [manualExplanation, setManualExplanation] = useState<string>('');
  const [manualPrimaryConcepts, setManualPrimaryConcepts] = useState<string>('');
  const [manualRefTitle, setManualRefTitle] = useState<string>('');
  const [manualRefUrl, setManualRefUrl] = useState<string>('');
  const [manualError, setManualError] = useState<string>('');
  const [manualSuccess, setManualSuccess] = useState<string>('');

  // Load invite codes, admin passcode, and generated questions pool
  useEffect(() => {
    // Admin Passcode
    const storedAdminPass = localStorage.getItem('cissp_admin_passcode');
    if (storedAdminPass) {
      setAdminPasscode(storedAdminPass);
    } else {
      localStorage.setItem('cissp_admin_passcode', DEFAULT_ADMIN_PASSCODE);
    }

    // Invite Codes
    const storedCodes = localStorage.getItem('cissp_invite_codes');
    if (storedCodes) {
      try {
        setInviteCodes(JSON.parse(storedCodes));
      } catch (e) {
        initializeDefaultCodes();
      }
    } else {
      initializeDefaultCodes();
    }

    // Generated Questions Pool
    const storedPool = localStorage.getItem('cissp_generated_questions');
    if (storedPool) {
      try {
        setGeneratedPool(JSON.parse(storedPool));
      } catch (e) {
        console.error("Failed to parse stored generated questions:", e);
      }
    }
  }, []);

  const initializeDefaultCodes = () => {
    const defaultList: InviteCode[] = [
      {
        code: DEFAULT_INVITE_CODE,
        createdAt: new Date().toISOString(),
        createdBy: 'System Default',
        usedCount: Number(localStorage.getItem('cissp_invite_used_count_' + DEFAULT_INVITE_CODE) || 0)
      }
    ];
    localStorage.setItem('cissp_invite_codes', JSON.stringify(defaultList));
    setInviteCodes(defaultList);
  };

  // Helper to generate a secure random 8-character code
  const handleGenerateRandomCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like I, O, 0, 1
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const fullCode = `CISSP-${randomPart}`;
    setNewCodeInput(fullCode);
  };

  // Create custom or random invite code
  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    const cleanCode = newCodeInput.trim().toUpperCase();
    
    if (!cleanCode) return;
    if (cleanCode.length < 4) {
      setCreateError('Invite code must be at least 4 characters long.');
      return;
    }

    if (inviteCodes.some(c => c.code === cleanCode)) {
      setCreateError('This invite code already exists.');
      return;
    }

    const newCodeObj: InviteCode = {
      code: cleanCode,
      createdAt: new Date().toISOString(),
      createdBy: 'Administrator',
      usedCount: 0,
      candidateName: candidateNameInput.trim() || `Candidate (${cleanCode})`
    };

    const updated = [newCodeObj, ...inviteCodes];
    localStorage.setItem('cissp_invite_codes', JSON.stringify(updated));
    setInviteCodes(updated);
    setNewCodeInput('');
    setCandidateNameInput('');
  };

  // Delete/Revoke a code
  const handleRevokeCode = (codeToRevoke: string) => {
    if (codePendingDelete !== codeToRevoke) {
      setCodePendingDelete(codeToRevoke);
      return;
    }

    const updated = inviteCodes.filter(c => c.code !== codeToRevoke);
    localStorage.setItem('cissp_invite_codes', JSON.stringify(updated));
    setInviteCodes(updated);
    setCodePendingDelete(null);
  };

  // Copy code to clipboard helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Rotate Admin Passcode
  const handleRotateAdminPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (oldPasscode !== adminPasscode) {
      setPasscodeError('Current admin passcode is incorrect.');
      return;
    }

    if (newPasscode.length < 6) {
      setPasscodeError('New passcode must be at least 6 characters long.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('New passcodes do not match.');
      return;
    }

    localStorage.setItem('cissp_admin_passcode', newPasscode);
    setAdminPasscode(newPasscode);
    setPasscodeSuccess('Master admin passcode updated successfully!');
    setOldPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
  };

  // AI Question Generation Lab
  const handleGenerateQuestion = async () => {
    setIsGeneratingQuestion(true);
    setGenerationError('');
    setGeneratedQuestions([]);
    setTestAnswers({});

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      setGenerationError("Google Gemini API Key is not configured. Please define GEMINI_API_KEY in the workspace environment settings.");
      setIsGeneratingQuestion(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are a senior ISC2 CISSP Psychometrician and Lead Exam Architect.
        Generate exactly ${numQuestions} highly realistic, professionally challenging CISSP exam question(s) of ${selectedDifficulty} difficulty targeting CISSP ${selectedDomain}.
        ${subdomainInput ? `Focus on Subdomain topic: "${subdomainInput}".` : ''}
        ${customPrompt ? `Incorporate this custom scenario/guidance: "${customPrompt}".` : ''}
        
        Guidelines for each question:
        - The question stem must be written in the scenario-based, conceptual, or executive management decision style of the actual CISSP exam.
        - Options must include four highly plausible professional options (A, B, C, D).
        - One option must be unequivocally correct according to standard ISC2/CISSP CBK consensus.
        - The explanation must be detailed, justifying the correct option AND explaining why each other option (distractor) is incorrect or less optimal in an enterprise management context.
        - Ensure variety in the scenarios and correct answers if multiple questions are being generated.
      `;

      const response = await ai.models.generateContent({
        model: selectedEngine,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: `An array of exactly ${numQuestions} generated CISSP questions.`,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique generated ID, e.g. gen-12345" },
                domain: { type: Type.STRING, description: "The exact CISSP domain name" },
                subdomain: { type: Type.STRING, description: "Subdomain or concept name" },
                difficulty: { type: Type.STRING, description: "Basic, Moderate, or Hard" },
                stem: { type: Type.STRING, description: "The scenario-based question stem" },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  },
                  required: ["A", "B", "C", "D"],
                },
                correctOption: { type: Type.STRING, description: "Exactly one uppercase character: A, B, C, or D" },
                explanation: { type: Type.STRING, description: "Detailed psychometric explanation" },
                primaryConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                references: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      accessed: { type: Type.STRING }
                    },
                    required: ["title"]
                  }
                }
              },
              required: ["id", "domain", "subdomain", "difficulty", "stem", "options", "correctOption", "explanation"]
            }
          }
        }
      });

      const text = response.text || '';
      let parsed = JSON.parse(text);
      
      if (!Array.isArray(parsed)) {
        if (typeof parsed === 'object' && parsed !== null) {
          parsed = [parsed];
        } else {
          throw new Error("Generated response is not a valid question array.");
        }
      }
      
      // Ensure IDs are unique and fields are populated
      const updatedQuestions = parsed.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `gen-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        domain: q.domain || selectedDomain,
        difficulty: q.difficulty || selectedDifficulty,
        subdomain: q.subdomain || subdomainInput || 'Security Architecture',
      }));

      // Validate structure
      for (const q of updatedQuestions) {
        if (!q.stem || !q.options || !q.correctOption || !q.explanation) {
          throw new Error("One or more generated questions has an invalid structure.");
        }
      }

      setGeneratedQuestions(updatedQuestions);
    } catch (e: any) {
      console.error(e);
      setGenerationError(e?.message || "AI Generation failed. Please try again or check the API key.");
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSaveSingleQuestion = (question: Question) => {
    const updated = [question, ...generatedPool];
    localStorage.setItem('cissp_generated_questions', JSON.stringify(updated));
    setGeneratedPool(updated);
    
    // Remove from draft list
    setGeneratedQuestions(prev => prev.filter(q => q.id !== question.id));
    setTestAnswers(prev => {
      const copy = { ...prev };
      delete copy[question.id];
      return copy;
    });
  };

  const handleSaveAllQuestions = () => {
    if (generatedQuestions.length === 0) return;
    const updated = [...generatedQuestions, ...generatedPool];
    localStorage.setItem('cissp_generated_questions', JSON.stringify(updated));
    setGeneratedPool(updated);
    setGeneratedQuestions([]);
    setTestAnswers({});
    alert(`Successfully saved all ${generatedQuestions.length} questions to practice and adaptive CAT pool!`);
  };

  const handleDiscardSingleQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
    setTestAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleDiscardAllQuestions = () => {
    setGeneratedQuestions([]);
    setTestAnswers({});
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = generatedPool.filter(q => q.id !== id);
    localStorage.setItem('cissp_generated_questions', JSON.stringify(updated));
    setGeneratedPool(updated);
  };

  const handleCreateManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');

    if (!manualStem.trim()) {
      setManualError('Question stem scenario is required.');
      return;
    }
    if (!manualOptionA.trim() || !manualOptionB.trim() || !manualOptionC.trim() || !manualOptionD.trim()) {
      setManualError('All options (A, B, C, and D) must be provided.');
      return;
    }
    if (!manualExplanation.trim()) {
      setManualError('An explanation/rationale is required.');
      return;
    }

    const concepts = manualPrimaryConcepts
      ? manualPrimaryConcepts.split(',').map(c => c.trim()).filter(Boolean)
      : ['Custom Practice', 'Manual Entrance'];

    const refs = [];
    if (manualRefTitle.trim()) {
      refs.push({
        title: manualRefTitle.trim(),
        url: manualRefUrl.trim() || 'https://www.isc2.org/Certifications/CISSP',
        accessed: new Date().toLocaleDateString()
      });
    } else {
      refs.push({
        title: 'Official ISC2 Guide Book',
        url: 'https://www.isc2.org/Certifications/CISSP',
        accessed: new Date().toLocaleDateString()
      });
    }

    const newQuestion: Question = {
      id: `manual-${Date.now()}`,
      domain: manualDomain,
      subdomain: manualSubdomain.trim() || 'Security Architecture',
      difficulty: manualDifficulty,
      stem: manualStem.trim(),
      options: {
        A: manualOptionA.trim(),
        B: manualOptionB.trim(),
        C: manualOptionC.trim(),
        D: manualOptionD.trim()
      },
      correctOption: manualCorrectOption,
      explanation: manualExplanation.trim(),
      primaryConcepts: concepts,
      references: refs
    };

    const updated = [newQuestion, ...generatedPool];
    localStorage.setItem('cissp_generated_questions', JSON.stringify(updated));
    setGeneratedPool(updated);

    // Reset inputs
    setManualStem('');
    setManualOptionA('');
    setManualOptionB('');
    setManualOptionC('');
    setManualOptionD('');
    setManualCorrectOption('A');
    setManualExplanation('');
    setManualPrimaryConcepts('');
    setManualRefTitle('');
    setManualRefUrl('');
    setManualSuccess(`Question successfully saved & deployed to the practice pool!`);

    setTimeout(() => setManualSuccess(''), 4000);
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Admin Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white relative overflow-hidden shadow-xl shadow-slate-950/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-black uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                Security Operations Center
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">CISSP Vault Admin Panel</h2>
              <p className="text-xs text-slate-400 font-medium">
                Generate questions with Gemini, monitor credential keys, and configure access policies.
              </p>
            </div>
            <div className="flex gap-4 items-center bg-slate-950/50 border border-slate-800/80 px-5 py-3 rounded-2xl shrink-0">
              <div className="text-center">
                <div className="text-xl font-mono font-black text-indigo-400">{inviteCodes.length}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Keys</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-xl font-mono font-black text-emerald-400">
                  {generatedPool.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-col sm:flex-row bg-slate-200/60 p-1.5 rounded-[1.3rem] gap-1 border border-slate-200/40 shadow-inner">
          <button
            onClick={() => setAdminTab('invite')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              adminTab === 'invite' 
                ? 'bg-white text-indigo-600 shadow-md border-b-2 border-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-500" />
            Invite & Access Keys
          </button>
          <button
            onClick={() => setAdminTab('ai-studio')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              adminTab === 'ai-studio' 
                ? 'bg-white text-indigo-600 shadow-md border-b-2 border-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
            AI Question Lab Studio
            {generatedPool.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100">
                {generatedPool.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('manual-studio')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              adminTab === 'manual-studio' 
                ? 'bg-white text-indigo-600 shadow-md border-b-2 border-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <ListChecks className="w-4 h-4 text-indigo-500" />
            Manual Question Editor
          </button>
        </div>

        {adminTab === 'invite' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            
            {/* Column 1 & 2: Invite Code Generator & List */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Generate Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Create Access Invite Codes</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Generate cryptographic single-use invite tokens (strictly 1 use per user).</p>
                  </div>
                </div>

                <form onSubmit={handleCreateCode} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="ENTER CODE OR GENERATE RANDOM"
                          value={newCodeInput}
                          onChange={(e) => { setNewCodeInput(e.target.value); setCreateError(''); }}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-xs text-slate-900 font-mono tracking-wider transition-all uppercase outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => { handleGenerateRandomCode(); setCreateError(''); }}
                        className="px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shrink-0"
                        title="Generate cryptographic random invite code"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Random</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign Candidate Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.G., JOHN DOE"
                      value={candidateNameInput}
                      onChange={(e) => setCandidateNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 transition-all uppercase outline-none"
                    />
                  </div>

                  {createError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!newCodeInput.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100"
                  >
                    Authorize New Invite Code
                  </button>
                </form>
              </div>

              {/* List Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Credentials Registry</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Verify active cryptographic invite codes below.</p>
                    </div>
                  </div>
                  <button
                    onClick={initializeDefaultCodes}
                    className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    Reset Defaults
                  </button>
                </div>

                {/* Grid of invite codes */}
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-1">
                  {inviteCodes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No active invite codes. Generate a code to grant student access.
                    </div>
                  ) : (
                    inviteCodes.map((item) => (
                      <div key={item.code} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <code className="text-sm font-mono font-black text-slate-950 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg tracking-wider block truncate">
                              {item.code}
                            </code>
                            {item.usedCount > 0 ? (
                              <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1 shrink-0">
                                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Fully Redeemed (1/1 Use)
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active & Available
                              </span>
                            )}
                          </div>
                          {item.candidateName && (
                            <div className="text-xs font-black text-indigo-600 uppercase tracking-wide mt-1 flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate:</span>
                              {item.candidateName}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-bold">Created:</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold">By:</span>
                            <span>{item.createdBy}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopyCode(item.code)}
                            className={`p-2 rounded-lg border transition-all ${
                              copiedCode === item.code 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                            title="Copy Code"
                          >
                            {copiedCode === item.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          
                          {codePendingDelete === item.code ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-2 py-1.5 rounded-lg">
                              <button
                                onClick={() => handleRevokeCode(item.code)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                title="Confirm Revocation"
                              >
                                <Check className="w-3 h-3" />
                                Confirm
                              </button>
                              <button
                                onClick={() => setCodePendingDelete(null)}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRevokeCode(item.code)}
                              className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 text-rose-600 rounded-lg transition-all"
                              title="Revoke and Delete Code"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Column 3: Policy Configuration / Password Rotation */}
            <div className="space-y-8">
              
              {/* Policy Module / Master rotation */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Rotate Admin Key</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Update the master administrative secret passcode.</p>
                  </div>
                </div>

                <form onSubmit={handleRotateAdminPasscode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      Current Admin Passcode
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminCode ? "text" : "password"}
                        value={oldPasscode}
                        onChange={(e) => setOldPasscode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs font-mono tracking-widest text-slate-900 transition-all outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showAdminCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      New Admin Passcode (min. 6 chars)
                    </label>
                    <input
                      type="password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="New Admin Secret"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs font-mono tracking-widest text-slate-900 transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      Confirm New Admin Passcode
                    </label>
                    <input
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Confirm Secret"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs font-mono tracking-widest text-slate-900 transition-all outline-none"
                      required
                    />
                  </div>

                  {passcodeError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[11px] font-semibold flex items-start gap-1.5 leading-relaxed">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <span>{passcodeError}</span>
                    </div>
                  )}

                  {passcodeSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center">
                      {passcodeSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Rotate Secrets
                  </button>
                </form>
              </div>

              {/* Quick reference guide */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-300 space-y-4 shadow-sm text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-black tracking-wider uppercase">
                  <KeyRound className="w-4 h-4" />
                  IAM Policy Guard
                </div>
                <p className="leading-relaxed font-medium">
                  Admin Panel operations persist directly into the browser's cryptographic secure local sandbox storage.
                </p>
                <ul className="space-y-2 list-disc pl-4 text-slate-400">
                  <li>Candidates enter active invite codes to gain access.</li>
                  <li>The admin uses the Master Passcode (default <code className="text-slate-300 font-bold bg-slate-800 px-1 py-0.5 rounded">ADMIN2026</code>) to log in.</li>
                  <li>Revoking any active code instantly locks any future candidate login attempt using that token.</li>
                </ul>
              </div>

            </div>

          </div>
        ) : adminTab === 'ai-studio' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Column 1 & 2: Generation Setup & Preview */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Question Config Form */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Question Generation Lab</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Fine-tune domain criteria and custom prompt parameters to generate professional CISSP questions.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Target CISSP Domain</label>
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        {DOMAINS_LIST.map((domain) => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Difficulty Calibration</label>
                      <div className="flex p-1 bg-slate-50 rounded-xl gap-1 border border-slate-200">
                        {['Basic', 'Moderate', 'Hard'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff as any)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              selectedDifficulty === diff 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">AI Agent/Engine</label>
                      <select
                        value={selectedEngine}
                        onChange={(e) => setSelectedEngine(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced & Fast)</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analytical & Deep Reasoning)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Number of Questions</label>
                      <div className="flex p-1 bg-slate-50 rounded-xl gap-1 border border-slate-200">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNumQuestions(num)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              numQuestions === num 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {num} {num === 1 ? 'Q' : 'Qs'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Target Subdomain Topic (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.G., CRYPTOGRAPHY, RISK MANAGEMENT, BCP/DRP"
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 transition-all uppercase outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Custom Guidance / Scenario Prompt (Optional)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const topics = [
                            "Contrast Quantitative vs Qualitative risk analysis with a focus on SLE/ALE calculations.",
                            "Focus on Bell-LaPadula Simple Security Property vs *-Property with practical access control decisions.",
                            "Create a business continuity crisis involving hot site transition failure due to network bandwidth saturation.",
                            "Kerberos Ticket Granting Server (TGS) authentication flow vulnerability context.",
                            "Evaluate a development project shifting to DevSecOps, deciding where to inject SAST vs DAST tools.",
                            "Explain OAuth 2.0 grant types in a mobile client architecture scenario."
                          ];
                          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                          setCustomPrompt(randomTopic);
                        }}
                        className="text-[9px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1"
                      >
                        <Dices className="w-3.5 h-3.5" /> Auto-Suggest Topic
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="E.G., FOCUS ON EXPLAINING EXCLUSIVELY WHY THE PRINCIPLE OF LEAST PRIVILEGE PREVENTS LATER PRIVILEGE ESCALATION."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 transition-all outline-none resize-none"
                    />
                  </div>

                  {generationError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-rose-800 uppercase tracking-wider">AI Generation Error</p>
                        <p className="text-xs text-rose-700 leading-relaxed mt-0.5">{generationError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateQuestion}
                    disabled={isGeneratingQuestion}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    {isGeneratingQuestion ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Question via Gemini...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Generate Custom Question with Gemini AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LIVE PREVIEW OF GENERATED QUESTIONS BATCH */}
              {generatedQuestions.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">AI Generated Batch Drafts</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Verify each question below before deploying them to the candidate exam pool.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveAllQuestions}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/20 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save All ({generatedQuestions.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscardAllQuestions}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700/50"
                      >
                        Discard All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => {
                      const testAnswer = testAnswers[question.id];
                      return (
                        <div key={question.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                Draft #{index + 1}
                              </span>
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                                {question.difficulty}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {question.id}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                              {question.domain} • {question.subdomain}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                              {question.stem}
                            </h4>

                            {/* Interactive Options Preview */}
                            <div className="space-y-2.5">
                              {Object.entries(question.options).map(([key, value]) => {
                                const isCorrect = key === question.correctOption;
                                const isSelected = key === testAnswer;
                                
                                let optionStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
                                if (testAnswer) {
                                  if (isCorrect) {
                                    optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                                  } else if (isSelected) {
                                    optionStyle = "border-rose-500 bg-rose-50 text-rose-900";
                                  } else {
                                    optionStyle = "border-slate-100 opacity-60 text-slate-400";
                                  }
                                }

                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      if (!testAnswer) {
                                        setTestAnswers(prev => ({
                                          ...prev,
                                          [question.id]: key
                                        }));
                                      }
                                    }}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex gap-3 items-center ${optionStyle}`}
                                  >
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 ${
                                      testAnswer
                                        ? isCorrect
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : isSelected
                                            ? 'bg-rose-500 border-rose-500 text-white'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}>
                                      {key}
                                    </span>
                                    <span>{value}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {testAnswer && (
                              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 animate-in fade-in">
                                <div className="flex items-center gap-1.5 text-indigo-700">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span className="text-[10px] font-black uppercase tracking-wider">EXPLANATION RATIONALE</span>
                                </div>
                                <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                                  {question.explanation}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-3 border-t border-slate-100 pt-5">
                              <button
                                type="button"
                                onClick={() => handleSaveSingleQuestion(question)}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save & Deploy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDiscardSingleQuestion(question.id)}
                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                Discard
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Custom Question Registry & Summary */}
            <div className="space-y-8">
              
              {/* Question Pool Stats */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Custom Question Bank</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Monitoring metrics for injected study metrics.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <span className="text-2xl font-black text-indigo-600 font-mono">
                      {generatedPool.length}
                    </span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">GENERATED</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {staticQuestions.length + generatedPool.length}
                    </span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ACTIVE TOTAL</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed pt-2">
                  • Deployed questions are automatically integrated into both **Practice quizzes** and the **Adaptive CAT algorithm** for all users taking exams on the local offline engine!
                </div>
              </div>

              {/* Active Custom Pool Registry */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Custom Questions ({generatedPool.length})</h3>
                
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                  {generatedPool.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No custom questions generated yet. Use the lab to build and save questions!
                    </div>
                  ) : (
                    generatedPool.map((q) => <QuestionListItem key={q.id} q={q} onDelete={handleDeleteQuestion} />)
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Column 1 & 2: Manual Custom Question Creator Form */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <ListChecks className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Manual Custom Question Creator</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Create tailored CISSP exam questions. Enter custom domain and subtopics manually.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateManualQuestion} className="space-y-5">
                  
                  {/* Select Domain & Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">CISSP Domain</label>
                      <select
                        value={manualDomain}
                        onChange={(e) => setManualDomain(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        {DOMAINS_LIST.map((domain) => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Difficulty Calibration</label>
                      <div className="flex p-1 bg-slate-50 rounded-xl gap-1 border border-slate-200">
                        {['Basic', 'Moderate', 'Hard'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setManualDifficulty(diff as any)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              manualDifficulty === diff 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subdomain & Primary Concepts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Subdomain Topic (e.g., Kerberos, BCR)</label>
                      <input
                        type="text"
                        placeholder="E.G., CRYPTOGRAPHY STANDARDS"
                        value={manualSubdomain}
                        onChange={(e) => setManualSubdomain(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold transition-all uppercase outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Primary Concepts (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="E.G., PKI, AES, SYMMETRIC ENCRYPTION"
                        value={manualPrimaryConcepts}
                        onChange={(e) => setManualPrimaryConcepts(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold transition-all uppercase outline-none"
                      />
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Question Stem (Scenario Text)</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the scenario-based question. Make it challenging and administrative, in ISC2 style."
                      value={manualStem}
                      onChange={(e) => setManualStem(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-xs font-semibold text-slate-800 leading-relaxed outline-none transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Options Input A & B */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Option A</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center">A</span>
                        <input
                          type="text"
                          placeholder="Option A text..."
                          value={manualOptionA}
                          onChange={(e) => setManualOptionA(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-800 font-semibold transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Option B</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center">B</span>
                        <input
                          type="text"
                          placeholder="Option B text..."
                          value={manualOptionB}
                          onChange={(e) => setManualOptionB(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-800 font-semibold transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options Input C & D */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Option C</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center">C</span>
                        <input
                          type="text"
                          placeholder="Option C text..."
                          value={manualOptionC}
                          onChange={(e) => setManualOptionC(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-800 font-semibold transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Option D</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center">D</span>
                        <input
                          type="text"
                          placeholder="Option D text..."
                          value={manualOptionD}
                          onChange={(e) => setManualOptionD(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-4 py-3 text-xs text-slate-800 font-semibold transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Correct Option Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Correct Answer Designation</label>
                    <div className="flex p-1 bg-slate-50 rounded-xl gap-1 border border-slate-200">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setManualCorrectOption(opt as any)}
                          className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${
                            manualCorrectOption === opt 
                              ? 'bg-emerald-600 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          Option {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explanation rationale */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Explanation & Psychometric Rationale</label>
                    <textarea
                      rows={3}
                      placeholder="Explain why the designated option is correct, and why the distractors are incorrect or sub-optimal in an enterprise scope."
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-xs font-semibold text-slate-800 leading-relaxed outline-none transition-all resize-none"
                      required
                    />
                  </div>

                  {/* References */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Reference Citation Title (Optional)</label>
                      <input
                        type="text"
                        placeholder="E.G., OFFICIAL ISC2 CBK GUIDE, CHAPTER 4"
                        value={manualRefTitle}
                        onChange={(e) => setManualRefTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold transition-all uppercase outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Reference URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="E.G., HTTPS://WWW.ISC2.ORG"
                        value={manualRefUrl}
                        onChange={(e) => setManualRefUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {manualError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 leading-relaxed">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                      <span>{manualError}</span>
                    </div>
                  )}

                  {manualSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center">
                      {manualSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save & Deploy Custom Question
                  </button>
                </form>
              </div>

            </div>

            {/* Column 3: Custom Question Registry & Summary */}
            <div className="space-y-8">
              
              {/* Question Pool Stats */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Custom Question Bank</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Monitoring metrics for injected study metrics.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <span className="text-2xl font-black text-indigo-600 font-mono">
                      {generatedPool.length}
                    </span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">GENERATED</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {staticQuestions.length + generatedPool.length}
                    </span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ACTIVE TOTAL</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed pt-2">
                  • Deployed questions are automatically integrated into both **Practice quizzes** and the **Adaptive CAT algorithm** for all users taking exams on the local offline engine!
                </div>
              </div>

              {/* Active Custom Pool Registry */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Custom Questions ({generatedPool.length})</h3>
                
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                  {generatedPool.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No custom questions generated yet. Use the lab to build and save questions!
                    </div>
                  ) : (
                    generatedPool.map((q) => <QuestionListItem key={q.id} q={q} onDelete={handleDeleteQuestion} />)
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Extracted sub-component for proper React state hook lifecycle inside mapped item list
const QuestionListItem: React.FC<{ q: Question; onDelete: (id: string) => void }> = ({ q, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="py-3.5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="inline-block text-[8px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-widest mr-1.5">
            {q.difficulty}
          </span>
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
            {q.subdomain}
          </span>
          <p className="text-xs text-slate-800 font-semibold leading-normal line-clamp-2 mt-1">
            {q.stem}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0 items-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider"
          >
            {expanded ? 'Close' : 'View'}
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this custom question?")) {
                onDelete(q.id);
              }
            }}
            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider"
          >
            Delete
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-[11px] animate-in slide-in-from-top-1">
          <p className="font-bold text-slate-700">Options:</p>
          <ul className="space-y-1 text-slate-600">
            {Object.entries(q.options).map(([k, v]) => (
              <li key={k} className={k === q.correctOption ? "text-emerald-600 font-extrabold" : "font-medium"}>
                {k}: {v}
              </li>
            ))}
          </ul>
          <p className="font-bold text-slate-700 mt-2">Explanation:</p>
          <p className="text-slate-500 font-medium leading-relaxed italic">
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
