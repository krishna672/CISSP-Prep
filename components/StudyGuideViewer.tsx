
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Book, Download, Printer, ShieldCheck, 
  Menu, ChevronRight, ZoomIn, ZoomOut, 
  Search, ChevronLeft, Layout, FileText, 
  Maximize, MoreVertical, Bookmark,
  Triangle, Circle, Pyramid, Layers, User,
  Users, Server, Network, Shield, AlertTriangle,
  ArrowRight, BarChart, CheckCircle2, XCircle, TrendingUp
} from 'lucide-react';
import { studyGuideContent } from '../data/studyGuideData';

// --- HIGH FIDELITY DIAGRAM COMPONENTS ---

const DiagramCIA: React.FC = () => (
  <div className="my-10 flex flex-col items-center">
    <div className="relative w-64 h-64 border-l-[3px] border-b-[3px] border-indigo-900 border-opacity-30 rotate-45 transform">
      <div className="absolute -left-12 -top-10 -rotate-45 font-black text-xs text-indigo-900 tracking-widest bg-white px-2">CONFIDENTIALITY</div>
      <div className="absolute -right-8 -bottom-8 -rotate-45 font-black text-xs text-indigo-900 tracking-widest bg-white px-2">AVAILABILITY</div>
      <div className="absolute left-1/2 bottom-1/2 -translate-x-1/2 translate-y-1/2 -rotate-45 border-t-[3px] border-indigo-900 border-opacity-30 w-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 -rotate-45 font-black text-xs text-indigo-900 tracking-widest bg-white px-2">INTEGRITY</div>
    </div>
    <div className="mt-8 text-[10px] font-bold text-slate-400 italic">Figure: The CIA Triad</div>
  </div>
);

const DiagramDAD: React.FC = () => (
  <div className="my-10 flex flex-col items-center">
    <div className="relative w-64 h-64 flex items-center justify-center border-[3px] border-rose-600/20 rounded-full">
        <Triangle className="w-48 h-48 text-rose-600/30" strokeWidth={1} />
        <div className="absolute top-8 font-black text-xs text-rose-700 tracking-widest">DISCLOSURE</div>
        <div className="absolute bottom-16 left-4 font-black text-xs text-rose-700 tracking-widest -rotate-45">ALTERATION</div>
        <div className="absolute bottom-16 right-4 font-black text-xs text-rose-700 tracking-widest rotate-45">DESTRUCTION</div>
    </div>
    <div className="mt-4 text-[10px] font-bold text-rose-400 italic">Figure: The DAD Triad (Negative counterpart)</div>
  </div>
);

const DiagramOnion: React.FC = () => (
  <div className="my-12 flex justify-center">
    <div className="relative w-72 h-72 flex items-center justify-center">
      {[72, 56, 40, 24, 8].map((size, idx) => (
        <div key={idx} className={`absolute border-2 border-indigo-600/20 rounded-full bg-indigo-50/10 flex items-center justify-center`} style={{ width: `${size*4}px`, height: `${size*4}px` }}>
           {idx === 0 && <span className="absolute top-4 text-[8px] font-black text-indigo-300">POLICIES & TRAINING</span>}
           {idx === 1 && <span className="absolute top-4 text-[8px] font-black text-indigo-400">PHYSICAL SECURITY</span>}
           {idx === 2 && <span className="absolute top-4 text-[8px] font-black text-indigo-500">NETWORK SECURITY</span>}
           {idx === 3 && <span className="absolute top-4 text-[8px] font-black text-indigo-600 uppercase">SYSTEMS</span>}
           {idx === 4 && <Shield className="w-8 h-8 text-indigo-900" />}
        </div>
      ))}
    </div>
  </div>
);

