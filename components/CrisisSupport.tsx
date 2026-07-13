
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Phone, MessageSquare, Shield, AlertTriangle, Radio, Mic, Video, XCircle, Heart, CheckCircle2 } from 'lucide-react';

const MOCK_RESPONDERS = [
  {
    id: 'r1',
    name: 'Officer Vance',
    role: 'Vanguard First Responder',
    rating: 4.9,
    verified: true,
    experience: 12,
    bio: 'Tactical responder specialized in neighborhood extraction and conflict de-escalation.',
    availability: ['AVAILABLE NOW', 'Today, 5:30 PM']
  },
  {
    id: 'r2',
    name: 'Elena Rossi',
    role: 'Crisis Counselor',
    rating: 4.7,
    verified: true,
    experience: 8,
    bio: 'Senior counselor with focus on trauma recovery and emergency relocation.',
    availability: ['AVAILABLE NOW', 'Tomorrow, 9:00 AM']
  },
  {
    id: 'r3',
    name: 'Shield-Node 42',
    role: 'Autonomous AI Guard',
    rating: 5.0,
    verified: true,
    experience: 99,
    bio: 'AI-driven rapid triage and emergency telemetry monitoring.',
    availability: ['ALWAYS ONLINE']
  }
];

interface CrisisSupportProps {
  profile: UserProfile | null;
  onEmergency: () => void;
}

