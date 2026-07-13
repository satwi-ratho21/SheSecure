
import React from 'react';

const DesignSystem: React.FC = () => {
  return (
    <div className="space-y-16 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="max-w-2xl">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Bio-Intelligence UI Kit</h2>
        <p className="text-slate-500 font-medium text-lg mt-4">Defining the visual language of Sovereign Health.</p>
      </header>

      {/* 🎨 COLOR PALETTE */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Core Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[
            { name: 'Base Depth', hex: '#020617', class: 'bg-slate-950' },
            { name: 'Surface', hex: '#0f172a', class: 'bg-slate-900' },
            { name: 'Neon Teal', hex: '#14b8a6', class: 'bg-teal-500' },
            { name: 'Electric Indigo', hex: '#6366f1', class: 'bg-indigo-600' },
            { name: 'Emergency Red', hex: '#ef4444', class: 'bg-red-600' }
          ].map(color => (
            <div key={color.name} className="space-y-3">
              <div className={`${color.class} h-24 rounded-[32px] shadow-lg border border-white/5 bento-inner-shadow`} />
              <div>
                <p className="font-black text-slate-900 text-sm leading-none">{color.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mono mt-1 uppercase">{color.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔘 BUTTON STYLES */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Action Elements</h3>
        <div className="flex flex-wrap gap-8 items-center bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm">
          <button className="px-10 py-5 bg-teal-500 text-slate-900 rounded-[32px] font-black text-lg hover-lift shadow-xl shadow-teal-500/20 active:scale-95">Primary Action</button>
          <button className="px-10 py-5 bg-slate-900 text-white rounded-[32px] font-black text-lg hover-lift shadow-xl shadow-slate-900/10 active:scale-95">Command Button</button>
          <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-[28px] font-black text-base hover:border-indigo-600 transition-all active:scale-95">Secondary</button>
          <button className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-xl sos-pulse shadow-xl shadow-red-500/30 hover:scale-110 transition-transform">SOS</button>
        </div>
      </section>

      {/* 🧬 CARD ARCHITECTURE */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Card Architecture (Bento)</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Glass Card */}
          <div className="glass-card p-10 rounded-[64px] border border-white/10 shadow-2xl space-y-4">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🪟</div>
             <h4 className="text-2xl font-black text-white">Glass Surface</h4>
             <p className="text-slate-400 text-sm leading-relaxed">High-blur backdrop for clinical clarity and depth.</p>
          </div>

          {/* AI Insight Card */}
          <div className="bg-white p-10 rounded-[64px] border border-indigo-100 shadow-sm ai-insight-glow relative overflow-hidden group hover:scale-[1.02] transition-all">
             <div className="absolute top-0 right-0 p-4 bg-indigo-600 text-white text-[10px] font-black rounded-bl-[32px] uppercase">AI Active</div>
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:rotate-12 transition-transform">🤖</div>
             <h4 className="text-2xl font-black text-slate-900">Insight Layer</h4>
             <p className="text-slate-500 text-sm leading-relaxed mt-2">Subtle indigo glow identifies machine-generated proactive health tips.</p>
          </div>

          {/* Emergency Card */}
          <div className="bg-red-50 p-10 rounded-[64px] border border-red-100 shadow-xl space-y-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
             <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-red-500/30">!</div>
             <h4 className="text-2xl font-black text-red-600">Crisis Mode</h4>
             <p className="text-red-900/60 text-sm leading-relaxed font-bold">High-contrast red palette for immediate cognitive attention.</p>
          </div>
        </div>
      </section>

      {/* 🎙️ VOICE FEEDBACK */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Inclusive Interaction</h3>
        <div className="bg-indigo-700 p-12 rounded-[72px] text-white flex flex-col items-center gap-10 shadow-3xl border-4 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <div className="text-center">
            <h4 className="text-3xl font-black mb-2">Voice Feedback Pulse</h4>
            <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Accessibility Standard 2.1</p>
          </div>
          <div className="flex gap-4 items-center h-20">
             {[0.1, 0.4, 0.2, 0.8, 0.5, 0.9, 0.3].map((delay, i) => (
               <div key={i} className="w-3 bg-white rounded-full animate-[bounce_1s_infinite] shadow-lg shadow-white/20" style={{ height: `${30 + delay * 70}%`, animationDelay: `${delay}s` }} />
             ))}
          </div>
          <p className="text-indigo-100 text-sm italic font-medium">"Visualizing sound for illiterate and elderly users."</p>
        </div>
      </section>

      {/* 🔡 TYPOGRAPHY */}
      <section className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm space-y-12">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Typography System</h3>
        <div className="space-y-10">
          <div>
            <p className="text-xs text-slate-400 font-black uppercase mb-4 mono">Heading 1 / Plus Jakarta Sans Black</p>
            <p className="text-7xl font-black text-slate-900 tracking-tighter">Unified Bio-Identity.</p>
          </div>
          <div>
             <p className="text-xs text-slate-400 font-black uppercase mb-4 mono">Body Lead / Plus Jakarta Sans Medium</p>
             <p className="text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl">
               HealthVerse operates on a zero-trust architecture. You own the keys, the AI provides the map.
             </p>
          </div>
          <div className="p-8 bg-slate-950 rounded-3xl border border-white/10">
             <p className="text-[10px] text-teal-400 font-black uppercase mb-4 mono tracking-[0.4em]">System Data / JetBrains Mono</p>
             <p className="text-3xl font-black text-white mono tracking-widest uppercase">HV-1024-8832-TX</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
