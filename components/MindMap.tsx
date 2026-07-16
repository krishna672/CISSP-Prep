
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';
import { ZoomIn, ZoomOut, Maximize, Search, ChevronRight, Sparkles, Loader2, X, Check, Plus } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface MindMapProps {
  data: MindMapNode;
  selectedNodeId?: string;
  onNodeClick: (node: MindMapNode) => void;
  onAddNodes?: (parentId: string, newNodes: MindMapNode[]) => void;
}

type D3Node = d3.HierarchyPointNode<MindMapNode> & {
  x0?: number;
  y0?: number;
  _children?: D3Node[] | null;
  id?: any;
};

const MindMap: React.FC<MindMapProps> = ({ data, selectedNodeId, onNodeClick, onAddNodes }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MindMapNode[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const rootRef = useRef<D3Node | null>(null);
  const treeLayoutRef = useRef<d3.TreeLayout<MindMapNode>>(d3.tree<MindMapNode>().nodeSize([65, 280]));
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const getNodeColor = (d: any) => {
    if (d.data.color) return d.data.color;
    let curr = d;
    while(curr.parent && !curr.data.color) {
        curr = curr.parent;
    }
    return curr.data.color || "#94a3b8";
  };

  const diagonal = (s: {x: number, y: number}, d: {x: number, y: number}) => {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  };

  const updateStructure = useCallback((source: D3Node) => {
    if (!gRef.current || !rootRef.current) return;

    const g = gRef.current;
    const root = rootRef.current;
    const treeLayout = treeLayoutRef.current;

    const treeData = treeLayout(root);
    const nodes = treeData.descendants() as D3Node[];
    const links = treeData.links();

    nodes.forEach((d) => { d.y = d.depth * 300; });

    let i = 0;
    const node = g.selectAll<SVGGElement, D3Node>('g.node')
      .data(nodes, (d: any) => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", () => `translate(${source.y || 0},${source.x || 0})`)
      .style('opacity', 0)
      .on('click', (event, d) => {
        // Localized Toggle: Only expand/collapse the specific node clicked
        if (d.children) {
          d._children = d.children as unknown as D3Node[];
          d.children = null;
        } else if (d._children) {
          d.children = d._children;
          d._children = null;
        }
        
        onNodeClick(d.data);
        updateStructure(d as D3Node);
      });

    nodeEnter.append('rect')
      .attr('width', 220)
      .attr('height', 48)
      .attr('y', -24)
      .attr('x', -10)
      .attr('rx', 14)
      .attr('ry', 14)
      .style("fill", "#fff")
      .style("stroke-width", "2.5px")
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.04))");

    nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", 15)
      .attr("text-anchor", "start")
      .style("font-size", "13px")
      .style("fill", "#1e293b")
      .text((d) => d.data.label.length > 28 ? d.data.label.substring(0, 26) + "..." : d.data.label);

    nodeEnter.append('circle')
      .attr('class', 'indicator')
      .attr('cx', 210)
      .attr('cy', 0)
      .attr('r', 5)
      .style('stroke-width', '1.5px');

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(300)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .style('opacity', 1);

    nodeUpdate.select('rect')
      .style("stroke", (d) => {
          const isMatch = searchTerm && d.data.label.toLowerCase().includes(searchTerm.toLowerCase());
          return isMatch ? "#facc15" : getNodeColor(d);
      })
      .style("stroke-width", (d) => {
          const isMatch = searchTerm && d.data.label.toLowerCase().includes(searchTerm.toLowerCase());
          const isSelected = d.data.id === selectedNodeId;
          return isMatch ? "5px" : (isSelected ? "4px" : "2.5px");
      });

    nodeUpdate.select('circle.indicator')
      .style('display', (d) => (d.children || d._children) ? 'block' : 'none')
      .style('fill', (d) => d._children ? getNodeColor(d) : '#fff')
      .style('stroke', (d) => getNodeColor(d))
      .attr('class', (d) => d._children ? 'indicator animate-pulse' : 'indicator');

    nodeUpdate.attr('class', (d) => `node ${d.data.id === selectedNodeId ? 'selected-node' : ''}`);

    node.exit().transition()
      .duration(300)
      .attr("transform", () => `translate(${source.y},${source.x})`)
      .style('opacity', 0)
      .remove();

    const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<MindMapNode>>('path.link')
      .data(links, (d: any) => d.target.id);

    const linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', () => {
        const o = { x: source.x || 0, y: source.y || 0 };
        return diagonal(o, o);
      })
      .style("fill", "none")
      .style("stroke", (d) => getNodeColor(d.target))
      .style("stroke-width", (d: any) => Math.max(1, 4 - d.target.depth) + "px")
      .style("opacity", 0);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate.transition()
      .duration(300)
      .attr('d', (d: any) => diagonal(d.source, d.target))
      .style("opacity", 0.35);

    link.exit().transition()
      .duration(300)
      .attr('d', () => {
        const o = { x: source.x || 0, y: source.y || 0 };
        return diagonal(o, o);
      })
      .remove();
  }, [selectedNodeId, searchTerm, onNodeClick]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;
    const height = containerRef.current.clientHeight;

    if (!gRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
          gRef.current?.attr("transform", event.transform);
        });
      
      zoomRef.current = zoom;
      svg.call(zoom);
      const g = svg.append("g");
      gRef.current = g;

      const root = d3.hierarchy<MindMapNode>(data) as unknown as D3Node;
      root.x0 = height / 2;
      root.y0 = 0;

      // MANDATORY INITIAL COLLAPSE
      const collapseAll = (d: any) => {
        if (d.children) {
          d._children = d.children;
          d.children = null;
          d._children.forEach(collapseAll);
        }
      };
      
      // Expand root, collapse everything else
      if (root.children) {
        root.children.forEach(collapseAll);
      }

      rootRef.current = root;
      const initialTransform = d3.zoomIdentity.translate(100, height / 2).scale(0.8);
      svg.transition().duration(0).call(zoom.transform as any, initialTransform);
    } else {
      // Re-map hierarchy if data changes (like AI nodes)
      const oldRoot = rootRef.current;
      const newRoot = d3.hierarchy<MindMapNode>(data) as unknown as D3Node;
      
      const preserveState = (nNew: any, nOld: any) => {
          if (!nOld) return;
          if (!nOld.children && nOld._children) {
              nNew._children = nNew.children;
              nNew.children = null;
          }
          
          const newChildren = nNew.children || nNew._children;
          const oldChildren = nOld.children || nOld._children;
          
          if (newChildren && oldChildren) {
              newChildren.forEach((cNew: any) => {
                  const matchingOld = oldChildren.find((cOld: any) => cOld.data.id === cNew.data.id);
                  if (matchingOld) {
                      preserveState(cNew, matchingOld);
                  }
              });
          }
      };
      preserveState(newRoot, oldRoot);
      rootRef.current = newRoot;
    }

    if (rootRef.current) {
        updateStructure(rootRef.current);
    }
  }, [data, updateStructure]);

  useEffect(() => {
      if (rootRef.current) {
          updateStructure(rootRef.current);
      }
  }, [selectedNodeId, searchTerm, updateStructure]);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2 || !rootRef.current) return [];
    const allNodes = (rootRef.current as any).descendants() as any[];
    return allNodes
      .filter(d => d.data.label.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8);
  }, [searchTerm]);

  const handleSuggestionClick = (d: any) => {
    setSearchTerm(d.data.label);
    setShowSuggestions(false);
    
    // Auto-expand path to suggestion
    let curr = d;
    while(curr.parent) {
        if (curr.parent._children) {
            curr.parent.children = curr.parent._children;
            curr.parent._children = null;
        }
        curr = curr.parent;
    }

    onNodeClick(d.data);
    updateStructure(rootRef.current as D3Node);

    if (svgRef.current && zoomRef.current && containerRef.current) {
        const height = containerRef.current.clientHeight;
        const width = containerRef.current.clientWidth;
        const transform = d3.zoomIdentity
            .translate(width / 2 - (d.y || 0) * 0.8, height / 2 - (d.x || 0) * 0.8)
            .scale(0.8);
        d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform as any, transform);
    }
  };

  const handleSuggestNodes = async () => {
    const targetNode = selectedNodeId 
      ? rootRef.current?.descendants().find(d => d.data.id === selectedNodeId)?.data 
      : data;

    if (!targetNode) return;

    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are a CISSP Knowledge Graph Architect.
        Context: The user is exploring "${targetNode.label}".
        Current existing sub-topics: ${targetNode.children?.map(c => c.label).join(", ") || "None"}.
        
        TASK: Identify 3 to 5 critical missing professional concepts or technical details from the CISSP Body of Knowledge (CBK) that belong under this branch.
        
        Return a JSON array of objects:
        { id, label, definition, type: 'concept'|'detail', keyAspect }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                definition: { type: Type.STRING },
                type: { type: Type.STRING },
                keyAspect: { type: Type.STRING },
              },
              required: ["id", "label", "definition", "type", "keyAspect"]
            }
          }
        }
      });

      const raw = JSON.parse(response.text || "[]");
      const suggestions = raw.map((s: any, idx: number) => ({
        ...s,
        id: `ai-${Date.now()}-${idx}`
      }));
      setAiSuggestions(suggestions);
      setSelectedSuggestions(new Set(suggestions.map((s: any) => s.id)));
    } catch (error) {
      console.error("AI Node Suggestion Failed:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const confirmAiNodes = () => {
    if (!aiSuggestions || !onAddNodes || !selectedNodeId) return;
    const toAdd = aiSuggestions.filter(s => selectedSuggestions.has(s.id));
    onAddNodes(selectedNodeId, toAdd);
    setAiSuggestions(null);
    setSelectedSuggestions(new Set());
    
    // Auto-expand to show new findings
    const targetNode = rootRef.current?.descendants().find(d => d.data.id === selectedNodeId);
    if (targetNode && targetNode._children) {
        targetNode.children = targetNode._children;
        targetNode._children = null;
        updateStructure(targetNode as D3Node);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#f8fafc] overflow-hidden" ref={containerRef}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search CISSP Concepts..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel border border-slate-200 shadow-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        {suggestions.map((s: any, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(s)}
                                className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center justify-between group"
                            >
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">{s.data.label}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{s.parent?.data.label || 'Top Level'}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
            <div className="flex flex-col gap-1 glass-panel p-1.5 rounded-2xl shadow-2xl border border-slate-200">
                <button 
                    className="p-3 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl transition-colors group disabled:opacity-30" 
                    title="Suggest Nodes (AI)"
                    disabled={!selectedNodeId || isSuggesting}
                    onClick={handleSuggestNodes}
                >
                    {isSuggesting ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    )}
                </button>
                <div className="h-px bg-slate-100 mx-2 my-1"></div>
                <button className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors" title="Zoom In" onClick={() => {
                    if(svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy as any, 1.3);
                }}>
                    <ZoomIn className="w-5 h-5 text-slate-700"/>
                </button>
                <button className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors" title="Zoom Out" onClick={() => {
                    if(svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy as any, 0.7);
                }}>
                    <ZoomOut className="w-5 h-5 text-slate-700"/>
                </button>
                <div className="h-px bg-slate-200 mx-2 my-1"></div>
                <button className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors" title="Center Map" onClick={() => {
                    if(svgRef.current && zoomRef.current) { 
                        const transform = d3.zoomIdentity.translate(100, containerRef.current!.clientHeight / 2).scale(0.8);
                        d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform as any, transform);
                    }
                }}>
                    <Maximize className="w-5 h-5 text-slate-700"/>
                </button>
            </div>
        </div>

      <svg ref={svgRef} className="mindmap-container" onClick={() => setShowSuggestions(false)}></svg>

      {/* AI Suggestion Modal */}
      {aiSuggestions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setAiSuggestions(null)}></div>
           <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-indigo-600" /> AI Concept Injection
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select findings to add to branch</p>
                 </div>
                 <button onClick={() => setAiSuggestions(null)} className="p-2 hover:bg-white rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                 {aiSuggestions.map((s) => (
                    <button 
                        key={s.id}
                        onClick={() => {
                          const next = new Set(selectedSuggestions);
                          if (next.has(s.id)) next.delete(s.id);
                          else next.add(s.id);
                          setSelectedSuggestions(next);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                          selectedSuggestions.has(s.id) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                       <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                         selectedSuggestions.has(s.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                       }`}>
                          {selectedSuggestions.has(s.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-300" />}
                       </div>
                       <div>
                          <div className="font-black text-slate-900 text-sm mb-1">{s.label}</div>
                          <div className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{s.definition}</div>
                       </div>
                    </button>
                 ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                 <button onClick={() => setAiSuggestions(null)} className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50">Discard</button>
                 <button 
                  onClick={confirmAiNodes}
                  disabled={selectedSuggestions.size === 0}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-20"
                 >
                   Inject {selectedSuggestions.size} Nodes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
