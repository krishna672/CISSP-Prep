import React, { useState, useEffect } from 'react';
// Added CheckCircle to imports
import { X, Shield, Key, FileText, Gavel, Lightbulb, Bookmark, Target, GraduationCap, Loader2, Sparkles, AlertCircle, ChevronLeft, CheckCircle } from 'lucide-react';
import { MindMapNode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface ExpandedDetailsModalProps {
  node: MindMapNode;
  onClose: () => void;
}

interface AIAnalysis {
  comprehensiveDefinition: string;
  technicalControls: string[];
  examManagerThinking: string;
  practiceScenario: string;
  practiceStem: string;
  practiceOptions: { [key: string]: string };
  practiceCorrect: string;
  practiceRationale: string;
  crossDomainImpacts: string[];
}

const ExpandedDetailsModal: React.FC<ExpandedDetailsModalProps> = ({ node, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          You are a world-class CISSP Exam Instructor.
          TOPIC: "${node.label}" (${node.type})
          
          TASK: Create a deep "Exam-Ready" technical and management analysis for this concept.
          
          OUTPUT JSON STRUCTURE:
          {
            "comprehensiveDefinition": "Deep professional definition including business alignment.",
            "technicalControls": ["Control 1", "Control 2", "Control 3"],
            "examManagerThinking": "Specific management logic for success with this topic.",
            "practiceScenario": "A complex 3-4 sentence organizational situation.",
            "practiceStem": "The exam question (BEST/MOST/FIRST/LEAST).",
            "practiceOptions": {"A": "...", "B": "...", "C": "...", "D": "..."},
            "practiceCorrect": "A",
            "practiceRationale": "Professional explanation of why it is the correct response.",
            "crossDomainImpacts": ["Interdependency 1", "Interdependency 2"]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comprehensiveDefinition: { type: Type.STRING },
                technicalControls: { type: Type.ARRAY, items: { type: Type.STRING } },
                examManagerThinking: { type: Type.STRING },
                practiceScenario: { type: Type.STRING },
                practiceStem: { type: Type.STRING },
                practiceOptions: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  },
                  required: ["A", "B", "C", "D"]
                },
                practiceCorrect: { type: Type.STRING },
                practiceRationale: { type: Type.STRING },
                crossDomainImpacts: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["comprehensiveDefinition", "technicalControls", "examManagerThinking", "practiceScenario", "practiceStem", "practiceOptions", "practiceCorrect", "practiceRationale", "crossDomainImpacts"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}") as AIAnalysis;
        setAnalysis(data);
      } catch (err) {
        console.error("AI Analysis Engine Fault:", err);
        setError("AI Study Engine failed to synchronize. Please check connection.");
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalysis();
  }, [node]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 sm:p-10 border-b border-slate-100 shrink-0 bg-slate-50/50 flex justify-between items-start gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-[80%]">
            <div className="flex items-center gap-3 flex-wrap">
               <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                  {node.type} Insight
               </span>
               <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 animate-pulse" />
                  Live AI Synthesis
               </div>
            </div>
            <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {node.label}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white hover:shadow-lg rounded-xl sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-slate-100 shrink-0">
            <X className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Dynamic Analysis Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-12 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-16 sm:py-24 space-y-6">
               <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-[4px] border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
               </div>
               <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">Synthesizing Body of Knowledge...</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Generating technical and management perspectives.</p>
               </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 p-6 sm:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] border border-rose-100 text-center space-y-4 sm:space-y-6">
               <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 mx-auto" />
               <p className="text-rose-900 font-bold text-base sm:text-lg">{error}</p>
               <button onClick={onClose} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Return to Mind Map</button>
            </div>
          ) : analysis && (
            <div className="space-y-10 sm:space-y-16 animate-in fade-in duration-500">
              
              <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl"><FileText className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest">Comprehensive Breakdown</h3>
                </div>
                <p className="text-slate-700 text-base sm:text-xl leading-relaxed font-semibold">
                  {analysis.comprehensiveDefinition}
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                 <section className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <div className="p-2 bg-emerald-50 rounded-xl"><Gavel className="w-5 h-5" /></div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Enforcement Controls</h3>
                    </div>
                    <div className="space-y-3">
                       {analysis.technicalControls.map((c, i) => (
                         <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-slate-600">
                            <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                            {c}
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="bg-amber-50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-[0.05] scale-150 rotate-12">
                      <GraduationCap className="w-48 h-48 text-amber-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4 text-amber-600">
                        <Key className="w-6 h-6" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest">Think Like a Manager</h3>
                      </div>
                      <p className="text-amber-900 text-lg font-black leading-snug italic">
                        "{analysis.examManagerThinking}"
                      </p>
                    </div>
                 </section>
              </div>

              <section className="bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
                 <div className="relative z-10 space-y-6 sm:space-y-10">
                    <div className="flex items-center gap-3 text-indigo-400">
                       <Target className="w-6 h-6" />
                       <h3 className="text-xs font-black uppercase tracking-widest">Expert Scenario Simulation</h3>
                    </div>
                    
                    <div className="space-y-6">
                       <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 sm:pl-6">
                         {analysis.practiceScenario}
                       </p>
                       <h4 className="text-lg sm:text-2xl font-black text-white leading-tight">
                         {analysis.practiceStem}
                       </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {Object.entries(analysis.practiceOptions).map(([key, val]) => (
                         <div key={key} className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-3 sm:gap-4 ${
                           key === analysis.practiceCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                         }`}>
                            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                              key === analysis.practiceCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                            }`}>{key}</span>
                            <span className="text-xs font-bold text-slate-300 mt-1 sm:mt-1.5">{val}</span>
                         </div>
                       ))}
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-3">
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                         <CheckCircle className="w-3.5 h-3.5" /> Professional Solution Rationale
                       </span>
                       <p className="text-slate-400 text-sm leading-relaxed font-medium">
                          {analysis.practiceRationale}
                       </p>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-100 rounded-xl"><Bookmark className="w-5 h-5" /></div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Domain Cross-Links</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.crossDomainImpacts.map((impact, i) => (
                      <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                         <p className="text-xs font-bold text-slate-600 leading-relaxed tracking-tight">{impact}</p>
                      </div>
                    ))}
                 </div>
              </section>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Shield className="w-5 h-5 text-indigo-600" />
            Verified CISSP Body of Knowledge
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpandedDetailsModal;
