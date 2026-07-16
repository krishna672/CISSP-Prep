import React from 'react';
import { MM_COLORS } from '../data/mindMapData';

const DesignTokens: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Visual Design System</h2>
        <p className="mb-8 text-slate-600">Extracted from ThorTeaches PDF artifacts to ensure fidelity.</p>

        <div className="mb-10">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(MM_COLORS).map(([name, hex]) => (
                    <div key={name} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg shadow-sm" style={{backgroundColor: hex}}></div>
                        <div>
                            <div className="font-mono text-xs text-slate-400">{name}</div>
                            <div className="font-bold text-slate-700">{hex}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-10">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Node Shapes & Typography</h3>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-8">
                    <div className="w-32 h-12 bg-[#002b5c] rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                        Root Node
                    </div>
                    <p className="text-sm text-slate-500">Dark Navy background, rounded rect (rx=10), white text, bold.</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="w-32 h-10 border-2 border-[#e11d48] rounded-full flex items-center justify-center text-slate-700 font-medium bg-white">
                        Child Node
                    </div>
                    <p className="text-sm text-slate-500">White fill, colored stroke (2px) matching parent branch, pill shape.</p>
                </div>
                 <div className="flex items-center gap-8">
                     <svg width="100" height="40">
                         <path d="M 0 20 C 50 20, 50 20, 100 20" stroke="#f97316" strokeWidth="4" fill="none" />
                     </svg>
                    <p className="text-sm text-slate-500">Connections: Bezier curves, stroke width decreases with depth (4px to 2px).</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DesignTokens;