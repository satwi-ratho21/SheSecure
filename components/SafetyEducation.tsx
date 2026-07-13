import React, { useState } from 'react';
import { 
  BookOpen, Shield, ShieldCheck, HelpCircle, PhoneCall, Scale, 
  Video, Eye, Lock, ArrowRight, Zap, Target, BookOpenCheck 
} from 'lucide-react';

interface EducationArticle {
  id: string;
  title: string;
  category: 'PHYSICAL_DEFENSE' | 'DIGITAL_HYGIENE' | 'LEGAL_RIGHTS';
  summary: string;
  steps: string[];
  visualVector?: string;
}

const ARTICLES: EducationArticle[] = [
  {
    id: 'a1',
    title: 'De-escalation & Spatial Boundary Defense',
    category: 'PHYSICAL_DEFENSE',
    summary: 'Maintain safe ranges and utilize tactical verbal indicators to neutralize escalation without immediate combat.',
    steps: [
      "Establish active combat-ready stance (one foot back slightly, arms high up near chest with palms open pointing outward).",
      "Speak in a calm, flat but extremely firm, deep tone. Repeat boundaries clearly ('Step back. I do not want to talk to you.').",
      "Scan the perimeter background quadrant continuously. Look for lighting corridors and crowded exits.",
      "Identify the 2-meter physical boundary bubble. Trigger Silent SOS if this threshold is breached."
    ]
  },
  {
    id: 'a2',
    title: 'Physical Joint Lock & Separation Angle',
    category: 'PHYSICAL_DEFENSE',
    summary: 'Critical physical defensive strikes to escape and break wrist grabs, hair grabs, or body locks.',
    steps: [
      "Wrist grab escape: Rotate your wrist sharply towards the attacker's thumbs (the weakest grip gap) and tear away.",
      "Rear bear-hug escape: Drop your weight immediately to lower your center of gravity. Stomp heavily on the attacker's feet, and strike backwards forcibly to their groin.",
      "Aim for high-vulnerability targets: Eyes, nose, throat, ears, groin, and shins. Strike with maximum explosive energy."
    ]
  },
  {
    id: 'a3',
    title: 'Digital Footprint Scrubber Routine',
    category: 'DIGITAL_HYGIENE',
    summary: 'Sanitize your active digital nodes and remove metadata tracking markers to prevent digital stalking.',
    steps: [
      "Access mobile system cameras and toggle off 'Save Location Latitude' / geo-tagging properties.",
      "Clear continuous bluetooth discovery layers. Turn off location sharing permission across non-tactical services.",
      "Generate nested passwords using modern cryptographic protocols. Avoid reusing security identifiers.",
      "Establish automated periodic device logs reset every 30 days."
    ]
  },
  {
    id: 'a4',
    title: 'Filing Immediate Restraining & Protection Orders',
    category: 'LEGAL_RIGHTS',
    summary: 'Sovereign judicial tools to compel threatening individuals to preserve separation boundaries under legal penalties.',
    steps: [
      "Log and trace harassment timestamps. Safe-keep these logs directly inside the Evidence Vault to generate hashes.",
      "Visit the local magistrate clerk, fill the petition for restraining order, and supply the verified evidence locker hashes.",
      "State clear credible threat indicators of imminent physical distress to trigger a temporary ex-parte injunction.",
      "Transmit the served copy immediately to Vanguard circles so guardians can monitor boundary enforcement."
    ]
  }
];

