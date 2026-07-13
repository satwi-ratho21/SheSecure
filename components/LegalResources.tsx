
import React, { useState } from 'react';
import { Shield, BookOpen, Scaling as Scale, PhoneCall, ArrowRight, Gavel, Users, HeartHandshake } from 'lucide-react';

const MOCK_RESOURCES = [
  {
    id: 'res_1',
    name: 'Vanguard Legal Shield',
    category: 'LEGAL',
    description: 'Direct access to pro-bono attorneys specializing in safety and protection orders.',
    benefit: 'Free Consultation',
    aiInsight: 'Based on your recent SOS logs, you qualify for priority legal counsel matching.'
  },
  {
    id: 'res_2',
    name: 'SafeHaven NGO Network',
    category: 'SHELTER',
    description: 'Verified emergency housing and confidential safe-house locations across the grid.',
    benefit: 'Confidential Access',
    aiInsight: 'Immediate extraction assistance available in your current sector.'
  },
  {
    id: 'res_3',
    name: 'Digital Rights Guard',
    category: 'DIGITAL',
    description: 'Workshops and tools to secure your digital footprint and block unauthorized tracking.',
    benefit: 'Privacy Audit',
    aiInsight: 'Advanced encryption protocols recommended for your Trust Circle comms.'
  }
];

const LegalResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'LEGAL' | 'SHELTER'>('ALL');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <BookOpen size={24} />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Sovereign Resources</h2>
          </div>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] mono ml-1">Legal, Shelter, and Advocacy Infrastructure</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Status</p>
              <p className="text-xl font-black text-emerald-400 mono">READY</p>
           </div>
        </div>
      </header>

      <section className="bg-zinc-950 p-10 rounded-[64px] border-4 border-white/5 relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-6 flex-1">
               <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">Vanguard Rights Console</h3>
               <p className="text-sm font-bold text-slate-400 italic mono uppercase leading-relaxed max-w-2xl">
                 Your safety extends beyond the physical. Access the infrastructure of legal protection and verified safe harbors through our distributed network.
               </p>
               <div className="flex gap-4">
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2">
                     <Gavel size={16} /> Legal Portal
                  </button>
                  <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                     <HeartHandshake size={16} /> NGO Support
                  </button>
               </div>
            </div>
            <div className="w-full md:w-auto">
               <div className="p-8 bg-white/5 border-2 border-white/10 rounded-[56px] text-center space-y-4 min-w-[280px]">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mono">Active Protections</p>
                  <div className="w-20 h-20 mx-auto bg-indigo-600/20 rounded-[28px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                     <Scale size={32} />
                  </div>
                  <h4 className="text-2xl font-black text-white mono">LEVEL 4</h4>
                  <p className="text-[8px] font-bold text-slate-700 leading-relaxed uppercase mono">High-Tier Advocacy Linked</p>
               </div>
            </div>
         </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
         {MOCK_RESOURCES.map(res => (
           <div key={res.id} className="bg-zinc-950 p-10 rounded-[56px] border-4 border-white/5 hover:border-indigo-600/40 transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 transition-transform group-hover:scale-110 group-hover:bg-indigo-600/10">
                       {res.category === 'LEGAL' ? <Gavel className="text-indigo-400" /> : res.category === 'SHELTER' ? <Shield className="text-emerald-400" /> : <Users className="text-indigo-400" />}
                    </div>
                    <span className="text-indigo-400 font-black text-xl mono">{res.benefit}</span>
                 </div>
                 <h4 className="text-2xl font-black text-white tracking-tighter uppercase mb-3">{res.name}</h4>
                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed mb-8 uppercase mono">{res.description}</p>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-[32px] shadow-inner">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 mono">Vanguard Insight</p>
                    <p className="text-[10px] font-black text-slate-400 italic leading-snug uppercase">"{res.aiInsight}"</p>
                 </div>
                 <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[32px] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group/btn">
                    Access Portal <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
         ))}
      </div>

      <div className="p-10 bg-zinc-950 border-4 border-indigo-500/20 rounded-[64px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
         <div className="max-w-xl space-y-4 relative z-10">
            <h4 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Advocacy Stacking</h4>
            <p className="text-sm font-bold text-slate-400 leading-relaxed italic mono uppercase">
              By combining **Legal Shield** with **NGO Sheltering**, our AI has calculated a **40% higher probability** of sustained safety resolution within 30 days.
            </p>
         </div>
         <button className="whitespace-nowrap px-10 py-5 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
            Initiate Stacked Protocal
         </button>
      </div>

    </div>
  );
};

export default LegalResources;
