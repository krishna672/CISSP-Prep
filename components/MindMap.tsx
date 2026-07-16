
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';
import { ZoomIn, ZoomOut, Maximize, Search, ChevronRight } from 'lucide-react';

interface MindMapProps {
  data: MindMapNode;
  selectedNodeId?: string;
  onNodeClick: (node: MindMapNode) => void;
}

type D3Node = d3.HierarchyPointNode<MindMapNode> & {
  x0?: number;
  y0?: number;
  _children?: D3Node[] | null;
  id?: any;
};

const MindMap: React.FC<MindMapProps> = ({ data, selectedNodeId, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
      // Re-map hierarchy if data changes
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
    </div>
  );
};

export default MindMap;
