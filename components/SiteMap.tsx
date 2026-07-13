import React from 'react';
import { AppView } from '../types';
import { Network, Shield, Cpu, HelpCircle, Activity } from 'lucide-react';

interface SiteMapProps {
  onNavigate: (view: AppView) => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ onNavigate }) => {
  const sections = [
    {
      title: 'Active Defense Hubs',
      color: 'text-indigo-400',
      items: [
        { label: 'Tactical Workspace', view: AppView.DASHBOARD, desc: 'Central Safety OS Terminal', icon: '🏠' },
        { label: 'Evidence Vault', view: AppView.EVIDENCE_LOCKER, desc: 'Encrypted Incident Locker', icon: '🔒' },
        { label: 'AI Threat Assessor', view: AppView.AI_THREAT_DETECTION, desc: 'Neural Urgency & Hazard Classifier', icon: '🧠' },
        { label: 'Stealth & Decoy Tools', view: AppView.DISCREET_TOOLS, desc: 'Decoy dialer & Covert recording', icon: '👁️' },
        { label: 'Voice Detector', view: AppView.VOICE_ASSISTANT, desc: 'AI Safe-word activation mic', icon: '🎙️' }
      ]
    },
    {
      title: 'Structural Systems',
      color: 'text-cyan-400',
      items: [
        { label: 'Safe Harbors Index', view: AppView.SAFE_ZONES, desc: 'Police stations & shelters grid', icon: '🏥' },
        { label: 'Sentry Navigation', view: AppView.SAFE_ROUTES, desc: 'Predictive optimum safe routes', icon: '🗺️' },
        { label: 'Dispatcher Hub', view: AppView.AUTHORITY_DASHBOARD, desc: 'Infrastructure telemetry metrics', icon: '📡' }
      ]
    },
    {
      title: 'Vanguard Networks',
      color: 'text-purple-400',
      items: [
        { label: 'Trust Mesh Contacts', view: AppView.TRUST_CIRCLE, desc: 'Circle guard coordinates', icon: '👥' },
        { label: 'Sovereign Community', view: AppView.VIGILANTE_COMMUNITY, desc: 'Anti-trafficking & Alerts feed', icon: '✊' },
        { label: 'Missing Persons Portal', view: AppView.MISSING_PERSON_PORTAL, desc: 'Index and look up missing cases', icon: '❤️' },
        { label: 'Advocacy Portal', view: AppView.LEGAL_RESOURCES, desc: 'Legal and NGO resource networks', icon: '⚖️' },
        { label: 'Safety Education Hub', view: AppView.SAFETY_EDUCATION, desc: 'Interactive defense lessons', icon: '📚' }
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-44 animate-in fade-in duration-750">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg">
              <Network className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">OS Map</h2>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono">Tactical Integration Topology</p>
        </div>
      </header>

      {/* THREE COLUMN GRID */}
      <div className="grid lg:grid-cols-3 gap-10">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className={`text-xs font-black uppercase tracking-[0.3em] ${section.color} ml-4 mono`}>
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={() => onNavigate(item.view)}
                  className="w-full text-left bg-zinc-950 p-6 rounded-[32px] border-2 border-white/5 shadow-md hover:border-indigo-600/30 hover:scale-102 transition-all group flex items-start gap-4"
                >
                  <div className="text-3xl p-3 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all flex h-14 w-14 items-center justify-center">{item.icon}</div>
                  <div className="space-y-1">
                     <h4 className="font-black text-white text-lg uppercase leading-tight group-hover:text-indigo-400 transition-colors">{item.label}</h4>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mono leading-snug">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM EXPLANATION BANNER */}
      <div className="bg-zinc-950 rounded-[48px] p-10 border-4 border-white/5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
         <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-4">
               <span className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400">Core Architecture</span>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Vanguard Philosophy</h3>
               <p className="text-slate-400 text-sm leading-relaxed font-bold italic font-mono uppercase">
                  Our architecture couples **Real-Time Mesh Alerts** with **Biometric Stealth Decoys**. Every system node operates completely offline-first using client-stored cryptographic states.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-[#030712] rounded-3xl border border-white/5">
                  <p className="text-3xl font-black text-indigo-400 mono leading-none">14</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Modules Mapped</p>
               </div>
               <div className="p-6 bg-[#030712] rounded-3xl border border-white/5">
                  <p className="text-3xl font-black text-emerald-400 mono leading-none">100%</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Node Integrity</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default SiteMap;
