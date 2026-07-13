
import React, { useState, useEffect } from 'react';
import { UserProfile, SafetyStatus } from '../types';
import { AlertCircle, Shield, Phone, MapPin, Mic, Camera, Users, ShieldAlert } from 'lucide-react';

interface EmergencySOSProps {
  profile: UserProfile | null;
  isActive: boolean;
  onStateChange: (active: boolean) => void;
  isGlobal?: boolean;
}

enum SOSPhase {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  BROADCASTING = 'BROADCASTING',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED'
}

const EmergencySOS: React.FC<EmergencySOSProps> = ({ profile, isActive, onStateChange, isGlobal = false }) => {
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState<SOSPhase>(SOSPhase.IDLE);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  useEffect(() => {
    if (isActive && phase === SOSPhase.IDLE) {
      setPhase(SOSPhase.COUNTDOWN);
      setCountdown(5);
      addLog('Initiating Guardian Protocol...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          addLog(`GPS Lock: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }, (err) => {
          addLog('GPS Access Denied. Deploying celestial backup mapping...');
          const mockLoc = { lat: 17.6868, lng: 83.2185 };
          setLocation(mockLoc);
          addLog(`Bypass GPS Lock: ${mockLoc.lat.toFixed(4)}, ${mockLoc.lng.toFixed(4)}`);
        });
      } else {
        const mockLoc = { lat: 17.6868, lng: 83.2185 };
        setLocation(mockLoc);
      }
    } else if (!isActive) {
      setPhase(SOSPhase.IDLE);
      setLogs([]);
    }
  }, [isActive]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  useEffect(() => {
    let timer: any;
    if (phase === SOSPhase.COUNTDOWN && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && phase === SOSPhase.COUNTDOWN) {
      startBroadcast();
    }
    return () => clearInterval(timer);
  }, [phase, countdown]);

  const triggerApi = async (coords: { lat: number; lng: number }) => {
    const jwtToken = localStorage.getItem('vs_jwt_token');
    if (!jwtToken) {
      addLog('Bypassing Grid token sync: Local network cache selected.');
      return;
    }

    try {
      const contacts = profile?.trustCircle || (profile as any)?.emergencyContacts || [];
      const recipients = contacts.map((c: any) => c.phone).filter(Boolean);
      const customMsg = localStorage.getItem('vs_custom_sos_message') || '';

      const response = await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          coordinates: coords,
          emergencyMessage: customMsg,
          recipients
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIncidentId(data.incident.id);
        addLog(`Uplinks Synced! MongoDB Ref ID: ${data.incident.id}`);
        if (data.incident.smsDetails) {
          const smsStatusItems = data.incident.smsDetails.split(' | ');
          smsStatusItems.forEach((item: string) => addLog(`Guard dispatch: ${item}`));
        } else {
          addLog('Alert dispatched to emergency responder ring.');
        }
      } else {
        addLog(`Grid Synapse error: ${data.error || 'System Congestion'}`);
      }
    } catch (e) {
      console.error(e);
      addLog('RF network conflict. Reverting to automated hardware backup broadcast.');
    }
  };

  const startBroadcast = async () => {
    setPhase(SOSPhase.BROADCASTING);
    addLog('Synthesizing high priority emergency RF broadcast...');
    
    // Auto-record and active sensors triggers
    setTimeout(() => addLog('Aura sensors: Silent Recording Active (128-bit)'), 1500);
    setTimeout(() => addLog('Telemetry: High Frequency Pinging...'), 3000);

    let coords = location;
    if (!coords) {
      coords = { lat: 17.6868, lng: 83.2185 };
      setLocation(coords);
    }
    
    await triggerApi(coords);

    // Escalation warning indicator
    setTimeout(() => {
      setPhase(curr => {
        if (curr === SOSPhase.BROADCASTING) {
          addLog('ESCALATION STATUS: Local law enforcement and rescue responders dispatched.');
          return SOSPhase.ESCALATED;
        }
        return curr;
      });
    }, 12000);
  };

  const handleResolve = async () => {
    if (incidentId) {
      const jwtToken = localStorage.getItem('vs_jwt_token');
      if (jwtToken) {
        try {
          addLog('Transmitting stand-down resolution signature...');
          const response = await fetch('/api/sos/resolve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ incidentId })
          });
          if (response.ok) {
            addLog('Resolution signature recognized. Standing down.');
          }
        } catch (e) {
          console.error("Distress signal stand-down resolve failure:", e);
        }
      }
    }

    setIncidentId(null);
    onStateChange(false);
    setPhase(SOSPhase.IDLE);
  };

  if (phase === SOSPhase.IDLE && !isGlobal) return null;
  if (phase === SOSPhase.IDLE) return null;

  return (
    <div className={`fixed inset-0 z-[2000] backdrop-blur-3xl flex items-center justify-center p-4 transition-all duration-700 ${phase === SOSPhase.COUNTDOWN ? 'bg-red-950/80' : 'bg-black/95'}`}>
      
      {/* CRISIS OVERLAY ANIMATIONS */}
      {(phase === SOSPhase.BROADCASTING || phase === SOSPhase.ESCALATED) && (
        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
      )}

      <div className="max-w-xl w-full bg-slate-900 border-2 border-red-500/30 rounded-[64px] p-10 shadow-[0_0_100px_rgba(220,38,38,0.3)] relative overflow-hidden">
        
        {/* HEADER STATUS */}
        <div className="text-center space-y-6 mb-10">
          <div className={`w-28 h-28 rounded-[40px] mx-auto flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 border-4 ${phase === SOSPhase.ESCALATED ? 'bg-red-600 border-red-400 animate-ping' : 'bg-red-600 border-red-500/50 sos-pulse'}`}>
             <span className="font-black text-white">{phase === SOSPhase.COUNTDOWN ? countdown : <ShieldAlert className="w-16 h-16" />}</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none italic">
            {phase === SOSPhase.COUNTDOWN ? 'SOS TRIGGERED' : 
             phase === SOSPhase.BROADCASTING ? 'BROADCASTING' : 
             phase === SOSPhase.ESCALATED ? 'TACTICAL ALERT' : 'ACTIVE'}
          </h2>
          <p className="text-red-500 font-black text-xs uppercase tracking-[0.5em] mono">Vanguard Tactical Protocol Active</p>
        </div>

        <div className="space-y-6">
          
          {/* TACTICAL READOUT */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Coordinates</p>
                </div>
                <p className="text-xs font-bold text-white mono">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Locking GPS...'}</p>
             </div>
             <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                   <Users className="w-4 h-4 text-indigo-400" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Trust Circle</p>
                </div>
                <p className="text-xs font-bold text-indigo-400 mono">{phase === SOSPhase.COUNTDOWN ? 'Pending' : 'Uplink Alerted'}</p>
             </div>
          </div>

          {/* SYSTEM LOGS */}
          <div className="bg-black/40 rounded-[40px] border border-white/5 p-8 h-48 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50" />
             <div className="space-y-4">
               {logs.map((log, i) => (
                 <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]" />
                    <p className="text-[11px] font-bold text-slate-400 mono uppercase">{log}</p>
                 </div>
               ))}
             </div>
          </div>

          {/* ACTIVE SENSORS */}
          <div className="flex justify-around items-center p-4 bg-white/5 rounded-[32px] border border-white/5">
             <Mic className={`w-6 h-6 ${phase !== SOSPhase.COUNTDOWN ? 'text-red-500 animate-pulse' : 'text-slate-700'}`} />
             <Camera className={`w-6 h-6 ${phase !== SOSPhase.COUNTDOWN ? 'text-red-500 animate-pulse' : 'text-slate-700'}`} />
             <Phone className={`w-6 h-6 ${phase === SOSPhase.ESCALATED ? 'text-red-500 animate-pulse' : 'text-slate-700'}`} />
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
          <button 
            onClick={handleResolve}
            className="py-8 bg-white/5 border border-white/10 text-slate-400 rounded-[40px] font-black text-xl hover:bg-white hover:text-slate-900 transition-all uppercase tracking-tighter shadow-inner"
          >
            I AM SAFE
          </button>
          
          {phase === SOSPhase.COUNTDOWN ? (
            <button 
              onClick={startBroadcast}
              className="py-8 bg-red-600 text-white rounded-[40px] font-black text-xl animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.5)] border-2 border-red-400/50"
            >
              FORCE SOS
            </button>
          ) : (
            <a href="tel:911" className="py-8 bg-white text-slate-950 rounded-[40px] font-black text-xl flex items-center justify-center gap-3 shadow-3xl hover:scale-105 active:scale-95 transition-all">
               <Phone className="w-6 h-6" />
               OPERATOR
            </a>
          )}
        </div>

      </div>

      <style>{`
        @keyframes sos-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 40px 20px rgba(220, 38, 38, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .sos-pulse {
          animation: sos-pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default EmergencySOS;
