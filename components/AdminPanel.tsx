import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, Users, Trash2, PlusCircle, Copy, Check, 
  Settings, Lock, KeyRound, AlertTriangle, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface InviteCode {
  code: string;
  createdAt: string;
  createdBy: string;
  usedCount: number;
  candidateName?: string;
}

const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';
const DEFAULT_INVITE_CODE = 'CISSP2026';

const AdminPanel: React.FC = () => {
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

  // Load invite codes and admin passcode
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
                Cryptographic authentication key creation, audit metrics, and access policy rules.
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
                  {inviteCodes.reduce((acc, curr) => acc + curr.usedCount, 0)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Uses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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

      </div>
    </div>
  );
};

export default AdminPanel;
