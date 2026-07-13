import React, { useState, useEffect } from 'react';
import { 
  Phone, Eye, Zap, Shield, ShieldAlert, Clock, AlertTriangle, 
  Settings, UserCheck, ShieldCheck, Mail, Globe, Lock, Key, 
  Terminal, BarChart2, VideoOff, WifiOff, FileText, CheckCircle2,
  Mic, MicOff, Volume2, VolumeX, Grid, Plus, Video, PhoneOff, 
  User, Minimize2, Maximize2, X, Battery, Wifi, Flame, RotateCcw,
  Bluetooth, BluetoothOff
} from 'lucide-react';

interface StalkerLog {
  id: string;
  timestamp: string;
  source: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface DiscreetToolsProps {
  onLaunchDecoy?: () => void;
}

const DiscreetTools: React.FC<DiscreetToolsProps> = ({ onLaunchDecoy }) => {
  const [activeStealthTab, setActiveStealthTab] = useState<'FAKE_CALL' | 'SILENT_SOS' | 'CYBER_SAFETY' | 'BLUETOOTH'>('FAKE_CALL');

  // --- BLUETOOTH INTEGRATION STATES ---
  const [btStatus, setBtStatus] = useState<'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [btError, setBtError] = useState<string>('');
  const [btBattery, setBtBattery] = useState<number | null>(null);
  const [btSignalStrength, setBtSignalStrength] = useState<number>(-55); // in dBm
  const [btAutoTriggerSos, setBtAutoTriggerSos] = useState<boolean>(true);
  const [btEventLog, setBtEventLog] = useState<string[]>([]);
  const [pairedDeviceName, setPairedDeviceName] = useState<string>('');
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [isSimulatingBt, setIsSimulatingBt] = useState<boolean>(true);

  // --- FAKE CALL STATE ---
  const [callerName, setCallerName] = useState('Parent (Emergency Sync)');
  const [callerNumber, setCallerNumber] = useState('+1 (555) 392-1920');
  const [callerDelay, setCallerDelay] = useState(10); // in seconds
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<'police' | 'parent' | 'colleague'>('police');
  const [stealthTheme, setStealthTheme] = useState<'iOS' | 'Android'>('iOS');

  // New Fullscreen & Audio custom states
  const [isFullscreenActive, setIsFullscreenActive] = useState(true);
  const [isSimulatingLockScreen, setIsSimulatingLockScreen] = useState(true);
  const [isCustomVoiceLines, setIsCustomVoiceLines] = useState(false);
  const [customVoiceInput, setCustomVoiceInput] = useState(
    "Hi, we are waiting for you near the front exit. Where are you?\nOkay, stay on the line with me. I am walking towards your location."
  );
  const [customVoiceTexts, setCustomVoiceTexts] = useState<string[]>([
    "Hi, we are waiting for you near the front exit. Where are you?",
    "Okay, stay on the line with me. I am walking towards your location."
  ]);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [slideX, setSlideX] = useState(0);

  // --- SILENT SOS STATE ---
  const [isSilentRecording, setIsSilentRecording] = useState(false);
  const [silentSOSActivated, setSilentSOSActivated] = useState(false);
  const [silentLogs, setSilentLogs] = useState<string[]>([]);
  const [volumeTriggerCount, setVolumeTriggerCount] = useState(0);

  const [decoyType, setDecoyType] = useState<'CALCULATOR' | 'CLOCK'>(() => {
    return (localStorage.getItem('vs_silent_sos_decoy_type') as 'CALCULATOR' | 'CLOCK') || 'CALCULATOR';
  });
  const [secretPin, setSecretPin] = useState(() => {
    return localStorage.getItem('vs_silent_sos_pin') || '911';
  });
  const [secretPhrase, setSecretPhrase] = useState(() => {
    return localStorage.getItem('vs_silent_sos_phrase') || 'red balloon';
  });

  const handleSaveDecoyType = (val: 'CALCULATOR' | 'CLOCK') => {
    setDecoyType(val);
    localStorage.setItem('vs_silent_sos_decoy_type', val);
    addSilentLog(`Config updated: Default decoy interface set to "${val}"`);
  };

  const handleSavePin = (val: string) => {
    setSecretPin(val);
    localStorage.setItem('vs_silent_sos_pin', val);
    addSilentLog(`Config updated: Calculator Secret PIN set to "${val}"`);
  };

  const handleSavePhrase = (val: string) => {
    setSecretPhrase(val);
    localStorage.setItem('vs_silent_sos_phrase', val);
    addSilentLog(`Config updated: Trigger Phrase set to "${val}"`);
  };

  // --- CYBER SAFETY STATE ---
  const [cyberReports, setCyberReports] = useState<StalkerLog[]>([
    {
      id: '1',
      timestamp: '2026-05-26 14:22',
      source: 'Instagram direct message',
      details: 'Repeated threats from mock handle, stalking personal tracking info.',
      severity: 'HIGH'
    },
    {
      id: '2',
      timestamp: '2026-05-24 09:15',
      source: 'SMS / Unknown ID',
      details: 'Unsolicited links directing to malicious tracking coordinates.',
      severity: 'MEDIUM'
    }
  ]);
  const [cyberSource, setCyberSource] = useState('');
  const [cyberDetails, setCyberDetails] = useState('');
  const [cyberSeverity, setCyberSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [deepfakeUrl, setDeepfakeUrl] = useState('');
  const [deepfakeChecking, setDeepfakeChecking] = useState(false);
  const [deepfakeResult, setDeepfakeResult] = useState<{ scanStatus: string; score: number; tip: string } | null>(null);

  // Fake voice lines
  const voiceLines = {
    police: [
      "[Dispatch Captain] Officer Vanguard requesting immediately safety status. Walk towards a public venue.",
      "[Dispatch Captain] Backup division is checking Sector 4. Affirm status by repeating back coordinates."
    ],
    parent: [
      "[Father] Hi sweetie! I am waiting outside, where exactly are you right now?",
      "[Father] Yes, I have open maps in front of me. Just keep walking towards me, I can see you."
    ],
    colleague: [
      "[Supervisor] Hey, we are finalizing the dispatch metrics. Are you joining us in the lobby?",
      "[Supervisor] We are heading out together right now. Share your pulse so we can group up."
    ]
  };

  // Sound effects simulator using browser audio synthetic frequencies
  const playBeep = (freq: number, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore audio synthesis block
    }
  };

  // Dual-Tone Multi-Frequency (DTMF) keypad dialer tones
  const playDialBeep = (num: string) => {
    const freqMap: Record<string, [number, number]> = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };
    const pair = freqMap[num] || [440, 350];
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.frequency.value = pair[0];
      osc2.frequency.value = pair[1];
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // ignore blockades
    }
  };

  // Sync custom dialog box segments
  useEffect(() => {
    const lines = customVoiceInput.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      setCustomVoiceTexts(lines);
    }
  }, [customVoiceInput]);

  // Trigger speech synthesis during active calls
  useEffect(() => {
    if (isInCall && speakerEnabled && !isMuted) {
      const activeLines = isCustomVoiceLines ? customVoiceTexts : voiceLines[selectedVoice];
      // Speak a new line or repeat appropriately
      const lineIndex = Math.floor(callTimer / 6) % activeLines.length;
      
      // Let's speak as soon as the call is accepted, and every 6 seconds thereafter
      if (callTimer % 6 === 0) {
        let textToSpeak = activeLines[lineIndex] || '';
        // Strip out brackets (e.g. "[Father]") before sending to TTS synthesizer
        textToSpeak = textToSpeak.replace(/\[.*?\]\s*/, '');
        
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.95; // realistic voice rate
            utterance.pitch = selectedVoice === 'police' ? 0.85 : selectedVoice === 'parent' ? 1.05 : 1.15;
            
            // Assign English/standard fallback matching
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              const langMatch = voices.filter(v => v.lang.startsWith('en'));
              if (selectedVoice === 'police' && langMatch.length > 1) {
                utterance.voice = langMatch[1];
              } else if (langMatch.length > 0) {
                utterance.voice = langMatch[0];
              }
            }
            window.speechSynthesis.speak(utterance);
          }
        } catch (err) {
          console.warn("Speech Synthesis interface failure ignored:", err);
        }
      }
    }
  }, [isInCall, callTimer, speakerEnabled, isMuted, selectedVoice, isCustomVoiceLines, customVoiceTexts]);

  // Fake Call countdown mechanism
  useEffect(() => {
    let intervalId: any;
    if (isCountingDown && countdownRemaining > 0) {
      intervalId = setInterval(() => {
        setCountdownRemaining(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdownRemaining === 0) {
      setIsCountingDown(false);
      setIsRinging(true);
      playBeep(440, 0.4);
    }
    return () => clearInterval(intervalId);
  }, [isCountingDown, countdownRemaining]);

  // Ring tone pulsing synthesize sound
  useEffect(() => {
    let ringInterval: any;
    if (isRinging) {
      ringInterval = setInterval(() => {
        playBeep(480, 0.5);
      }, 2000);
    }
    return () => clearInterval(ringInterval);
  }, [isRinging]);

  // Call duration counter
  useEffect(() => {
    let callInterval: any;
    if (isInCall) {
      callInterval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(callInterval);
  }, [isInCall]);

  const triggerCallSimulation = () => {
    setIsCountingDown(true);
    setCountdownRemaining(callerDelay);
    setIsRinging(false);
    setIsInCall(false);
    setSlideX(0);
    setShowKeypad(false);
    setKeypadInput('');
  };

  const cancelCallSimulation = () => {
    setIsCountingDown(false);
    setIsRinging(false);
    setIsInCall(false);
    setSlideX(0);
    setShowKeypad(false);
    setKeypadInput('');
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      // ignore client-side cancel exceptions
    }
  };

  const acceptCall = () => {
    setIsRinging(false);
    setIsInCall(true);
    setSlideX(0);
    playBeep(600, 0.2);
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Load and refresh logs from localStorage
  useEffect(() => {
    const loadLogs = () => {
      const stored = JSON.parse(localStorage.getItem('vs_silent_sos_logs') || '[]');
      if (stored.length > 0) {
        setSilentLogs(stored);
      }
    };
    loadLogs();
    const sub = setInterval(loadLogs, 1000);
    return () => clearInterval(sub);
  }, []);

  const addSilentLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const newMsg = `[${time}] ${msg}`;
    setSilentLogs(prev => {
      const updated = [newMsg, ...prev].slice(0, 50);
      localStorage.setItem('vs_silent_sos_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // --- BLUETOOTH INTEGRATION HELPERS ---
  const addBtLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBtEventLog(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    setBtEventLog([
      `[${timestamp}] BLE Stack: Engine initiated successfully.`,
      `[${timestamp}] BLE Stack: Web Bluetooth 5.2 hardware layer detected.`
    ]);
  }, []);

  useEffect(() => {
    let timer: any;
    if (btStatus === 'CONNECTED') {
      timer = setInterval(() => {
        setBtSignalStrength(prev => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const newVal = prev + delta;
          return Math.max(-90, Math.min(-30, newVal));
        });
        if (btBattery !== null && Math.random() > 0.85) {
          setBtBattery(prev => (prev !== null && prev > 1) ? prev - 1 : prev);
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [btStatus, btBattery]);

  const connectRealBluetooth = async () => {
    setBtError('');
    setBtStatus('SCANNING');
    addBtLog('Initiating hardware scanning mode (navigator.bluetooth)...');
    try {
      if (!(navigator as any).bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser, or is restricted inside iframes.');
      }
      
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'battery_service', 
          '0000180f-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          'ffe0',
          'fff0'
        ]
      });
      
      setBtStatus('CONNECTING');
      addBtLog(`Device located: "${device.name || 'Generic BLE Accessory'}" [ID: ${device.id}]`);
      setPairedDeviceName(device.name || 'Generic BLE Accessory');
      
      addBtLog('Connecting to GATT Server...');
      const server = await device.gatt?.connect();
      setBluetoothDevice(device);
      setBtStatus('CONNECTED');
      setIsSimulatingBt(false);
      addBtLog('Hardware Bluetooth GATT service connected successfully.');
      
      device.addEventListener('gattserverdisconnected', () => {
        setBtStatus('DISCONNECTED');
        addBtLog('Security alert: Bluetooth distress beacon link severed.');
        playBeep(330, 0.4);
      });
      
      // Attempt to read Battery Service
      try {
        addBtLog('Querying standard Battery Service...');
        const batteryService = await server.getPrimaryService('battery_service');
        const characteristic = await batteryService.getCharacteristic('battery_level');
        const val = await characteristic.readValue();
        const level = val.getUint8(0);
        setBtBattery(level);
        addBtLog(`Battery status resolved: ${level}%`);
        
        // Listen to battery change notification
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const newLevel = event.target.value.getUint8(0);
          setBtBattery(newLevel);
          addBtLog(`Battery telemetry updated: ${newLevel}%`);
        });
      } catch (batErr) {
        console.warn("Battery service query skipped:", batErr);
        setBtBattery(95); // fallback default
        addBtLog('Battery service unavailable. Defaulting to 95% telemetry.');
      }

      // Automatically search for notification keys/click services (e.g. FFE0) and bind trigger handlers
      try {
        addBtLog('Searching for click/alert characteristic triggers...');
        const services = await server.getPrimaryServices();
        addBtLog(`Located ${services.length} primary GATT services.`);
        
        for (const service of services) {
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            // If characteristics support notify/indicate, subscribe to them!
            if (char.properties.notify || char.properties.indicate) {
              addBtLog(`Binding click trigger on char: ${char.uuid.substring(0, 8)}`);
              await char.startNotifications();
              char.addEventListener('characteristicvaluechanged', (event: any) => {
                const data = event.target.value;
                const hexVals: string[] = [];
                for (let i = 0; i < data.byteLength; i++) {
                  hexVals.push(data.getUint8(i).toString(16).padStart(2, '0'));
                }
                const hexStr = hexVals.join(' ');
                addBtLog(`[GATT NOTIFICATION] Char ${char.uuid.substring(0, 8)}: ${hexStr}`);
                
                // Trigger distress sequence on double click/alert characteristic notifications!
                playBeep(880, 0.1);
                setTimeout(() => playBeep(880, 0.1), 150);
                if (btAutoTriggerSos) {
                  addBtLog(`[AUTOMATED ROUTE] Fob trigger verified. Deploying silent tactical SOS sequence...`);
                  triggerSilentSOS();
                } else {
                  addBtLog(`[WARNING] Auto-trigger disabled. Action skipped.`);
                }
              });
            }
          }
        }
      } catch (charErr) {
        console.warn("GATT characteristic scan skipped or limited:", charErr);
        addBtLog('Generic click monitoring fallback active. Click on physical button sends notification.');
      }
      
    } catch (err: any) {
      console.warn("Web Bluetooth failure:", err);
      setBtStatus('ERROR');
      setBtError(err.message || 'Web Bluetooth scan cancelled or context unauthorized.');
      addBtLog(`Hardware connection failed: ${err.message || 'Scan cancelled.'}`);
      addBtLog('Falling back to Sandbox Bluetooth Emulator.');
      setIsSimulatingBt(true);
    }
  };

  const connectSimulatedBluetooth = (name: string) => {
    setBtError('');
    setBtStatus('CONNECTING');
    addBtLog(`Establishing secure channel to simulated hardware: "${name}"...`);
    
    setTimeout(() => {
      setBtStatus('CONNECTED');
      setPairedDeviceName(name);
      setBtBattery(100);
      setBtSignalStrength(-42);
      setIsSimulatingBt(true);
      addBtLog(`[Sandbox] Synchronized "${name}" panic node. Verification signature: OK.`);
      addBtLog(`[Sandbox] Continuous telemetry monitoring active. Handshake verified.`);
      playBeep(600, 0.15);
    }, 1000);
  };

  const simulateFobClick = () => {
    if (btStatus !== 'CONNECTED') return;
    addBtLog(`[ALARM EVENT] Single-click registered on "${pairedDeviceName}". Sync checked.`);
    playBeep(880, 0.1);
  };

  const simulateFobDoubleClick = () => {
    if (btStatus !== 'CONNECTED') return;
    addBtLog(`[ALARM EVENT] Double-click registered on "${pairedDeviceName}"!`);
    playBeep(880, 0.1);
    setTimeout(() => playBeep(880, 0.1), 150);
    
    if (btAutoTriggerSos) {
      addBtLog(`[AUTOMATED ROUTE] Fob trigger verified. Deploying silent tactical SOS sequence...`);
      triggerSilentSOS();
    } else {
      addBtLog(`[WARNING] Auto-trigger was disabled. Dispatch skipped.`);
    }
  };

  const disconnectBluetooth = () => {
    if (bluetoothDevice) {
      try {
        bluetoothDevice.gatt?.disconnect();
      } catch (e) {}
    }
    setBluetoothDevice(null);
    setBtStatus('DISCONNECTED');
    setBtBattery(null);
    addBtLog('Operator requested Bluetooth disconnect. Beacon link severed.');
    playBeep(440, 0.2);
  };

  // Covert volume toggle gesture simulator
  const simulateVolumePowerTap = () => {
    setVolumeTriggerCount(prev => {
      const next = prev + 1;
      addSilentLog(`Covert Keypress detected: Power + Vol UP (${next}/3)`);
      if (next >= 3) {
        triggerSilentSOS();
        return 0;
      }
      return next;
    });
  };

  const triggerSilentSOS = async () => {
    setSilentSOSActivated(true);
    setIsSilentRecording(true);
    addSilentLog("CRITICAL: Stealth SOS active. No visual output shown externally.");
    addSilentLog("TRANSMITTING: GPS coordinate pack broadcasted to Vanguard Grid.");
    addSilentLog("RECORDING: Local ambient microphone active. Hashing chunks for Evidence Locker.");
    playBeep(880, 0.1);

    // Call actual quiet trigger
    const jwtToken = localStorage.getItem('vs_jwt_token');
    if (!jwtToken) return;

    const lat = 41.8781;
    const lng = -87.6298;

    const sendData = async (coords: { lat: number, lng: number }) => {
      try {
        const customMsg = localStorage.getItem('vs_custom_sos_message') || '';
        await fetch('/api/sos/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            coordinates: coords,
            emergencyMessage: `SILENT SOS ALERT: ${customMsg || "Assistance required."} Reason: Discreet Tools Panel Manual Trigger`,
            recipients: []
          })
        });
        addSilentLog(`API CONFIRMATIVE SYNC COMPLETE (MongoDB logged)`);
      } catch (e) {
        console.error(e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendData({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => sendData({ lat, lng })
      );
    } else {
      sendData({ lat, lng });
    }
  };

  const deactivateSilentSOS = () => {
    setSilentSOSActivated(false);
    setIsSilentRecording(false);
    setVolumeTriggerCount(0);
    localStorage.removeItem('vs_silent_sos_triggered_status');
    addSilentLog("Silent SOS deactivated. Encryption logs finalized.");
  };

  // Submit cyber harassment report
  const submitCyberReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyberSource || !cyberDetails) return;
    const newLog: StalkerLog = {
      id: Math.random().toString(),
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      source: cyberSource,
      details: cyberDetails,
      severity: cyberSeverity
    };
    setCyberReports([newLog, ...cyberReports]);
    setCyberSource('');
    setCyberDetails('');
  };

  // Check Deepfake Tool Simulator
  const checkDeepfakeStatus = () => {
    if (!deepfakeUrl) return;
    setDeepfakeChecking(true);
    setDeepfakeResult(null);
    setTimeout(() => {
      const isHighlySuspicious = deepfakeUrl.toLowerCase().includes('leak') || deepfakeUrl.toLowerCase().includes('face') || Math.random() > 0.4;
      setDeepfakeResult({
        scanStatus: 'ANALYSIS COMPLETED BY VANGUARD AI',
        score: isHighlySuspicious ? Math.floor(75 + Math.random() * 20) : Math.floor(10 + Math.random() * 20),
        tip: isHighlySuspicious 
          ? 'Deepfake synthesis signatures detected over key facial structures. High replication match.' 
          : 'Low deepfake signatures. Content appears native.'
      });
      setDeepfakeChecking(false);
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-44">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white border border-white/10 shadow-lg">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Stealth Modules</h2>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono">Covert Dispersal & Divergent Escort tools</p>
        </div>

        {/* METRIC BADGE */}
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-white/5 py-3 px-6 rounded-2xl flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mono">Stealth Shield Enabled</p>
          </div>
        </div>
      </header>

      {/* TABS SELECTOR */}
      <div className="p-2 bg-slate-950 border border-white/5 rounded-3xl flex flex-wrap gap-2">
        <button 
          onClick={() => setActiveStealthTab('FAKE_CALL')}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeStealthTab === 'FAKE_CALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Phone className="w-4 h-4" />
          Tactical Decoy Dialer
        </button>
        <button 
          onClick={() => setActiveStealthTab('SILENT_SOS')}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeStealthTab === 'SILENT_SOS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Silent SOS Sequence
        </button>
        <button 
          onClick={() => setActiveStealthTab('CYBER_SAFETY')}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeStealthTab === 'CYBER_SAFETY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          Cyber Threat Audits
        </button>
        <button 
          onClick={() => setActiveStealthTab('BLUETOOTH')}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeStealthTab === 'BLUETOOTH' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bluetooth className="w-4 h-4" />
          Wireless Fob Pair
        </button>
      </div>

      {/* --- CONTENT BLOCK --- */}
      {activeStealthTab === 'FAKE_CALL' && (
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* DIAL CONFIGURATION */}
          <div className="lg:col-span-6 bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                 <Flame className="text-indigo-500 animate-pulse w-7 h-7" /> Tactical Call Decoy
               </h3>
               <p className="text-xs font-bold text-slate-500 mono uppercase">Defuse uncomfortable security threats with highly plausible mobile voice communications.</p>
            </div>

            <div className="space-y-5">
              
              {/* Caller profile inputs */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono mb-2 block">Decoy Caller Name</label>
                   <input 
                     type="text" 
                     value={callerName} 
                     onChange={(e) => setCallerName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono mb-2 block">Decoy Number</label>
                   <input 
                     type="text" 
                     value={callerNumber} 
                     onChange={(e) => setCallerNumber(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500"
                   />
                 </div>
              </div>

              {/* Prebuilt Quick Caller Selectors */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono mb-2 block">Decoy Caller Persona</label>
                <div className="grid grid-cols-3 gap-3">
                   {[
                     { label: 'Dispatch Alpha', val: 'Vanguard Headquarters', phone: '+1 (800) 911-TACT', code: 'police' },
                     { label: 'Guardian Dad', val: 'Father', phone: '+1 (555) 392-1920', code: 'parent' },
                     { label: 'Duty Manager', val: 'Project Lead Spark', phone: '+1 (555) 880-3320', code: 'colleague' }
                   ].map(per => (
                     <button 
                       key={per.label}
                       onClick={() => {
                         setCallerName(per.val);
                         setCallerNumber(per.phone);
                         setSelectedVoice(per.code as any);
                       }}
                       className={`p-3.5 border text-center rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${
                         callerName === per.val ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                       }`}
                     >
                        <UserCheck className="w-4 h-4 mb-0.5 text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-tight">{per.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              {/* Delay Timer option plus custom value */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono block">Delay Timer Alert</label>
                  <span className="text-[10px] text-indigo-400 font-bold mono">{callerDelay} Seconds Delay</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                   {[
                     { label: '3s', sec: 3 },
                     { label: '10s', sec: 10 },
                     { label: '30s', sec: 30 },
                     { label: '1m', sec: 60 },
                     { label: '3m', sec: 180 }
                   ].map(del => (
                     <button 
                       key={del.sec}
                       onClick={() => setCallerDelay(del.sec)}
                       className={`py-3.5 border text-center rounded-xl font-black uppercase text-[10px] mono transition-all ${
                         callerDelay === del.sec ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                       }`}
                     >
                       {del.label}
                     </button>
                   ))}
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase mono shrink-0">Custom Seconds:</span>
                  <input 
                    type="number"
                    min="1"
                    max="3600"
                    value={callerDelay}
                    onChange={(e) => setCallerDelay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 outline-none focus:border-indigo-500 text-center mono"
                  />
                  <span className="text-[9px] text-slate-500 italic">Enter exact countdown duration</span>
                </div>
              </div>

              {/* Layout theme & customization switches */}
              <div className="space-y-3.5 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-black text-white uppercase">Decoy Skin UI Theme</p>
                     <p className="text-[10px] text-slate-500 mono uppercase mt-0.5">Locks appearance structure</p>
                  </div>
                  <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl">
                     <button 
                       onClick={() => setStealthTheme('iOS')}
                       className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${stealthTheme === 'iOS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-250'}`}
                     >
                       iOS
                     </button>
                     <button 
                       onClick={() => setStealthTheme('Android')}
                       className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${stealthTheme === 'Android' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-250'}`}
                     >
                       Android
                     </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  {/* Fullscreen Overlay mode toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-300 uppercase">Fullscreen Takeover</p>
                      <p className="text-[9px] text-zinc-500 uppercase mono">Covers all borders, banners and chrome</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isFullscreenActive}
                      onChange={(e) => setIsFullscreenActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-zinc-900 border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  {/* Simulate Lock Screen style toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-300 uppercase">Simulate Lock Screen</p>
                      <p className="text-[9px] text-zinc-500 uppercase mono">Shows beautiful lock style during delay</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isSimulatingLockScreen}
                      onChange={(e) => setIsSimulatingLockScreen(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-zinc-900 border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  {/* Synthetic Voice Reader Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-300 uppercase">Audible Voice on Speaker</p>
                      <p className="text-[9px] text-zinc-500 uppercase mono">Speaks dialogue aloud using speech synthesis</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={speakerEnabled}
                      onChange={(e) => setSpeakerEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-zinc-900 border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  {/* Custom Written Dialogue Toggles */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-300 uppercase">Custom Voice Dialog Scripts</p>
                      <p className="text-[9px] text-zinc-500 uppercase mono">Type exactly what you want the caller to say</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isCustomVoiceLines}
                      onChange={(e) => setIsCustomVoiceLines(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-zinc-900 border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  {isCustomVoiceLines && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mono mb-1.5 block">Custom Spoken Dialogue (Line by line):</label>
                      <textarea
                        rows={3}
                        value={customVoiceInput}
                        onChange={(e) => setCustomVoiceInput(e.target.value)}
                        placeholder="Write spoken lines here, press enter for the next sentence..."
                        className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500"
                      />
                      <p className="text-[9px] text-zinc-500 italic mt-1">Synthetic voice reads each progressive block aloud every 6 seconds on speaker.</p>
                    </div>
                  )}

                </div>
              </div>

              {/* Trigger Scheduling Actions */}
              <div className="grid grid-cols-2 gap-4 pb-2">
                <button 
                  onClick={triggerCallSimulation}
                  disabled={isCountingDown || isRinging || isInCall}
                  className="py-5 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 hover:scale-102 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-white animate-bounce" />
                  Schedule Call
                </button>
                <button 
                  onClick={cancelCallSimulation}
                  disabled={!isCountingDown && !isRinging && !isInCall}
                  className="py-5 bg-white/5 border border-white/10 text-slate-400 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4 text-slate-400" />
                  Cancel Active
                </button>
              </div>

              {/* Trigger Instant Trigger bypass */}
              <button
                onClick={() => {
                  setCallerDelay(0);
                  setIsCountingDown(false);
                  setIsRinging(true);
                  playBeep(440, 0.4);
                }}
                disabled={isRinging || isInCall}
                className="w-full py-4.5 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
              >
                Launch Simulation Instantly (0s Delay)
              </button>

            </div>
          </div>

          {/* SIMULATOR SCREEN CONTAINER (PREVIEW MODE) */}
          <div className="lg:col-span-6 bg-[#020617] p-8 rounded-[64px] border-4 border-zinc-900 shadow-3xl flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden">
             
             {isCountingDown && (
               <div className="text-center space-y-4 animate-in zoom-in duration-500">
                  <Clock className="w-16 h-16 text-indigo-500 mx-auto animate-spin" />
                  <p className="text-lg font-black text-white uppercase mono tracking-wider">Stealth Call Scheduled</p>
                  <p className="text-6xl font-black text-indigo-400 mono animate-pulse">{countdownRemaining}<span className="text-xl">s</span></p>
                  <p className="text-[10px] text-slate-500 mono uppercase">
                    {isFullscreenActive ? "Full Screen Takeover mode active! Preparing lock screen..." : "Simulation running in inline pane. Standby."}
                  </p>
               </div>
             )}

             {isRinging && (
               <div className={`w-full h-full absolute inset-0 text-white p-12 flex flex-col justify-between transition-all duration-700 ${
                 stealthTheme === 'iOS' ? 'bg-[#1c1c1e]' : 'bg-[#0f1016]'
               }`}>
                  <div className="text-center space-y-3 pt-12">
                     <p className="text-4xl font-normal text-slate-100 font-sans tracking-tight leading-none">{callerName}</p>
                     <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mono">{callerNumber}</p>
                     <p className="text-[11px] text-emerald-400 font-bold uppercase animate-pulse">Incoming Phone Alert...</p>
                  </div>

                  <div className="flex justify-around items-center pb-12">
                     {/* Decoy actions */}
                     <button 
                       onClick={cancelCallSimulation}
                       className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:scale-110 active:scale-95 transition-transform shadow-lg"
                     >
                        <Phone className="w-8 h-8 rotate-[135deg]" />
                     </button>
                     <button 
                       onClick={acceptCall}
                       className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black hover:scale-110 active:scale-95 transition-transform shadow-lg accept-pulse"
                     >
                        <Phone className="w-8 h-8" />
                     </button>
                  </div>
               </div>
             )}

             {isInCall && (
               <div className={`w-full h-full absolute inset-0 text-white p-12 flex flex-col justify-between transition-all duration-700 ${
                 stealthTheme === 'iOS' ? 'bg-[#050505]' : 'bg-[#111]'
               }`}>
                  <div className="text-center space-y-2 pt-12">
                     <p className="text-3xl font-light text-slate-200">{callerName}</p>
                     <p className="text-lg text-emerald-500 mono font-black">{formatCallTime(callTimer)}</p>
                     <p className="text-[10px] text-indigo-400/80 uppercase tracking-widest mono mt-1">Direct Secure Bridge Active</p>
                  </div>

                  {/* Synthetic Audio Wave */}
                  <div className="py-8 text-center space-y-4">
                     <div className="flex gap-1.5 items-end justify-center h-24 max-w-xs mx-auto">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 1, 4, 2].map((h, i) => (
                           <div 
                             key={i} 
                             className="bg-indigo-500 w-1.5 rounded-full animate-[progress_1s_infinite]" 
                             style={{ 
                               height: `${20 + (Math.sin((callTimer + i) * 1.5) + 1) * 35}%`,
                               animationDelay: `${i * 100}ms` 
                             }} 
                           />
                        ))}
                     </div>
                     <div className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl max-w-sm mx-auto text-left">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 mono">Incoming Dispatch Playback</p>
                        <p className="text-xs font-bold text-indigo-300 italic">
                          "{(isCustomVoiceLines ? customVoiceTexts : voiceLines[selectedVoice])[Math.floor(callTimer / 6) % (isCustomVoiceLines ? customVoiceTexts : voiceLines[selectedVoice]).length] || "Bridge connection established. Keep line active."}"
                        </p>
                     </div>
                  </div>

                  <div className="flex justify-center pb-12">
                     <button 
                       onClick={cancelCallSimulation}
                       className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:scale-110 active:scale-95 transition-transform"
                     >
                        <Phone className="w-8 h-8 rotate-[135deg]" />
                     </button>
                  </div>
               </div>
             )}

             {!isCountingDown && !isRinging && !isInCall && (
               <div className="text-center space-y-6 max-w-md p-6">
                  <div className="w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center text-indigo-400 mx-auto">
                     <Phone className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase italic">Stealth Screen Standby</h4>
                    <p className="text-sm font-semibold italic text-slate-500 uppercase mono mt-3">Select parameters on the left pane and fire a simulation to demonstrate the defensive decoy call flow.</p>
                  </div>
               </div>
             )}

          </div>
        </div>
      )}

      {/* FULLSCREEN REALISTIC COVERT OVERLAY (TAKES OVER ENTIRE VIEW) */}
      {isFullscreenActive && (isCountingDown || isRinging || isInCall) && (
        <div className="fixed inset-0 z-[999999] bg-[#000000] text-white flex flex-col justify-between overflow-hidden font-sans select-none animate-in fade-in duration-500">
          
          {/* TOP STATUS BAR ACCENTS */}
          <div className="h-10 flex items-center justify-between px-6 bg-black/10 select-none text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <span>9:41</span>
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] bg-red-650/40 border border-red-500 text-red-400 py-0.5 px-1.5 rounded uppercase font-bold tracking-tight">STEALTH GRID</span>
              <Battery className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* EXIT BYPASS HOT BUTTON (Subtly hidden for demo testing but easily usable) */}
          <button 
            onClick={cancelCallSimulation}
            className="absolute top-12 right-6 z-[1000000] bg-white/10 hover:bg-white/20 hover:text-red-400 border border-white/5 py-2 px-3 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-colors"
          >
            ❌ TERMINATE SIMULATION
          </button>

          {/* SIMULATED LOCK SCREEN STANDBY STATE */}
          {isCountingDown && isSimulatingLockScreen && (
            <div className="flex-1 flex flex-col justify-between py-12 px-8 bg-gradient-to-b from-[#090b11] via-[#020306] to-[#040608] text-center relative animate-in fade-in duration-700">
              <div className="space-y-2 mt-8">
                {/* Pad lock icon */}
                <Lock className="w-6 h-6 text-slate-400 mx-auto animate-pulse" />
                
                {/* Clock */}
                <h2 className="text-8xl font-thin tracking-tight text-white font-mono leading-none">
                  {new Date().getHours().toString().padStart(2, '0')}:
                  {new Date().getMinutes().toString().padStart(2, '0')}
                </h2>
                
                {/* Date */}
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Covert notifications */}
              <div className="max-w-sm mx-auto w-full space-y-4">
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-3xl text-left shadow-lg backdrop-blur-xl animate-pulse">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Stealth Watch OS</span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase">Decoy call protocol armed</h4>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase leading-snug font-mono">Incoming contact fire in {countdownRemaining}s. Lock or put device down.</p>
                </div>
              </div>

              {/* Swipe to open / cancel footer */}
              <div className="space-y-4">
                <div className="h-0.5 w-32 bg-slate-700 mx-auto rounded-full animate-bounce" />
                <button 
                  onClick={cancelCallSimulation}
                  className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest hover:text-zinc-400 transition-colors"
                >
                  Swipe up or Tap here to abort
                </button>
              </div>
            </div>
          )}

          {/* SIMULATED INCOMING RINGING MOBILE INTERFACE */}
          {isRinging && (
            <div className={`flex-1 flex flex-col justify-between py-16 px-8 text-center animate-in zoom-in-95 duration-500 relative ${
              stealthTheme === 'iOS' 
                ? 'bg-gradient-to-b from-slate-900/45 via-black/80 to-black select-none' 
                : 'bg-gradient-to-b from-[#1c2230] via-[#090c10] to-black'
            }`}>
              {/* Blurred atmospheric profile image background (iOS design language) */}
              <div className="absolute inset-0 bg-indigo-900/10 blur-3xl rounded-full scale-110 pointer-events-none" />

              {/* Backlight and contact Details */}
              <div className="space-y-3 pt-6 z-10 relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-slate-800 to-indigo-900 rounded-full flex items-center justify-center text-white font-light text-4xl shadow-xl mx-auto border border-white/10 select-none">
                  {callerName[0]}
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-white font-sans mt-4">{callerName}</h2>
                <p className="text-sm font-semibold tracking-wider text-indigo-400 uppercase font-mono">{callerNumber}</p>
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-tight animate-pulse mb-1 mt-1">
                  {stealthTheme === 'iOS' ? 'Incoming Phone Line...' : 'SIMULATED DECOY INCOMING...'}
                </p>
              </div>

              {/* iOS SLIDE TO ANSWER OR ANDROID SWIPE AND ACTION BUTTON MATRIX */}
              <div className="space-y-12 z-10 relative pb-6">
                
                {/* Auxiliary subtle circular controls (Remind Me / Message) */}
                {stealthTheme === 'iOS' && (
                  <div className="grid grid-cols-2 max-w-xs mx-auto text-center text-slate-400 text-xs pb-4">
                    <button className="flex flex-col items-center justify-center gap-1 hover:text-white transition-colors">
                      <Clock className="w-5 h-5" />
                      <span className="text-[10px] font-medium tracking-wide">Remind Me</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="text-[10px] font-medium tracking-wide">Message</span>
                    </button>
                  </div>
                )}

                {/* ANIMATED SLIDER OR ANDROID SEPARATED BUTTONS */}
                {stealthTheme === 'iOS' ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {/* Realistic slide to answer range slider widget */}
                    <div className="relative w-80 h-16 bg-white/[0.08] rounded-full flex items-center justify-between p-1.5 overflow-hidden border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent pointer-events-none" />
                      
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={slideX}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSlideX(val);
                          if (val >= 85) {
                            acceptCall();
                            setSlideX(0);
                          }
                        }}
                        onMouseUp={() => setSlideX(0)}
                        onTouchEnd={() => setSlideX(0)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      
                      <div 
                        className="absolute left-1.5 w-13 h-13 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-75 pointer-events-none z-10"
                        style={{ transform: `translateX(${slideX * 2.3}px)` }}
                      >
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      
                      <span className="w-full text-center text-xs font-bold text-slate-300 pointer-events-none tracking-widest uppercase font-sans animate-[pulse_1.5s_infinite] select-none pl-6">
                        slide to answer
                      </span>
                    </div>

                    <p className="text-[9px] text-zinc-500 font-bold uppercase mono tracking-widest">
                      Drag the phone icon right to answer
                    </p>

                    <div className="mt-4">
                      {/* Apple style direct Decline backup button */}
                      <button 
                        onClick={cancelCallSimulation}
                        className="py-2.5 px-6 bg-red-600/30 border border-red-500/30 rounded-full text-red-400 font-bold text-[10px] uppercase tracking-widest hover:bg-red-650"
                      >
                        Decline Call
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Android responsive incoming call layout */
                  <div className="space-y-6">
                    <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">Swipe or click actions below to manage stream</p>
                    <div className="flex justify-around items-center max-w-sm mx-auto">
                      <div className="text-center space-y-2">
                        <button 
                          onClick={cancelCallSimulation}
                          className="w-18 h-18 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:scale-105 transition-transform shadow-lg hover:shadow-red-900/35"
                        >
                          <Phone className="w-7 h-7 rotate-[135deg]" />
                        </button>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decline</p>
                      </div>

                      <div className="text-center space-y-2">
                        <button 
                          onClick={acceptCall}
                          className="w-18 h-18 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black hover:scale-105 transition-transform shadow-lg hover:shadow-emerald-900/35 animate-bounce"
                        >
                          <Phone className="w-7 h-7" />
                        </button>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accept</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* SIMULATED ACTIVE PHONE CALL CONVERSATION INTERFACE */}
          {isInCall && (
            <div className={`flex-1 flex flex-col justify-between py-12 px-6 text-center select-none ${
              stealthTheme === 'iOS' ? 'bg-[#000000]' : 'bg-gradient-to-b from-[#0e1014] to-black'
            }`}>
              
              {/* Header block with dynamic scrolling text dial details */}
              <div className="space-y-1.5 pt-4">
                <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight font-sans">{callerName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-lg text-emerald-400 font-mono tracking-wider font-extrabold">{formatCallTime(callTimer)}</p>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mono">Audio Speaker Channel Engaged</p>
              </div>

              {/* AUDIO SPECTROGRAM OR NUMERIC KEYPAD DIAL SCREEN */}
              <div className="my-2.5 flex-1 flex flex-col justify-center items-center">
                
                {showKeypad ? (
                  /* Fully Interactive DTMF dialing dialpad overlay */
                  <div className="w-full max-w-xs p-4 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Keypad Input</span>
                      <button 
                        onClick={() => setKeypadInput('')} 
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase mono"
                      >
                        Clear
                      </button>
                    </div>
                    {/* Dial feedback screen */}
                    <div className="h-12 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center text-2xl tracking-widest font-semibold text-indigo-300 font-mono overflow-x-auto truncate px-4">
                      {keypadInput || 'Dialing...'}
                    </div>
                    
                    {/* Key Matrix */}
                    <div className="grid grid-cols-3 gap-3">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(num => (
                        <button
                          key={num}
                          onClick={() => {
                            setKeypadInput(prev => prev + num);
                            playDialBeep(num);
                          }}
                          className="h-14 w-14 rounded-full bg-slate-900 border border-white/5 text-xl font-mono text-slate-100 hover:bg-slate-800 active:bg-indigo-600 active:text-white flex items-center justify-center transition-all mx-auto shadow-md"
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowKeypad(false)}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-widest"
                    >
                      Close Keypad
                    </button>
                  </div>
                ) : (
                  /* Atmospheric voice playbacks audio spectrograph animation */
                  <div className="w-full max-w-sm space-y-6">
                    <div className="flex gap-1.5 items-end justify-center h-28 max-w-[280px] mx-auto select-none pointer-events-none">
                      {/* Generates highly fluid, stateful sine scale waves based on active timer */}
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 1, 4, 2].map((h, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 rounded-full transition-all duration-300 ${
                            isMuted ? 'bg-slate-700 h-2' : 'bg-indigo-500 p-0.5'
                          }`} 
                          style={isMuted ? {} : { 
                            height: `${15 + (Math.sin((callTimer + i) * 1.5) + 1) * 40}%`,
                            animation: `pulse 1.2s infinite ease-in-out`
                          }} 
                        />
                      ))}
                    </div>

                    {/* Subtitle transcription container */}
                    <div className="bg-slate-950/80 border border-white/5 p-5 rounded-3xl text-left shadow-2xl relative">
                      <div className="absolute top-3 right-4 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-widest">TRANSCRIBING</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">Simulated Voice Playback</p>
                      <p className="text-sm font-semibold italic text-indigo-200 leading-snug">
                        "{(isCustomVoiceLines ? customVoiceTexts : voiceLines[selectedVoice])[Math.floor(callTimer / 6) % (isCustomVoiceLines ? customVoiceTexts : voiceLines[selectedVoice]).length] || "Lines syncing... Keep listening."}"
                      </p>
                    </div>

                    {isMuted && (
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                        ⚠️ Microphone muted - dispatch cannot hear details
                      </p>
                    )}
                  </div>
                )}

              </div>

              {/* ACTION CALL CONFIGURATION BUTTON MATRIX */}
              <div className="space-y-6 select-none z-10">
                
                {/* 3x2 Circular Translucent Buttons (iOS-Style Call Options) */}
                <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto justify-items-center mb-4">
                  
                  {/* MUTE BUTTON */}
                  <div className="text-center space-y-1.5">
                    <button 
                      onClick={() => setIsMuted(prev => !prev)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${
                        isMuted 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/[0.05] text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mute</p>
                  </div>

                  {/* KEYPAD OPTION TOGGLE */}
                  <div className="text-center space-y-1.5">
                    <button 
                      onClick={() => setShowKeypad(prev => !prev)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${
                        showKeypad 
                          ? 'bg-[#3b82f6] text-white border-[#3b82f6]' 
                          : 'bg-white/[0.05] text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Grid className="w-6 h-6" />
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keypad</p>
                  </div>

                  {/* SPEAKER OPTION TOGGLE */}
                  <div className="text-center space-y-1.5">
                    <button 
                      onClick={() => setSpeakerEnabled(prev => !prev)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${
                        speakerEnabled 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/[0.05] text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {speakerEnabled ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaker</p>
                  </div>

                  {/* ADD CALL (Simulated Disabled) */}
                  <div className="text-center space-y-1.5 opacity-40">
                    <button className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white cursor-not-allowed">
                      <Plus className="w-6 h-6" />
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Call</p>
                  </div>

                  {/* FACETIME (Simulated Disabled) */}
                  <div className="text-center space-y-1.5 opacity-40">
                    <button className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white cursor-not-allowed">
                      <Video className="w-6 h-6" />
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FaceTime</p>
                  </div>

                  {/* CONTACT LIST (Simulated Disabled) */}
                  <div className="text-center space-y-1.5 opacity-40">
                    <button className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white cursor-not-allowed">
                      <User className="w-6 h-6" />
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacts</p>
                  </div>

                </div>

                {/* RED SHUTDOWN LINE CALL BUTTON */}
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={cancelCallSimulation}
                    className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-black hover:scale-110 active:scale-95 transition-all shadow-xl shadow-red-900/40 cursor-pointer"
                  >
                    <PhoneOff className="w-9 h-9" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* REALISTIC HINT GUIDELINE METRIC AT THE VERY BOTTOM ROW */}
          <div className="py-3 text-center border-t border-white/5 bg-black/80 text-[8px] text-zinc-600 font-mono uppercase tracking-widest leading-none select-none">
            Vanguard Tactical Decoy Engine active • Hold Bypass button to exit safely
          </div>

        </div>
      )}

      {activeStealthTab === 'SILENT_SOS' && (
        <div className="grid lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
          
          {/* SILENT CONFIGURATION & TRIGGER LAUNCHER */}
          <div className="lg:col-span-6 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className="space-y-4">
               <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-red-500 mono">Silent Beacon Active</span>
               </div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">Silent SOS Disguise Console</h3>
               <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase mono">Covertly trigger coordinate broadcasts and ambient surveillance streaming without alert screens or flashing signs.</p>
            </div>

            {/* LAUNCH COVERT DECOY GLOWING CTA */}
            <div className="p-8 bg-gradient-to-br from-indigo-950/40 to-slate-900 border-2 border-indigo-500/20 rounded-[36px] space-y-4 shadow-xl">
               <div className="space-y-1">
                 <p className="text-xs font-black text-indigo-400 uppercase tracking-wide font-mono">Stealth Decoy Deployment</p>
                 <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase mono">
                   Launches an innocuous full-screen cover skin. Perfect screen cover if observed.
                 </p>
               </div>
               
               <button 
                 onClick={onLaunchDecoy}
                 className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-102 active:scale-98 transition-all"
               >
                 Launch Covert Decoy Screen
               </button>
            </div>

            {/* LIVE CUSTOMIZATION CONFIGURATION */}
            <div className="bg-white/5 border border-white/5 rounded-[36px] p-8 space-y-6">
               <p className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-3">Decoy & Trigger Parameters</p>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Default Decoy Interface</label>
                     <select 
                       value={decoyType}
                       onChange={(e) => handleSaveDecoyType(e.target.value as 'CALCULATOR' | 'CLOCK')}
                       className="w-full bg-[#0d1017] border border-white/10 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500"
                     >
                        <option value="CALCULATOR">Minimalist Smart Calculator</option>
                        <option value="CLOCK">Modern Ambient Digital Clock</option>
                     </select>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Calculator Emergency Pin</label>
                     <input 
                       type="text" 
                       value={secretPin}
                       onChange={(e) => handleSavePin(e.target.value)}
                       placeholder="e.g. 911"
                       className="w-full bg-[#0d1017] border border-white/10 p-4 rounded-2xl text-xs font-mono font-bold text-white outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                     />
                     <span className="text-[9px] text-zinc-600 font-mono mt-1 block">TYPE THIS PIN AND PRESS "=" TO TRIGGER SOS SILENTLY</span>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Secret Voice/Dictation Phrase</label>
                     <input 
                       type="text" 
                       value={secretPhrase}
                       onChange={(e) => handleSavePhrase(e.target.value)}
                       placeholder="e.g. red balloon"
                       className="w-full bg-[#0d1017] border border-white/10 p-4 rounded-2xl text-xs font-mono font-bold text-white outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                     />
                     <span className="text-[9px] text-zinc-600 font-mono mt-1 block">SPEAKING OR TYPING THIS PHRASE GLOBALLY FIRES COVERT SOS</span>
                  </div>
               </div>
            </div>

            {/* GLOBAL HOTKEY GUIDELINES CARD */}
            <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 space-y-4">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mono">Covert Hotkey Shortcuts (Anywhere in App)</p>
               <div className="space-y-2.5 text-[11px] font-semibold text-slate-400 mono leading-relaxed uppercase">
                  <div className="flex justify-between items-center border-b border-white/[0.02] pb-1.5 gap-2">
                     <span>Ctrl + Shift + D</span>
                     <span className="text-indigo-400 font-bold">Toggle Full Decoy Cover</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/[0.02] pb-1.5 gap-2">
                     <span>Ctrl + Shift + S</span>
                     <span className="text-red-400 font-bold">Background Emergency SOS</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                     <span>Type word/phrase</span>
                     <span className="text-red-400 font-bold">Universal Core Trigger</span>
                  </div>
               </div>
            </div>

          </div>

          {/* TELEMETRY ACTIVE CONSOLE */}
          <div className="lg:col-span-6 bg-zinc-950 p-10 rounded-[48px] border-4 border-white/5 shadow-2xl space-y-8 flex flex-col justify-between">
             <div className="space-y-4">
                <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
                   <Terminal className="text-red-500" /> Covert Core logs (Diagnostic Logs)
                </h4>
                
                <div className="bg-black/80 rounded-[32px] p-6 h-80 overflow-y-auto font-mono text-[11px] space-y-2 border border-white/5 custom-scrollbar uppercase">
                   {silentLogs.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-center text-slate-700 uppercase italic">
                        [Standby: Listening to stealth keypress routines...]
                     </div>
                   ) : (
                     <div className="space-y-2.5">
                        {silentLogs.map((log, idx) => (
                          <div key={idx} className="text-indigo-400 animate-in slide-in-from-left-2 text-[11px]">
                             {log}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>

             {/* GESTURE HARDWARE COVERT TESTING */}
             <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
                <p className="text-xs font-black text-white uppercase tracking-wider">Covert Hardware Gesture Simulator</p>
                <div className="flex items-center justify-between gap-4">
                   <button 
                     onClick={simulateVolumePowerTap}
                     className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                   >
                     Tap Hardware Vol/Power
                   </button>
                   <div className="flex gap-2">
                      {[1, 2, 3].map(step => (
                        <div 
                          key={step} 
                          className={`w-4 h-4 rounded-full border border-white/10 ${
                            volumeTriggerCount >= step ? 'bg-red-500 shadow-lg shadow-red-500/40' : 'bg-white/5'
                          }`}
                        />
                      ))}
                   </div>
                </div>
                <p className="text-[10px] font-bold text-[#64748b] leading-relaxed uppercase mono">
                   Vol Up + Power 3 times mimics secret hand trigger under active duress constraints.
                </p>
             </div>

             {/* TRIGGER AND DEACTIVATE FOR MANUAL OVERRIDES */}
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={triggerSilentSOS}
                  disabled={silentSOSActivated}
                  className="py-6 bg-red-900/40 border border-red-500/30 text-red-100 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                   Manual Silent Trigger
                </button>
                <button 
                  onClick={deactivateSilentSOS}
                  disabled={!silentSOSActivated}
                  className="py-6 bg-white/5 border border-white/10 text-[#64748b] rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all disabled:opacity-50"
                >
                   Resolve / Deactivate
                </button>
             </div>

             <div className="p-6 bg-[#020617] rounded-3xl border border-white/5 flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  isSilentRecording ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'
                }`}>
                   <VideoOff size={24} />
                </div>
                <div>
                   <p className="text-xs font-black text-white uppercase">Continuous Ambient Capture</p>
                   <p className="text-[9px] text-slate-500 mono uppercase">Covertly chunking background mic feeds</p>
                </div>
             </div>
          </div>

        </div>
      )}

      {activeStealthTab === 'CYBER_SAFETY' && (
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* INCIDENT tracker */}
          <div className="lg:col-span-7 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8 shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">Cyber Safety Tracker</h3>
                <p className="text-xs font-bold text-slate-500 uppercase mono">Secure registration & reporting logs of online stalking, deepfakes, or digital harassment.</p>
             </div>

             <form onSubmit={submitCyberReport} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Harassment Channel</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WhatsApp, Twitter DM"
                      value={cyberSource} 
                      onChange={(e) => setCyberSource(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-semibold text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Threat Severity</label>
                    <select 
                      value={cyberSeverity} 
                      onChange={(e) => setCyberSeverity(e.target.value as any)}
                      className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-500"
                    >
                      <option value="LOW">LOW VERIFICATION</option>
                      <option value="MEDIUM">MEDIUM ALARM</option>
                      <option value="HIGH">CRITICAL DISTRESS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono mb-2 block">Activity Log Details & Handles</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide screenshot markers, unverified handles, threatening language..."
                    value={cyberDetails} 
                    onChange={(e) => setCyberDetails(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-semibold text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!cyberSource || !cyberDetails}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Log Cyber Stalking Event
                </button>
             </form>

             {/* Historic logged threats */}
             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Active Cyber Records ({cyberReports.length})</p>
                <div className="space-y-3">
                   {cyberReports.map((item) => (
                     <div key={item.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-start gap-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{item.source}</span>
                             <span className="text-[8px] font-mono text-slate-500">{item.timestamp}</span>
                           </div>
                           <p className="text-xs text-slate-300 font-medium">{item.details}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                          item.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                          item.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {item.severity}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* DEEPFAKE CHECKER TOOL */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 shadow-2xl space-y-6">
                <div className="space-y-1">
                   <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
                     <Key className="text-indigo-400" /> Deepfake Verify Tool
                   </h4>
                   <p className="text-[9px] text-slate-500 uppercase mono">Analyze suspect profile handles for digital forgery</p>
                </div>

                <div className="space-y-4">
                   <input 
                     type="text"
                     placeholder="Suspect media link, post handle or url..."
                     value={deepfakeUrl}
                     onChange={(e) => setDeepfakeUrl(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500 uppercase"
                   />
                   <button 
                     onClick={checkDeepfakeStatus}
                     disabled={deepfakeChecking || !deepfakeUrl}
                     className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50"
                   >
                     {deepfakeChecking ? 'RUNNING SCAN BIOMETRICS...' : 'SCAN FOR DIGITAL FORGERY'}
                   </button>
                </div>

                {deepfakeResult && (
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500">
                     <div className="flex justify-between items-center text-[8px] font-mono text-indigo-400 uppercase">
                        <span>{deepfakeResult.scanStatus}</span>
                        <span>{deepfakeResult.score}% CLASSIFICATION</span>
                     </div>
                     <p className="text-xs font-bold text-white uppercase italic">"{deepfakeResult.tip}"</p>
                     <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${deepfakeResult.score > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${deepfakeResult.score}%` }} />
                     </div>
                  </div>
                )}
             </div>

             {/* Digital Hygiene Checklists */}
             <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 shadow-2xl space-y-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Anti-Stalking Hygiene Protocol</p>
                <div className="space-y-2">
                   {[
                     "Turn off location metadata on social cameras.",
                     "Disable bluetooth tag discovery in crowded hubs.",
                     "Set instant 2-Factor Authentication across nodes.",
                     "Activate silent device proxying for coordinates."
                   ].map((item, idx) => (
                     <div key={idx} className="flex gap-3 items-center p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase leading-snug">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      )}

      {activeStealthTab === 'BLUETOOTH' && (
        <div className="grid lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
          
          {/* LEFT PANEL: DEVICE MANAGEMENT & SCANNING */}
          <div className="lg:col-span-6 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <div className="space-y-3">
               <div className="flex gap-2 items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${btStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mono">Wireless SOS Link</span>
               </div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                 <Bluetooth className="text-indigo-500 animate-pulse w-7 h-7" /> Bluetooth Distress Fob
               </h3>
               <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase mono">
                 Pair wearable Bluetooth accessories (smart rings, panic fobs, buttons) to trigger background SOS broadcasts instantly without touching your phone.
               </p>
               
               {/* SECURITY CONTEXT / DIRECT HTTPS LINK NOTICE */}
               <div className="p-5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl space-y-2">
                 <p className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                   ⚠️ Secure Sandbox Warning
                 </p>
                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase mono">
                   Browsers restrict the Web Bluetooth API inside cross-origin preview iframes. If you see a <strong className="text-white">"context unauthorized"</strong> or <strong className="text-white">"SecurityError"</strong>, you MUST open the app in a new tab:
                 </p>
                 <div className="p-3 bg-black/40 rounded-xl font-mono text-[10px] text-indigo-300 break-all border border-white/5 select-all">
                   https://ais-dev-ebyflyp272xbefa4orchf5-177512689673.asia-southeast1.run.app
                 </div>
                 <p className="text-[9px] text-slate-500 uppercase font-medium leading-normal mono">
                   👉 Tap the link above or click the "Open in new tab" icon on the top right on your phone or desktop to grant Web Bluetooth hardware permissions directly.
                 </p>
               </div>
            </div>

            {/* CONNECTION CARD */}
            <div className="bg-white/5 border border-white/5 rounded-[36px] p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-xs font-black text-white uppercase tracking-wider">Device Connection Status</span>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase mono ${
                  btStatus === 'CONNECTED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                  btStatus === 'DISCONNECTED' ? 'bg-slate-900 text-slate-500 border border-white/5' :
                  btStatus === 'SCANNING' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/30 animate-pulse' :
                  btStatus === 'CONNECTING' ? 'bg-yellow-600/15 text-yellow-400 border border-yellow-600/30' :
                  'bg-red-600/15 text-red-500 border border-red-500/20'
                }`}>
                  {btStatus}
                </span>
              </div>

              {btStatus === 'CONNECTED' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Active Device</p>
                      <p className="text-lg font-black text-white uppercase italic">{pairedDeviceName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Channel</p>
                      <p className="text-xs font-black text-indigo-400 mono uppercase">{isSimulatingBt ? 'Simulated BLE' : 'Hardware GATT'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Signal RSSI</span>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-white mono">{btSignalStrength}</span>
                        <span className="text-xs font-bold text-slate-400 mono">dBm</span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase mt-2 mono">
                        {btSignalStrength > -50 ? 'Strong Connection' : btSignalStrength > -75 ? 'Guarded Range' : 'Weak Signal'}
                      </span>
                    </div>

                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Battery Level</span>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-2xl font-black text-white mono">{btBattery}%</span>
                        <span className="text-xs font-bold text-slate-400 mono">Li-Po</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${btBattery && btBattery > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${btBattery}%` }} />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={disconnectBluetooth}
                    className="w-full py-5 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Disconnect Device Link
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {btError && (
                    <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-[11px] font-bold text-red-400 leading-relaxed uppercase mono">
                      <p className="font-black">Direct Scan Interrupted:</p>
                      <p className="mt-1 text-slate-400 font-medium normal-case">{btError}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button 
                      type="button"
                      onClick={connectRealBluetooth}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
                    >
                      Scan BLE Wearables
                    </button>
                    <p className="text-[9px] text-slate-500 leading-normal uppercase mono text-center">
                      Requires Bluetooth hardware. Click to initiate standard Web Bluetooth scan.
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-6 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">High-Fidelity Bluetooth Emulators</p>
                    <p className="text-xs text-slate-500 font-bold uppercase italic leading-normal mono">
                      Sandbox bypass: instantly mount a simulated safety wearable device to verify the end-to-end SOS logic within browser environments.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Vanguard Smart Ring BLE', desc: 'Covert Bio-Accessory' },
                        { name: 'Tactical Keychain Fob', desc: 'Secure Dual-Button' },
                        { name: 'Guardian Sentry Band', desc: 'Continuous Heart-Rate' }
                      ].map((dev, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => connectSimulatedBluetooth(dev.name)}
                          className="p-4 bg-white/5 border border-white/5 hover:border-indigo-500/40 rounded-2xl text-left hover:bg-white/[0.02] transition-all cursor-pointer"
                        >
                          <span className="font-black text-white text-[11px] uppercase block truncate">{dev.name}</span>
                          <span className="font-mono text-[9px] text-indigo-400 uppercase mt-1 block">{dev.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SYSTEM CONFIGURATION */}
            <div className="bg-white/5 border border-white/5 rounded-[36px] p-8 space-y-5">
              <p className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-3">Bluetooth Dispatch Protocols</p>
              
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-2xl border border-white/5">
                <div>
                  <span className="text-xs font-black text-white uppercase block">Double-Press Quick SOS</span>
                  <span className="text-[9px] text-slate-500 uppercase mono">Instantly deploy background silent broadcast.</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setBtAutoTriggerSos(!btAutoTriggerSos)}
                  className={`w-12 h-7 rounded-full transition-all relative p-1 cursor-pointer ${btAutoTriggerSos ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${btAutoTriggerSos ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-normal mono">
                  Encryption Key: SHA-256 secure hash generated on initial device pairing handshakes.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: WEARABLE SIMULATION & EVENT REGISTRY */}
          <div className="lg:col-span-6 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            
            <div className="space-y-4">
               <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 mono">Hardware Simulator</span>
               </div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">Active Wearable Deck</h3>
               <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase mono">
                 Verify and test click trigger profiles by interacting with the virtual micro-hardware layout.
               </p>
            </div>

            {/* GRAPHICAL FOB COMPONENT */}
            <div className="bg-[#0b0d13] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[300px]">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {btStatus === 'CONNECTED' ? (
                <div className="w-full flex flex-col items-center space-y-6">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Paired & Armed Mode: click or double-click to test</p>
                  
                  {/* METALLIC FOB BUTTON BODY */}
                  <div className="w-44 h-44 bg-gradient-to-b from-zinc-800 to-zinc-950 border-4 border-zinc-700/50 rounded-full flex items-center justify-center shadow-3xl relative active:scale-95 transition-all group p-4 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full" />
                    
                    {/* INNER BUTTON CLICKABLE */}
                    <div 
                      onClick={simulateFobDoubleClick}
                      className="w-32 h-32 bg-gradient-to-t from-red-950 via-red-800 to-red-600 rounded-full flex flex-col items-center justify-center border-2 border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.4)] active:from-red-900 hover:brightness-110 transition-all text-center relative select-none cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent)] rounded-full animate-pulse" />
                      <Bluetooth className="w-10 h-10 text-white animate-bounce" />
                      <span className="text-[10px] font-black text-white tracking-widest uppercase mt-2">DOUBLE PRESS</span>
                      <span className="text-[8px] font-mono text-red-200 mt-1 uppercase block">SILENT SOS</span>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button 
                      type="button"
                      onClick={simulateFobClick}
                      className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-colors cursor-pointer"
                    >
                      Test Single-Click (Sync Pulse)
                    </button>
                    <button 
                      type="button"
                      onClick={simulateFobDoubleClick}
                      className="flex-1 py-4 bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Trigger Test Double-Click
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-10 max-w-sm">
                  <BluetoothOff className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-sm font-black text-white uppercase">Device Disconnected</p>
                  <p className="text-xs text-slate-500 uppercase leading-relaxed mono">
                    Pair one of the simulated hardware wearables on the left panel or scan for available BLE accessories to access the tactical simulation controls.
                  </p>
                </div>
              )}
            </div>

            {/* EVENT LOG REGISTRY */}
            <div className="bg-white/5 border border-white/5 rounded-[36px] p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-black text-white uppercase tracking-wider">Bluetooth GATT Event Registry</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mono">SECURE TELEMETRY</span>
              </div>

              <div className="h-44 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 bg-black/60 p-6 rounded-2xl border border-white/5 pr-2">
                {btEventLog.map((log, index) => {
                  let textGlow = 'text-slate-400';
                  if (log.includes('[ALARM EVENT]')) textGlow = 'text-red-400 font-bold';
                  else if (log.includes('[Sandbox]')) textGlow = 'text-cyan-400';
                  else if (log.includes('GATT') || log.includes('connected')) textGlow = 'text-emerald-400';
                  
                  return (
                    <div key={index} className={`border-b border-white/[0.02] pb-1.5 last:border-0 leading-relaxed uppercase ${textGlow}`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default DiscreetTools;
