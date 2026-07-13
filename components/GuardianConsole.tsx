
import React from 'react';
import { Activity, Shield, AlertCircle, Zap, Globe, Siren, Target, Terminal } from 'lucide-react';

interface GuardianConsoleProps {
  onNavigateToRecords?: () => void;
}

const GuardianConsole: React.FC<GuardianConsoleProps> = ({ onNavigateToRecords }) => {
  const incidents = [
    { id: '1', sector: 'Sector 4', severity: 'HIGH', type: 'Unverified Report', time: '2m ago' },
    { id: '2', sector: 'Downtown', severity: 'LOW', type: 'Infrastructure Failure', time: '15m ago' },
    { id: '3', sector: 'Residential East', severity: 'CRITICAL', type: 'SOS BROADCAST', time: 'NOW' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 italic font-black text-2xl">G</div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Guardian Console</h2>
          </div>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] mono ml-1 px-1">Global Perimeter Monitoring & Resource Orchestration</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
              <span className="text-[10px] font-black uppercase tracking-widest">NETWORK LINK STABLE</span>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-zinc-950 p-12 rounded-[64px] border-4 border-white/5 shadow-3xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3 uppercase">
                    <Activity className="text-indigo-400" /> Tactical Incident Feed
                  </h3>
               </div>
               <div className="px-4 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-500 tracking-widest mono">
                  Live Sync Active
               </div>
            </div>

            <div className="space-y-6">
              {incidents.map(incident => (
                <div key={incident.id} className="flex items-center justify-between p-8 bg-white/5 border-2 border-white/10 rounded-[48px] hover:border-indigo-600/40 transition-all group cursor-pointer shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Target className="text-indigo-400 w-12 h-12" />
                  </div>

                  <div className="flex gap-6 items-center relative z-10">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl shadow-xl ${
                      incident.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                      incident.severity === 'HIGH' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-slate-400'
                    }`}>
                      {incident.severity === 'CRITICAL' ? <Siren /> : <Shield />}
                    </div>
                    <div>
                      <p className="font-black text-white text-2xl tracking-tighter uppercase">{incident.sector}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mono">
                        {incident.type} • {incident.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 relative z-10">
                    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                      incident.severity === 'CRITICAL' ? 'bg-red-600 text-white shadow-red-600/20' : 
                      incident.severity === 'HIGH' ? 'bg-amber-600 text-white shadow-amber-600/20' : 'bg-white/10 text-slate-400'
                    }`}>
                      {incident.severity}
                    </span>
                    <button 
                      onClick={onNavigateToRecords}
                      className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                      AUDIT DATA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-6">
             {[
               { icon: Globe, label: 'Sector Control', val: '92%', detail: 'Total Verified' },
               { icon: Zap, label: 'Response Latency', val: '4.2m', detail: 'Average' },
               { icon: Shield, label: 'Safety Clusters', val: '142', detail: 'Active Now' }
             ].map((stat, i) => (
                <div key={i} className="bg-zinc-950 p-8 rounded-[48px] border border-white/5 text-center space-y-2 group hover:border-indigo-500/30 transition-all cursor-crosshair">
                   <stat.icon className="w-8 h-8 mx-auto text-indigo-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mono">{stat.label}</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.val}</p>
                   <p className="text-[8px] font-bold text-indigo-500 uppercase mono">{stat.detail}</p>
                </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-900 p-10 rounded-[56px] text-white shadow-3xl border-4 border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
             
             <header className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                  <Terminal size={24} />
                </div>
                <div>
                   <h3 className="font-black text-2xl tracking-tighter uppercase italic leading-none">Vanguard Overmind</h3>
                   <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mono mt-1">Global AI Intelligence</p>
                </div>
             </header>

             <div className="space-y-6">
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all">
                  <div className="absolute top-0 right-0 p-4">
                     <AlertCircle size={20} className="text-red-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 mono">Critical Pattern Detected</p>
                  <p className="text-sm font-bold leading-relaxed italic mono uppercase text-slate-300">
                    Irregular movement patterns detected in Sector 4. Recommending illumination increase in peripheral havens.
                  </p>
                </div>

                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 group hover:bg-white/10 transition-all">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 mono">Grid Resilience Report</p>
                  <p className="text-sm font-bold leading-relaxed italic mono uppercase text-slate-300">
                    Trusted network density in Downtown has matched peak levels from previous cycle.
                  </p>
                </div>
             </div>

             <button 
               onClick={onNavigateToRecords}
               className="w-full mt-10 py-6 bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
             >
               ACCESS DATA CRYPT
             </button>
          </section>
          
          <section className="bg-zinc-950 p-10 rounded-[56px] border border-white/5 shadow-inner space-y-10">
             <div className="space-y-2 text-center">
                <h4 className="font-black text-white text-[10px] uppercase tracking-[0.4em] mono">Network Pulse</h4>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mono">
                      <span className="text-slate-500">Resource Saturation</span>
                      <span className="text-emerald-500">OPTIMAL</span>
                   </div>
                   <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-[88%] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mono">
                      <span className="text-slate-500">Node Connectivity</span>
                      <span className="text-indigo-400">94.2%</span>
                   </div>
                   <div className="flex items-end justify-between h-20 gap-1">
                      {[30, 45, 90, 65, 40, 25, 50, 85, 70, 50, 80, 95].map((h, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-t-lg transition-all duration-1000 ${i === 11 ? 'bg-indigo-400 shadow-lg' : 'bg-white/10'}`} 
                          style={{ height: `${h}%` }} 
                        />
                      ))}
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuardianConsole;
