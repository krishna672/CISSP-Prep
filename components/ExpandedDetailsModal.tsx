import React, { useState, useEffect } from 'react';
import { X, Shield, Key, FileText, Gavel, Bookmark, GraduationCap, ChevronLeft, CheckCircle, Quote, Compass, Pencil, PlusCircle, Trash2, Save, XCircle } from 'lucide-react';
import { MindMapNode, MindMapNodeEdit, MindMapAddedNode } from '../types';

interface ExpandedDetailsModalProps {
  node: MindMapNode;
  onClose: () => void;
  isAdmin?: boolean;
  isAddedNode?: boolean;
  onSaveEdit?: (nodeId: string, updates: MindMapNodeEdit) => void;
  onAddChild?: (parentId: string, newNode: Omit<MindMapAddedNode, 'id' | 'parentId'>) => void;
  onDeleteAddedNode?: (nodeId: string) => void;
}

const NEXT_TYPE_BY_PARENT: Record<string, MindMapAddedNode['type']> = {
  root: 'domain',
  domain: 'subdomain',
  subdomain: 'concept',
  concept: 'detail',
  detail: 'detail',
};

const emptyChildForm = {
  label: '',
  type: 'detail' as MindMapAddedNode['type'],
  definition: '',
  example: '',
  enforcement: '',
  keyAspect: '',
};

