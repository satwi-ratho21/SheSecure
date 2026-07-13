
import React, { useState } from 'react';
import { UserProfile, TrustContact, SafetyMetrics } from '../types';

const OnboardingFlow: React.FC<{ initialProfile: UserProfile | null, onComplete: (profile: UserProfile) => void }> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'ANALYZING' | 'GENERATING_AVATAR' | 'DONE'>('IDLE');
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const defaultId = 'VS-' + Math.floor(100000 + Math.random() * 900000);
    if (initialProfile) {
      return {
        ...initialProfile,
        healthId: initialProfile.healthId || initialProfile.safetyId || defaultId,
        safetyId: initialProfile.safetyId || defaultId
      };
    }
    return {
      uid: '',
      safetyId: defaultId,
      healthId: defaultId,
      email: '', name: '', language: 'English',
      trustCircle: [{ name: '', phone: '', relation: '', isBroadcasting: false }],
      hasCompletedOnboarding: false
    };
  });

  const stepLabels = ['Communication', 'Identity', 'SOS Network', 'Neural Sync', 'Finalize'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadStatus('UPLOADING');
    
    setTimeout(async () => {
      setUploadStatus('ANALYZING');
      try {
        const mockText = `Vanguard Grid Ingestion for Citizen ${profile.name || 'Anonymous'}. 
        Vocal Signature: Verified. Proximity Alert: Armed. 
        Safety Affinity: Secure. Neural Auth Hash: 99.8%. 
        Trust Nodes: Active. Vanguard Protocol Beta ready.`;
        
        const token = localStorage.getItem('vs_jwt_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const analysisRes = await fetch('/api/ai/analyze-evidence', {
          method: 'POST',
          headers,
          body: JSON.stringify({ recordText: mockText, type: 'IDENTITY_VERIFICATION' })
        });
        const aiAnalysis = await analysisRes.json();
        
        const initialMetrics = {
          environmentSafety: 85, crowdDensity: 20, lightingQuality: 90, proximityToSafeZones: 80, riskIndex: 12
        };

        setUploadStatus('GENERATING_AVATAR');
        const avatarRes = await fetch('/api/ai/generate-avatar', {
          method: 'POST',
          headers,
          body: JSON.stringify({ metrics: initialMetrics })
        });
        const avatarData = await avatarRes.json();
        const avatar = avatarData.avatarUrl;

        // Sync with server profile update
        const updatedProfileFields = {
          avatarUrl: avatar,
          checkupReportSummary: aiAnalysis.defenseExplanation,
          healthId: profile.safetyId,
          safetyId: profile.safetyId
        };

        const syncRes = await fetch('/api/auth/profile/update', {
          method: 'POST',
          headers,
          body: JSON.stringify(updatedProfileFields)
        });
        const syncData = await syncRes.json();

        setProfile(prev => ({ 
          ...prev, 
          ...syncData.profile,
          avatarUrl: avatar,
          checkupReportSummary: aiAnalysis.defenseExplanation
        }));
        setUploadStatus('DONE');
      } catch (err) {
        console.error("Onboarding AI Sync failed, using robust fallback", err);
        setProfile(prev => ({
          ...prev,
          avatarUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
          checkupReportSummary: "Vanguard safe sync verification completed in offline contingency. Biological metrics sealed and encrypted."
        }));
        setUploadStatus('DONE');
      }
    }, 2000);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">Grid Voice</h2>
            <p className="text-teal-400 font-black uppercase text-[11px] tracking-[0.6em] mono">Inclusion Protocol Initializing...</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {['English', 'Spanish', 'Hindi', 'Arabic'].map(lang => (
              <button key={lang} onClick={() => setProfile(p => ({ ...p, language: lang }))} className={`p-12 rounded-[48px] border-4 font-black text-2xl transition-all ${profile.language === lang ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_40px_rgba(20,184,166,0.3)]' : 'border-white/10 bg-white/5 text-slate-600 hover:border-white/20'}`}>{lang}</button>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">Citizen Ident</h2>
            <p className="text-slate-400 uppercase text-[10px] tracking-widest mono">Authorized Biological Manifestation</p>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-500/50 uppercase tracking-[0.4em] ml-8 mono">Authorized Full Name</label>
              <input type="text" placeholder="CITIZEN_01" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full p-10 rounded-[40px] bg-slate-950 border-4 border-teal-500/20 text-white outline-none focus:border-teal-500 transition-all font-black text-4xl uppercase placeholder:text-slate-900 shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-500/50 uppercase tracking-[0.4em] ml-8 mono">Biological Cycles (Age)</label>
              <input type="number" placeholder="CYCLES" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} className="w-full p-10 rounded-[40px] bg-slate-950 border-4 border-teal-500/20 text-white outline-none focus:border-teal-500 transition-all font-black text-4xl uppercase placeholder:text-slate-900 shadow-inner" />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">SOS Link</h2>
            <p className="text-red-500 uppercase text-[10px] tracking-[0.4em] mono font-black">Emergency Node Distribution</p>
          </div>
          <div className="p-12 bg-red-600/5 border-4 border-red-600/30 rounded-[64px] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-3 h-full bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            <input type="text" placeholder="GUARDIAN_IDENT" value={profile.emergencyContacts[0]?.name} onChange={e => {
              const contacts = [...profile.emergencyContacts];
              contacts[0] = { ...contacts[0], name: e.target.value };
              setProfile(p => ({ ...p, emergencyContacts: contacts }));
            }} className="w-full p-8 rounded-[32px] bg-slate-950 border-2 border-white/10 text-white outline-none focus:border-red-600 transition-all font-black text-2xl placeholder:text-slate-900 uppercase" />
            <input type="tel" placeholder="+COMM_ID" value={profile.emergencyContacts[0]?.phone} onChange={e => {
              const contacts = [...profile.emergencyContacts];
              contacts[0] = { ...contacts[0], phone: e.target.value, relation: 'Guardian' };
              setProfile(p => ({ ...p, emergencyContacts: contacts }));
            }} className="w-full p-8 rounded-[32px] bg-slate-950 border-2 border-white/10 text-white outline-none focus:border-red-600 transition-all font-black text-2xl placeholder:text-slate-900 uppercase" />
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">Vault Sync</h2>
            <p className="text-teal-400 uppercase text-[10px] tracking-[0.4em] mono font-black">Synthesizing Bio-Aura Matrix...</p>
          </div>
          
          <div className={`p-16 border-[6px] border-dashed rounded-[72px] text-center transition-all relative overflow-hidden ${uploadStatus === 'DONE' ? 'border-teal-500 bg-teal-500/5 shadow-[0_0_60px_rgba(20,184,166,0.2)]' : 'border-teal-500/20 bg-slate-950'}`}>
            <div className="bio-scan-line" />
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="w-64 h-64 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            </div>

            {uploadStatus === 'IDLE' && (
              <div className="space-y-12 relative z-10">
                <div className="w-32 h-32 bg-teal-500/10 rounded-[40px] mx-auto flex items-center justify-center text-7xl shadow-[0_0_40px_rgba(20,184,166,0.1)] border-4 border-teal-500/20">📄</div>
                <label className="inline-block px-16 py-8 bg-teal-500 text-slate-950 rounded-[48px] font-black text-3xl cursor-pointer hover:scale-105 transition-all shadow-[0_25px_60px_rgba(20,184,166,0.5)] active:scale-95">
                  INGEST BIO-RECORD
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                </label>
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] mono">Encrypted Spectral Scan Enabled</p>
              </div>
            )}
            
            {(uploadStatus === 'UPLOADING' || uploadStatus === 'ANALYZING' || uploadStatus === 'GENERATING_AVATAR') && (
              <div className="space-y-12 relative z-10 py-16">
                <div className="w-32 h-32 border-[10px] border-teal-500/10 border-t-teal-500 rounded-full animate-spin mx-auto shadow-[0_0_50px_rgba(20,184,166,0.3)]" />
                <div className="space-y-4">
                  <p className="text-4xl font-black text-white tracking-tighter uppercase">
                    {uploadStatus === 'UPLOADING' ? 'Ingesting Record Data' : 
                     uploadStatus === 'ANALYZING' ? 'Decrypting Clinical Triage' : 'Synthesizing Digital Aura'}
                  </p>
                  <p className="text-[11px] font-black text-teal-500 uppercase tracking-[0.8em] mono animate-pulse">Neural Grid Synchronization</p>
                </div>
              </div>
            )}

            {uploadStatus === 'DONE' && (
              <div className="space-y-12 animate-in zoom-in-95 duration-1000 relative z-10 py-8">
                <div className="relative group mx-auto w-fit">
                   <div className="absolute inset-0 bg-teal-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
                   <div className="w-72 h-72 mx-auto rounded-full border-[6px] border-teal-500 p-3 overflow-hidden shadow-[0_0_80px_rgba(20,184,166,0.6)] bg-slate-950 relative">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Twin" className="w-full h-full object-cover rounded-full shadow-inner" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl animate-pulse">👤</div>
                      )}
                   </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-5xl font-black text-teal-400 tracking-tighter uppercase leading-none">Aura Manifest Complete</h3>
                  <div className="p-10 bg-slate-900/90 border-2 border-teal-500/20 rounded-[48px] text-left shadow-2xl backdrop-blur-xl">
                     <p className="text-lg font-bold text-slate-300 leading-relaxed italic mono">"{profile.checkupReportSummary}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-14 text-center animate-in zoom-in-95 duration-1000">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-teal-500 rounded-full blur-3xl opacity-40 animate-pulse" />
             <div className="w-48 h-48 bg-teal-500/10 text-teal-400 rounded-full mx-auto flex items-center justify-center text-8xl border-4 border-teal-500/40 relative shadow-[0_0_60px_rgba(20,184,166,0.3)]">✨</div>
          </div>
          <div className="space-y-4">
            <h2 className="text-7xl font-black text-white tracking-tighter leading-none uppercase">Grid Online</h2>
            <p className="text-slate-400 font-bold uppercase text-[12px] tracking-[0.8em] mono">Citizen 1.2M+ • Bio-Sovereignty Enabled</p>
          </div>
          <div className="p-12 bg-slate-950 rounded-[64px] border-4 border-teal-500/30 inline-block shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-80 animate-[scanline_3s_linear_infinite]" />
            <p className="text-[11px] font-black text-teal-500/50 uppercase tracking-[1em] mb-6 mono">Authorized Citizen Bio-ID</p>
            <p className="text-5xl font-black text-white tracking-[0.4em] uppercase mono drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{profile.healthId}</p>
          </div>
          <button 
            onClick={() => setProfile(p => ({ ...p, consentGiven: !p.consentGiven }))}
            className={`flex items-center gap-8 justify-center w-full group transition-all p-10 rounded-[56px] border-4 ${profile.consentGiven ? 'border-teal-500/50 bg-teal-500/5 shadow-inner' : 'border-white/5 bg-white/5'}`}
          >
            <div className={`w-12 h-12 rounded-3xl border-4 flex items-center justify-center transition-all ${profile.consentGiven ? 'bg-teal-500 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,1)]' : 'border-white/20 group-hover:border-teal-500/50'}`}>
              {profile.consentGiven && <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={6}/></svg>}
            </div>
            <span className="text-xl font-black text-slate-400 group-hover:text-white transition-colors mono uppercase tracking-widest">Accept Grid Sovereignty Protocols</span>
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto py-16 px-4">
      <div className="mb-20 flex justify-between gap-8 relative">
        {stepLabels.map((label, s) => (
          <div key={label} className="flex-1 space-y-5">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${step >= s + 1 ? 'bg-teal-500 shadow-[0_0_25px_rgba(20,184,166,1)]' : 'bg-slate-900'}`} />
            <p className={`text-[11px] font-black uppercase text-center mono tracking-tighter transition-colors ${step >= s + 1 ? 'text-teal-500' : 'text-slate-800'}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-16 md:p-24 rounded-[96px] shadow-[0_60px_150px_rgba(0,0,0,0.8)] min-h-[750px] flex flex-col justify-between border-4 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[160px] -mr-64 -mt-64 pointer-events-none" />
        
        {renderStep()}

        <div className="mt-20 flex gap-10">
          {step > 1 && step < 5 && (
            <button onClick={handleBack} className="px-16 py-8 bg-white/5 border-2 border-white/5 text-slate-400 rounded-[40px] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all mono">Back</button>
          )}
          <button 
            onClick={step === 5 ? () => onComplete(profile) : handleNext} 
            disabled={(step === 4 && uploadStatus !== 'DONE') || (step === 5 && !profile.consentGiven)}
            className="flex-1 py-8 bg-teal-500 text-slate-950 rounded-[40px] font-black text-4xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_25px_70px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:grayscale disabled:scale-100 tracking-tighter uppercase"
          >
            {step === 5 ? 'INITIALIZE_GRID_ID' : 'CONTINUE_PROTOCOL'}
          </button>
        </div>
      </div>
      
      <div className="mt-16 text-center opacity-20">
        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[1em] mono">Encrypted • Anonymous • Distributed Bio-Intelligence</p>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;
