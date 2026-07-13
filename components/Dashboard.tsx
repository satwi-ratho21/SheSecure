import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, UserProfile } from '../types';
import { 
  Shield, 
  Lock, 
  MapPin, 
  Radio, 
  Users, 
  Scale, 
  Compass, 
  Zap, 
  Eye, 
  AlertTriangle, 
  Heart, 
  ShieldAlert, 
  ShieldCheck, 
  Brain,
  Globe,
  Cpu,
  Wifi,
  Key,
  Database,
  Crosshair,
  TrendingUp,
  Activity,
  UserCheck,
  Map,
  Fingerprint,
  Bell
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile | null;
  onNavigate: (view: AppView) => void;
  onEmergency: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onNavigate, onEmergency }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [activeRadarAngle, setActiveRadarAngle] = useState(0);
  const [radarPings, setRadarPings] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Update high-fidelity UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate custom radar sweeps & spawn random scanning pings
  useEffect(() => {
    const radarInterval = setInterval(() => {
      setActiveRadarAngle((prev) => (prev + 2) % 360);
    }, 16);

    const pingInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setRadarPings((prev) => [
          ...prev.slice(-3), // Keep only last few pings
          {
            id: Date.now(),
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            size: 8 + Math.random() * 12
          }
        ]);
      }
    }, 2000);

    return () => {
      clearInterval(radarInterval);
      clearInterval(pingInterval);
    };
  }, []);

  // Security Command Modules with rich, responsive telemetry data
  const operations = [
    {
      id: 2,
      label: 'Guardian AI',
      view: AppView.GUARDIAN_AI,
      icon: Eye,
      color: 'cyan',
      desc: 'Predictive risk projections',
      metrics: [
        { name: 'Active Predictions', val: '0 Threats Detected', glow: 'text-emerald-400' },
        { name: 'Confidence Ratio', val: '99.8% Nominal', glow: 'text-cyan-400' },
        { name: 'Live Analysis', val: 'ACTIVE SCAN', glow: 'text-cyan-400 animate-pulse' }
      ]
    },
    {
      id: 3,
      label: 'AI Threat Assessor',
      view: AppView.AI_THREAT_DETECTION,
      icon: Brain,
      color: 'cyan',
      desc: 'Neural risk & hazard classifier',
      metrics: [
        { name: 'Current Risk', val: '12% Low Hazard', glow: 'text-emerald-400' },
        { name: 'Classification', val: 'STABLE SECTOR', glow: 'text-cyan-400' },
        { name: 'Neural Score', val: '94/100 Secured', glow: 'text-cyan-400' }
      ]
    },
    {
      id: 4,
      label: 'Cyber Safety',
      view: AppView.CYBER_SAFETY_REPORTING,
      icon: ShieldAlert,
      color: 'red',
      desc: 'Anti-sextortion & identity shield',
      metrics: [
        { name: 'Breach Incidents', val: '0 Reports Active', glow: 'text-emerald-400' },
        { name: 'Dark Web Sweep', val: 'SECURE', glow: 'text-emerald-400' },
        { name: 'Impersonation Shield', val: 'ARMED', glow: 'text-red-400' }
      ]
    },
    {
      id: 6,
      label: 'Safe Zones',
      view: AppView.SAFE_ZONES,
      icon: MapPin,
      color: 'blue',
      desc: 'Shelters & immediate safe havens',
      metrics: [
        { name: 'Nearby Shelters', val: '3 Verified', glow: 'text-cyan-400' },
        { name: 'Police Intercepts', val: '2 Units Standby', glow: 'text-blue-400' },
        { name: 'Medical Response', val: '4 Ready Hubs', glow: 'text-emerald-400' }
      ]
    },
    {
      id: 8,
      label: 'Trust Circle',
      view: AppView.TRUST_CIRCLE,
      icon: Users,
      color: 'emerald',
      desc: 'Private verified contact mesh',
      metrics: [
        { name: 'Linked Sentinels', val: `${profile?.trustCircle?.length || 4} Active Mesh`, glow: 'text-emerald-400' },
        { name: 'Hotlink Contacts', val: '2 Broadcasting', glow: 'text-cyan-400' },
        { name: 'Heartbeat Check', val: '100% RESPONSIVE', glow: 'text-emerald-400' }
      ]
    },
    {
      id: 9,
      label: 'Incident Feed',
      view: AppView.VIGILANTE_COMMUNITY,
      icon: Radio,
      color: 'red',
      desc: 'Live area intelligence',
      metrics: [
        { name: 'Local Alerts', val: '0 Hazards Reported', glow: 'text-emerald-400' },
        { name: 'Area Intelligence', val: 'STABLE ZONE', glow: 'text-emerald-400' },
        { name: 'Telemetry Update', val: '3 Mins Ago', glow: 'text-slate-400' }
      ]
    },
    {
      id: 10,
      label: 'Community Rescue',
      view: AppView.COMMUNITY_RESCUE,
      icon: ShieldCheck,
      color: 'emerald',
      desc: 'Rescue beacons & live dispatch',
      metrics: [
        { name: 'Vanguard Responders', val: '7 Active Patrollers', glow: 'text-emerald-400' },
        { name: 'Rescue Intercept', val: '4 Mins ETA', glow: 'text-cyan-400' },
        { name: 'Dispatch Status', val: 'STANDBY', glow: 'text-cyan-400 animate-pulse' }
      ]
    },
    {
      id: 11,
      label: 'Missing Persons',
      view: AppView.MISSING_PERSON_PORTAL,
      icon: Heart,
      color: 'red',
      desc: 'Search registries & public bulletins',
      metrics: [
        { name: 'Active Investigations', val: '2 Registry Matches', glow: 'text-red-400' },
        { name: 'Regional Alerts', val: '1 Broadcast Live', glow: 'text-red-400 animate-pulse' },
        { name: 'Matched Queries', val: '0 Unresolved', glow: 'text-emerald-400' }
      ]
    },
    {
      id: 12,
      label: 'System Map',
      view: AppView.SITEMAP,
      icon: Compass,
      color: 'blue',
      desc: 'Real-time interactive tracking overview',
      metrics: [
        { name: 'Map Mode', val: 'TACTICAL LAYOUT', glow: 'text-cyan-400' },
        { name: 'Tracking Mesh', val: 'GPS + LORA ENABLED', glow: 'text-emerald-400' },
        { name: 'Hotspots Marked', val: '0 Safe Zones Alert', glow: 'text-cyan-400' }
      ]
    },
    {
      id: 13,
      label: 'Notification Center',
      view: AppView.NOTIFICATION_CENTER,
      icon: Bell,
      color: 'violet',
      desc: 'Unified SMS, push, email & in-app alerts',
      metrics: [
        { name: 'Gateway Status', val: '100% OPERATIONAL', glow: 'text-emerald-400' },
        { name: 'Bridge Sync', val: 'ACTIVE WEBSOCKET', glow: 'text-cyan-400 animate-pulse' },
        { name: 'Outbound Carriers', val: '4 Active Lines', glow: 'text-indigo-400' }
      ]
    }
  ];

  const colorGlows = {
    violet: 'border-purple-500/20 hover:border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.05)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    blue: 'border-blue-500/20 hover:border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    red: 'border-red-500/20 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]'
  };

  const badgeColors = {
    violet: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-10 pb-44 animate-in fade-in duration-700 relative text-slate-100" id="tactical-command-dashboard">
      
      {/* Dynamic Cybernetic HUD Style Injector */}
      <style>{`
        .hud-grid {
          background-image: linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .scanline {
          animation: scan 8s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .cyber-badge {
          clip-path: polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px);
        }
        .sos-pulse-effect {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: sosPulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes sosPulse {
          to {
            box-shadow: 0 0 0 30px rgba(239, 68, 68, 0);
          }
        }
        .text-flicker {
          animation: textFlick 4s infinite;
        }
        @keyframes textFlick {
          0%, 100% { opacity: 1; }
          95% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 0.9; }
          98% { opacity: 0.3; }
          99% { opacity: 0.85; }
        }
      `}</style>

      {/* Futuristic Scanline Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        <div className="scanline w-full h-[3px] bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.8)] opacity-70" />
      </div>



      {/* 🚨 CRITICAL INCIDENT DEFENSE INJECTOR (SOS OVERRIDE) */}
      <section className="bg-gradient-to-r from-red-950/40 via-[#070105] to-red-950/40 border-2 border-red-500/40 p-8 md:p-10 rounded-[36px] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden group">
        
        {/* Moving Alert Laser bar on top */}
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent w-full animate-pulse" />
        
        <div className="flex items-center gap-6 md:gap-8 relative z-10 w-full lg:w-auto">
          <div className="w-20 h-20 bg-red-600/10 border-2 border-red-500/50 rounded-2xl flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] sos-pulse-effect flex-shrink-0">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <p className="text-xs font-mono font-black text-red-400 uppercase tracking-[0.4em]">PROTOCOL ZERO • EMERGENCY</p>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mt-1.5">
              Active Incident Intercept
            </h2>
            <p className="text-[11px] font-medium text-slate-400 max-w-xl leading-relaxed mt-2 uppercase tracking-wide">
              Tap the override to instantly broadcast multi-spectrum beacons, encrypt audio-visual proof files, and dispatch nearest guardian teams.
            </p>
          </div>
        </div>
        <button 
          onClick={onEmergency}
          className="w-full lg:w-auto px-12 py-5.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] hover:scale-[1.03] active:scale-95"
        >
          SOS FORCE TRIGGER
        </button>
      </section>

      {/* ----------------- CORE SECTION TACTICAL DISPLAY GRID ----------------- */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* TACTICAL READOUT & ANIMATED VECTOR RADAR SCREEN (Col Span 8) */}
        <div className="lg:col-span-8 bg-[#020512]/80 border border-cyan-500/15 p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md">
          {/* Neon wireframes */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-cyan-500/30" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-cyan-500/30" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-cyan-500/30" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-cyan-500/30" />
          
          {/* Animated matrix dots */}
          <div className="absolute inset-0 hud-grid opacity-[0.25] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch gap-10">
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping shadow-[0_0_10px_rgba(34,211,238,1)]" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] font-mono">TACTICAL COMMAND ACTIVE</span>
                </div>
                <h3 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white mt-4 uppercase">
                  PERIMETER <br/>
                  <span className="text-cyan-400">INTELLIGENCE</span>
                </h3>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] font-mono mt-3">
                  SYSTEM CLEARANCE SECURE • BROADCAST MESH SYNCED
                </p>
              </div>

              {/* Safety Rating Big Telemetry Indicator */}
              <div className="flex gap-10 items-end mt-4">
                <div 
                  onClick={() => onNavigate(AppView.GUARDIAN_AI)} 
                  className="cursor-pointer group flex flex-col"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono mb-2">SAFETY INDEX</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-9xl font-black text-white group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-[0_0_35px_rgba(6,182,212,0.15)] leading-none tracking-tighter">
                      94
                    </span>
                    <span className="text-3xl font-black text-cyan-500/55 font-mono">%</span>
                  </div>
                </div>
                <div className="space-y-3 pb-4">
                  <div className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">STATE: SECURE</p>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] text-center font-mono">Verified Grid</p>
                </div>
              </div>
            </div>

            {/* ----------------- HIGH TECH RADAR SCREEN PANEL ----------------- */}
            <div 
              onClick={() => onNavigate(AppView.GUARDIAN_AI)}
              className="w-full md:w-80 bg-[#040A1A] rounded-[32px] border border-cyan-500/20 p-6 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-cyan-500/50 transition-all duration-300 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]"
            >
              {/* Rotating radar scan sweep */}
              <div 
                className="absolute w-[400px] h-[400px] pointer-events-none" 
                style={{
                  transform: `rotate(${activeRadarAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.15) 0deg, rgba(6, 182, 212, 0) 120deg)'
                }}
              />
              
              {/* Radar circular lines */}
              <div className="absolute w-56 h-56 border border-cyan-500/25 rounded-full pointer-events-none" />
              <div className="absolute w-40 h-40 border border-dashed border-cyan-500/20 rounded-full pointer-events-none" />
              <div className="absolute w-24 h-24 border border-cyan-500/15 rounded-full pointer-events-none" />
              <div className="absolute w-12 h-12 border border-cyan-500/10 rounded-full pointer-events-none" />
              
              {/* Crosshair axis lines */}
              <div className="absolute w-60 h-[1px] bg-cyan-500/10 pointer-events-none" />
              <div className="absolute h-60 w-[1px] bg-cyan-500/10 pointer-events-none" />

              {/* Dynamic radar tracking pings */}
              {radarPings.map((ping) => (
                <div
                  key={ping.id}
                  className="absolute bg-cyan-400 rounded-full animate-ping shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none"
                  style={{
                    left: `${ping.x}%`,
                    top: `${ping.y}%`,
                    width: `${ping.size}px`,
                    height: `${ping.size}px`
                  }}
                />
              ))}

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  <Fingerprint className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">AI SENTINEL HUD</h4>
                  <p className="text-[9px] text-cyan-400/80 font-mono tracking-widest mt-1 uppercase">GRID MONITOR ONLINE</p>
                </div>
              </div>

              {/* Bouncing radar sweep indicator blocks */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" 
                    style={{ animationDelay: `${i * 150}ms` }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Soundwave scanner bar */}
          <div className="mt-8 pt-6 border-t border-cyan-500/10 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>STATION-01 MESH INTEGRITY: NOMINAL</span>
            </div>
            
            {/* Real-time spectrum line */}
            <div className="flex gap-1 h-6 items-end">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((b) => (
                <div 
                  key={b} 
                  className="w-[2px] bg-cyan-500/60 rounded-full" 
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    animation: `pulse 1.2s infinite ease-in-out alternate`
                  }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* INCIDENT ALERTS & THREAT STREAM (Col Span 4) */}
        <div 
          onClick={() => onNavigate(AppView.VIGILANTE_COMMUNITY)}
          className="lg:col-span-4 bg-[#020512]/80 border border-red-500/20 p-8 rounded-[40px] flex flex-col justify-between group cursor-pointer hover:bg-[#04081c]/90 transition-all duration-300 shadow-[0_0_40px_rgba(239,68,68,0.05)] relative overflow-hidden"
        >
          {/* Alert corners */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-red-500/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-red-500/30" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-xl group-hover:rotate-12 transition-transform duration-300 border border-red-500/30">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <span className="text-[9px] font-mono bg-red-600/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded tracking-widest font-black uppercase">LIVE RADAR FEED</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">
                VANGUARD <br/>
                <span className="text-red-500">FEEDSTREAM</span>
              </h4>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Live threat notifications parsed by neural models. Real-time tactical routing sweeps active in your district.
              </p>
            </div>
          </div>

          {/* Glowing alert stream ticker */}
          <div className="relative z-10 mt-8 p-5 bg-red-500/5 border border-red-500/20 rounded-[24px] flex items-center justify-between group-hover:bg-red-500/10 transition-all duration-300">
             <div className="space-y-1">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">ACTIVE DISTURBANCES</p>
               <p className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                 03 <span className="text-[10px] text-red-400 font-mono tracking-widest animate-pulse">INCIDENTS</span>
               </p>
             </div>
             <div className="w-12 h-12 rounded-full bg-red-500/15 group-hover:bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:translate-x-2 transition-transform duration-300">
               →
             </div>
          </div>
        </div>
      </div>

      {/* 🛡️ MILITARY-GRADE CONTROL BOARD bento GRID */}
      <section className="pt-10 space-y-8">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-cyan-500/40" />
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.8em] font-mono">TACTICAL OPERATIONS MATRIX</h3>
            <span className="w-8 h-[1px] bg-cyan-500/40" />
          </div>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed uppercase tracking-wide font-medium">
            Deploy defensive capabilities, monitor real-time security parameters, and coordinate trust sentinels.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6.5">
          {operations.map((op) => {
            const IconComp = op.icon;
            return (
              <div
                key={op.id}
                onClick={() => onNavigate(op.view)}
                onMouseEnter={() => setHoveredCard(op.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group cursor-pointer rounded-[32px] p-7 bg-[#020512]/95 border-2 ${colorGlows[op.color as keyof typeof colorGlows]} transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[310px] pointer-events-auto backdrop-blur-md`}
              >
                {/* Embedded scan effect on hover */}
                {hoveredCard === op.id && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-[pulse_1s_infinite] pointer-events-none" />
                )}

                {/* Card Header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl border ${badgeColors[op.color as keyof typeof badgeColors]} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="w-6.5 h-6.5" />
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 bg-slate-950/60 border border-slate-500/20 px-2 py-0.5 rounded uppercase">
                      SECURE LINK
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase leading-none">
                      {op.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1.5 uppercase tracking-wide">
                      {op.desc}
                    </p>
                  </div>
                </div>

                {/* Complex intelligence indicators and mini status logs */}
                <div className="mt-6 pt-5 border-t border-slate-500/10 space-y-3">
                  {op.metrics.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-slate-500 font-bold">{m.name}</span>
                      <span className={`font-black ${m.glow}`}>{m.val}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom slide action visual ribbon */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- DYNAMIC STICKY TELEMETRY STATUS BAR (2035 MILITARY HUD STYLE) ----------------- */}
      <div className="fixed bottom-0 left-0 w-full bg-[#020512]/95 border-t border-cyan-500/20 py-4 px-6 md:px-10 z-40 backdrop-blur-lg shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center gap-6">
          
          {/* SOS Readiness Trigger Indicator */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <div className="text-left font-mono">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">SOS BEACON MESH</p>
              <p className="text-xs font-black text-red-400 mt-1 uppercase leading-none">100% ARMED</p>
            </div>
          </div>

          {/* Telemetry scrolling stats ribbon */}
          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center justify-start md:justify-around gap-8 py-1">
            
            <div className="text-left font-mono min-w-[120px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">TRUST SENTINELS</p>
              <p className="text-xs font-black text-emerald-400 mt-1 uppercase leading-none flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {profile?.trustCircle?.length || 4} CONNECTED
              </p>
            </div>

            <div className="text-left font-mono min-w-[110px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">AI CONFIDENCE</p>
              <p className="text-xs font-black text-cyan-400 mt-1 uppercase leading-none">99.8% NOMINAL</p>
            </div>

            <div className="text-left font-mono min-w-[130px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">EMERGENCY DISPATCH</p>
              <p className="text-xs font-black text-cyan-400 mt-1 uppercase leading-none">3.8 MINS ETA</p>
            </div>

            <div className="text-left font-mono min-w-[100px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">GPS ACCURACY</p>
              <p className="text-xs font-black text-emerald-400 mt-1 uppercase leading-none flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" />
                ±1.2 METERS
              </p>
            </div>

            <div className="text-left font-mono min-w-[100px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">SECURE CRYPTO</p>
              <p className="text-xs font-black text-slate-300 mt-1 uppercase leading-none flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5" />
                MIL-SPEC AES
              </p>
            </div>

            <div className="text-left font-mono min-w-[110px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">THREAT STATUS</p>
              <p className="text-xs font-black text-emerald-400 mt-1 uppercase leading-none flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                LOW RISK
              </p>
            </div>

            <div className="text-left font-mono min-w-[100px] flex-shrink-0">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">UPTIME STATUS</p>
              <p className="text-xs font-black text-cyan-400 mt-1 uppercase leading-none flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                CONNECTED
              </p>
            </div>

          </div>

          {/* Secure lock encryption signal */}
          <div className="flex items-center gap-2.5 flex-shrink-0 bg-cyan-950/40 border border-cyan-500/25 px-3 py-1.5 rounded-xl font-mono text-[9px] text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-black tracking-widest">RSA-4096 ENCRYPTED</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