const ExpandedDetailsModal: React.FC<ExpandedDetailsModalProps> = ({
  node,
  onClose,
  isAdmin,
  isAddedNode,
  onSaveEdit,
  onAddChild,
  onDeleteAddedNode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [editForm, setEditForm] = useState<MindMapNodeEdit>({});
  const [childForm, setChildForm] = useState(emptyChildForm);

  // Reset local edit state whenever a different node is opened
  useEffect(() => {
    setIsEditing(false);
    setIsAddingChild(false);
    setPendingDelete(false);
    setEditForm({
      label: node.label,
      definition: node.definition || '',
      example: node.example || '',
      enforcement: node.enforcement || '',
      keyAspect: node.keyAspect || '',
      notes: node.notes || '',
      citation: node.citation || '',
    });
    setChildForm({ ...emptyChildForm, type: NEXT_TYPE_BY_PARENT[node.type] || 'detail' });
  }, [node.id]);

  // Parse enforcement/controls text into lines for a clean layout
  const controls = node.enforcement
    ? node.enforcement
        .split('\n')
        .map(line => line.replace(/^Controls:\s*/i, '').replace(/^Steps:\s*/i, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
    : [];

  // Parse related concepts
  const relatedList = node.related || [];

  const handleSave = () => {
    if (onSaveEdit) {
      onSaveEdit(node.id, editForm);
    }
    setIsEditing(false);
  };

  const handleSaveChild = () => {
    if (!childForm.label.trim() || !onAddChild) return;
    onAddChild(node.id, {
      label: childForm.label.trim(),
      type: childForm.type,
      definition: childForm.definition.trim() || undefined,
      example: childForm.example.trim() || undefined,
      enforcement: childForm.enforcement.trim() || undefined,
      keyAspect: childForm.keyAspect.trim() || undefined,
    });
    setChildForm({ ...emptyChildForm, type: NEXT_TYPE_BY_PARENT[node.type] || 'detail' });
    setIsAddingChild(false);
  };

  const handleDeleteClick = () => {
    if (!pendingDelete) {
      setPendingDelete(true);
      setTimeout(() => setPendingDelete(false), 4000);
      return;
    }
    if (onDeleteAddedNode) {
      onDeleteAddedNode(node.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-10 border-b border-slate-100 shrink-0 bg-slate-50/50 flex justify-between items-start gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-[70%]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                {node.type} Insight
              </span>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Offline Vault Verified
              </div>
              {isAddedNode && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black rounded uppercase tracking-widest">
                  Admin Added
                </span>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm(f => ({ ...f, label: e.target.value }))}
                className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none"
              />
            ) : (
              <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {node.label}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && !isEditing && !isAddingChild && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 sm:p-3 hover:bg-indigo-50 rounded-xl sm:rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 shrink-0"
                  title="Edit this node's content"
                  aria-label="Edit node"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="p-2 sm:p-3 hover:bg-emerald-50 rounded-xl sm:rounded-2xl text-slate-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 shrink-0"
                  title="Add a child node"
                  aria-label="Add child node"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {isAddedNode && (
                  <button
                    onClick={handleDeleteClick}
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all border shrink-0 ${
                      pendingDelete
                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                        : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-transparent hover:border-rose-100'
                    }`}
                    title={pendingDelete ? 'Click again to confirm delete' : 'Delete this added node'}
                    aria-label="Delete node"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </>
            )}
            <button 
              onClick={onClose} 
              className="p-2 sm:p-3 hover:bg-white hover:shadow-lg rounded-xl sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-slate-100 shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>

        {/* Study Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-12 space-y-10 sm:space-y-16 custom-scrollbar">

          {isEditing ? (
            /* -------------------- EDIT MODE -------------------- */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comprehensive Breakdown</label>
                <textarea
                  value={editForm.definition}
                  onChange={(e) => setEditForm(f => ({ ...f, definition: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-800 outline-none"
                  placeholder="Full definition / explanation of this concept..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enforcement Controls (one per line)</label>
                  <textarea
                    value={editForm.enforcement}
                    onChange={(e) => setEditForm(f => ({ ...f, enforcement: e.target.value }))}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs font-mono text-slate-800 outline-none"
                    placeholder={"Controls:\n1. First control\n2. Second control"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Think Like a Manager</label>
                  <textarea
                    value={editForm.keyAspect}
                    onChange={(e) => setEditForm(f => ({ ...f, keyAspect: e.target.value }))}
                    rows={6}
                    className="w-full bg-amber-50 border border-amber-200 focus:border-amber-500 rounded-2xl p-4 text-sm text-amber-900 outline-none"
                    placeholder="The key exam-focused takeaway..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-World / Exam Scenario</label>
                <textarea
                  value={editForm.example}
                  onChange={(e) => setEditForm(f => ({ ...f, example: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-800 outline-none"
                  placeholder="Exam Scenario: ..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Additional Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-800 outline-none"
                    placeholder="Any extra context or study notes..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CBK Citation Reference</label>
                  <textarea
                    value={editForm.citation}
                    onChange={(e) => setEditForm(f => ({ ...f, citation: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs font-mono text-slate-800 outline-none"
                    placeholder="Source reference..."
                  />
                </div>
              </div>
            </div>
          ) : isAddingChild ? (
            /* -------------------- ADD CHILD MODE -------------------- */
            <div className="space-y-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                New node will be added as a child of <span className="text-indigo-600">{node.label}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Label *</label>
                  <input
                    type="text"
                    value={childForm.label}
                    onChange={(e) => setChildForm(f => ({ ...f, label: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-3.5 text-sm text-slate-800 outline-none"
                    placeholder="e.g. Zero Trust Architecture"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Type</label>
                  <select
                    value={childForm.type}
                    onChange={(e) => setChildForm(f => ({ ...f, type: e.target.value as MindMapAddedNode['type'] }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-3.5 text-sm text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="domain">Domain</option>
                    <option value="subdomain">Subdomain</option>
                    <option value="concept">Concept</option>
                    <option value="detail">Detail</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comprehensive Breakdown</label>
                <textarea
                  value={childForm.definition}
                  onChange={(e) => setChildForm(f => ({ ...f, definition: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-800 outline-none"
                  placeholder="Definition / explanation of this new node..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enforcement Controls</label>
                  <textarea
                    value={childForm.enforcement}
                    onChange={(e) => setChildForm(f => ({ ...f, enforcement: e.target.value }))}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs font-mono text-slate-800 outline-none"
                    placeholder={"Controls:\n1. First control"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Think Like a Manager</label>
                  <textarea
                    value={childForm.keyAspect}
                    onChange={(e) => setChildForm(f => ({ ...f, keyAspect: e.target.value }))}
                    rows={4}
                    className="w-full bg-amber-50 border border-amber-200 focus:border-amber-500 rounded-2xl p-4 text-sm text-amber-900 outline-none"
                    placeholder="Key exam-focused takeaway..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-World / Exam Scenario</label>
                <textarea
                  value={childForm.example}
                  onChange={(e) => setChildForm(f => ({ ...f, example: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-800 outline-none"
                  placeholder="Exam Scenario: ..."
                />
              </div>
            </div>
          ) : (
            /* -------------------- READ-ONLY VIEW -------------------- */
            <>
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

              {/* Notes */}
              {node.notes && (
                <section className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest">Additional Notes</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{node.notes}</p>
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
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          {isEditing ? (
            <>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                <Pencil className="w-4 h-4" />
                Editing Node Content
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </>
          ) : isAddingChild ? (
            <>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <PlusCircle className="w-4 h-4" />
                Adding New Node
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsAddingChild(false)}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveChild}
                  disabled={!childForm.label.trim()}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> Save Node
                </button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandedDetailsModal;
