import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, AlertTriangle, Shield, Map, Lock, Users, Terminal, 
  Play, Square, Trash2, UploadCloud, Volume2, Settings, Activity, 
  Sparkles, Radio, CheckCircle, Info, RefreshCw, ChevronRight, FileAudio
} from 'lucide-react';
import { AppView } from '../types';

interface VoiceAssistantProps {
  onEmergencyDetected: () => void;
  onSilentEmergencyDetected?: (reason: string) => void;
  onNavigate: (view: AppView) => void;
  language?: string;
}

interface RecordedVoiceClip {
  id: string;
  timestamp: string;
  duration: string;
  blobUrl: string;
  blobBase64?: string;
  title: string;
  isUploaded: boolean;
  uploadedId?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onEmergencyDetected, 
  onSilentEmergencyDetected, 
  onNavigate, 
  language = 'English' 
}) => {
  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState<{ intent: string; voiceResponse: string; isCritical: boolean } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customCommand, setCustomCommand] = useState('');

  // Safe Word System States
  const [safeWord, setSafeWord] = useState(() => localStorage.getItem('vs_safe_word') || 'red balloon');
  const [safeWordType, setSafeWordType] = useState<'COVERT' | 'OVERT'>('COVERT');
  const [bgListeningActive, setBgListeningActive] = useState(false);
  const [actionSos, setActionSos] = useState(true);
  const [actionAlertGuardians, setActionAlertGuardians] = useState(true);
  const [actionRecord, setActionRecord] = useState(true);
  const [actionUpload, setActionUpload] = useState(true);

  // Micro-recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedClips, setRecordedClips] = useState<RecordedVoiceClip[]>([]);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);

  // Audio Context Visualizer states
  const [micVolume, setMicVolume] = useState<number>(0);
  const [triggerFlasher, setTriggerFlasher] = useState(false);

  // Refs for audio capturing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Synchronization refs to avoid stale closures in web Speech API and audio recorder
  const bgListeningActiveRef = useRef(bgListeningActive);
  const isListeningRef = useRef(isListening);
  const safeWordRef = useRef(safeWord);
  const actionSosRef = useRef(actionSos);
  const actionAlertGuardiansRef = useRef(actionAlertGuardians);
  const actionRecordRef = useRef(actionRecord);
  const actionUploadRef = useRef(actionUpload);
  const safeWordTypeRef = useRef(safeWordType);
  const isTriggeringRef = useRef(false);

  useEffect(() => { bgListeningActiveRef.current = bgListeningActive; }, [bgListeningActive]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { safeWordRef.current = safeWord; }, [safeWord]);
  useEffect(() => { actionSosRef.current = actionSos; }, [actionSos]);
  useEffect(() => { actionAlertGuardiansRef.current = actionAlertGuardians; }, [actionAlertGuardians]);
  useEffect(() => { actionRecordRef.current = actionRecord; }, [actionRecord]);
  useEffect(() => { actionUploadRef.current = actionUpload; }, [actionUpload]);
  useEffect(() => { safeWordTypeRef.current = safeWordType; }, [safeWordType]);

  // Load clips from local storage
  useEffect(() => {
    const savedClips = localStorage.getItem('vs_recorded_clips');
    if (savedClips) {
      try {
        const parsed = JSON.parse(savedClips);
        // Note: blob URLs don't persist across reloads, so we'll filter out clips without base64 or regenerate placeholder URLs
        const validClips = parsed.map((clip: any) => {
          if (!clip.blobUrl && clip.blobBase64) {
            // Re-generate blobUrl from base64 if needed
            try {
              const byteCharacters = atob(clip.blobBase64.split(',')[1] || clip.blobBase64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'audio/webm' });
              return { ...clip, blobUrl: URL.createObjectURL(blob) };
            } catch (e) {
              return clip;
            }
          }
          return clip;
        });
        setRecordedClips(validClips);
      } catch (e) {
        console.error("Error reading saved clips", e);
      }
    }
  }, []);

  // Save clips to local storage
  const saveClips = (clips: RecordedVoiceClip[]) => {
    localStorage.setItem('vs_recorded_clips', JSON.stringify(clips));
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'Spanish' ? 'es-ES' : 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).toLowerCase().trim();
        if (currentText) {
          setTranscription(currentText);
          
          // Check for safeword match
          const activeWord = safeWordRef.current.toLowerCase().trim();
          if (currentText.includes(activeWord)) {
            triggerSafeWordProtocol();
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          setAudioPermission(false);
        }
      };

      rec.onend = () => {
        // Auto-restart if bgListening or isListening is active using refs
        if (bgListeningActiveRef.current || isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        }
      };

      recognitionRef.current = rec;

      // Start recognition if listening state is already active
      if (bgListeningActiveRef.current || isListeningRef.current) {
        try {
          rec.start();
        } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language]);

  // Clean speaking status timer
  useEffect(() => {
    if (analysis && !isAnalyzing) {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [analysis, isAnalyzing]);

  // Stop active microphone nodes on unmount
  useEffect(() => {
    return () => {
      stopMicrophoneNodes();
    };
  }, []);

  const stopMicrophoneNodes = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // Setup Web Audio Analyser for glowing mic pulses
  const startAudioAnalyzer = async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceNodeRef.current = sourceNode;

      const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        setMicVolume(average / 128); // normalise range roughly
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.error("Web Audio Analyser setup failed", e);
    }
  };

  // Handler for direct micro recordings (MediaRecorder)
  const startRecordingAudio = async () => {
    try {
      // Reuse the current stream if active and has audio track to avoid dual acquisition conflicts
      let stream = streamRef.current;
      const isStreamActive = stream && stream.active && stream.getAudioTracks().length > 0;

      if (!isStreamActive) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }
      setAudioPermission(true);

      startAudioAnalyzer(stream!);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream!);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        
        // Convert blob to base64 for local storage persistence & API compatibility
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const durationStr = `${Math.floor(audioChunksRef.current.length * 0.5 || 3)}s`;
          const recordId = "VOX-" + Math.floor(1000 + Math.random() * 9000);
          
          const newClip: RecordedVoiceClip = {
            id: recordId,
            timestamp: new Date().toISOString(),
            duration: durationStr,
            blobUrl: blobUrl,
            blobBase64: base64data,
            title: `Safe-Word Capture ${recordId}`,
            isUploaded: false
          };

          setRecordedClips((prevClips) => {
            const updatedClips = [newClip, ...prevClips];
            saveClips(updatedClips);
            
            // If configured to auto upload on trigger, post it
            if (actionUploadRef.current) {
              uploadClipToEvidence(newClip);
            }
            return updatedClips;
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone", err);
      setAudioPermission(false);
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    // Only stop microphone nodes if NOT continuous background/active listening
    if (!bgListeningActiveRef.current && !isListeningRef.current) {
      stopMicrophoneNodes();
    }
  };

  // Upload Voice Clip directly to evidence locker database
  const uploadClipToEvidence = async (clip: RecordedVoiceClip) => {
    try {
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) return;

      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'AUDIO',
          title: clip.title,
          location: 'Vanguard Active Voice Node',
          summary: `Vocal recording triggered automatically by Safe Word match on standard client device. Detected keyword phrase: "${safeWordRef.current}".`,
          linkedIncident: 'Safe-Word Security Protocol',
          fileName: `vanguard_safeword_${clip.id.toLowerCase()}.mp3`,
          fileSize: clip.duration === '0s' ? '1.2 MB' : `${(parseInt(clip.duration) * 0.1).toFixed(2)} MB`,
          fileBase64: clip.blobBase64,
          encryptionKeyName: 'VANGUARD_AES_VOX_KEY'
        })
      });

      const data = await res.json();
      if (data.success && data.record) {
        // Mark clip as uploaded
        setRecordedClips(prev => {
          const updated = prev.map(c => 
            c.id === clip.id ? { ...c, isUploaded: true, uploadedId: data.record.id } : c
          );
          saveClips(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error("Cloud storage backup pipeline failed", e);
    }
  };

  const deleteClip = (id: string) => {
    setRecordedClips(prev => {
      const filtered = prev.filter(c => c.id !== id);
      saveClips(filtered);
      return filtered;
    });
  };

  // Safe Word match checking engine
  const checkSafeWordMatch = (transcriptText: string) => {
    const activeWord = safeWordRef.current.toLowerCase().trim();
    if (transcriptText.toLowerCase().includes(activeWord)) {
      triggerSafeWordProtocol();
    }
  };

  // The actual Safe Word Protocol trigger
  const triggerSafeWordProtocol = () => {
    if (isTriggeringRef.current) return;
    isTriggeringRef.current = true;
    setTimeout(() => {
      isTriggeringRef.current = false;
    }, 12000); // 12s cooldown window

    setTriggerFlasher(true);
    setTimeout(() => setTriggerFlasher(false), 5000);

    // 1. Play feedback sound locally
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch notification
      osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // Staccato siren
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context block
    }

    // 2. Trigger Actions - Enforce distress broadcast SOS as requested
    const currentSafeWord = safeWordRef.current;
    const currentSafeWordType = safeWordTypeRef.current;

    if (currentSafeWordType === 'COVERT' && onSilentEmergencyDetected) {
      onSilentEmergencyDetected(`Covert safe word trigger matched keyword: "${currentSafeWord}". Safe protocols active.`);
    } else {
      onEmergencyDetected();
    }

    if (actionAlertGuardiansRef.current) {
      // Simulate real dispatch event to trust network via notification
      const dispatchLog = {
        time: new Date().toISOString(),
        note: `CRITICAL VOICE UPLINK: Safe word matches detected. High-level perimeter alert issued to Guardians.`
      };
      // Store in transient log / local simulated feed
      const activeLogs = localStorage.getItem('vanguard_sos_dispatch_log') || '[]';
      try {
        const parsedLogs = JSON.parse(activeLogs);
        parsedLogs.push(dispatchLog);
        localStorage.setItem('vanguard_sos_dispatch_log', JSON.stringify(parsedLogs));
      } catch (e) {}
    }

    // 3. Force auto capture incident recording of safe word aftermath as requested (At least 1 minute)
    startRecordingAudio();
    setTimeout(() => {
      stopRecordingAudio();
    }, 60000); // Record exactly 60 seconds (1 minute)

    setAnalysis({
      intent: 'EMERGENCY',
      voiceResponse: currentSafeWordType === 'COVERT' 
        ? "Covert silent security protocol initialized. Environmental logs locked into Vanguard ledger."
        : "ALERT DETECTED! Safe word triggered. Direct distress broadcast and tactical beacons activated.",
      isCritical: true
    });
  };

  // Handles standard vocal command input through AI
  const handleCommandInput = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    setTranscription(inputStr);
    setIsListening(false);
    setIsAnalyzing(true);
    setAnalysis(null);

    // Check custom safe word match first
    if (inputStr.toLowerCase().includes(safeWord.toLowerCase().trim())) {
      triggerSafeWordProtocol();
      setIsAnalyzing(false);
      return;
    }

    try {
      const token = localStorage.getItem('vs_jwt_token');
      const res = await fetch('/api/ai/classify-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: inputStr })
      });
      const result = await res.json();
      setAnalysis(result);
      
      setTimeout(() => {
        if (result.intent === 'EMERGENCY') {
          onEmergencyDetected();
        } else {
          setTimeout(() => {
            if (result.intent === 'ESCORT') onNavigate(AppView.SAFE_ROUTES);
            else if (result.intent === 'VAULT') onNavigate(AppView.EVIDENCE_LOCKER);
            else if (result.intent === 'NETWORK') onNavigate(AppView.SAFE_ZONES);
            else if (result.intent === 'CIRCLE') onNavigate(AppView.TRUST_CIRCLE);
            
            setIsListening(false);
            setIsAnalyzing(false);
          }, 3000);
        }
      }, 1000);
    } catch (e) {
      setAnalysis({ 
        intent: 'GENERAL', 
        voiceResponse: "Signal degradation. Re-verify vocal command at the nexus.", 
        isCritical: false 
      });
      setIsAnalyzing(false);
      setIsListening(false);
    }
  };

  // Toggle active microphone speech recognition
  const toggleListen = async () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopMicrophoneNodes();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setAudioPermission(true);
      startAudioAnalyzer(stream);

      setIsListening(true);
      setTranscription("Awaiting vocal signature...");
      setAnalysis(null);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        // Speech Recognition fallback
        setTimeout(async () => {
          const samples = [
            "I'm feeling unsafe, please track my location",
            "Broadcast SOS to my trust circle immediately",
            "Find the nearest safe-haven",
            "Access my evidence locker audio logs",
            `Atmospheric status reading: trigger ${safeWord}`
          ];
          const mockInput = samples[Math.floor(Math.random() * samples.length)];
          handleCommandInput(mockInput);
        }, 3000);
      }
    } catch (err) {
      console.error("Microphone access declined or unavailable", err);
      setAudioPermission(false);
      // Mock flow triggers if permission unavailable
      setIsListening(true);
      setTranscription("Listening (Virtual Sandbox Simulation)...");
      setTimeout(() => {
        const samples = [
          "I'm feeling unsafe, please track my location",
          "Broadcast SOS to my trust circle immediately",
          `Deploy safe-haven beacons: ${safeWord}`
        ];
        const mockInput = samples[Math.floor(Math.random() * samples.length)];
        handleCommandInput(mockInput);
      }, 3000);
    }
  };

  // Background listening toggler
  const toggleBgListening = async () => {
    if (bgListeningActive) {
      setBgListeningActive(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopMicrophoneNodes();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        startAudioAnalyzer(stream);
        setBgListeningActive(true);
        setAudioPermission(true);
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error("Background mic capture failed", err);
        setAudioPermission(false);
        // Sandbox Simulation Mode
        setBgListeningActive(true);
      }
    }
  };

  const getIntentMeta = (intent: string) => {
    switch (intent) {
      case 'EMERGENCY': return { icon: AlertTriangle, label: 'SAFE WORD MATCHED', color: 'bg-red-600', textColor: 'text-red-100' };
      case 'ESCORT': return { icon: Map, label: 'TACTICAL ESCORT', color: 'bg-indigo-600', textColor: 'text-indigo-100' };
      case 'VAULT': return { icon: Lock, label: 'VAULT ACCESS', color: 'bg-zinc-800', textColor: 'text-zinc-400' };
      case 'NETWORK': return { icon: Shield, label: 'GRID SECURITY', color: 'bg-blue-600', textColor: 'text-blue-100' };
      case 'CIRCLE': return { icon: Users, label: 'TRUST SYNC', color: 'bg-emerald-600', textColor: 'text-emerald-100' };
      default: return { icon: Terminal, label: 'GENERAL QUERY', color: 'bg-slate-900', textColor: 'text-slate-400' };
    }
  };

  return (
    <div className={`space-y-10 animate-in fade-in duration-500 pb-40 max-w-6xl mx-auto text-left`} id="safeword-detection-container">
      
      {/* TRIGGER VISUAL FLASH OVERLAY */}
      {triggerFlasher && (
        <div className="fixed inset-0 bg-red-600/30 border-[16px] border-red-500 animate-ping z-50 pointer-events-none" />
      )}

      {/* SYSTEM STATE ALERT BANNER */}
      {audioPermission === false && (
        <div className="bg-amber-500/10 border-2 border-amber-500/20 p-6 rounded-3xl flex items-start gap-4 text-amber-400">
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black uppercase text-xs tracking-wider">Microphone Permission Blocked</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browser hardware blocks microphone access in secure sandboxed previews. We have activated our <strong className="text-amber-400">Tactical Virtual Sandbox Emulator</strong>. Use the simulation overrides panel to type and mock safe-words flawlessly.
            </p>
          </div>
        </div>
      )}

      {/* CORE HUD SPLIT */}
      <div className="grid lg:grid-cols-5 gap-10">
        
        {/* LEFT COLUMN: ACTIVE SCANNING RADAR & OVERRIDES */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* RADAR HUB CONTAINER */}
          <div className={`relative p-12 rounded-[56px] border-[6px] transition-all duration-700 overflow-hidden flex flex-col items-center min-h-[560px] ${
            analysis?.intent === 'EMERGENCY' ? 'bg-red-950/40 border-red-500/40' : 
            bgListeningActive ? 'bg-slate-950/60 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 
            isListening ? 'bg-slate-950/60 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)]' : 'bg-slate-950/60 border-white/5'
          }`}>
            
            {/* Ambient Decorative Blurs */}
            <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-20 transition-all duration-1000 ${
              isListening ? 'bg-indigo-500' : bgListeningActive ? 'bg-cyan-500' : 'bg-indigo-600'
            }`} />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-zinc-900/40 rounded-full blur-[120px] pointer-events-none" />

            {/* HEADER METADATA */}
            <header className="text-center mb-10 w-full flex justify-between items-center z-10">
              <div className="text-left">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mono">Vanguard Vocal Radar</span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase mt-1">SAFE WORD SENTINEL</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${isListening || bgListeningActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">
                  {bgListeningActive ? 'BACKGROUND ACTIVE' : isListening ? 'SCANNING MIC' : 'STANDBY'}
                </span>
              </div>
            </header>

            {/* GIANT RADAR TRIGGER BULB */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              <button 
                onClick={toggleListen}
                style={{ transform: `scale(${1 + micVolume * 0.15})` }}
                className={`w-48 h-48 rounded-[56px] flex flex-col items-center justify-center transition-all duration-300 shadow-3xl border-4 ${
                  isListening ? 'bg-white border-indigo-500 text-indigo-600 shadow-[0_0_80px_rgba(255,255,255,0.25)]' : 
                  bgListeningActive ? 'bg-cyan-500/20 border-cyan-500 hover:bg-cyan-500/30 text-cyan-400' : 
                  analysis?.intent === 'EMERGENCY' ? 'bg-red-600 border-red-500 text-white animate-pulse' : 
                  'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30'
                }`}
              >
                {isListening ? (
                  <div className="flex gap-2.5 items-center justify-center h-16">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className="w-2 bg-indigo-600 rounded-full animate-[voice_0.8s_infinite] shadow" 
                        style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 120}ms` }} 
                      />
                    ))}
                  </div>
                ) : bgListeningActive ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Activity className="w-12 h-12 text-cyan-400 animate-[pulse_1.5s_infinite]" />
                    <p className="text-[8px] font-black tracking-widest uppercase text-cyan-400/80 font-mono">Continuous Scan</p>
                  </div>
                ) : (
                  <>
                    <Mic size={52} className="group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] font-mono mt-3 opacity-65">Tap to Scan</p>
                  </>
                )}
              </button>

              {/* PULSING BACKGROUND RINGS */}
              {(isListening || bgListeningActive) && (
                <div className="absolute inset-0 -m-10 border border-indigo-500/10 rounded-[80px] animate-[ping_3s_infinite] pointer-events-none" />
              )}
            </div>

            {/* REAL-TIME DECODED STREAMING TRANSCRIPT */}
            <div className="w-full mt-8 z-10 space-y-4">
              {transcription && (
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl animate-in slide-in-from-bottom-6 text-center">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono mb-2">Decoded Signal Waveform</p>
                  <p className="text-xl font-black text-white italic">"{transcription}"</p>
                </div>
              )}

              {/* STATUS INDICATOR CARD */}
              {analysis && (
                <div className={`p-6 rounded-3xl animate-in zoom-in duration-300 border ${getIntentMeta(analysis.intent).color} border-white/10 flex items-center gap-4`}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    {React.createElement(getIntentMeta(analysis.intent).icon, { size: 24, className: "text-white" })}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{getIntentMeta(analysis.intent).label}</h4>
                    <p className="text-sm font-bold text-white mt-1">{analysis.voiceResponse}</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* SIMULATION DICTATOR BRIDGE */}
          <div className="glass-card p-8 rounded-[40px] border-white/5 space-y-5">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mono">Vocal Emulator overrides</h4>
              <p className="text-xs text-slate-500 mt-1">If the sandbox environment blocks browser microphones, input standard verbal commands or simulate safe-words to review safety triggers instantly.</p>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type command override (e.g. 'red balloon' or 'help me now')"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommandInput(customCommand);
                    setCustomCommand('');
                  }
                }}
                className="flex-grow bg-slate-950 border border-white/10 px-5 py-4 rounded-2xl text-xs text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600 font-mono"
              />
              <button 
                onClick={() => {
                  handleCommandInput(customCommand);
                  setCustomCommand('');
                }}
                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <span>Mock Input</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* PRE-DETERMINED KEYWORDS BADGES */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: 'Overt Distress SOS', text: 'Broadcast SOS to my trust circle immediately' },
                { label: 'Coordinated Safe-Path', text: 'Find the nearest safe-haven' },
                { label: 'Access Vault Files', text: 'Access my evidence locker audio logs' },
                { label: 'Trigger Custom Safe-Word', text: `Trigger safe code: ${safeWord}` }
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleCommandInput(pill.text)}
                  className="px-3.5 py-2 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-mono text-slate-400 hover:text-white hover:border-indigo-500/40 transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CONTROL DASHBOARD & CAPTURE LOCKER */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* CONTROL SWITCHBOARD PANEL */}
          <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <Settings size={20} />
              </div>
              <div>
                <h4 className="font-black text-white text-lg uppercase tracking-tight">Active Safe Word Configuration</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol switchboard</p>
              </div>
            </div>

            {/* CUSTOM KEYWORD FIELD */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono block">Configured Secret Safe-Word</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={safeWord}
                  onChange={(e) => {
                    setSafeWord(e.target.value);
                    localStorage.setItem('vs_safe_word', e.target.value);
                  }}
                  placeholder="e.g. red balloon, guardian, mayday"
                  className="flex-grow bg-slate-950 border border-white/10 px-4 py-3 rounded-xl text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none"
                />
              </div>
              <p className="text-[9px] text-slate-500 leading-snug">Type any phrase. If background or live scan registers this exact keyword in speech, Vanguard's distress response activates silently.</p>
            </div>

            {/* COVERT VS OVERT SELECTOR */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono block">Protocol Stealth</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSafeWordType('COVERT')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    safeWordType === 'COVERT' 
                      ? 'bg-indigo-600/20 text-white border-indigo-500/50 shadow-md' 
                      : 'bg-slate-950/40 text-slate-500 border-white/5 hover:border-white/10'
                  }`}
                >
                  Covert (Silent SOS)
                </button>
                <button
                  type="button"
                  onClick={() => setSafeWordType('OVERT')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    safeWordType === 'OVERT' 
                      ? 'bg-red-600/20 text-white border-red-500/50 shadow-md' 
                      : 'bg-slate-950/40 text-slate-500 border-white/5 hover:border-white/10'
                  }`}
                >
                  Overt (Active Alarm)
                </button>
              </div>
            </div>

            {/* TRIGGER OPERATIONS LOG CHECKBOXES */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono block">On Safe-Word Trigger Actions</label>
              
              {/* ACTIVATE SOS */}
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={actionSos} 
                    onChange={(e) => setActionSos(e.target.checked)}
                    className="w-4 h-4 bg-slate-950 border-white/10 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Broadcast Emergency SOS</span>
                    <span className="text-[9px] text-slate-500 block">Fires instant tactical alert payloads</span>
                  </div>
                </div>
              </label>

              {/* NOTIFY GUARDIANS */}
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={actionAlertGuardians} 
                    onChange={(e) => setActionAlertGuardians(e.target.checked)}
                    className="w-4 h-4 bg-slate-950 border-white/10 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Alert Circle Guardians</span>
                    <span className="text-[9px] text-slate-500 block">Broadcast telemetry vector to friends</span>
                  </div>
                </div>
              </label>

              {/* AUTOMATIC VOICE REC */}
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={actionRecord} 
                    onChange={(e) => setActionRecord(e.target.checked)}
                    className="w-4 h-4 bg-slate-950 border-white/10 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Capture Micro Voice clip</span>
                    <span className="text-[9px] text-slate-500 block">Saves 5s environmental clip locally</span>
                  </div>
                </div>
              </label>

              {/* AUTO BACKUP */}
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={actionUpload} 
                    onChange={(e) => setActionUpload(e.target.checked)}
                    className="w-4 h-4 bg-slate-950 border-white/10 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Auto-Sync to Secure Vault</span>
                    <span className="text-[9px] text-slate-500 block">Pushes clip directly to Evidence locker</span>
                  </div>
                </div>
              </label>
            </div>

            {/* TOGGLE CONTINUOUS BACKGROUND MIC SCANNING */}
            <div className="pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={toggleBgListening}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                  bgListeningActive 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Radio size={14} className={bgListeningActive ? "animate-pulse" : ""} />
                <span>{bgListeningActive ? "Deactivate Background Scanning" : "Enable Background Scanning"}</span>
              </button>
            </div>

          </div>

          {/* RECORDED VOICE RECORDINGS LISTING BOARD */}
          <div className="glass-card p-8 rounded-[40px] border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileAudio className="w-5 h-5 text-indigo-400" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Incident Audio Captures</h4>
              </div>
              <span className="px-2.5 py-1 bg-slate-900 border border-white/5 text-[9px] font-mono text-indigo-400 rounded-lg">
                {recordedClips.length} clips
              </span>
            </div>

            {recordedClips.length === 0 ? (
              <div className="p-8 bg-slate-950/40 rounded-3xl text-center border border-white/5 text-slate-500 space-y-3">
                <Volume2 className="mx-auto text-slate-700 w-8 h-8" />
                <p className="text-xs font-bold leading-normal">No Safe-Word clips indexed yet. When matching keywords occur, environmental recordings list here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {recordedClips.map((clip) => (
                  <div key={clip.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <Volume2 size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{clip.title}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">{clip.duration} • {new Date(clip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          const sound = new Audio(clip.blobUrl);
                          sound.play();
                        }}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Listen Clip"
                      >
                        <Play size={14} />
                      </button>
                      
                      {!clip.isUploaded && (
                        <button 
                          onClick={() => uploadClipToEvidence(clip)}
                          className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Backup to Cloud Storage Vault"
                        >
                          <UploadCloud size={14} />
                        </button>
                      )}

                      {clip.isUploaded && (
                        <span className="p-2 text-emerald-400" title="Safely Backup Synced">
                          <CheckCircle size={14} />
                        </span>
                      )}

                      <button 
                        onClick={() => deleteClip(clip.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Purge local record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @keyframes voice {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.2);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99,102,241,0.4);
        }
      `}</style>

    </div>
  );
};

export default VoiceAssistant;
