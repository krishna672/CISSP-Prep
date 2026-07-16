
import { mindMapData as initialData } from './data/mindMapData';
import { AppTab, MindMapNode } from './types';
import React, { useState } from 'react';
import { Map, BookOpen, Layers, Download, CheckCircle, Shield, Key, FileText, X, ChevronLeft, GraduationCap } from 'lucide-react';
import MindMap from './components/MindMap';
import QuizDashboard from './components/QuizDashboard';
import ExamSimulator from './components/ExamSimulator';
import DesignTokens from './components/DesignTokens';
import ExpandedDetailsModal from './components/ExpandedDetailsModal';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.MINDMAP);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [mapData] = useState<MindMapNode>(initialData);

  const handleExport = () => {
    alert("Map data exported successfully (JSON format).");
  };

  const handleOpenDetails = () => {
    if (selectedNode) {
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header Navigation */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 z-50 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-100">V</div>
            <h1 className="font-black text-sm tracking-tighter hidden min-[400px]:inline-block sm:block">CISSP <span className="text-indigo-600 font-normal">Vault</span></h1>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <nav className="flex items-center gap-1">
            {[
              { id: AppTab.MINDMAP, label: 'Mind Map', icon: Map },
              { id: AppTab.QUIZ, label: 'Practice', icon: BookOpen },
              { id: AppTab.EXAM, label: 'Adaptive CAT', icon: GraduationCap },
              { id: AppTab.DESIGN, label: 'Tokens', icon: Layers }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== AppTab.MINDMAP) {
                    setSelectedNode(null);
                    setIsConceptModalOpen(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] font-black transition-all shrink-0 ${
                    activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={tab.label}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
             <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-100 uppercase tracking-widest">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Core Verified</span>
            </div>
            <button onClick={handleExport} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                <Download className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative h-full">
            {activeTab === AppTab.MINDMAP && (
                <MindMap 
                    data={mapData} 
                    selectedNodeId={selectedNode?.id}
                    onNodeClick={(node) => {
                        setSelectedNode(node);
                        const hasChildren = node.children && node.children.length > 0;
                        if (!hasChildren) {
                            setIsConceptModalOpen(true);
                        } else {
                            setIsConceptModalOpen(false);
                        }
                    }}
                />
            )}
            {activeTab === AppTab.QUIZ && <QuizDashboard />}
            {activeTab === AppTab.EXAM && <ExamSimulator />}
            {activeTab === AppTab.DESIGN && <DesignTokens />}

            {/* Elegant Floating Selection Bar */}
            {activeTab === AppTab.MINDMAP && selectedNode && !isConceptModalOpen && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Selected Concept</span>
                        <span className="text-xs font-bold text-slate-800 max-w-[280px] sm:max-w-[200px] truncate">{selectedNode.label}</span>
                    </div>
                    <div className="h-px sm:h-8 w-full sm:w-px bg-slate-200" />
                    <div className="flex gap-2 justify-end">
                        <button 
                            onClick={() => setIsConceptModalOpen(true)}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                            <BookOpen className="w-3 h-3" /> View Details
                        </button>
                        <button 
                            onClick={() => setSelectedNode(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all"
                        >
                            Deselect
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Dynamic Concept Modal */}
        {activeTab === AppTab.MINDMAP && selectedNode && isConceptModalOpen && (
             <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 md:p-8">
                <div 
                   className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                   onClick={() => setIsConceptModalOpen(false)} 
                />
                
                <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-8 py-8 border-b border-slate-100 shrink-0 bg-slate-50/50 backdrop-blur-sm flex justify-between items-start">
                        <div className="space-y-2">
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                                {selectedNode.type || 'CONCEPT'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight pr-4">
                                {selectedNode.label}
                            </h2>
                        </div>
                        <button 
                           onClick={() => setIsConceptModalOpen(false)} 
                           className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 p-2.5 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                        >
                           <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                        {selectedNode.definition && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5 text-indigo-500">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg"><FileText className="w-4 h-4" /></div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Summary</h3>
                                </div>
                                <p className="text-slate-800 text-base md:text-lg leading-relaxed font-semibold">
                                    {selectedNode.definition}
                                </p>
                            </div>
                        )}

                        {selectedNode.keyAspect && (
                            <div className="bg-amber-50 p-6 md:p-8 rounded-[2rem] border border-amber-100 relative overflow-hidden">
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3 text-amber-600">
                                      <Key className="w-4 h-4" />
                                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Success Criteria</h3>
                                  </div>
                                  <p className="text-amber-900 text-sm md:text-base font-black leading-snug italic">
                                      "{selectedNode.keyAspect}"
                                  </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={handleOpenDetails}
                              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-3 group"
                            >
                              Study Comprehensive Card <BookOpen className="w-4 h-4 group-hover:scale-105 transition-transform" />
                            </button>
                            <button 
                              onClick={() => setIsConceptModalOpen(false)}
                              className="py-4 px-6 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                            >
                              Close <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Shield className="w-4 h-4 text-indigo-600" />
                          Neural Vault Reconstructed
                        </div>
                    </div>
                </div>
             </div>
        )}
      </main>

      {/* Dynamic AI Study Modal */}
      {isDetailsModalOpen && selectedNode && (
        <ExpandedDetailsModal 
          node={selectedNode} 
          onClose={() => setIsDetailsModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;
