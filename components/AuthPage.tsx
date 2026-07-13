import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { 
  Shield, Lock, Mail, Users, Key, Terminal, Code, Cpu, 
  HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles 
} from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (profile: UserProfile, token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [viewState, setViewState] = useState<'LOGIN' | 'SIGNUP' | 'OTP_VERIFICATION' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'VOLUNTEER' | 'POLICE' | 'ADMIN'>('USER');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Simulated OTP capture to display directly on-screen for premium inspection testing convenience
  const [mockConsoleOtp, setMockConsoleOtp] = useState<string | null>(null);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  // 1. LOGIN PROCEDURES
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // If not verified, the server flags OTP verification requirement
        if (data.code === 'UNVERIFIED_OTP') {
          setMockConsoleOtp(data.otpCode);
          setViewState('OTP_VERIFICATION');
          setError('Vanguard ID verification required. Enter the Secure OTP.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Authenication node response failed.');
      }

      setSuccess('Grid handshake successful. Authorizing session...');
      localStorage.setItem('vs_jwt_token', data.token);
      setTimeout(() => {
        onAuthSuccess(data.profile, data.token);
      }, 1200);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGNUp PROCEDURES
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mesh identity mapping rejected.');
      }

      // Display simulation OTP token for convenient workspace testing
      if (data.otpCode) {
        setMockConsoleOtp(data.otpCode);
      }

      setSuccess('Identity mapped into virtual MongoDB block. Confirming via OTP.');
      setTimeout(() => {
        setViewState('OTP_VERIFICATION');
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP CONFIRMATION CODE VALIDATION
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP signature verification failed.');
      }

      setSuccess('Secure token authorized! Writing database node to session...');
      localStorage.setItem('vs_jwt_token', data.token);
      setTimeout(() => {
        onAuthSuccess(data.profile, data.token);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD PROTOCOL
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unrecognized system node entity.');
      }

      if (data.otpCode) {
        setMockConsoleOtp(data.otpCode);
      }

      setSuccess('Secondary rewrite certificate verified. Reset OTP dispatched.');
      setTimeout(() => {
        setViewState('RESET_PASSWORD');
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. SECURE RESET RECONFIRM
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password override rejected.');
      }

      setSuccess('Passkey rewritten successfully! Initializing terminal sign-in.');
      setTimeout(() => {
        setViewState('LOGIN');
        setPassword('');
        setOtp('');
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto select-none p-4 pb-20">
      
      {/* GLOWING AUTHENTICATION CARD GRID CONTAINER */}
      <div className="bg-zinc-950/90 border-4 border-white/5 rounded-[56px] p-8 md:p-14 relative overflow-hidden shadow-3xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -mr-36 -mt-36 pointer-events-none" />
        
        {/* LOGO ENGINE & HEADER DESK */}
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-[2rem] font-black mb-6 shadow-xl shadow-indigo-600/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
            {viewState === 'LOGIN' && 'Grid Handshake'}
            {viewState === 'SIGNUP' && 'Map Identity'}
            {viewState === 'OTP_VERIFICATION' && 'Confirm OTP'}
            {viewState === 'FORGOT_PASSWORD' && 'Key Recovery'}
            {viewState === 'RESET_PASSWORD' && 'Secure Rewrite'}
          </h2>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mono">
            Express + JWT + MongoDB Core
          </p>
        </div>

        {/* ERROR SCREEN */}
        {error && (
          <div className="mb-8 p-5 bg-red-950/60 border-2 border-red-500/30 rounded-[24px] text-red-400 text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-3 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            {error}
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {success && (
          <div className="mb-8 p-5 bg-emerald-950/60 border-2 border-emerald-500/30 rounded-[24px] text-emerald-400 text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-3">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
             {success}
          </div>
        )}

        {/* MOCK CYBER-SMS DISPATCH DISPLAY - MAKES INTERACTIVE TESTING EXTREMELY FUN! */}
        {mockConsoleOtp && (viewState === 'OTP_VERIFICATION' || viewState === 'RESET_PASSWORD') && (
          <div className="mb-8 p-6 bg-indigo-950/60 border-2 border-indigo-500/30 rounded-[28px] space-y-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 py-1 px-3 bg-indigo-505/10 bg-indigo-600 rounded-bl-xl text-white font-mono text-[8px] font-black uppercase">
                COSIMULATOR DESK
             </div>
             <p className="text-[10px] font-mono uppercase font-black text-indigo-400 leading-none">
                SIMULATED SECURE MESSENGER DISPATCH:
             </p>
             <p className="text-xs text-slate-300 uppercase leading-snug font-bold font-mono">
                Authentication Code is: <span className="text-xl font-black text-white px-2 py-0.5 bg-indigo-600 rounded-lg select-all tracking-wider font-mono">{mockConsoleOtp}</span>
             </p>
             <p className="text-[9px] text-slate-500 uppercase font-bold font-mono">
                *Pre-loaded demo account logins bypass verification if already indexed!
             </p>
          </div>
        )}

        {/* DYNAMIC FORMS RENDER */}
        <AnimatePresence mode="wait">
          
          {/* A. LOGIN FORM */}
          {viewState === 'LOGIN' && (
            <motion.form 
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleLoginSubmit}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Mesh Address Registry (Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@vanguard.mesh"
                    className="w-full pl-14 pr-6 py-6 rounded-[28px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-lg uppercase placeholder-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mono">
                    Safety Passkey Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => { resetMessages(); setViewState('FORGOT_PASSWORD'); }}
                    className="text-[9px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors mono"
                  >
                    Reset Lost Node Key?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-14 pr-6 py-6 rounded-[28px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-lg placeholder-slate-850"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 mt-4 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase border border-indigo-400/20 shadow-xl shadow-indigo-600/10"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>AUTHORIZE HANDSHAKE <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </motion.form>
          )}

          {/* B. SIGNUP FORM */}
          {viewState === 'SIGNUP' && (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSignupSubmit}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Citizen Identification Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alpha Vanguard Operator"
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-base uppercase placeholder-slate-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  System Registry Mail (Email)
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@vanguard.mesh"
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-base uppercase placeholder-slate-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Desired Security Crypt key Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-base placeholder-slate-850"
                  required
                />
              </div>

              {/* Role-based selection nodes */}
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                   Role Authorization Designation
                 </label>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'USER', label: 'User Client', desc: 'Secure defense tools & SOS client' },
                      { id: 'VOLUNTEER', label: 'Volunteer Node', desc: 'Active safety mesh responder' },
                      { id: 'POLICE', label: 'Sentry Law Pod', desc: 'Official authority coordinates dispatch' },
                      { id: 'ADMIN', label: 'Primary Admin', desc: 'System level database monitor overrides' }
                    ].map((roleOption) => (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => setRole(roleOption.id as any)}
                        className={`p-4 text-left rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          role === roleOption.id 
                            ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md' 
                            : 'bg-black/40 border-white/5 hover:border-white/10 text-slate-400'
                        }`}
                      >
                         <span className="font-extrabold text-xs uppercase leading-none">{roleOption.label}</span>
                         <span className="text-[8px] font-mono font-black uppercase text-slate-600 leading-none mt-2">
                            {roleOption.desc}
                         </span>
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 mt-4 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase border border-indigo-400/20 shadow-xl"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>INITIALIZE IDENTITY REVOLUTION <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </motion.form>
          )}

          {/* C. OTP_VERIFICATION FORM */}
          {viewState === 'OTP_VERIFICATION' && (
            <motion.form 
              key="otp_verify"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleOtpVerifySubmit}
              className="space-y-6 relative z-10"
            >
              <p className="text-xs text-slate-400 text-center uppercase font-bold leading-normal mono mb-6">
                A 6-digit confirmation key has been dispatched to establish identity on the Express + MongoDB secure registry cluster for email: <span className="text-white font-black">{email}</span>.
              </p>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Enter 6-Digit Security Token OTP
                </label>
                <div className="relative">
                  <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="E.G. 583921"
                    maxLength={6}
                    className="w-full pl-14 pr-6 py-6 rounded-[28px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-black text-2xl tracking-[0.25em] text-center placeholder-slate-800"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>CONFIRM PROTOCOL SYNC</>
                )}
              </button>
            </motion.form>
          )}

          {/* D. FORGOT_PASSWORD FORM */}
          {viewState === 'FORGOT_PASSWORD' && (
            <motion.form 
              key="forgot_pass"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleForgotPasswordSubmit}
              className="space-y-6 relative z-10"
            >
              <p className="text-xs text-slate-400 uppercase font-semibold leading-normal font-mono mb-4 text-center">
                Input your mesh registered email address to release security passkey overrides certificates.
              </p>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Registered Node Mail Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="OPERATOR@VANGUARD.MESH"
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-lg uppercase placeholder-slate-800"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>SEND KEY DECODER OTP</>
                )}
              </button>
            </motion.form>
          )}

          {/* E. RESET_PASSWORD FORM */}
          {viewState === 'RESET_PASSWORD' && (
            <motion.form 
              key="reset_pass"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleResetPasswordSubmit}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Recovery Token (6-Digit OTP)
                </label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="OTP FROM SYSTEM CAPTURE"
                  maxLength={6}
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-black text-xl text-center tracking-widest"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mono">
                  Define New Security Passkey Password
                </label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-6 py-5 rounded-[24px] bg-black/60 border-2 border-white/5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-lg"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>REWRITE SYSTEM ENCRYPTION KEY</>
                )}
              </button>
            </motion.form>
          )}

        </AnimatePresence>

        {/* BOTTOM UTILITY LINKS DESK */}
        <div className="mt-10 border-t border-white/5 pt-8 text-center relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button 
            type="button"
            onClick={() => {
              resetMessages();
              setMockConsoleOtp(null);
              if (viewState === 'LOGIN') {
                setViewState('SIGNUP');
              } else {
                setViewState('LOGIN');
              }
            }}
            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em] hover:text-indigo-400 transition-all py-3 px-6 border-2 border-white/5 rounded-full hover:bg-white/5 mono"
          >
            {viewState === 'LOGIN' ? 'NEW USER? MANIFEST NODE' : 'HAVE REGISTRY? ACCESS PORTAL'}
          </button>

          {viewState !== 'LOGIN' && viewState !== 'SIGNUP' && (
            <button 
              type="button"
              onClick={() => { resetMessages(); setViewState('LOGIN'); }}
              className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              ← Cancel & Return
            </button>
          )}
        </div>

        {/* COMPREHENSIVE SEEDED ACCOUNTS LEGEND FOR FAST AND BEAUTIFUL INSPECTION */}
        <div className="mt-8 border-t border-white/5 pt-6 space-y-3 relative z-10">
           <p className="text-[9px] font-mono uppercase font-black text-indigo-400/80 leading-snug tracking-wider">
              Virtual MongoDB Seed Credentials (Pre-Verified Roles Logins):
           </p>
           <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-500">
              <div className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl">
                 <span className="text-white font-black block leading-none">USER ACCOUNT</span>
                 <p className="mt-1 text-indigo-300">user@vanguard.mesh</p>
                 <span className="text-neutral-600 font-bold block mt-0.5">Pass: Password123!</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl">
                 <span className="text-white font-black block leading-none">VOLUNTEER ACCOUNT</span>
                 <p className="mt-1 text-indigo-300">volunteer@vanguard.mesh</p>
                 <span className="text-neutral-600 font-bold block mt-0.5">Pass: Password123!</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl">
                 <span className="text-white font-black block leading-none">POLICE SENTRY</span>
                 <p className="mt-1 text-indigo-300">police@vanguard.mesh</p>
                 <span className="text-neutral-600 font-bold block mt-0.5">Pass: Password123!</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl">
                 <span className="text-white font-black block leading-none">ADMINISTRATOR</span>
                 <p className="mt-1 text-indigo-300">admin@vanguard.mesh</p>
                 <span className="text-neutral-600 font-bold block mt-0.5">Pass: Password123!</span>
              </div>
           </div>
        </div>

      </div>

      <p className="mt-8 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] mono">
         Cryptographic Authentication Desk Connected 0.0.0.0
      </p>
    </div>
  );
};

export default AuthPage;
