import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Search, Calendar, Award, RefreshCw, 
  Trash2, ShieldCheck, CheckCircle2, XCircle, Clock, BookOpen, GraduationCap 
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  code: string;
  name: string;
  score: number;
  type: 'CAT Exam' | 'Practice Quiz';
  questionsCount: number;
  timestamp: string;
  passed: boolean;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'CAT Exam' | 'Practice Quiz'>('All');
  const [isAdmin, setIsAdmin] = useState(false);

  // Load entries and admin state
  useEffect(() => {
    setIsAdmin(sessionStorage.getItem('cissp_vault_admin') === 'true');
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const stored = localStorage.getItem('cissp_leaderboard');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LeaderboardEntry[];
        // Filter out any older mock/dummy data to ensure the board is clean of simulated records
        const genuineEntries = parsed.filter(entry => !entry.id.startsWith('mock-'));
        if (genuineEntries.length !== parsed.length) {
          localStorage.setItem('cissp_leaderboard', JSON.stringify(genuineEntries));
        }
        setEntries(genuineEntries);
      } catch (e) {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  };

  // Clear leaderboard (Admin only)
  const handleClearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear all high scores and leaderboard history? This cannot be undone.')) {
      localStorage.setItem('cissp_leaderboard', JSON.stringify([]));
      setEntries([]);
    }
  };

  // Filter and search entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || entry.type === filterType;

    return matchesSearch && matchesType;
  });

  // Sort: CAT Exams sorted by score desc, then Practice Quizzes by score desc
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    // Sort CAT exams first or keep it unified by score? Let's sort by timestamp or score desc.
    // Unified rank sorting: Let's normalize CAT score (scaled 100-1000) and Quiz score (scaled 0-100)
    const getNormalizedScore = (e: LeaderboardEntry) => {
      return e.type === 'CAT Exam' ? (e.score / 1000) * 100 : e.score;
    };
    return getNormalizedScore(b) - getNormalizedScore(a);
  });

  return (
    <div className="h-full bg-slate-50/50 overflow-y-auto p-4 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Candidate Leaderboard</h2>
              <p className="text-xs text-slate-500 font-medium">
                Live performance tracking by candidate identity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={loadLeaderboard}
              className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors border border-slate-200 bg-white"
              title="Refresh Leaderboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {isAdmin && entries.length > 0 && (
              <button
                onClick={handleClearLeaderboard}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                title="Clear scores"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Board
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-mono font-black text-slate-950">
                {entries.filter(e => e.type === 'CAT Exam').length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CAT Exam Sessions</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-mono font-black text-slate-950">
                {entries.filter(e => e.type === 'Practice Quiz').length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Practice Quizzes</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-mono font-black text-slate-950">
                {entries.length > 0 
                  ? Math.round((entries.filter(e => e.passed).length / entries.length) * 100)
                  : 0}%
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Global Pass Rate</div>
            </div>
          </div>
        </div>

        {/* Search & Filtering Bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all uppercase font-semibold"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'CAT Exam', 'Practice Quiz'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterType === type 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Main Scoreboard List */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">Rank</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Challenge Type</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score achieved</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No matching candidate scores logged yet. Start a Practice test or Adaptive CAT Simulation!
                    </td>
                  </tr>
                ) : (
                  sortedEntries.map((item, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Rank */}
                        <td className="py-5 px-6 text-center">
                          {index < 3 ? (
                            <div className="inline-flex items-center justify-center">
                              <Medal className={`w-6 h-6 ${
                                isGold ? 'text-amber-500 fill-amber-50' : 
                                isSilver ? 'text-slate-400 fill-slate-50' : 
                                'text-amber-700 fill-amber-50'
                              }`} />
                            </div>
                          ) : (
                            <span className="text-xs font-mono font-black text-slate-400">#{index + 1}</span>
                          )}
                        </td>

                        {/* Candidate Identity */}
                        <td className="py-5 px-6">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          </div>
                        </td>

                        {/* Exam Type */}
                        <td className="py-5 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                            {item.type === 'CAT Exam' ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                            {item.type}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-5 px-6 text-center">
                          <div className="space-y-0.5">
                            <span className="text-base font-mono font-black text-slate-950">
                              {item.score}
                              {item.type === 'Practice Quiz' && <span className="text-xs text-slate-400 ml-0.5">%</span>}
                            </span>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              {item.questionsCount} Items
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-5 px-6 text-center">
                          {item.passed ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              Failed
                            </span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-5 px-6 text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <div className="flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
