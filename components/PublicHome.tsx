import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, Zap, MapPin, Eye, Clock, Phone, Lock, 
  Users, Radio, MessageSquare, ArrowRight, BookOpen, Volume2, 
  ShieldAlert, Award, Star, Globe, Navigation, Heart, ShieldCheck, CheckCircle2
} from 'lucide-react';

interface PublicHomeProps {
  onGetStarted: () => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ onGetStarted }) => {
  // SOS activation simulator state
  const [isSimulatingSOS, setIsSimulatingSOS] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosLogs, setSosLogs] = useState<string[]>([]);
  const [activeTraffickingTab, setActiveTraffickingTab] = useState<'RED_FLAGS' | 'DEFENSIVE_TACTICS' | 'HELP_NETWORK'>('RED_FLAGS');
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // Statistics Chart interactive node hover
  const [hoveredStatIndex, setHoveredStatIndex] = useState<number | null>(null);

  // SOS Countdown logic
  useEffect(() => {
    let timer: any;
    if (isSimulatingSOS && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(prev => prev - 1);
        const logMessages = [
          "SECURE VPN NODE ROUTE SANITIZED",
          "GEO-LOCATION ACQUIRED [GPS 0.1M RESOLUTION]",
          "STREAMING AMBIENT COVERT AUDIO FEED",
          "ALERT SIGNAL DISPATCHED TO TRUST CIRCLE MESH",
          "ESTABLISHING HIGH-PRIORITY FIRST RESPONDER HANDSHAKE"
        ];
        // Add random log message based on countdown
        const idx = 5 - sosCountdown;
        if (logMessages[idx]) {
          setSosLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logMessages[idx]}`]);
        }
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ALERT FULLY DEPLOYED to authorities and selected guardian nodes.`]);
    }
    return () => clearTimeout(timer);
  }, [isSimulatingSOS, sosCountdown]);

  const triggerSOSSimulation = () => {
    if (isSimulatingSOS) {
      // Reset
      setIsSimulatingSOS(false);
      setSosCountdown(5);
      setSosLogs([]);
    } else {
      setIsSimulatingSOS(true);
      setSosLogs([`[${new Date().toLocaleTimeString()}] BIOMETRIC PULSE DETECTED. SOS INITIALIZED.`]);
    }
  };

  const statData = [
    { label: 'JAN', safeNodes: 450, responseSec: 0.9 },
    { label: 'FEB', safeNodes: 680, responseSec: 0.7 },
    { label: 'MAR', safeNodes: 920, responseSec: 0.6 },
    { label: 'APR', safeNodes: 1100, responseSec: 0.4 },
    { label: 'MAY', safeNodes: 1450, responseSec: 0.4 },
  ];

  const stories = [
    {
      name: "Valerie K.",
      role: "Sovereign Operator [Chicago Mesh]",
      comment: "Vanguard saved me during a late-night commute transit failure. I tapped the Covert Alarm, and the dynamic route engine safely navigated me to a verified emergency container pod within 3 minutes.",
      rating: 5,
      date: "May 2026"
    },
    {
      name: "Tanya M.",
      role: "Protected Node [Mumbai Guardian Circle]",
      comment: "The Human Trafficking warning nodes in the app helped our advocacy group identify and immediately report forced passport coercion tactics at a major transit portal. Truly tactical tech.",
      rating: 5,
      date: "April 2026"
    },
    {
      name: "Elena R.",
      role: "NGO Coordinator & Legal Advocate",
      comment: "We upload physical harassment telemetry hashes directly into the Evidence Vault. Knowing it's fully decentralized, safe from hostile edits, and cryptographically sound has completely changed the game.",
      rating: 5,
      date: "February 2026"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="space-y-32 py-8 text-slate-100 min-h-screen">
      
      {/* 1. HERO SECTION & NEON HEADER */}
      <section className="relative px-4 max-w-6xl mx-auto space-y-12">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-12 right-12 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />

        {/* HERO HEADER CALLOUT */}
        <div className="text-center space-y-6 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-950/40 border border-red-500/30 rounded-full text-red-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Vanguard Sovereign Security Shield
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase italic"
          >
            Tactical <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-red-400 filter drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              Safety Mesh
            </span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-bold uppercase mono tracking-wide"
          >
            Zero-knowledge protective infrastructure. Bio-pulse dispatch coordinates, offline cryptographic evidence vaults, and sentinel community routing models.
          </motion.p>
        </div>

        {/* HERO CTAs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg hover:bg-indigo-500 hover:scale-105 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3 border border-indigo-400/30 group uppercase tracking-widest"
          >
            Enter Tactical Console 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
          
          <a 
            href="#cyber-sos"
            className="w-full sm:w-auto px-12 py-6 bg-zinc-950 text-slate-400 border-2 border-white/5 rounded-[32px] font-black text-lg hover:border-indigo-500/30 hover:text-white transition-all active:scale-95 text-center uppercase tracking-widest"
          >
            Test Biometric SOS
          </a>
        </motion.div>

        {/* ACTIVE MESH TELEMETRY STATUS BAR */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-10 opacity-60 text-[10px] font-black uppercase tracking-[0.34em] mono text-slate-500 relative z-10 text-center">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> AES-GCM Encryption Locked</div>
          <div className="h-4 w-px bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Mapped Safety Safe Harbors: 1,450+</div>
          <div className="h-4 w-px bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Active Dispatches Mapped: Real-Time</div>
        </div>
      </section>

      {/* 2. DYNAMIC LIVE SOS SIMULATOR (SOS ACCESS) */}
      <section id="cyber-sos" className="max-w-6xl mx-auto px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[180px] pointer-events-none" />
        
        <div className="bg-zinc-950 border-4 border-white/5 rounded-[64px] p-8 md:p-16 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* SOS Trigger Info */}
            <div className="lg:col-span-7 space-y-6">
              <span className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 mono inline-block">
                Sovereign Anti-Harassment Node
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
                Biometric <br/>
                <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">Emergency SOS</span> Trigger
              </h2>
              <p className="text-slate-400 text-sm font-semibold uppercase leading-relaxed font-mono">
                Clicking the biometric sensor below simulates a real emergency dispatch. The system secures terminal state, launches coordinates tracking, clears background logs, and prepares an encrypted audio witness recording.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase mono">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-black">1</span>
                  Hold or click high-sensitivity node to fire.
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase mono">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-black">2</span>
                  5-second abort countdown prevents accidental dispatches.
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase mono">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-black">3</span>
                  Triggers secondary silent decoy call routes.
                </div>
              </div>
            </div>

            {/* Simulated SOS Controller Dial */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/40 border border-white/5 p-8 rounded-[48px] shadow-inner space-y-6">
              
              <div className="relative flex items-center justify-center">
                {/* Glowing Circles */}
                <span className={`absolute inset-0 rounded-full border border-red-500/20 ${isSimulatingSOS ? 'animate-ping' : ''}`} />
                <span className={`absolute -inset-4 rounded-full border-2 border-red-500/10 ${isSimulatingSOS ? 'animate-pulse' : ''}`} />
                
                <button 
                  onClick={triggerSOSSimulation}
                  className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-[8px] border-zinc-900 transition-all select-none relative z-10 ${
                    isSimulatingSOS 
                      ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.8)] scale-105 text-white' 
                      : 'bg-zinc-950 hover:bg-slate-900 shadow-[0_0_30px_rgba(239,68,68,0.15)] text-red-500 border-red-500/20'
                  }`}
                >
                  <Radio className={`w-8 h-8 mb-2 ${isSimulatingSOS ? 'animate-bounce' : 'animate-pulse'}`} />
                  <span className="font-black text-xl tracking-tight uppercase leading-none">
                    {isSimulatingSOS ? 'ACTIVE' : 'TEST SOS'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">
                    {isSimulatingSOS ? 'TAP TO ABORT' : 'BIOMETRIC PUSH'}
                  </span>
                </button>
              </div>

              {/* Countdown or Status Text */}
              <div className="text-center">
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mono">Trigger Status</p>
                {isSimulatingSOS ? (
                  <p className="text-2xl font-black text-red-500 tracking-tighter uppercase anim-pulse mt-1">
                    {sosCountdown > 0 ? `Aborting in ${sosCountdown}s` : 'ALERT DISPATCHED'}
                  </p>
                ) : (
                  <p className="text-lg font-black text-slate-300 tracking-tight uppercase mt-1">
                    STANDBY NODE
                  </p>
                )}
              </div>

              {/* Simulated Logs Stream */}
              <div className="w-full bg-[#030712] p-4 rounded-2xl border border-white/5 max-h-[140px] overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 text-left select-none">
                {sosLogs.length === 0 ? (
                  <div className="text-center text-slate-600 py-4 uppercase font-black tracking-wider">
                     Waiting for sensor pulse input...
                  </div>
                ) : (
                  sosLogs.map((log, lidx) => (
                    <div key={lidx} className="border-l-2 border-red-500 pl-2 text-red-400">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TACTICAL HUMAN TRAFFICKING AWARENESS MODULE */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <header className="text-center space-y-2">
          <div className="inline-flex gap-2 items-center justify-center p-2 rounded-2xl bg-indigo-505/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest mono">
             <ShieldAlert size={14} className="text-indigo-400 animate-pulse" /> Global Combat Node
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Anti Human Trafficking <br/>
            <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.25)]">Awareness & Prevention</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest max-w-2xl mx-auto mono">
             Identifying Coercive Operations, Safehouse Escape Vectors, and Judicial Extraction Channels.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Action Tabs Menu */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
             {[
               { id: 'RED_FLAGS', label: '1. Spotting Coercive Signs', desc: 'Identify forced control of identification cards, controlled movement, and high-risk spatial indicators.' },
               { id: 'DEFENSIVE_TACTICS', label: '2. Escape Vector Tactics', desc: 'Sovereign containment bypass techniques, distress indicators, and safe route routing corridors.' },
               { id: 'HELP_NETWORK', label: '3. Strategic NGO Assets', desc: 'Secure links to global extraction teams, rapid psychological first aid, and diplomatic legal groups.' }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTraffickingTab(tab.id as any)}
                 className={`p-6 text-left rounded-[32px] border-2 transition-all flex flex-col justify-between h-full ${
                    activeTraffickingTab === tab.id 
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-xl scale-102' 
                      : 'bg-zinc-950 border-white/5 hover:border-white/10'
                 }`}
               >
                 <div>
                    <h4 className="font-black text-lg text-white uppercase tracking-tight mb-2">{tab.label}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-snug mono">{tab.desc}</p>
                 </div>
                 <div className="text-[9px] font-black tracking-widest uppercase mt-4 text-indigo-400 mono">
                    {activeTraffickingTab === tab.id ? 'ACTIVE DRILL' : 'LOAD PROTOCOL →'}
                 </div>
               </button>
             ))}
          </div>

          {/* Active Drilling Content Card */}
          <div className="lg:col-span-8 bg-zinc-950 p-8 md:p-12 border-4 border-white/5 rounded-[48px] shadow-2xl flex flex-col justify-between relative overflow-hidden">
             
             {/* Dynamic Ambient Background Glow */}
             <div className="absolute top-1/2 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

             <AnimatePresence mode="wait">
               {activeTraffickingTab === 'RED_FLAGS' && (
                 <motion.div 
                   key="red-flags"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.4 }}
                   className="space-y-6"
                 >
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-cyan-400 text-xs font-black uppercase tracking-widest mono">COERCION & SIGNS DETECTION</span>
                       <span className="text-red-500 font-mono text-[9px] font-black uppercase bg-red-500/10 px-2 py-1 rounded">HIGH DANGER INDICATOR</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Passbook & Identifying Constraints</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Individual is never permitted to handle their own physical passport, work visa, or security passcodes. Hostile handlers maintain structural control of papers.
                         </p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Pre-scripted Verbal Dialogue</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Subject exhibits severe visual reservation, avoids any direct eye contact with travel clerks, and recites mechanical responses confirming transport consent.
                         </p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Coercive Social Shadowing</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Subject is constantly shadowed, flanked, or guided by non-family guardians who intercept and respond to all social attempts at conversation.
                         </p>
                      </div>
                    </div>
                 </motion.div>
               )}

               {activeTraffickingTab === 'DEFENSIVE_TACTICS' && (
                 <motion.div 
                   key="defensive-tactics"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.4 }}
                   className="space-y-6"
                 >
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-cyan-400 text-xs font-black uppercase tracking-widest mono">COVERT EXTRACTION TECHNIQUES</span>
                       <span className="text-amber-400 font-mono text-[9px] font-black uppercase bg-amber-500/10 px-2 py-1 rounded">TACTICAL RECOVERY ROUTINE</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Physical Distress Hand Gestures</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Deploy the global Signal for Help: Raise palm facing outward, tuck thumb into palm, and fold fingers down over thumb to communicate distress silently.
                         </p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Node Dispersal Safezone Trajectories</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Utilize Vanguard Safe Zones navigation to locate police pods, verified emergency shelter safe havens, and community-patrolled safe containers.
                         </p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                         <h5 className="font-black text-white text-sm uppercase mb-1">Encrypted Witness Capture Loop</h5>
                         <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">
                            Trigger short-cut discreet audio stream capture. Instantly offload raw voice recording or ambient background clips to our decentralized IPFS Evidence Vault.
                         </p>
                      </div>
                    </div>
                 </motion.div>
               )}

               {activeTraffickingTab === 'HELP_NETWORK' && (
                 <motion.div 
                   key="help-network"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.4 }}
                   className="space-y-6"
                 >
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-cyan-400 text-xs font-black uppercase tracking-widest mono">RECOVERY & ADVOCACY CHANNELS</span>
                       <span className="text-emerald-500 font-mono text-[9px] font-black uppercase bg-emerald-500/10 px-2 py-1 rounded">VERIFIED NETWORKS</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                         <div>
                            <h5 className="font-black text-white text-sm uppercase mb-1">Polaris Project Anti-Trafficking</h5>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">Hotline: 1-888-373-7888 (US Area Support Desk)</p>
                         </div>
                         <a href="tel:18883737888" className="p-3 bg-indigo-600 rounded-xl hover:scale-105 transition-all text-white text-xs font-black uppercase">DIAL</a>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                         <div>
                            <h5 className="font-black text-white text-sm uppercase mb-1">Vanguard Cyber Extraction Unit</h5>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">Decentralized anti-coercion mesh desk</p>
                         </div>
                         <span className="px-4 py-2 bg-[#030712] border border-white/10 rounded-xl text-slate-500 text-[10px] font-mono">ONLINE</span>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                         <div>
                            <h5 className="font-black text-white text-sm uppercase mb-1">UN Office on Drugs and Crime (AHTU)</h5>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wide">Sovereign Human Rights Intervention Teams</p>
                         </div>
                         <span className="px-4 py-2 bg-indigo-600/10 border border-indigo-505/20 rounded-xl text-indigo-400 text-[10px] font-mono font-black">SUPPORT</span>
                      </div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-emerald-400" />
                   <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Tactical Training Code V5.2 Mapped</p>
                </div>
                <button 
                  onClick={onGetStarted}
                  className="px-6 py-2 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all"
                >
                   Complete Tutorial Drill
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURE SHOWCASE CARDS */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <header className="text-center space-y-2">
          <span className="px-4 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest mono">
             OPERATIONAL CAPABILITIES
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
             Core Ecosystem Modules
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest max-w-xl mx-auto mono">
             Engineered specifically to survive signal jamming, hostile surveillance, and immediate distress.
          </p>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            {
              title: "Discreet Decoy Tools",
              desc: "Simulate incoming voice calling, load cover interfaces, and capture audio telemetry completely backgrounded.",
              icon: <Eye className="w-8 h-8 text-indigo-400" />,
              badge: "BACKGROUND STEALTH"
            },
            {
              title: "Decentralized Locker",
              desc: "Upload local photos, medical notes, or witness audio directly. Immutable logs backed up by client-side crypt keys.",
              icon: <Lock className="w-8 h-8 text-cyan-400" />,
              badge: "ENCRYPTED STORAGE"
            },
            {
              title: "Sentinel Guardian AI",
              desc: "Smart voice-guided safe-word listening tracks threat levels and silently triggers dispatch upon micro-matches.",
              icon: <Radio className="w-8 h-8 text-red-400" />,
              badge: "VOICE-ACTIVATED AI"
            },
            {
              title: "Optimal Safe Routes",
              desc: "Live route analyzer tracks crowd density, lighting ratios, and proximity to active law pods dynamically.",
              icon: <Navigation className="w-8 h-8 text-emerald-400" />,
              badge: "PREDICTIVE ROUTING"
            }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-zinc-950 p-8 rounded-[40px] border-2 border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-full shadow-lg group"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600/10 transition-colors">
                  {card.icon}
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-xl text-white uppercase tracking-tight leading-tight">{card.title}</h4>
                   <p className="text-slate-400 text-xs leading-relaxed font-semibold uppercase tracking-wide">{card.desc}</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[8px] font-black text-slate-500 tracking-wider font-mono uppercase bg-white/5 px-2 py-1 rounded">
                   {card.badge}
                 </span>
                 <button 
                   onClick={onGetStarted}
                   className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors flex items-center gap-1 font-mono"
                 >
                   TEST
                   <ArrowRight size={12} />
                 </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. TACTICAL SAFETY STATISTICS SECTION */}
      <section className="max-w-6xl mx-auto px-4 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
         
         <div className="bg-[#030612] border-4 border-white/5 p-8 md:p-16 rounded-[64px] shadow-3xl space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
               <div className="space-y-2">
                  <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-405 inline-block text-cyan-400 mono">
                    TELEMETRY GRAPHICS
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
                     Mesh Sentinel Growth
                  </h2>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest max-w-sm font-mono leading-relaxed">
                  Historical tracking of verified guard containment nodes mapped and average response dispatch dispatch latency.
               </p>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Stat Callout Numbers */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                 {[
                   { label: 'Active Guard Mapped', val: '1,450', unit: 'NODES', color: 'text-indigo-400' },
                   { label: 'Avg Dispatch Lag', val: '0.4', unit: 'SECONDS', color: 'text-red-500' },
                   { label: 'Crisis Calls Met', val: '100%', unit: 'ACCURACY', color: 'text-emerald-400' },
                   { label: 'Zero-Knowledge Vault', val: '0', unit: 'LEAK LOGS', color: 'text-cyan-400' }
                 ].map((box, bidx) => (
                   <div key={bidx} className="bg-zinc-950 p-6 rounded-[32px] border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono">{box.label}</span>
                     <div className="mt-4">
                        <span className={`text-4xl font-extrabold tracking-tighter block leading-none ${box.color}`}>{box.val}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono block mt-1">{box.unit}</span>
                     </div>
                   </div>
                 ))}
              </div>

              {/* Dynamic Interactive SVG Stat Line Chart */}
              <div className="lg:col-span-7 bg-[#05091a] p-8 rounded-[48px] border-2 border-white/5 space-y-4">
                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    <span>Vanguard Mesh Expansion Index</span>
                    <span className="text-indigo-400 font-black">Interactive Chart [Hover points]</span>
                 </div>

                 {/* Simulated Chart Container */}
                 <div className="relative pt-8 h-48 flex items-end justify-between px-6">
                    {/* SVG Chart Line */}
                    <svg className="absolute inset-x-0 bottom-0 h-40 w-full overflow-visible pointer-events-none" viewBox="0 0 400 120" preserveAspectRatio="none">
                       {/* Background Gradient Area */}
                       <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"/>
                             <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                          </linearGradient>
                       </defs>
                       
                       <path 
                         d="M 10 90 Q 100 70 200 45 T 390 10" 
                         fill="none" 
                         stroke="#4f46e5" 
                         strokeWidth="4" 
                         filter="url(#glow)"
                       />
                       
                       <path 
                         d="M 10 90 Q 100 70 200 45 T 390 10 L 390 120 L 10 120 Z" 
                         fill="url(#chartGlow)"
                       />
                    </svg>

                    {/* Interactive points */}
                    {statData.map((pt, pidx) => {
                       const heights = [30, 50, 75, 90, 110];
                       const isHovered = hoveredStatIndex === pidx;
                       return (
                         <div 
                           key={pidx} 
                           className="flex flex-col items-center justify-end h-full relative group cursor-pointer"
                           onMouseEnter={() => setHoveredStatIndex(pidx)}
                           onMouseLeave={() => setHoveredStatIndex(null)}
                         >
                            {/* Hover Metric Banner */}
                            <div className={`absolute bottom-32 bg-indigo-6500 border border-indigo-500 bg-zinc-950 p-3 rounded-xl shadow-2xl z-20 transition-all ${
                              isHovered ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
                            } min-w-[125px] text-center`}>
                               <p className="text-[10px] font-black text-indigo-400 font-mono uppercase leading-none">{pt.label}</p>
                               <p className="text-xs font-black text-white mt-1">VERIFIED: {pt.safeNodes} Mapped</p>
                               <span className="text-[8px] font-mono font-black text-emerald-400">DISPATCH SEC: {pt.responseSec}s</span>
                            </div>

                            {/* Point on the line */}
                            <div 
                              className={`w-3.5 h-3.5 rounded-full border-2 border-indigo-400 bg-slate-950 flex shadow-[0_0_12px_rgba(79,70,229,0.8)] items-center justify-center transition-all ${
                                isHovered ? 'scale-150 bg-indigo-500' : 'scale-100'
                              }`} 
                              style={{ marginBottom: `${heights[pidx]}px` }} 
                            />

                            {/* Monthly Label */}
                            <span className="text-[10px] font-mono font-black text-slate-500 mt-2">{pt.label}</span>
                         </div>
                       );
                    })}
                 </div>

                 <div className="bg-black/40 p-4 border border-white/5 rounded-2xl flex justify-between items-center text-xs text-slate-400 font-mono font-black uppercase">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Active Guards</span>
                    <span className="text-slate-600">Response Latency dropping month-over-month</span>
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* 6. HOLOGRAPHIC VERIFIED TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <header className="text-center space-y-2">
          <span className="px-4 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest mono">
             COVERT CONSOLE REVIEWS
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
             Active Agent Testimonials
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest max-w-xl mx-auto mono">
             Verified encrypted testimony uploaded directly via the Vanguard secure messaging networks anonymously.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {stories.map((t, idx) => (
            <div 
              key={idx}
              className={`p-10 rounded-[48px] border-2 transition-all flex flex-col justify-between h-full ${
                idx === activeStoryIdx 
                  ? 'bg-zinc-950 border-indigo-500/40 shadow-2xl' 
                  : 'bg-zinc-950/60 border-white/5 hover:border-white/10'
              }`}
              onClick={() => setActiveStoryIdx(idx)}
            >
               <div className="space-y-6">
                  {/* Stars indicators */}
                  <div className="flex gap-1.5">
                     {[...Array(t.rating)].map((_, i) => (
                       <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                     ))}
                  </div>

                  <p className="text-slate-300 text-xs md:text-sm font-bold uppercase leading-relaxed font-mono">
                     "{t.comment}"
                  </p>
               </div>

               <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                     <p className="font-extrabold text-white uppercase tracking-tight text-sm">{t.name}</p>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono mt-0.5">{t.role}</p>
                  </div>
                  <span className="text-[8px] font-mono font-black text-slate-500">{t.date}</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SECURE LANDING FOOTER WITH EMERGENCY CONTACTS */}
      <footer className="border-t-4 border-white/5 bg-zinc-950 pt-20 pb-44 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          
          {/* Main Footer Row */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white font-black text-xl shadow-lg">V</div>
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Vanguard OS</h3>
                    <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-1 mono">Tactical Safety Mesh Networks</p>
                 </div>
               </div>
               <p className="text-slate-500 text-xs font-semibold leading-relaxed uppercase tracking-wide">
                  Building open, cryptographic, zero-knowledge security grids that restore defensive sovereignty to women. Run locally, decentralized globally, validated perpetually.
               </p>
            </div>

            {/* Emergency Hotline Desks grid */}
            <div className="lg:col-span-7 space-y-6">
               <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-500 mono flex items-center gap-2">
                  <Phone className="w-4 h-4 animate-pulse" /> Emergency Hotline Connection portals
               </h4>

               <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Domestic Harassment', number: '1091', region: 'India Area Desk' },
                    { label: 'Cyber Security Response', number: '1930', region: 'Digital Crimes Pod' },
                    { label: 'Human Trafficking desk', number: '1-888-373-7888', region: 'Polaris US Hub' },
                    { label: 'Mental Psychological desk', number: '988', region: 'Psychological Crisis Response' },
                    { label: 'Advocacy Legal Support', number: '1800-444-555', region: 'General NGO Legal Assist' },
                    { label: 'Police Sentry Dispatch', number: '911 / 100', region: 'Local Law Pods' }
                  ].map((hotline, hidx) => (
                    <div key={hidx} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                       <div>
                          <p className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{hotline.label}</p>
                          <span className="text-[7.5px] text-indigo-400 font-mono font-black uppercase tracking-wider">{hotline.region}</span>
                       </div>
                       <a href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`} className="mt-4 font-black font-mono text-lg text-white hover:text-indigo-400 transition-colors leading-none tracking-tight block">
                          {hotline.number}
                       </a>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sitemaps direct link shortcut and credits */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs font-mono font-semibold tracking-wider text-slate-500 gap-6">
             <div className="flex flex-wrap gap-8 uppercase font-black">
                <a href="#cyber-sos" className="hover:text-indigo-400 select-none">SOS SIMULATOR</a>
                <span>•</span>
                <button onClick={onGetStarted} className="hover:text-indigo-400 uppercase">ACCESS PANEL</button>
                <span>•</span>
                <span className="text-slate-600 font-bold uppercase">ZERO USER TRACKING ACTIVE</span>
             </div>
             <p className="uppercase text-center md:text-right text-[10px] text-slate-600 font-black">
                © {new Date().getFullYear()} VANGUARD SYSTEM. BUILT FOR SOVEREIGN SEPARATION ENFORCEMENT.
             </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default PublicHome;