const SafetyEducation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PHYSICAL_DEFENSE' | 'DIGITAL_HYGIENE' | 'LEGAL_RIGHTS'>('ALL');
  const [activeArticle, setActiveArticle] = useState<EducationArticle | null>(ARTICLES[0]);

  return (
    <div className="space-y-12 animate-in fade-in duration-750 pb-44">
      
      {/* HEADER ROW */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white border border-white/10 shadow-lg">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Edu Hub</h2>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono">Physical, Digital, and Sovereign Guidelines</p>
        </div>

        {/* QUICK ASSISTANT HELPLINES */}
        <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center gap-3 shadow-inner">
           <PhoneCall className="w-4 h-4 text-red-500 animate-pulse" />
           <p className="text-[10px] font-black tracking-widest uppercase text-slate-300 mono">Emergency Desk: 1091 / 911</p>
        </div>
      </header>

      {/* FILTER BUTTONS */}
      <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-3xl flex flex-wrap gap-2">
         {[
           { id: 'ALL', label: 'All Lectures' },
           { id: 'PHYSICAL_DEFENSE', label: 'Physical self-defense' },
           { id: 'DIGITAL_HYGIENE', label: 'Cyber Privacy' },
           { id: 'LEGAL_RIGHTS', label: 'Legal Sovereignty' }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setSelectedCategory(tab.id as any)}
             className={`flex-1 min-w-[130px] py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
               selectedCategory === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
             }`}
           >
              {tab.label}
           </button>
         ))}
      </div>

      {/* CORE SPLIT SCREEN */}
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* ARTICLES LISTING */}
        <div className="lg:col-span-6 space-y-6">
           <h3 className="text-xl font-black text-white uppercase tracking-tight ml-2">Available Modules</h3>
           
           <div className="space-y-4">
              {ARTICLES
                .filter(a => selectedCategory === 'ALL' || a.category === selectedCategory)
                .map(art => (
                  <button
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className={`w-full p-6 text-left rounded-[32px] border-2 transition-all group flex flex-col justify-between ${
                      activeArticle?.id === art.id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-xl' : 'bg-zinc-950 border-white/5 hover:border-white/10'
                    }`}
                  >
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                           <span className={`text-[8px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded ${
                             art.category === 'PHYSICAL_DEFENSE' ? 'bg-orange-500/20 text-orange-400' :
                             art.category === 'DIGITAL_HYGIENE' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                           }`}>
                              {art.category.replace('_', ' ')}
                           </span>
                           <span className="text-slate-600 text-[9px] font-mono">STEP-BY-STEP</span>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase group-hover:text-indigo-400 transition-colors leading-tight">{art.title}</h4>
                        <p className="text-[10.5px] font-bold text-slate-500 leading-relaxed uppercase mono">{art.summary}</p>
                     </div>
                  </button>
                ))}
           </div>
        </div>

        {/* ACTIVE MODULE PREVIEW IN-DEPTH */}
        <div className="lg:col-span-6">
           {activeArticle ? (
             <div className="bg-zinc-950 p-10 rounded-[48px] border-4 border-white/5 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
                <header className="border-b border-white/5 pb-6">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mono mb-1">Interactive Active Tactical Guide</p>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-snug">{activeArticle.title}</h3>
                </header>

                <div className="space-y-6">
                   <p className="text-sm font-bold text-slate-400 italic font-mono uppercase">Follow these physical and logical steps to activate response defense:</p>
                   
                   <div className="space-y-4">
                      {activeArticle.steps.map((st, sidx) => (
                        <div key={sidx} className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl group/item hover:bg-indigo-600/5 transition-all">
                           <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-mono font-black text-white text-xs flex-shrink-0 shadow-lg">
                              {sidx + 1}
                           </div>
                           <p className="text-xs font-semibold leading-relaxed text-slate-200 uppercase tracking-wide">{st}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 bg-[#030712] rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <div>
                         <p className="text-[10px] font-black text-white uppercase">Vanguard Training Standard</p>
                         <p className="text-[9px] text-slate-500 mono uppercase">Audit completed by legal/defense boards</p>
                      </div>
                   </div>
                   <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-all">
                      Test Skill <ArrowRight size={10} />
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center border-4 border-dashed border-white/5 rounded-[48px] p-20 text-center opacity-40">
                <p className="text-xs uppercase font-mono text-slate-500 font-black">Choose a specific safety seminar module from left menu</p>
             </div>
           )}
        </div>

      </div>

      {/* QUICK ASSISTANCE NUMBERS DIRECT LINK */}
      <section className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-6 shadow-2xl">
         <div className="space-y-1">
            <h4 className="text-lg font-black text-white uppercase italic flex items-center gap-2">
               <Scale className="text-indigo-400" /> Human Advocacy and Legal Support Helplines
            </h4>
            <p className="text-xs font-medium text-slate-500">Instant connection portals matching non-profits, psychological first-aid desks, and security networks.</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'National Women Helpline', num: '1091', target: 'tel:1091' },
              { label: 'Anti Human Trafficking Unit', num: '1800-111-3040', target: 'tel:18001113040' },
              { label: 'Vanguard Cyber Response', num: '+1 (555) 091-CYBER', target: '#' },
              { label: 'Psychological Crisis Support', num: '988', target: 'tel:988' }
            ].map(hotline => (
              <a 
                key={hotline.label} 
                href={hotline.target} 
                className="p-6 bg-[#05050c] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3 group"
              >
                 <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider mono leading-tight">{hotline.label}</span>
                 <div className="flex justify-between items-center mt-1">
                    <span className="text-lg font-black text-indigo-400 font-mono tracking-tight group-hover:text-indigo-300 transition-colors">{hotline.num}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">→</div>
                 </div>
              </a>
            ))}
         </div>
      </section>

    </div>
  );
};

export default SafetyEducation;