const DiagramPyramid: React.FC = () => (
  <div className="my-12 flex flex-col items-center">
    <div className="w-80 space-y-1">
      <div className="bg-[#064e3b] text-white p-3 text-center rounded-t-lg font-black text-xs tracking-widest">POLICIES (High Level)</div>
      <div className="bg-[#064e3b]/90 text-white p-3 text-center font-black text-xs tracking-widest">STANDARDS (Mandatory)</div>
      <div className="bg-[#f97316] text-white p-3 text-center font-black text-xs tracking-widest">GUIDELINES (Optional)</div>
      <div className="bg-slate-700 text-white p-3 text-center rounded-b-lg font-black text-xs tracking-widest">PROCEDURES (Tactical)</div>
    </div>
  </div>
);

const DiagramMaturity: React.FC = () => (
    <div className="my-12 flex flex-col items-center">
        <div className="flex items-end gap-1 h-48 w-full max-w-lg px-4 border-b-2 border-slate-200">
            {[
                { l: "Initial", h: "20%", c: "bg-slate-400" },
                { l: "Repeatable", h: "40%", c: "bg-slate-500" },
                { l: "Defined", h: "60%", c: "bg-indigo-400" },
                { l: "Managed", h: "80%", c: "bg-indigo-600" },
                { l: "Optimized", h: "100%", c: "bg-[#064e3b]" }
            ].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`${s.c} w-full rounded-t-lg transition-all duration-1000`} style={{ height: s.h }}></div>
                    <span className="text-[8px] font-black uppercase text-slate-400 rotate-45 origin-left">{s.l}</span>
                </div>
            ))}
        </div>
        <div className="mt-12 text-[10px] font-bold text-slate-400 italic">Figure: Risk Management Maturity Model</div>
    </div>
);