const CrisisSupport: React.FC<CrisisSupportProps> = ({ profile, onEmergency }) => {
  const [view, setView] = useState<'RESPONDERS' | 'ACTIVE_BRIDGE' | 'RESOURCES'>('RESPONDERS');
  const [activeCall, setActiveCall] = useState<any>(null);

  const startBridge = (responder: any) => {
    setActiveCall(responder);
    setView('ACTIVE_BRIDGE');
  };

  const endBridge = () => {
    setActiveCall(null);
    setView('RESPONDERS');
  };

  return (
    <div className="min-h-[70vh] animate-in fade-in duration-700 pb-40">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/20 italic font-black text-2xl">B</div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">The Bridge</h2>
          </div>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] mono ml-1">Direct Secure Uplink to Tactical Responders</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Responder Density</p>
              <p className="text-xl font-black text-emerald-400 mono italic">HIGH</p>
           </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-6 mb-12 bg-zinc-950 px-6 py-3 rounded-[32px] w-fit border-2 border-white/5">
        {[
          { id: 'RESPONDERS', label: 'Tactical Uplink', icon: Radio },
          { id: 'RESOURCES', label: 'Self Defense', icon: Shield }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setView(tab.id as any)} 
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'RESPONDERS' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_RESPONDERS.map(res => (
            <div key={res.id} className="bg-zinc-950 rounded-[56px] border-4 border-white/5 p-10 hover:border-indigo-600/40 transition-all flex flex-col justify-between group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
               
               <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-transform group-hover:rotate-6">
                      {res.name[0]}
                    </div>
                    {res.verified && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">{res.name}</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic mono mb-6">{res.role} • {res.experience}Y</p>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed italic mono uppercase mb-8">"{res.bio}"</p>
               </div>

               <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] mono ml-1">Responder Status</p>
                  {res.availability.map(time => (
                    <button 
                      key={time}
                      onClick={() => startBridge(res)}
                      className="w-full py-5 bg-white/5 border-2 border-white/10 rounded-[32px] text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <Phone size={14} />
                      {time}
                    </button>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {view === 'ACTIVE_BRIDGE' && activeCall && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col lg:flex-row animate-in zoom-in-95 duration-500">
           <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="w-full h-full border-[2px] border-indigo-500 animate-pulse" />
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)] animate-[scan_4s_linear_infinite]" />
              </div>
              <div className="text-center space-y-10 z-10 p-12">
                 <div className="w-56 h-56 bg-indigo-600 rounded-[64px] mx-auto flex items-center justify-center text-8xl font-black text-white shadow-[0_0_100px_rgba(79,70,229,0.4)] animate-flicker relative">
                    {activeCall.name[0]}
                    <div className="absolute inset-0 border-4 border-white/20 rounded-[64px] animate-ping" />
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{activeCall.name}</h2>
                    <p className="text-indigo-400 font-black uppercase tracking-[0.6em] mono text-lg">ENCRYPTED UPLINK ACTIVE</p>
                 </div>
                 <div className="flex gap-8 justify-center">
                    <button className="w-20 h-20 bg-white/5 border-2 border-white/10 rounded-[32px] flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group">
                       <Mic size={32} />
                    </button>
                    <button className="w-20 h-20 bg-white/5 border-2 border-white/10 rounded-[32px] flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group">
                       <Video size={32} />
                    </button>
                    <button onClick={endBridge} className="w-20 h-20 bg-red-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all">
                       <Phone size={32} />
                    </button>
                 </div>
              </div>

              {/* Patient Data HUD (Simulation) */}
              <div className="absolute top-12 left-12 grid grid-cols-2 gap-4">
                 {[
                   { label: 'Latency', val: '42ms', color: 'text-emerald-500' },
                   { label: 'Uplink', val: 'SECURE', color: 'text-indigo-400' },
                   { label: 'GPS LOCK', val: 'FIXED', color: 'text-emerald-500' },
                   { label: 'BATTERY', val: `${profile?.healthScore || 85}%`, color: 'text-amber-500' }
                 ].map(hud => (
                   <div key={hud.label} className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl min-w-[120px]">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono mb-1">{hud.label}</p>
                      <p className={`text-sm font-black mono italic ${hud.color}`}>{hud.val}</p>
                   </div>
                 ))}
              </div>

              {/* User Self Feed */}
              <div className="absolute bottom-12 right-12 w-64 h-80 bg-zinc-900 rounded-[56px] border-4 border-white/10 shadow-3xl overflow-hidden flex items-center justify-center group">
                 <p className="text-[10px] font-black text-slate-700 uppercase mono">Camera Feed</p>
                 <div className="absolute top-6 right-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-white mono uppercase tracking-widest">LIVE</span>
                 </div>
              </div>
              
              {/* Emergency Trigger */}
              <button 
                onClick={onEmergency}
                className="absolute top-12 right-12 flex items-center gap-4 px-10 py-5 bg-red-600 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-red-700 hover:scale-105 transition-all group"
              >
                <AlertTriangle size={20} className="animate-bounce" />
                Dispatch Extraction Team
              </button>
           </div>

           <div className="w-full lg:w-[480px] bg-zinc-950 flex flex-col p-12 border-l border-white/5 shadow-3xl">
              <header className="mb-12 space-y-4">
                 <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Bridge Assist</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono">Vanguard Analytics</p>
              </header>

              <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
                 <div className="p-8 bg-indigo-600/5 rounded-[48px] border-2 border-indigo-500/10 space-y-6">
                    <div className="flex items-center gap-4">
                       <Shield size={24} className="text-indigo-400" />
                       <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Vanguard Intelligence</h4>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 italic mono uppercase">
                          <span>Identity Status</span>
                          <span className="text-white">VERIFIED</span>
                       </div>
                       <div className="p-6 bg-black/40 rounded-[32px] border border-white/5">
                          <p className="text-xs font-bold text-indigo-300 leading-relaxed italic mono uppercase">
                            "Responder extraction time estimated at 4.2 mins for current Sector grid coordinate."
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono ml-1 px-1">Case Notes</h4>
                    <div className="grid gap-4">
                       {[
                         { icon: MessageSquare, label: 'Add Incident Tag', color: 'text-indigo-400' },
                         { icon: Heart, label: 'Mark Emotional Status', color: 'text-red-400' },
                         { icon: XCircle, label: 'Report Breach', color: 'text-slate-500' }
                       ].map((item, i) => (
                         <button key={i} className="w-full p-6 bg-white/5 border-2 border-white/10 rounded-[32px] flex items-center gap-6 hover:bg-white hover:text-black transition-all group">
                            <item.icon size={20} className={item.color} />
                            <span className="text-[9px] font-black uppercase tracking-widest mono">{item.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="mt-12">
                 <button onClick={endBridge} className="w-full py-6 bg-white text-zinc-950 rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">Secure & Terminate Uplink</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-flicker { animation: flicker 2s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CrisisSupport;
