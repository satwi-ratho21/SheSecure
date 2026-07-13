import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface DecoyOverlayProps {
  isActive: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const DecoyOverlay: React.FC<DecoyOverlayProps> = ({ isActive, onClose, profile }) => {
  const [decoyType, setDecoyType] = useState<'CALCULATOR' | 'CLOCK'>(() => {
    return (localStorage.getItem('vs_silent_sos_decoy_type') as 'CALCULATOR' | 'CLOCK') || 'CALCULATOR';
  });

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);

  // Clock State
  const [time, setTime] = useState(new Date());
  
  // Stopwatch State
  const [isSwActive, setIsSwActive] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const swTimerRef = useRef<any>(null);

  // Silent SOS trigger count for covert mouse clicks
  const [clickCount, setClickCount] = useState(0);
  const clockHoldTimer = useRef<any>(null);
  const [isHoldingClock, setIsHoldingClock] = useState(false);

  // Settings
  const secretPin = localStorage.getItem('vs_silent_sos_pin') || '911';
  const secretPhrase = (localStorage.getItem('vs_silent_sos_phrase') || 'red balloon').toLowerCase();

  // Sync chosen decoy types
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('vs_silent_sos_decoy_type') as 'CALCULATOR' | 'CLOCK';
      if (stored) setDecoyType(stored);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update clock time
  useEffect(() => {
    if (decoyType === 'CLOCK') {
      const interval = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [decoyType]);

  // Handle Stopwatch ticker
  useEffect(() => {
    if (isSwActive) {
      swTimerRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    } else {
      if (swTimerRef.current) clearInterval(swTimerRef.current);
    }
    return () => {
      if (swTimerRef.current) clearInterval(swTimerRef.current);
    };
  }, [isSwActive]);

  // Global exit listener and secret typing phrase capture outside inputs
  useEffect(() => {
    if (!isActive) return;

    let phraseBuffer = '';
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Check for ESC key to exit decoy screen
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // 2. Secret phrase typed anywhere (e.g., typing 'red balloon')
      const targetChar = e.key.toLowerCase();
      if (targetChar.length === 1 && /[a-z ]/.test(targetChar)) {
        phraseBuffer = (phraseBuffer + targetChar).slice(-30);
        if (phraseBuffer.includes(secretPhrase)) {
          triggerCovertSOS("Secret global phrase typed directly inside decoy layer.");
          phraseBuffer = '';
        }
      }

      // 3. Optional hotkey combination Ctrl+Shift+S (or Alt+Shift+S)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerCovertSOS("Ctrl+Shift+S Keyboard shortcut keyboard trigger.");
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isActive, secretPhrase]);

  if (!isActive) return null;

  // Active Silent SOS execution (POST to `/api/sos/trigger` secretly with no visual hints)
  const triggerCovertSOS = async (reason: string) => {
    const jwtToken = localStorage.getItem('vs_jwt_token');
    
    // Cache triggered state in localStorage for diagnostic loggers
    const timestamp = new Date().toLocaleTimeString();
    const triggerLogs = JSON.parse(localStorage.getItem('vs_silent_sos_logs') || '[]');
    const newLog = `[${timestamp}] COVERT DISPATCH: ${reason}`;
    localStorage.setItem('vs_silent_sos_logs', JSON.stringify([newLog, ...triggerLogs].slice(0, 50)));
    localStorage.setItem('vs_silent_sos_triggered_status', 'ACTIVE');

    // Silent haptic feedback if browser supports vibration as covert indicator
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    if (!jwtToken) {
      console.warn("[Stealth Grid Protocol] Offline mode: bypass API registration.");
      return;
    }

    // Capture location to transmit
    let lat = 41.8781;
    let lng = -87.6298;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          await sendSOSToServer(lat, lng, jwtToken, reason);
        },
        async () => {
          await sendSOSToServer(lat, lng, jwtToken, reason + " (GPS Denied, bypass coordinate loaded)");
        }
      );
    } else {
      await sendSOSToServer(lat, lng, jwtToken, reason + " (GPS Not supported)");
    }
  };

  const sendSOSToServer = async (lat: number, lng: number, token: string, reasonDetails: string) => {
    try {
      const contacts = profile?.trustCircle || (profile as any)?.emergencyContacts || [];
      const recipients = contacts.map((c: any) => c.phone).filter(Boolean);
      const customMsg = localStorage.getItem('vs_custom_sos_message') || '';
      
      const payloadMessage = `SILENT OUTLET CALL: ${customMsg || "Assistance required immediately."} Details: ${reasonDetails}`;

      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coordinates: { lat, lng },
          emergencyMessage: payloadMessage,
          recipients
        })
      });
    } catch (e) {
      console.error("[Silent SOS Connector] Failed to stream dispatch packets to socket nexus:", e);
    }
  };

  // --- CALCULATOR BUTTON ACTION HANDLERS ---
  const handleCalcPress = (val: string) => {
    if (resetOnNext) {
      setCalcDisplay(val);
      setResetOnNext(false);
      return;
    }

    if (calcDisplay === '0' && val !== '.') {
      setCalcDisplay(val);
    } else {
      setCalcDisplay(prev => prev + val);
    }
  };

  const handleCalcOp = (op: string) => {
    const current = parseFloat(calcDisplay);
    setPrevVal(current);
    setOperation(op);
    setCalcFormula(`${calcDisplay} ${op}`);
    setResetOnNext(true);
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcFormula('');
    setPrevVal(null);
    setOperation(null);
    setResetOnNext(false);
  };

  const handleCalcEqual = () => {
    // Check if the typed value inside display equals the secret Silent SOS PIN
    if (calcDisplay === secretPin) {
      triggerCovertSOS(`Disguised Calculator: Pin Sequence matched (${secretPin}).`);
      handleCalcClear();
      return;
    }

    if (!operation || prevVal === null) return;
    const current = parseFloat(calcDisplay);
    let result = 0;

    switch (operation) {
      case '+': result = prevVal + current; break;
      case '-': result = prevVal - current; break;
      case '×': result = prevVal * current; break;
      case '÷': result = current !== 0 ? prevVal / current : 0; break;
      default: return;
    }

    const output = parseFloat(result.toFixed(8)).toString();
    setCalcFormula(`${calcFormula} ${calcDisplay} =`);
    setCalcDisplay(output);
    setPrevVal(null);
    setOperation(null);
    setResetOnNext(true);
  };

  // --- CLOCK HOLDOVER TRIGGER MECHANISM ---
  const handleClockMouseDown = () => {
    setIsHoldingClock(true);
    clockHoldTimer.current = setTimeout(() => {
      triggerCovertSOS("Disguised Clock: Long touched coordinate screen sector (3 seconds).");
      setIsHoldingClock(false);
    }, 3000);
  };

  const handleClockMouseUp = () => {
    if (clockHoldTimer.current) {
      clearTimeout(clockHoldTimer.current);
    }
    setIsHoldingClock(false);
  };

  const handleCornerExitClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        onClose();
        return 0;
      }
      return next;
    });
    // Reset click counter if not pressed in quick succession
    setTimeout(() => setClickCount(0), 2000);
  };

  // Format Stopwatch numbers
  const formatStopwatch = (timeMs: number) => {
    const min = Math.floor(timeMs / 60000);
    const sec = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#090d16] text-white flex flex-col font-sans select-none animate-in fade-in duration-500">
      
      {/* Decoy Top Hidden Boundary Exits and Switcher Control (Stays invisible to observers) */}
      <div className="h-14 flex items-center justify-between px-6 bg-black/40 border-b border-white/[0.02] relative">
        <div 
          onClick={handleCornerExitClick}
          className="w-16 h-10 hover:bg-white/[0.01] rounded-lg cursor-pointer flex items-center justify-start text-[8px] text-zinc-800 font-mono italic uppercase"
        >
          {/* Invisible triple click fallback area to exit */}
          covert_node
        </div>
        
        {/* Subtly disguised settings selection inside decoy view for debugging or demo toggling */}
        <div className="flex gap-4 items-center">
          <span className="text-[9px] text-zinc-600 font-mono">SYS_DEC_ACTIVE</span>
          <button 
            onClick={() => setDecoyType(prev => prev === 'CALCULATOR' ? 'CLOCK' : 'CALCULATOR')}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest bg-zinc-900 border border-white/5 py-1.5 px-3 rounded-md transition-colors"
          >
            Switch Skin
          </button>
          <button 
            onClick={onClose}
            className="text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest bg-zinc-900 border border-white/5 py-1.5 px-3 rounded-md transition-colors"
          >
            Exit Decoy
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SKIN */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        
        {decoyType === 'CALCULATOR' ? (
          /* ==================================== */
          /*   NEUTERING CALCULATOR USER INTERFACE */
          /* ==================================== */
          <div className="w-full max-w-sm bg-[#161a23] rounded-[40px] p-6 shadow-2xl border border-white/10 flex flex-col gap-5 animate-in zoom-in-95 duration-300">
            {/* Display screen */}
            <div className="text-right px-4 py-8 bg-[#0d1017] rounded-3xl border border-white/5 min-h-[140px] flex flex-col justify-end gap-1.5 overflow-hidden">
               <span className="text-sm text-slate-500 font-mono truncate">{calcFormula}</span>
               <span className="text-5xl font-light tracking-tight text-white overflow-x-auto whitespace-nowrap scrollbar-none">{calcDisplay}</span>
            </div>

            {/* Buttons Matrix */}
            <div className="grid grid-cols-4 gap-3 text-lg font-medium">
              
              {/* Row 1 */}
              <button onClick={handleCalcClear} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-amber-500 font-bold transition-all">C</button>
              <button onClick={() => handleCalcOp('÷')} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-amber-500 transition-all">÷</button>
              <button onClick={() => handleCalcOp('×')} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-amber-500 transition-all">×</button>
              <button onClick={() => setCalcDisplay(prev => prev.slice(0, -1) || '0')} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-slate-400 text-sm font-bold uppercase tracking-tight transition-all">DEL</button>

              {/* Row 2 */}
              <button onClick={() => handleCalcPress('7')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">7</button>
              <button onClick={() => handleCalcPress('8')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">8</button>
              <button onClick={() => handleCalcPress('9')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">9</button>
              <button onClick={() => handleCalcOp('-')} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-amber-500 text-2xl transition-all">−</button>

              {/* Row 3 */}
              <button onClick={() => handleCalcPress('4')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">4</button>
              <button onClick={() => handleCalcPress('5')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">5</button>
              <button onClick={() => handleCalcPress('6')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">6</button>
              <button onClick={() => handleCalcOp('+')} className="h-16 rounded-2xl bg-[#262c3a] hover:bg-[#32394a] text-amber-500 text-2xl transition-all">+</button>

              {/* Row 4 */}
              <button onClick={() => handleCalcPress('1')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">1</button>
              <button onClick={() => handleCalcPress('2')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">2</button>
              <button onClick={() => handleCalcPress('3')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white transition-all">3</button>
              <button onClick={handleCalcEqual} className="h-36 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#161a23] font-bold text-3xl grid-row-span-2 col-start-4 row-start-4 transition-all flex items-center justify-center">=</button>

              {/* Row 5 */}
              <button onClick={() => handleCalcPress('0')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white col-span-2 transition-all">0</button>
              <button onClick={() => handleCalcPress('.')} className="h-16 rounded-2xl bg-[#1f2430] hover:bg-[#2a3040] text-white font-bold transition-all">.</button>
            </div>
          </div>
        ) : (
          /* ================================== */
          /*   HIGH TECH AMBIENT DIGITAL CLOCK   */
          /* ================================== */
          <div className="w-full max-w-xl text-center flex flex-col items-center justify-center gap-12 select-none animate-in zoom-in-95 duration-300">
            
            {/* Immersive interactive digital clock interface */}
            <div 
              onMouseDown={handleClockMouseDown}
              onMouseUp={handleClockMouseUp}
              onMouseLeave={handleClockMouseUp}
              onTouchStart={handleClockMouseDown}
              onTouchEnd={handleClockMouseUp}
              className={`cursor-pointer transition-all duration-500 border-2 py-16 px-10 rounded-[48px] w-full max-w-md ${
                isHoldingClock ? 'bg-zinc-900 border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)] scale-98' : 'bg-black/30 border-white/[0.02] hover:bg-zinc-950/20'
              }`}
            >
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-4 pointer-events-none">Local Time Standard</p>
              
              <div className="text-7xl font-light tracking-tighter text-slate-100 font-mono flex justify-center items-center gap-1 leading-none">
                <span>{time.getHours().toString().padStart(2, '0')}</span>
                <span className="animate-pulse">:</span>
                <span>{time.getMinutes().toString().padStart(2, '0')}</span>
                <span className="text-3xl text-slate-500 font-light ml-2">{time.getSeconds().toString().padStart(2, '0')}</span>
              </div>

              <div className="text-xs text-zinc-400 font-mono mt-4 font-bold uppercase tracking-wider">
                {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {isHoldingClock && (
                <p className="text-[9px] text-red-400 font-mono uppercase tracking-widest mt-6 animate-pulse">
                  Unlocking covert calibration system... Keep holding
                </p>
              )}
            </div>

            {/* Embedded Stopwatch section to validate clock's operational function */}
            <div className="w-full max-w-md p-6 bg-zinc-950/50 rounded-3xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Standard Stopwatch Utility</span>
                 <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest font-bold">UTILITY LOADED</span>
              </div>
              <div className="text-4xl font-light tracking-tight text-white font-mono">{formatStopwatch(swTime)}</div>
              
              {/* Controls */}
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setIsSwActive(prev => !prev)}
                   className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                 >
                   <Play size={12} className={isSwActive ? 'text-red-500 fill-current' : 'text-emerald-500 fill-current'} />
                   {isSwActive ? 'Stop' : 'Start'}
                 </button>
                 <button 
                   onClick={() => {
                     setIsSwActive(false);
                     setSwTime(0);
                   }}
                   className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                 >
                   <RotateCcw size={12} className="text-slate-400" />
                   Reset
                 </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Discrete Bottom Hint for demo testers */}
      <div className="py-4 text-center border-t border-white/[0.01] bg-black/40 text-[9px] text-zinc-600 font-mono uppercase tracking-widest leading-none">
        Press [Escape] or triple-tap top-left corner to close decoy view
      </div>

    </div>
  );
};