const DiagramRACI: React.FC = () => (
  <div className="my-10 overflow-x-auto">
    <table className="w-full text-left text-[10px] border-collapse bg-slate-50 rounded-xl overflow-hidden">
      <thead>
        <tr className="bg-slate-900 text-white font-black uppercase tracking-wider">
          <th className="p-3 border-r border-white/10">Task / Process</th>
          <th className="p-3 border-r border-white/10 text-center">Manager</th>
          <th className="p-3 border-r border-white/10 text-center">Admin</th>
          <th className="p-3 border-r border-white/10 text-center">User</th>
          <th className="p-3 text-center">Auditor</th>
        </tr>
      </thead>
      <tbody className="font-bold text-slate-700">
        <tr className="border-b border-slate-200">
          <td className="p-3 border-r border-slate-200">Create Policy</td>
          <td className="p-3 border-r border-slate-200 text-center text-indigo-600">A</td>
          <td className="p-3 border-r border-slate-200 text-center">R</td>
          <td className="p-3 border-r border-slate-200 text-center">I</td>
          <td className="p-3 text-center">C</td>
        </tr>
        <tr className="border-b border-slate-200 bg-white">
          <td className="p-3 border-r border-slate-200">Configure Firewall</td>
          <td className="p-3 border-r border-slate-200 text-center">A</td>
          <td className="p-3 border-r border-slate-200 text-center text-indigo-600">R</td>
          <td className="p-3 border-r border-slate-200 text-center">-</td>
          <td className="p-3 text-center">C</td>
        </tr>
        <tr className="bg-slate-50">
          <td className="p-3 border-r border-slate-200">Access Data</td>
          <td className="p-3 border-r border-slate-200 text-center">I</td>
          <td className="p-3 border-r border-slate-200 text-center">C</td>
          <td className="p-3 border-r border-slate-200 text-center text-indigo-600">R</td>
          <td className="p-3 text-center">A</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const DiagramThreatPie: React.FC = () => (
    <div className="my-10 flex flex-col items-center">
        <div className="relative w-64 h-64 rounded-full border-8 border-slate-100 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-[60px] border-t-indigo-600 border-r-[40px] border-r-rose-400 border-b-[80px] border-b-emerald-400 border-l-[80px] border-l-amber-400 opacity-20"></div>
            <div className="z-10 text-center">
                <span className="block text-2xl font-black text-slate-800">48-62%</span>
                <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest">EXTERNAL THREATS</span>
            </div>
        </div>
        <div className="mt-6 flex gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded"></div> PHISHING</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded"></div> MALWARE</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded"></div> INSIDERS</div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const StudyGuideViewer: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const domainOptions = [
    { id: 1, label: "Domain 1: Security and Risk Management" },
    { id: 2, label: "Domain 2: Asset Security" },
    { id: 3, label: "Domain 3: Security Architecture and Engineering" },
    { id: 4, label: "Domain 4: Communication and Network Security" },
    { id: 5, label: "Domain 5: Identity and Access Management (IAM)" },
    { id: 6, label: "Domain 6: Security Assessment and Testing" },
    { id: 7, label: "Domain 7: Security Operations" },
    { id: 8, label: "Domain 8: Software Development Security" },
  ];

  const currentContent = useMemo(() => {
    return studyGuideContent[selectedDomain] || "Content loading...";
  }, [selectedDomain]);

  const pages = useMemo(() => {
    const parts = currentContent.split(/\d+ \| Page/);
    return parts.map((part, i) => {
      const pageNum = i + 1;
      return { id: pageNum, content: part.trim(), footer: `${pageNum} | Page` };
    }).filter(p => p.content.length > 5);
  }, [currentContent]);

  const renderPageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      // DIAGRAM DISPATCHER
      if (trimmed === "[IMAGE: CIA_TRIAD]") return <DiagramCIA key={idx} />;
      if (trimmed === "[IMAGE: DAD_TRIAD]") return <DiagramDAD key={idx} />;
      if (trimmed === "[IMAGE: ONION_DEFENSE]") return <DiagramOnion key={idx} />;
      if (trimmed === "[IMAGE: DOCUMENTATION_PYRAMID]") return <DiagramPyramid key={idx} />;
      if (trimmed === "[IMAGE: MATURITY_MODEL]") return <DiagramMaturity key={idx} />;
      if (trimmed === "[IMAGE: RACI_CHART]") return <DiagramRACI key={idx} />;
      if (trimmed === "[IMAGE: THREAT_PIE]") return <DiagramThreatPie key={idx} />;
      
      if (trimmed.startsWith("[IMAGE:")) {
          return (
            <div key={idx} className="my-8 p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 text-slate-300" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Diagram Reconstruction: {trimmed.slice(8, -1).replace('_', ' ')}
                </span>
            </div>
          );
      }

      // HEADERS
      if (trimmed.includes("Thor’s Study Guide") || (trimmed.startsWith("Domain") && trimmed.length < 50 && !trimmed.includes("•"))) {
        return (
          <div key={idx} className="mb-8 border-b-4 border-[#064e3b] pb-4">
            <h1 className="text-[#064e3b] font-black text-3xl md:text-4xl tracking-tight leading-tight uppercase">{trimmed}</h1>
            <div className="h-1.5 w-20 bg-[#f97316] mt-3 rounded-full"></div>
          </div>
        );
      }

      if (/^[A-Z][a-z]+/.test(trimmed) && trimmed.length < 60 && !trimmed.match(/[●•▪▫⬧⬥✔✓⮚]/) && !trimmed.includes(":") && !trimmed.endsWith(".") && !trimmed.includes("..")) {
        return <h2 key={idx} className="text-[#f97316] font-extrabold text-xl mt-8 mb-4 tracking-tight flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-[#064e3b]" />{trimmed}
        </h2>;
      }
      
      // BULLETS
      const bulletMatch = trimmed.match(/^([●•▪▫⬧⬥✔✓⮚➢])|(\d+\.\s)/);
      if (bulletMatch) {
          const content = trimmed.replace(/^([●•▪▫⬧⬥✔✓⮚➢])|(\d+\.\s)/, '').trim();
          const symbol = bulletMatch[0];
          return (
            <div key={idx} className="flex gap-3 items-start my-2.5">
                <span className="text-[#f97316] mt-1 shrink-0 font-bold text-sm">{symbol}</span>
                <p className="text-slate-800 leading-relaxed font-medium text-base">{content}</p>
            </div>
          );
      }

      // TOC STYLE
      if (trimmed.includes("....")) {
        return (
          <div key={idx} className="flex items-center justify-between text-slate-600 font-medium py-1">
             <span className="truncate mr-2">{trimmed.split('.')[0]}</span>
             <span className="border-b border-dotted border-slate-300 flex-1 mx-2"></span>
             <span className="shrink-0">{trimmed.split('.').pop()}</span>
          </div>
        );
      }

      // PARAGRAPHS
      if (trimmed.length > 0) {
        return <p key={idx} className="text-slate-700 leading-relaxed my-3 font-medium text-base pl-1">{trimmed}</p>;
      }
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="flex h-full bg-[#525659] overflow-hidden">
      <aside className={`flex flex-col bg-[#323639] border-r border-black/20 transition-all duration-300 ${isSidebarOpen ? 'w-72 md:w-80' : 'w-0 overflow-hidden'}`}>
        <div className="h-12 flex items-center px-4 bg-[#202124] shrink-0 border-b border-white/5">
           <Layout className="w-4 h-4 text-white/70 mr-3" />
           <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Document Outline</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-2 space-y-1">
           {domainOptions.map((opt) => (
             <button key={opt.id} onClick={() => setSelectedDomain(opt.id)} className={`w-full text-left px-4 py-3 rounded-md transition-all flex items-start gap-3 group ${selectedDomain === opt.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
               <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${selectedDomain === opt.id ? 'text-indigo-400' : 'text-white/20'}`} />
               <span className="text-[11px] font-bold leading-snug tracking-tight">Domain {opt.id}: {opt.label.split(': ')[1]}</span>
             </button>
           ))}
        </div>
        <div className="p-4 bg-[#202124] border-t border-white/5">
           <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]"><ShieldCheck className="w-4 h-4 text-[#064e3b]" />CISSP SECURE VIEW</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="h-12 bg-[#323639] flex items-center justify-between px-4 shrink-0 z-50 border-b border-black/30 shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Toggle Sidebar"><Menu className="w-5 h-5 text-white/80" /></button>
            <div className="h-5 w-px bg-white/10 mx-1 hidden md:block"></div>
            <span className="text-xs font-medium text-white/90 truncate max-w-[150px] md:max-w-none uppercase tracking-tight">ThorTeaches_Domain_{selectedDomain}.pdf</span>
          </div>
          <div className="flex items-center gap-1 md:gap-4">
             <div className="flex items-center bg-[#202124] rounded px-2 py-1 gap-3 border border-white/5">
                <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] font-bold text-white/80 w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all"><ZoomIn className="w-4 h-4" /></button>
             </div>
             <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block"></div>
             <div className="hidden sm:flex items-center gap-2">
                <button className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all"><Printer className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all"><MoreVertical className="w-4 h-4" /></button>
             </div>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 md:p-12 scroll-smooth">
           <div className="flex flex-col items-center gap-8 pb-32">
             {pages.map((page) => (
               <div key={page.id} className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/10 relative transition-transform origin-top"
                 style={{ width: `${(zoom / 100) * 8.5}in`, minHeight: `${(zoom / 100) * 11}in`, padding: `${(zoom / 100) * 0.75}in ${(zoom / 100) * 1.0}in` }}>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#064e3b]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-45 select-none"><ShieldCheck className="w-[500px] h-[500px] text-slate-900" /></div>
                  <div className="relative z-10 select-text">{renderPageContent(page.content)}</div>
                  <div className="absolute bottom-8 left-0 right-0 px-12 flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] pointer-events-none">
                    <span>THORTEACHES.COM</span><span>{page.id} | Page</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f97316]" />
               </div>
             ))}
           </div>
        </div>
      </main>
    </div>
  );
};

export default StudyGuideViewer;
