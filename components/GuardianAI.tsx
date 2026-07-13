import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Wifi, 
  MapPin, 
  Battery, 
  Eye, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, GuardSimulation } from '../types';

interface FloatingMetricProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: 'cyan' | 'red' | 'emerald' | 'indigo' | 'blue';
  className?: string;
}

const FloatingMetric: React.FC<FloatingMetricProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color,
  className = ""
}) => {
  const glowStyles = {
    cyan: "border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-slate-950/90",
    red: "border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-slate-950/90",
    emerald: "border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-slate-950/90",
    indigo: "border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-slate-950/90",
    blue: "border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-slate-950/90"
  };

  const iconBgStyles = {
    cyan: "bg-cyan-500/5 text-cyan-400 border-cyan-500/20",
    red: "bg-red-500/5 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/5 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/5 text-indigo-400 border-indigo-500/20",
    blue: "bg-blue-500/5 text-blue-400 border-blue-500/20"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`border backdrop-blur-md p-3 px-4 rounded-[20px] flex items-center gap-3 w-full pointer-events-auto ${glowStyles[color]} ${className}`}
    >
      <div className={`p-2 rounded-xl border flex-shrink-0 ${iconBgStyles[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-bold text-slate-500 font-mono uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs md:text-sm font-black font-mono tracking-wide leading-none uppercase truncate">{value}</p>
      </div>
    </motion.div>
  );
};

// Custom high-fidelity SVG Radar Chart
const RadarChartSVG: React.FC<{ metrics: { env: number; signal: number; prox: number; power: number; alert: number } }> = ({ metrics }) => {
  const size = 200;
  const center = size / 2;
  const maxR = 65;
  
  // Angle calculations for 5-vertex pentagram radar chart (Env, Signal, Prox, Power, Alert)
  const getCoordinates = (valueRatio: number, index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = valueRatio * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const metricsValues = [
    metrics.env / 100,
    metrics.signal / 100,
    metrics.prox / 100,
    metrics.power / 100,
    metrics.alert / 100
  ];

  const labels = ['Env', 'Signal', 'Prox', 'Power', 'Alert'];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-h-[190px] drop-shadow-[0_0_10px_rgba(99,102,241,0.1)]">
      {/* Background concentric Grid lines (pentagons) */}
      {levels.map((lvl, idx) => {
        const points = Array.from({ length: 5 }, (_, i) => {
          const { x, y } = getCoordinates(lvl, i);
          return `${x},${y}`;
        }).join(' ');

        return (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis Lines from center to outer vertices */}
      {Array.from({ length: 5 }).map((_, i) => {
        const { x, y } = getCoordinates(1, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        );
      })}

      {/* Safe Area Data Polygon */}
      {(() => {
        const dataPoints = metricsValues.map((val, i) => {
          const { x, y } = getCoordinates(val, i);
          return `${x},${y}`;
        }).join(' ');

        return (
          <>
            {/* Polygon fill with purple glow */}
            <polygon
              points={dataPoints}
              fill="rgba(79, 70, 229, 0.18)"
              stroke="#6366f1"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            />
            {/* Small circles indicating data vertices */}
            {metricsValues.map((val, i) => {
              const { x, y } = getCoordinates(val, i);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="1.5"
                  className="shadow-md"
                />
              );
            })}
          </>
        );
      })()}

      {/* Outer Labels */}
      {Array.from({ length: 5 }).map((_, i) => {
        const { x, y } = getCoordinates(1.24, i);
        return (
          <text
            key={i}
            x={x}
            y={y + 3}
            fill="#475569"
            fontSize="8px"
            fontWeight="900"
            textAnchor="middle"
            className="font-mono uppercase tracking-widest text-[8px]"
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
};

const GuardianAI: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const [safetyMetrics] = useState({
    environment: 88,
    signal: 95,
    proximity: 72, // 0.4 KM maps here
    battery: 84,
    riskRating: 12
  });

  const [simulation, setSimulation] = useState<GuardSimulation | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simText, setSimText] = useState('');

  const handleSimulate = async () => {
    if (!simText.trim()) return;
    setSimLoading(true);
    try {
      const token = localStorage.getItem('vs_jwt_token');
      const res = await fetch('/api/ai/simulate-projection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentMetrics: {
            environment: safetyMetrics.environment,
            signal: safetyMetrics.signal,
            proximity: safetyMetrics.proximity,
            battery: safetyMetrics.battery,
            riskRating: safetyMetrics.riskRating
          },
          changes: simText
        })
      });
      const result = await res.json();
      
      setSimulation({
        projectedRisk: Math.max(0, 100 - (result.projectedScore || 0)),
        strategicAdvice: result.impactDescription || 'Tactical analysis projection active.',
        safeActions: result.safeActions || result.recoverySteps || ['Maintain trust mesh telemetry.']
      });
    } catch (e) {
      console.error("Simulation projection request failed, using local safety algorithm fallback", e);
      setSimulation({
        projectedRisk: Math.max(0, 100 - (safetyMetrics.environment + 5)),
        strategicAdvice: "Tactical projection fallback: Local environmental sensors indicate stable defensive parameters under simulated changes.",
        safeActions: ["Activate high-illumination beams", "Maintain active trust-circle synchronization", "Proceed along highly patrolled sectors"]
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in" id="guardian-hud-system">
      
      {/* ----------------- TOP GUARDIAN HUD HEADER ----------------- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#020510]/40 p-6 md:p-8 rounded-[36px] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">Guardian HUD</h2>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.4em] font-mono mt-1.5">
              Perimeter Analysis Active
            </p>
          </div>
        </div>

        {/* HUD Header Quick stats blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'SIGNAL STR', val: '95%', color: 'text-cyan-400 border-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.1)]' },
            { label: 'RISK RATING', val: '12%', color: 'text-red-500 border-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.1)]' },
            { label: 'PROXIMITY', val: '0.4 KM', color: 'text-blue-400 border-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.1)]' },
            { label: 'BATTERY', val: '84%', color: 'text-emerald-400 border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]' }
          ].map(stat => (
            <div 
              key={stat.label} 
              className={`p-4 bg-[#030712] rounded-[22px] border text-center min-w-[125px] flex flex-col justify-center ${stat.color}`}
            >
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1">{stat.label}</p>
              <p className="text-xl font-black font-mono tracking-tighter">{stat.val}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ----------------- CORE SECTION GRID ----------------- */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE HOLOGRAM MONITOR (Col Span 8) */}
        <div className="lg:col-span-8 bg-[#020512] rounded-[44px] border border-white/5 p-8 relative overflow-hidden h-[720px] flex flex-col justify-between shadow-2xl">
          {/* Cybernetic telemetry overlay decorative corners */}
          <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-cyan-500/40 pointer-events-none" />
          <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-cyan-500/40 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-cyan-500/40 pointer-events-none" />

          {/* Grid visual lines */}
          <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* AI Guardian Active Tag */}
          <div className="text-center relative z-20 pt-2">
            <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-[0.35em] uppercase">AI GUARDIAN</span>
            <h3 className="text-lg font-black text-cyan-300 font-mono tracking-[0.2em] uppercase mt-1 animate-pulse">
              ACTIVATED
            </h3>
          </div>

          {/* CENTER: THE AI GUARDIAN HOLOGRAM CONTAINER */}
          <div className="relative flex-1 flex items-center justify-center py-10 pointer-events-none">
            
            {/* Concentric glowing circular overlays behind the avatar */}
            <div className="absolute w-80 h-80 md:w-[480px] md:h-[480px] border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-[360px] h-[360px] md:w-[540px] md:h-[540px] border border-dashed border-cyan-500/5 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
            <div className="absolute w-72 h-72 md:w-[440px] md:h-[440px] border border-indigo-500/10 rounded-full" />

            {/* Glowing Holographic Projection Base */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 pointer-events-none opacity-80" style={{ perspective: '200px' }}>
              <div className="w-full h-full border-2 border-cyan-500/20 rounded-full animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]" style={{ transform: 'rotateX(75deg)' }} />
              <div className="absolute inset-1.5 border border-purple-500/30 rounded-full animate-ping" style={{ transform: 'rotateX(75deg)' }} />
              <div className="absolute inset-3.5 border border-cyan-500/40 rounded-full" style={{ transform: 'rotateX(75deg)' }} />
            </div>

            {/* Premium Generated Female Guardian Avatar */}
            <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-10 pointer-events-auto">
              <img 
                src="/src/assets/images/guardian_avatar_v3_1782323844652.jpg" 
                alt="AI Guardian Sentinel" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle blue scanning light overlay */}
              <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay pointer-events-none" />
              {/* Armored HUD text "AI" at the bottom center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest shadow-md">
                AI Sentry
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* FLOATING METRICS (ABSOLUTE HUD BADGES OVERLAYED ON LARGE SCREENS) */}
            {/* ------------------------------------------------------------ */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
              
              {/* Left Column HUD Badges */}
              <FloatingMetric 
                label="ENV SAFETY" 
                value="88%" 
                icon={Eye} 
                color="indigo" 
                className="absolute top-[10%] left-[1.5%] w-44" 
              />
              <FloatingMetric 
                label="THREAT" 
                value="LOW" 
                icon={Shield} 
                color="cyan" 
                className="absolute top-[32%] left-[0.5%] w-44" 
              />
              <FloatingMetric 
                label="ACTIVE SCAN" 
                value="SECURE" 
                icon={Zap} 
                color="cyan" 
                className="absolute top-[54%] left-[0.5%] w-44" 
              />
              <FloatingMetric 
                label="DEFENSE" 
                value="READY" 
                icon={ShieldCheck} 
                color="emerald" 
                className="absolute top-[76%] left-[1.5%] w-44" 
              />

              {/* Right Column HUD Badges */}
              <FloatingMetric 
                label="DEVICE UPLINK" 
                value="LINKED" 
                icon={Wifi} 
                color="blue" 
                className="absolute top-[10%] right-[1.5%] w-44" 
              />
              <FloatingMetric 
                label="AI CORE" 
                value="OPTIMAL" 
                icon={Cpu} 
                color="cyan" 
                className="absolute top-[32%] right-[0.5%] w-44" 
              />
              <FloatingMetric 
                label="PROXIMITY" 
                value="SAFE ZONE" 
                icon={MapPin} 
                color="indigo" 
                className="absolute top-[54%] right-[1.5%] w-44" 
              />
              <FloatingMetric 
                label="ENERGY CORE" 
                value="84%" 
                icon={Battery} 
                color="emerald" 
                className="absolute top-[76%] right-[2.5%] w-44" 
              />
            </div>
          </div>

          {/* Mobile Fallback: List of Floating Badges (Visible only under md screens) */}
          <div className="grid grid-cols-2 gap-3 md:hidden relative z-20 p-2">
            <FloatingMetric label="ENV SAFETY" value="88%" icon={Eye} color="indigo" />
            <FloatingMetric label="DEVICE UPLINK" value="LINKED" icon={Wifi} color="blue" />
            <FloatingMetric label="THREAT" value="LOW" icon={Shield} color="cyan" />
            <FloatingMetric label="AI CORE" value="OPTIMAL" icon={Cpu} color="cyan" />
            <FloatingMetric label="ACTIVE SCAN" value="SECURE" icon={Zap} color="cyan" />
            <FloatingMetric label="PROXIMITY" value="SAFE ZONE" icon={MapPin} color="indigo" />
            <FloatingMetric label="DEFENSE" value="READY" icon={ShieldCheck} color="emerald" />
            <FloatingMetric label="ENERGY CORE" value="84%" icon={Battery} color="emerald" />
          </div>

          {/* ----------------- HUD BASE BAR ----------------- */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6 relative z-20">
            
            {/* Bottom Left: Animated Soundwave Visualizer */}
            <div className="flex items-end gap-1 h-8 px-2 w-full sm:w-auto justify-center sm:justify-start" title="Real-time perimeter audio scanning stream">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((bar) => {
                const randomDuration = 0.4 + Math.random() * 0.9;
                const randomDelay = Math.random() * 0.4;
                return (
                  <motion.div
                    key={bar}
                    animate={{ height: ['15%', '100%', '15%'] }}
                    transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "easeInOut" }}
                    className="w-[2.5px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  />
                );
              })}
            </div>

            {/* Bottom Center: System state labels */}
            <div className="text-center">
              <p className="text-[9px] text-slate-500 font-mono tracking-[0.25em] font-black uppercase leading-none">
                AI Analysis In Progress
              </p>
              <p className="text-xs text-cyan-400 font-mono tracking-[0.35em] font-black uppercase mt-1 animate-pulse leading-none">
                Perimeter Secured
              </p>
            </div>

            {/* Bottom Right: Signal Integrity loading bar */}
            <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">
                Signal Integrity
              </span>
              <div className="w-24 md:w-28 h-2 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-cyan-400 w-[95%] shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full" />
              </div>
            </div>

          </div>
        </div>

        {/* ----------------- RIGHT COLUMN (Col Span 4) ----------------- */}
        <div className="lg:col-span-4 space-y-8 flex flex-col justify-between">
          
          {/* Card 1: Scenario Engine */}
          <div className="p-8 bg-[#020512] rounded-[36px] border border-white/5 shadow-2xl space-y-6 flex-1">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Scenario Engine</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Simulate Safety Protocols
              </p>
            </div>

            <div className="space-y-4">
              <textarea 
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="e.g. 'Walking 3km in rain at midnight...'"
                className="w-full p-5 rounded-[24px] bg-[#040816] border border-white/5 text-white font-bold placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none min-h-[110px] text-xs leading-relaxed"
              />
              <button 
                onClick={handleSimulate}
                disabled={simLoading || !simText.trim()}
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40"
              >
                {simLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Simulating Threat Parameters...
                  </span>
                ) : 'Project Safety'}
              </button>

              <AnimatePresence>
                {simulation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 mt-4"
                  >
                    <div className="p-5 bg-slate-950/80 rounded-2xl border border-white/5">
                      <p className="text-xs font-bold text-slate-300 leading-relaxed italic font-mono">
                        "{simulation.strategicAdvice}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-red-500/5 rounded-xl text-center border border-red-500/20">
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest font-mono mb-1">Projected Risk</p>
                        <p className="text-lg font-black text-red-400 font-mono">{simulation.projectedRisk}%</p>
                      </div>
                      <div className="p-4 bg-indigo-500/5 rounded-xl text-center border border-indigo-500/20">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono mb-1">RECOMMENDED ACTIONS</p>
                        <div className="space-y-0.5 max-h-12 overflow-y-auto">
                          {simulation.safeActions.slice(0, 2).map((act, i) => (
                            <p key={i} className="text-[8px] text-slate-400 font-bold uppercase truncate">{act}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Card 2: Tactical Radar */}
          <div className="p-8 bg-[#020512] rounded-[36px] border border-white/5 shadow-2xl flex flex-col items-center">
            <div className="w-full text-left">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Tactical Radar</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">Area Profile</h3>
            </div>

            {/* Hexagonal/Pentagram SVG Radar view */}
            <div className="w-full h-44 mt-4 flex items-center justify-center">
              <RadarChartSVG 
                metrics={{
                  env: safetyMetrics.environment,
                  signal: safetyMetrics.signal,
                  prox: safetyMetrics.proximity,
                  power: safetyMetrics.battery,
                  alert: safetyMetrics.riskRating
                }} 
              />
            </div>

            {/* List breakdown of environmental layers */}
            <div className="w-full space-y-2.5 text-xs font-bold pt-4 border-t border-white/5 mt-4">
              {[
                { label: '• Environment', val: 'High', color: 'text-purple-400' },
                { label: '• Signal Strength', val: 'Strong', color: 'text-cyan-400' },
                { label: '• Proximity', val: 'Safe', color: 'text-emerald-400' },
                { label: '• Power', val: 'Optimal', color: 'text-emerald-400' },
                { label: '• Alert Level', val: 'Low', color: 'text-emerald-400' }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-slate-400 font-mono tracking-wide uppercase">
                  <span>{item.label}</span>
                  <span className={`font-black ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default GuardianAI;
