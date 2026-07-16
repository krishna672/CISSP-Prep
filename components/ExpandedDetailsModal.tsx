import React from 'react';
import { X, Shield, Key, FileText, Gavel, Bookmark, GraduationCap, ChevronLeft, CheckCircle, Quote, Compass } from 'lucide-react';
import { MindMapNode } from '../types';

interface ExpandedDetailsModalProps {
  node: MindMapNode;
  onClose: () => void;
}

const ExpandedDetailsModal: React.FC<ExpandedDetailsModalProps> = ({ node, onClose }) => {
  // Parse enforcement/controls text into lines for a clean layout
  const controls = node.enforcement
    ? node.enforcement
        .split('\n')
        .map(line => line.replace(/^Controls:\s*/i, '').replace(/^Steps:\s*/i, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
    : [];

  // Parse related concepts
  const relatedList = node.related || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-10 border-b border-slate-100 shrink-0 bg-slate-50/50 flex justify-between items-start gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-[80%]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                {node.type} Insight
              </span>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Offline Vault Verified
              </div>
            </div>
            <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {node.label}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 sm:p-3 hover:bg-white hover:shadow-lg rounded-xl sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-slate-100 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Study Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-12 space-y-10 sm:space-y-16 custom-scrollbar">
          
          {/* Comprehensive Breakdown */}
          {node.definition && (
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest">Comprehensive Breakdown</h3>
              </div>
              <p className="text-slate-700 text-base sm:text-xl leading-relaxed font-semibold">
                {node.definition}
              </p>
            </section>
          )}

          {/* Controls & Think Like a Manager Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            
            {/* Enforcement Controls */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Gavel className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Enforcement Controls</h3>
              </div>
              {controls.length > 0 ? (
                <div className="space-y-3">
                  {controls.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  Standard procedural implementation applies.
                </p>
              )}
            </section>

            {/* Think Like a Manager */}
            {node.keyAspect && (
              <section className="bg-amber-50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-amber-100 relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute right-0 top-0 opacity-[0.05] scale-150 rotate-12">
                  <GraduationCap className="w-48 h-48 text-amber-600" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3 text-amber-600">
                    <Key className="w-6 h-6" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest">Think Like a Manager</h3>
                  </div>
                  <p className="text-amber-900 text-lg font-black leading-snug italic">
                    "{node.keyAspect}"
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Real-World / Exam Scenario */}
          {node.example && (
            <section className="bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3 text-indigo-400">
                  <Quote className="w-6 h-6" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Real-World Exam Scenario</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm sm:text-lg font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 sm:pl-6">
                    {node.example.replace(/^Exam Scenario:\s*/i, '')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Cross-Links & Citation */}
          {(relatedList.length > 0 || node.citation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 pt-4">
              {/* Related concepts */}
              {relatedList.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Domain Cross-Links</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relatedList.map((relatedNodeId, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-wider border border-slate-200">
                        {relatedNodeId}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Source Citation */}
              {node.citation && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">CBK Citation Reference</h3>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-xs font-mono text-slate-500 leading-relaxed">{node.citation}</p>
                  </div>
                </section>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Verified CISSP Body of Knowledge (CBK)
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
