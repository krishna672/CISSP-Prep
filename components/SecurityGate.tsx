import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Lock, Unlock, Eye, EyeOff, KeyRound, 
  AlertCircle, CheckCircle, Map, BookOpen, GraduationCap, 
  Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  loginCandidateCloud, 
  verifyAdminPasscodeCloud,
  saveMyCandidateInfo
} from './cloudSync';

interface SecurityGateProps {
  onUnlock: (isAdmin: boolean) => void;
}

const SecurityGate: React.FC<SecurityGateProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Local storage cache keys
  const [redeemedCodesOnDevice, setRedeemedCodesOnDevice] = useState<string[]>([]);

  // Note: the admin passcode is intentionally never fetched or cached here.
  // It's verified server-side (see handleSubmit) so it never touches the
  // browser. Similarly, the full invite code registry is never fetched by
  // candidates at all -- individual codes are checked server-side via
  // verifyInviteCodeCloud, which only ever reveals info about the one code
  // typed in.
  useEffect(() => {
    // If an invite code was shared via URL, pre-fill the input field only.
    // It still has to match a code that already exists in the admin's
    // registry to actually grant access (checked server-side in
    // handleSubmit) -- we never create/register a code just because
    // someone typed or linked one in.
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite') || params.get('code');
    if (inviteParam) {
      setPasscode(inviteParam.trim().toUpperCase());

      // Clean query params to keep the url neat and avoid re-processing on reload
      try {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {
        console.error("Failed to clean query parameters from URL:", e);
      }
    }

    // Track codes already successfully redeemed on this specific device
    const storedRedeemed = localStorage.getItem('cissp_my_redeemed_codes');
    if (storedRedeemed) {
      try {
        setRedeemedCodesOnDevice(JSON.parse(storedRedeemed));
      } catch (e) {
        setRedeemedCodesOnDevice([]);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const inputPass = passcode.trim();
    const inputUpper = inputPass.toUpperCase();

    // Verify against the admin passcode server-side. The real passcode
    // value is never sent to or stored in the browser -- only a yes/no
    // answer (plus a session token on success) comes back.
    const isAdminPasscode = await verifyAdminPasscodeCloud(inputPass);

    if (isAdminPasscode) {
      setSuccess(true);
      setSuccessMessage('Administrator Credentials Accepted. Unlocking Admin console...');
      
      // Save session info
      sessionStorage.setItem('cissp_vault_auth', 'true');
      sessionStorage.setItem('cissp_vault_admin', 'true');
      sessionStorage.setItem('cissp_vault_code', 'ADMIN');

      setTimeout(() => {
        onUnlock(true);
      }, 1000);
      return;
    }

    const isAlreadyRedeemedOnDevice = redeemedCodesOnDevice.includes(inputUpper);

    // One server-side transaction: validates the code, enforces the
    // one-use rule (except on this same device), conditionally redeems
    // it, and issues a real session token on success. Never fetches or
    // exposes the full registry of everyone else's codes/names.
    const result = await loginCandidateCloud(inputUpper, isAlreadyRedeemedOnDevice);

    // Codes are never auto-created or auto-registered from user input --
    // if it isn't already in the admin's registry, it's rejected outright.
    if (!result.success) {
      setError(
        result.reason === 'already_used'
          ? 'Access Denied. This invite code has already been redeemed and is limited to exactly 1 user.'
          : 'Access Denied. Invalid Invite Code.'
      );
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      return;
    }

    setSuccess(true);
    setSuccessMessage('Invite Code Accepted. Loading Candidate Vault...');

    const candidateName = result.candidateName || `Candidate (${inputUpper})`;

    // Cache ONLY this device's own record (never the full registry) so the
    // quiz/exam screens can label leaderboard submissions without needing
    // to read everyone else's invite codes.
    await saveMyCandidateInfo(inputUpper, candidateName);

    if (!isAlreadyRedeemedOnDevice) {
      const newRedeemedList = [...redeemedCodesOnDevice, inputUpper];
      localStorage.setItem('cissp_my_redeemed_codes', JSON.stringify(newRedeemedList));
      setRedeemedCodesOnDevice(newRedeemedList);
    }

    // Save session info
    sessionStorage.setItem('cissp_vault_auth', 'true');
    sessionStorage.setItem('cissp_vault_admin', 'false');
    sessionStorage.setItem('cissp_vault_code', inputUpper);

    setTimeout(() => {
      onUnlock(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950 text-white overflow-y-auto flex flex-col justify-between">
      {/* Decorative cyber backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent absolute top-0 animate-bounce duration-[15000ms]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-black shadow-lg shadow-indigo-950/40">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight flex items-center gap-1">
              CISSP <span className="text-indigo-400 font-medium">STUDY VAULT</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
              Interactive Exam Engine
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Security Protocol Active (AES-256)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Left Column: Stunning Marketing / Landing Page */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-400">
              <Lock className="w-3 h-3" />
              Secured Candidate Portal
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Master the CISSP <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
                8 Domains of Knowledge
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl">
              Gain complete understanding of information systems security policies, architecture, and threat mitigation models through an immersive, interactive study ecosystem.
            </p>
          </div>

          {/* Value Propositions / Key Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Map className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Interactive Mind Map</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Visually navigate concepts, protocols, and security principles mapping all 8 core curriculum domains.
              </p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Adaptive CAT Simulator</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Train under the exact real-time question weight and difficulty scaling used in the actual computerized adaptive test.
              </p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 hover:border-sky-500/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Active Recall Pools</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Test concepts instantly with domain-specific diagnostic practice questions featuring detailed explanations.
              </p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Design Frameworks</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Examine raw cryptographic parameters, configurations, and terminology in an intuitive dashboard.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Code Input Guard Panel */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Form Header */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400 shadow-xl shadow-indigo-950/50">
                {success ? (
                  <Unlock className="w-7 h-7 text-emerald-400 animate-pulse" />
                ) : (
                  <Lock className="w-7 h-7 text-indigo-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                  Unlock Study Vault
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Enter your invite code to access the vault
                </p>
              </div>
            </div>

            {/* Authentication Screen */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Enter Invite Code
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="CISSP-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 pr-12 text-sm text-center font-mono tracking-widest text-white transition-all outline-none"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider leading-relaxed animate-in fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={success}
                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  success 
                    ? 'bg-emerald-600 text-white shadow-emerald-950/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/30'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {success ? 'Decrypting Vault...' : 'Verify Access Credentials'}
              </button>


            </form>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; 2026 CISSP Vault. Fully local cryptographic sandboxed security.
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:text-slate-400 transition-colors cursor-help">Access Policy</span>
          <span>&middot;</span>
          <span className="hover:text-slate-400 transition-colors cursor-help">D3 Visualization Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default SecurityGate;
