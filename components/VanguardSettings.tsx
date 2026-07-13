
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Lock, Bell, User, Zap, EyeOff, Radio, LogOut, Sliders } from 'lucide-react';

interface SettingsPanelProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

const VanguardSettings: React.FC<SettingsPanelProps> = ({ profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PROTOCOLS' | 'PRIVACY' | 'SECURITY'>('IDENTITY');
  const [customSms, setCustomSms] = useState(localStorage.getItem('vs_custom_sos_message') || "Emergency Distress Signal triggered via Vanguard Tactical Safety. Assistance needed immediately!");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  const fetchIncidentHistory = async () => {
    setLoadingIncidents(true);
    const token = localStorage.getItem('vs_jwt_token');
    if (!token) {
      setLoadingIncidents(false);
      return;
    }
    try {
      const resp = await fetch('/api/sos/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error("Vanguard incident fetch error:", e);
    } finally {
      setLoadingIncidents(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'PROTOCOLS') {
      fetchIncidentHistory();
    }
  }, [activeTab]);

  const handleSaveCustomMessage = (val: string) => {
    setCustomSms(val);
    localStorage.setItem('vs_custom_sos_message', val);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 italic font-black text-2xl">C</div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Sovereignty Control</h2>
        </div>
        <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] mono ml-1">Orchestrate Tactical Identity & Extraction Protocols</p>
      </header>

      <div className="flex gap-6 p-3 bg-zinc-950 rounded-[32px] w-fit border-2 border-white/5">
        {[
          { id: 'IDENTITY', label: 'Identity', icon: User },
          { id: 'PROTOCOLS', label: 'SOS Protocols', icon: Bell },
          { id: 'PRIVACY', label: 'Vault Privacy', icon: EyeOff },
          { id: 'SECURITY', label: 'Node Security', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {activeTab === 'IDENTITY' && (
          <div className="lg:col-span-12 grid md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4">
            <section className="bg-zinc-950 p-10 rounded-[64px] border-4 border-white/5 shadow-2xl space-y-10">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                <User className="text-indigo-400" /> Tactical Profile
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] group">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 mono">Grid ID</p>
                     <p className="font-black text-white mono uppercase truncate group-hover:text-indigo-400 transition-colors">{profile?.healthId}</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 mono">Sector Rank</p>
                     <p className="font-black text-white italic uppercase tracking-wider">Vanguard Alpha</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 mono">Verified Alias</p>
                   <p className="text-xl font-black text-white tracking-tighter uppercase italic">{profile?.name}</p>
                </div>
                <button className="w-full py-6 bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">Update Grid Identity</button>
              </div>
            </section>

            <section className="bg-zinc-950 p-10 rounded-[64px] border-4 border-white/5 shadow-2xl space-y-10">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                <Radio className="text-red-400" /> Signal Priority
              </h3>
              <div className="space-y-6">
                 <div className="grid gap-4">
                    {profile?.emergencyContacts.map((c, i) => (
                      <div key={i} className="p-6 bg-red-600/5 border-2 border-red-500/20 rounded-[32px] flex justify-between items-center group">
                        <div>
                          <p className="font-black text-white uppercase text-sm tracking-tight italic">{c.name}</p>
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mono">{c.relation}</p>
                        </div>
                        <span className="font-black text-slate-400 mono text-xs">{c.phone}</span>
                      </div>
                    ))}
                 </div>
                 <button className="w-full py-6 border-2 border-red-500/20 text-red-500 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Expand Trust Network</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'PROTOCOLS' && (
          <div className="lg:col-span-12 p-12 bg-zinc-950 rounded-[64px] border-4 border-white/5 shadow-3xl space-y-12 animate-in slide-in-from-right-4">
             <header className="space-y-2">
                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Automated Rescue Logic</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mono">Tactical Response Customization</p>
             </header>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { label: 'SOS Countdown Delay', val: '5s', desc: 'Grace period before signal broadcast starts.' },
                  { label: 'Guardian AI Triage', val: 'SENSITIVE', desc: 'Autonomous threat detection sensitivity level.' },
                  { label: 'Stealth Audio Trigger', val: 'ON', desc: 'Activates silent recording on broadcast initiation.' }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/5 border-2 border-white/10 rounded-[48px] space-y-6 group hover:border-indigo-600/40 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                       <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight w-2/3">{item.label}</h4>
                       <span className="text-lg font-black text-indigo-400 mono italic">{item.val}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase italic mono leading-relaxed">{item.desc}</p>
                    <div className="mt-4 flex gap-2">
                       <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 w-1/2" />
                       </div>
                    </div>
                  </div>
                ))}
             </div>

             {/* Custom Emergency SOS message block */}
             <div className="p-10 bg-zinc-900/40 rounded-[48px] border-2 border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                   <Bell className="text-red-500 animate-pulse" />
                   <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Custom Emergency SOS Message</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase italic mono leading-tight">This secure custom message is appended to your active real-time GPS coordinates and dispatched to your trust network immediately upon SOS confirmation.</p>
                <textarea 
                  value={customSms}
                  onChange={(e) => handleSaveCustomMessage(e.target.value)}
                  placeholder="E.g. I am in danger near this sector. My Vanguard tracking is active."
                  className="w-full p-8 bg-zinc-950 border-2 border-white/10 rounded-[32px] text-zinc-100 font-mono text-sm outline-none focus:border-red-500/50 transition-all h-28 focus:ring-1 focus:ring-red-500/20"
                />
             </div>

             {/* Emergency History Logs block */}
             <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                      <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Emergency Incident Registry Logs</h4>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mono">Simulated Persistent MongoDB Collection</p>
                   </div>
                   <button 
                     onClick={fetchIncidentHistory}
                     className="px-6 py-3 bg-slate-900 border border-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors mono"
                   >
                     RELOAD DATABASE
                   </button>
                </div>

                {loadingIncidents ? (
                  <div className="p-16 text-center text-xs font-bold text-slate-500 uppercase mono animate-pulse border-2 border-dashed border-white/5 rounded-[40px]">Querying Vanguard Incident database...</div>
                ) : incidents.length === 0 ? (
                  <div className="p-16 text-center text-xs font-bold text-slate-600 uppercase border-2 border-dashed border-white/5 rounded-[40px] mono">No critical emergency incident signatures archived.</div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {incidents.map((inc) => (
                      <div key={inc.id} className="p-8 bg-slate-950/80 border-2 border-white/5 rounded-[40px] space-y-6 transition-all hover:border-red-500/25">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black tracking-wider uppercase mono border border-red-500/25">{inc.id}</span>
                            <span className="text-[11px] text-slate-500 font-semibold mono">{new Date(inc.timestamp).toLocaleString()}</span>
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider mono ${inc.status === 'ACTIVE' ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 bg-white/5 p-6 rounded-[24px] font-mono leading-relaxed border border-white/5">{inc.emergencyMessage}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-[10px] text-slate-400 mono bg-black/40 p-6 rounded-[32px] border border-white/5">
                           <div>
                              <span className="text-slate-600 uppercase tracking-tight font-black block mb-0.5">Location Vector:</span> 
                              <a href={`https://www.google.com/maps?q=${inc.coordinates.lat},${inc.coordinates.lng}`} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                                 {inc.coordinates.lat.toFixed(6)}, {inc.coordinates.lng.toFixed(6)} 🌐
                              </a>
                           </div>
                           <div>
                              <span className="text-slate-600 uppercase tracking-tight font-black block mb-0.5">SMS Transmission:</span> 
                              <span className="text-indigo-400 font-black uppercase">{inc.smsStatus}</span>
                           </div>
                           {inc.smsDetails && (
                             <div className="col-span-2 text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-1 leading-relaxed">
                                <span className="text-slate-600 uppercase font-black block mb-1">Network Details:</span>
                                {inc.smsDetails}
                             </div>
                           )}
                        </div>
                        
                        {inc.status === 'ACTIVE' && (
                          <button 
                            onClick={async () => {
                              const token = localStorage.getItem('vs_jwt_token');
                              if (!token) return;
                              try {
                                const r = await fetch('/api/sos/resolve', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ incidentId: inc.id })
                                });
                                if (r.ok) fetchIncidentHistory();
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="w-full py-5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-2 border-red-500/20 hover:border-red-600 font-black text-xs uppercase tracking-widest rounded-3xl transition-all"
                          >
                            Mark Distress Signal Resolved
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
             
             <div className="p-10 bg-indigo-600 rounded-[48px] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
                <div className="relative z-10 space-y-2 text-center md:text-left">
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter">Tactical Override Sync</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mono">Sync extraction blueprints with local enforcement nodes</p>
                </div>
                <button className="relative z-10 px-12 py-5 bg-white text-indigo-900 rounded-[28px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">INITIATE SYNC</button>
             </div>
          </div>
        )}

        {activeTab === 'PRIVACY' && (
          <div className="lg:col-span-12 bg-zinc-950 text-white p-12 rounded-[64px] border-4 border-white/5 shadow-3xl space-y-12 animate-in slide-in-from-left-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
             <div className="relative z-10 space-y-4 text-center">
                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">The Vault Cryptography</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mono">Zero-Trust Evidence Archiving</p>
             </div>
             
             <div className="grid md:grid-cols-2 gap-10 relative z-10">
                {[
                  { label: 'Auto-Purge Post Judicial', desc: 'Permanently deletes evidence 24h after successful handoff to authorities.' },
                  { label: 'Anonymous Mesh Network', desc: 'Obfuscate your grid location using tactical node bouncing.' },
                  { label: 'Biometric Grid Key', desc: 'Require neural-face ID for every evidence vault unlock.' }
                ].map((item, i) => (
                  <div key={i} className="p-10 bg-white/5 border-2 border-white/10 rounded-[48px] flex flex-col justify-between group hover:border-indigo-500/50 transition-all cursor-pointer">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <Lock size={20} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                         <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white">{item.label}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic mono uppercase">{item.desc}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mono">Policy Status: SECURE</span>
                       <div className="w-14 h-8 bg-indigo-600 rounded-full p-1 relative shadow-inner">
                          <div className="absolute right-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-8 bg-white text-zinc-950 rounded-[48px] font-black text-xl uppercase italic tracking-tighter shadow-3xl hover:scale-[1.01] active:scale-[0.99] transition-all">WIPE ALL CRYPTOGRAPHIC CONSENTS</button>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="lg:col-span-12 space-y-10 animate-in zoom-in-95">
            <section className="bg-zinc-950 p-12 rounded-[64px] border-4 border-white/5 shadow-2xl space-y-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-red-600/10 border-2 border-red-500/20 rounded-[32px] flex items-center justify-center text-white mb-4">
                  <Shield size={48} className="text-red-500" />
               </div>
               <div className="space-y-4 max-w-xl">
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Tactical Extraction</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono leading-relaxed">Terminating this session will disconnect all grid links and local havens from your bio-signature.</p>
               </div>
               <button 
                onClick={onLogout}
                className="group flex items-center gap-4 px-12 py-6 bg-red-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
               >
                 <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                 Sign Out & Clear Grid Pulse
               </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default VanguardSettings;
