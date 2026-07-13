import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Lock, Unlock, FileText, Video, Mic, Eye, Trash2, 
  Download, CheckCircle2, MapPin, ShieldAlert, UploadCloud, 
  Search, RefreshCw, Key, Paperclip, AlertCircle, Sparkles, HelpCircle, FileCheck, CheckSquare, Layers,
  Radio, Pause, Play, Square, Camera, AlertTriangle
} from 'lucide-react';

interface EvidenceRecord {
  id: string;
  timestamp: string;
  type: 'AUDIO' | 'VIDEO' | 'IMAGE' | 'DOCUMENT';
  title: string;
  location: string;
  summary: string;
  isLocked: boolean;
  hash: string;
  ownerEmail: string;
  linkedIncident: string;
  fileUrl?: string;
  cloudinaryPublicId?: string;
  fileName: string;
  fileSize: string;
  encryptionKeyName: string;
  encryptionStatus: 'ENCRYPTED' | 'UPLOADED' | 'LOCAL';
}

interface EvidenceLockerProps {
  profile: any;
  isEmergencyMode?: boolean;
}

const EvidenceLocker: React.FC<EvidenceLockerProps> = ({ profile, isEmergencyMode = false }) => {
  // Portal navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'EXPLORE' | 'SECURE_UPLOAD' | 'LIVE_RECORDER'>('EXPLORE');

  // Emergency Live Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingType, setRecordingType] = useState<'AUDIO' | 'VIDEO' | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [taggedSosIncidentId, setTaggedSosIncidentId] = useState<string>('General Security Space');
  const [autoUploadOnStop, setAutoUploadOnStop] = useState<boolean>(true);
  const [recordingStatusText, setRecordingStatusText] = useState<string>('System Idle (Ready)');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [sosIncidents, setSosIncidents] = useState<any[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<any[]>([]);

  // Emergency Live Recording Refs
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<any>(null);

  // Core records lists loaded dynamically from simulated MongoDB via JWT
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Search & Filters controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Currently inspected file credentials
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);

  // Secure evidence creation variables
  const [formType, setFormType] = useState<'AUDIO' | 'VIDEO' | 'IMAGE' | 'DOCUMENT'>('IMAGE');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formIncidentLink, setFormIncidentLink] = useState('General Security Space');
  const [customIncident, setCustomIncident] = useState('');
  const [formKeyLabel, setFormKeyLabel] = useState('VANGUARD_AES_NODE_0A');
  
  // File upload state controls
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [submittingUpload, setSubmittingUpload] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play strategic feedback beep codes
  const playSystemSound = (freq = 880, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Browser suppressed
    }
  };

  // Secure fetching directly mapping authenticated user's JWT partition
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) {
        setErrorText("Unauthenticated session. Please sign in to establish a secure link to the vault.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/evidence/records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Secure login credentials have changed or expired.");
        }
        throw new Error("Witness node unavailable or returned database pipeline error.");
      }

      const data = await res.json();
      if (data.success && data.records) {
        setRecords(data.records);
        // Sync selected record if open
        if (selectedRecord) {
          const fresh = data.records.find((r: EvidenceRecord) => r.id === selectedRecord.id);
          if (fresh) setSelectedRecord(fresh);
        }
      } else {
        throw new Error(data.error || "Failed to properly communicate with the cluster ledger.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Failed to retrive forensic cases under custody.");
    } finally {
      setLoading(false);
    }
  };

  // Convert recorded Blob to base64 and upload immediately (Auto Upload)
  const uploadRecordedMedia = async (blob: Blob, type: 'AUDIO' | 'VIDEO', finalDuration: number) => {
    try {
      setRecordingStatusText("Converting payload to cryptographically sealed base64...");
      playSystemSound(800, 0.08);

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        setRecordingStatusText("Uploading and sealing in Vanguard Cloud CDN...");
        const token = localStorage.getItem('vs_jwt_token');
        if (!token) {
          alert("Session expired. Auto-upload failed.");
          return;
        }

        // Generate precise descriptive metadata parameters
        const durationMin = Math.floor(finalDuration / 60);
        const durationSec = finalDuration % 60;
        const durationStr = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;
        
        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        const timestampStr = new Date().toISOString();
        const gpsStr = gpsCoordinates 
          ? `GPS Coordinates: Lat ${gpsCoordinates.lat.toFixed(5)}°, Lng ${gpsCoordinates.lng.toFixed(5)}°`
          : "GPS Coordinates: Locked Out / Signal Impeded";

        const metadataSummary = `Emergency Sentry Recording (${type}). Duration: ${durationStr}. ${gpsStr}. Sealed: ${timestampStr}. Protocol Status: Automated auto-upload. Browser device: ${navigator.userAgent.slice(0, 80)}.`;

        const payload = {
          type: type,
          title: `SENTRY EMERGENCY ${type} RECORDING [${durationStr}]`,
          location: gpsCoordinates ? `LAT: ${gpsCoordinates.lat.toFixed(5)}, LNG: ${gpsCoordinates.lng.toFixed(5)}` : "Emergency Dispatch Beacon",
          summary: metadataSummary,
          linkedIncident: taggedSosIncidentId || "General Security Space",
          fileName: `emergency_${type.toLowerCase()}_${Date.now()}.webm`,
          fileSize: `${sizeInMB} MB`,
          fileBase64: base64data,
          encryptionKeyName: "SOVEREIGN_WITNESS_SEAL"
        };

        const response = await fetch('/api/evidence/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resData = await response.json();
          setRecordingStatusText(`Cryptographic ledger seal complete! Verified: ${resData.record.id}`);
          playSystemSound(1200, 0.25);
          // Refresh records list
          fetchRecords();
        } else {
          const errData = await response.json();
          setRecordingStatusText(`Upload failed: ${errData.error || "Server storage error"}`);
          alert(`Auto-upload error: ${errData.error || "Failed to commit record to server ledger."}`);
        }
      };
    } catch (e: any) {
      console.error(e);
      setRecordingStatusText(`Processing error: ${e.message || "Failed to finalize asset upload."}`);
    }
  };

  // Start live hardware streams
  const startLiveRecording = async (type: 'AUDIO' | 'VIDEO') => {
    try {
      playSystemSound(1000, 0.15);
      setRecordingStatusText("Requesting hardware sensor permissions...");
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'VIDEO' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setMediaStream(stream);

      // Setup video preview element
      if (type === 'VIDEO' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(e => console.warn("Video play stream suppress", e));
      }

      // Detect support MIME types
      let mimeType = '';
      if (type === 'VIDEO') {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : MediaRecorder.isTypeSupported('video/webm') 
            ? 'video/webm' 
            : '';
      } else {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : '';
      }

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setRecordingStatusText("Recording stopped. Compiling feed segments...");
        const finalBlob = new Blob(chunks, { type: type === 'VIDEO' ? 'video/webm' : 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        if (autoUploadOnStop) {
          // capture final duration safely
          const currentDuration = (window as any)._sentryActiveRecorder 
            ? ((window as any)._sentryActiveRecorder.duration || 0)
            : 0;
          await uploadRecordedMedia(finalBlob, type, currentDuration || 1);
        } else {
          setRecordingStatusText("Ready. Recording stored locally.");
        }
      };

      setRecordedChunks([]);
      setIsRecording(true);
      setRecordingType(type);
      setRecordingDuration(0);
      setRecordingStatusText("Secure Recording Session Active");

      // Pull current coordinates for timestamp tagging metadata
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            // fallback coords
            setGpsCoordinates({ lat: 41.8781, lng: -87.6298 });
          }
        );
      } else {
        setGpsCoordinates({ lat: 41.8781, lng: -87.6298 });
      }

      // Tick recording duration
      let seconds = 0;
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      durationIntervalRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
        if (seconds % 3 === 0) {
          playSystemSound(440, 0.04);
        }
        // Sync duration to background window state
        if ((window as any)._sentryActiveRecorder) {
          (window as any)._sentryActiveRecorder.duration = seconds;
        }
      }, 1000);

      recorder.start();

      // Store in window for background execution survival
      (window as any)._sentryActiveRecorder = {
        recorder,
        stream,
        type,
        startTime: Date.now(),
        taggedSosIncidentId,
        intervalId: durationIntervalRef.current,
        chunks,
        duration: 0
      };

    } catch (err: any) {
      console.error("Hardware Stream Initialization Error", err);
      setRecordingStatusText(`Hardware Stream error: ${err.message || "Failed to initialize mic/camera feed"}`);
      alert(`Vanguard Recording Hardware Blocked: Please ensure you grant Microphone and Camera permissions to utilize real-time distress recordings.`);
    }
  };

  // Stop current live hardware streams
  const stopLiveRecording = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    const bg = (window as any)._sentryActiveRecorder;
    const finalDuration = bg ? (bg.duration || recordingDuration) : recordingDuration;
    
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    } else if (bg && bg.recorder && bg.recorder.state === 'recording') {
      bg.recorder.stop();
    }

    setIsRecording(false);
    setRecordingType(null);
    setMediaStream(null);
    
    // Clear global background state reference
    (window as any)._sentryActiveRecorder = null;
    playSystemSound(600, 0.15);
  };

  // Fetch user active SOS incident logs
  const fetchSOSIncidents = async () => {
    try {
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) return;
      const res = await fetch('/api/sos/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incidents) {
          setSosIncidents(data.incidents);
        }
      }
    } catch (err) {
      console.error("Failed to load SOS incidents", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchSOSIncidents();
    
    // Poll evidence & SOS state regularly to capture background SOS triggers or incident log transfers
    const tInterval = setInterval(() => {
      fetchRecords();
      fetchSOSIncidents();
    }, 10000);

    // Recover Background Recorder if active in window
    const activeBackground = (window as any)._sentryActiveRecorder;
    if (activeBackground) {
      const { recorder, stream, type, startTime, taggedSosIncidentId: savedTag, chunks, intervalId } = activeBackground;
      
      if (recorder && recorder.state === 'recording') {
        recorderRef.current = recorder;
        streamRef.current = stream;
        setMediaStream(stream);
        setIsRecording(true);
        setRecordingType(type);
        setTaggedSosIncidentId(savedTag || 'General Security Space');
        
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setRecordingDuration(elapsed);
        setRecordingStatusText("Background recording recovered. Continuous capture active.");

        // Clear the old background timer interval and spin up the local one
        if (intervalId) {
          clearInterval(intervalId);
        }

        let count = elapsed;
        durationIntervalRef.current = setInterval(() => {
          count++;
          setRecordingDuration(count);
          if (count % 3 === 0) {
            playSystemSound(440, 0.04);
          }
          if ((window as any)._sentryActiveRecorder) {
            (window as any)._sentryActiveRecorder.duration = count;
          }
        }, 1000);

        // Reconnect data gathering events
        recorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        // If Video preview element should show
        if (type === 'VIDEO') {
          setTimeout(() => {
            if (videoPreviewRef.current) {
              videoPreviewRef.current.srcObject = stream;
              videoPreviewRef.current.play().catch((e: any) => console.warn(e));
            }
          }, 300);
        }

        recorder.onstop = async () => {
          setRecordingStatusText("Recording stopped. Compiling feed segments...");
          const finalBlob = new Blob(chunks, { type: type === 'VIDEO' ? 'video/webm' : 'audio/webm' });
          stream.getTracks().forEach((track: any) => track.stop());
          await uploadRecordedMedia(finalBlob, type, count);
        };
      }
    }

    return () => {
      clearInterval(tInterval);
      // NOTE: We DO NOT stop recording here. This is exactly what enables "Background recording"!
      // If the component unmounts but isRecording is true, we update the background object
      // so it keeps ticking and can be recovered if they come back!
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        // Update intervalId references to keep ticking background-safe
        if ((window as any)._sentryActiveRecorder) {
          const bg = (window as any)._sentryActiveRecorder;
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
          // Set a silent interval in background window so it keeps adding duration if they browse other views
          let count = bg.duration || Math.floor((Date.now() - bg.startTime) / 1000);
          bg.intervalId = setInterval(() => {
            count++;
            bg.duration = count;
          }, 1000);
        }
      }
    };
  }, []);

  // Base64 file loaders
  const loadFileStream = (file: File) => {
    if (!file) return;

    // Read size neatly
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${sizeInMB} MB`);

    // Match appropriate category type dynamically from file type
    if (file.type.startsWith('audio/')) {
      setFormType('AUDIO');
    } else if (file.type.startsWith('video/')) {
      setFormType('VIDEO');
    } else if (file.type.startsWith('image/')) {
      setFormType('IMAGE');
    } else {
      setFormType('DOCUMENT');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
      playSystemSound(640, 0.12);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      loadFileStream(files[0]);
    }
  };

  const handleFileSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadFileStream(files[0]);
    }
  };

  // Upload evidentiary card log directly to MongoDB + Cloudinary simulated cache
  const handleEvidenceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Evidentiary incident node requires a clear descriptive title.");
      return;
    }

    const token = localStorage.getItem('vs_jwt_token');
    if (!token) {
      alert("Sign-in credential corrupted. Secure upload blocked.");
      return;
    }

    setSubmittingUpload(true);
    playSystemSound(1020, 0.05);

    try {
      const payload = {
        type: formType,
        title: formTitle,
        location: formLocation || "Direct Telemetry Stream",
        summary: formSummary || "Automated stress upload. No custom forensic notes filed.",
        linkedIncident: formIncidentLink === 'custom' ? customIncident : formIncidentLink,
        fileName: uploadedFileName || `forensic_${formType[0]}${formType.toLowerCase().slice(1)}_seal`,
        fileSize: uploadedFileSize || "0.8 MB",
        fileBase64: fileBase64 || "", // passed securely to the backend for Cloudinary CDN conversion
        encryptionKeyName: formKeyLabel
      };

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (response.ok) {
        playSystemSound(1320, 0.2); // high treble beep for tactical verification success
        alert(`Secured & Sealed! Evidence Hashed [${resData.record.id}] and backed up to Cloudinary Secure CDN Cloud.`);
        
        // Reset inputs
        setFormTitle('');
        setFormLocation('');
        setFormSummary('');
        setFormIncidentLink('General Security Space');
        setCustomIncident('');
        setFileBase64(null);
        setUploadedFileName(null);
        setUploadedFileSize(null);

        // Fetch & open list
        setActiveSubTab('EXPLORE');
        fetchRecords();
      } else {
        alert(`Registry lock error: ${resData.error || "Authentication/Storage pipeline fault."}`);
      }
    } catch (err) {
      alert("Network transmission failure. Simulated MongoDB pipeline requires online host state.");
    } finally {
      setSubmittingUpload(false);
    }
  };

  // Toggle record locker decrypt/encrypt secure status state
  const handleToggleLock = async (recordId: string) => {
    const token = localStorage.getItem('vs_jwt_token');
    if (!token) return;

    playSystemSound(820, 0.08);
    try {
      const res = await fetch(`/api/evidence/record/${recordId}/toggle-lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchRecords();
      } else {
        const d = await res.json();
        alert(`Unable to alter custody locks: ${d.error || "Permissions violation"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Purge evidence file node securely
  const handlePurgeRecord = async (recordId: string) => {
    const confirmationMsg = `CRITICAL DELETION REQUEST!\n\nAre you sure you want to permanently scrub Case Entry [${recordId}]?\nThis will completely purge the associated file from localized databases & the Cloudinary CDN grid. This action is irreversible.`;
    if (!confirm(confirmationMsg)) return;

    const token = localStorage.getItem('vs_jwt_token');
    if (!token) return;

    playSystemSound(400, 0.3); // warning low buzz audio cue
    try {
      const res = await fetch(`/api/evidence/record/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSelectedRecord(null);
        fetchRecords();
      } else {
        const d = await res.json();
        alert(`Purge command failed: ${d.error || "Unauthorized"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter records matching active controls
  const runFilterMatch = (r: EvidenceRecord) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery ? true : (
      r.title.toLowerCase().includes(query) ||
      r.location.toLowerCase().includes(query) ||
      r.summary.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.hash.toLowerCase().includes(query) ||
      r.fileName.toLowerCase().includes(query) ||
      r.linkedIncident.toLowerCase().includes(query)
    );

    const matchesType = filterType === 'ALL' ? true : r.type === filterType;
    return matchesQuery && matchesType;
  };

  const filteredRecords = records.filter(runFilterMatch);

  // Return specific visual icon per media type
  const getIndicatorIcon = (type: EvidenceRecord['type']) => {
    switch (type) {
      case 'AUDIO': return <Mic className="w-5 h-5 text-blue-400" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-red-400" />;
      case 'IMAGE': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'DOCUMENT': return <Paperclip className="w-5 h-5 text-emerald-400" />;
    }
  };

  // If the user isn't logged in, show defensive blocking screen
  if (!localStorage.getItem('vs_jwt_token')) {
    return (
      <div className="max-w-xl mx-auto my-12 p-10 bg-zinc-950 border-4 border-red-500/10 rounded-[44px] text-center space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Security Protocol Locked</h3>
        <p className="text-slate-400 text-xs uppercase font-mono tracking-widest leading-loose">
          Evidence Vault services are heavily isolated and partition-restricted. Authenticated user credential validation is required prior to ledger access.
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          Please log into your Vanguard Tactical Safety profile on the primary portal to establish server handshake.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-44">
      
      {/* SECTION TITLE HERO CONTROL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 p-10 rounded-[44px] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/35 rounded-2xl flex items-center justify-center text-indigo-400">
                <Lock className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Evidence Locker & Vault</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                      Secure Node: {profile?.email || 'Authenticated Segment ID'}
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* ACCESS TOGGLES */}
        <div className="flex gap-2 relative z-10 bg-slate-900/40 p-1 rounded-2xl border border-white/5 flex-wrap">
           <button
             onClick={() => { playSystemSound(); setActiveSubTab('EXPLORE'); }}
             className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
               activeSubTab === 'EXPLORE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
             }`}
           >
              Review Vault ({records.length})
           </button>
           <button
             onClick={() => { playSystemSound(); setActiveSubTab('SECURE_UPLOAD'); }}
             className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
               activeSubTab === 'SECURE_UPLOAD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
             }`}
           >
              <Paperclip size={11} /> File New Evidence
           </button>
           <button
             onClick={() => { playSystemSound(); setActiveSubTab('LIVE_RECORDER'); }}
             className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
               activeSubTab === 'LIVE_RECORDER' 
                 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                 : 'text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5'
             }`}
           >
              <Radio size={11} className={isRecording ? 'animate-spin text-white' : 'animate-pulse'} /> 
              {isRecording ? 'Sentry Active...' : 'Live Emergency Recorder'}
           </button>
        </div>
      </div>

      {activeSubTab === 'EXPLORE' && (
        <div className="space-y-8">
           
           {/* SEARCH FILTERS SECTION */}
           <div className="bg-zinc-950 p-6 rounded-[32px] border border-white/5 grid md:grid-cols-3 gap-4 items-center">
              <div className="relative">
                 <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search files by Title, Case ID, Hash, Incident..."
                   className="w-full bg-slate-900 border border-white/5 pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
                 />
              </div>

              <div>
                 <select
                   value={filterType}
                   onChange={(e) => { playSystemSound(); setFilterType(e.target.value); }}
                   className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white font-bold uppercase tracking-wider outline-none"
                 >
                    <option value="ALL">Show All Media Formats</option>
                    <option value="AUDIO">Audio Streams</option>
                    <option value="VIDEO">Video Elements</option>
                    <option value="IMAGE">Visual Images</option>
                    <option value="DOCUMENT">Documents / Logs</option>
                 </select>
              </div>

              <div className="flex md:justify-end gap-3 items-center">
                 <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">
                    User Locked: {filteredRecords.length} Files
                 </span>
                 <button
                   onClick={() => { playSystemSound(); fetchRecords(); }}
                   className="p-3 bg-slate-900 border border-white/5 hover:border-indigo-500/20 rounded-xl text-slate-300 hover:text-white transition-all"
                   title="Sync Evidentiary Ledger"
                 >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                 </button>
              </div>
           </div>

           {/* TOTAL OVERVIEW HUD */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/40 p-4 rounded-[32px] border border-white/5">
              {[
                { title: 'Custody Status', value: 'ONLINE-SECURE', color: 'text-emerald-400' },
                { title: 'Authorized Partition', value: profile?.role || 'USER', color: 'text-indigo-400' },
                { title: 'Verifiable Integrity', value: 'SHA-256 SEALED', color: 'text-cyan-400' },
                { title: 'CDN Cloud Storage', value: 'CLOUDINARY ACTIVE', color: 'text-pink-400' }
              ].map((hud, hIdx) => (
                <div key={hIdx} className="p-4 bg-zinc-950 rounded-2xl border border-white/5 text-center space-y-1">
                   <p className="text-[8px] text-slate-500 font-black uppercase font-mono tracking-widest">{hud.title}</p>
                   <p className={`text-xs font-black uppercase ${hud.color}`}>{hud.value}</p>
                </div>
              ))}
           </div>

           {/* MAIN LAYOUT SPLIT: RECORDS FEED & PREVIEW VIEW */}
           <div className="grid lg:grid-cols-3 gap-8">
              
              {/* LEFT TIMELINE FEED */}
              <div className="lg:col-span-2 space-y-4">
                 
                 {loading ? (
                   <div className="text-center p-20 bg-zinc-950 rounded-[44px] border border-white/5 space-y-4">
                      <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Decrypting user vault segments...</p>
                   </div>
                 ) : errorText ? (
                   <div className="text-center p-12 bg-zinc-950 rounded-[44px] border border-red-500/10 space-y-4">
                      <AlertCircle className="mx-auto w-10 h-10 text-red-500" />
                      <p className="text-xs uppercase font-bold text-red-400">{errorText}</p>
                      <button
                        onClick={fetchRecords}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs uppercase font-bold"
                      >
                         Reconnect Server
                      </button>
                   </div>
                 ) : filteredRecords.length === 0 ? (
                   <div className="text-center p-20 bg-zinc-950 rounded-[44px] border border-white/5 space-y-4">
                      <HelpCircle className="mx-auto w-10 h-10 text-slate-600" />
                      <p className="text-xs font-black text-slate-400 uppercase">Vault Partition contains no verified records</p>
                      <button
                        onClick={() => setActiveSubTab('SECURE_UPLOAD')}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider"
                      >
                         Seal First Evidence Element
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      {filteredRecords.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => { playSystemSound(770); setSelectedRecord(item); }}
                          className={`p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group/card flex flex-col justify-between ${
                            selectedRecord?.id === item.id 
                              ? 'bg-indigo-600/10 border-indigo-500/40 shadow-xl' 
                              : 'bg-zinc-950 border-white/5 hover:border-indigo-500/20'
                          }`}
                        >
                           {/* Highlight line for type */}
                           <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                             item.isLocked ? 'bg-indigo-600' : 'bg-slate-700'
                           }`} />

                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center">
                                    {getIndicatorIcon(item.type)}
                                 </div>

                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-widest">
                                          {item.id}
                                       </span>
                                       <span className="text-[9px] text-slate-500 font-mono">
                                          {new Date(item.timestamp).toLocaleString()}
                                       </span>
                                    </div>
                                    <h4 className="text-lg font-black text-white hover:text-indigo-400 transition-colors uppercase leading-none tracking-tight">
                                       {item.title}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 font-bold tracking-widest font-mono uppercase">
                                       🔗 Linked Incident: <span className="text-indigo-400">{item.linkedIncident}</span>
                                    </p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-3">
                                 <div className="text-right hidden md:block">
                                    <p className="text-[9px] font-mono text-slate-500">{item.fileName}</p>
                                    <p className="text-[8px] font-mono text-indigo-400 uppercase font-black tracking-widest">({item.fileSize})</p>
                                 </div>
                                 <button
                                   onClick={(e) => { e.stopPropagation(); handleToggleLock(item.id); }}
                                   className={`p-2.5 rounded-xl border transition-all ${
                                     item.isLocked 
                                       ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                                       : 'bg-zinc-900 text-slate-500 border-white/5'
                                   }`}
                                   title={item.isLocked ? "Secure Locked" : "Decrypted"}
                                 >
                                    {item.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}

              </div>

              {/* RIGHT EVIDENCE DETAIL INSPECTOR */}
              <div>
                 {selectedRecord ? (
                   <div className="bg-zinc-950 rounded-[40px] border-2 border-white/5 p-8 space-y-6 sticky top-24 shadow-2xl animate-in slide-in-from-right-4">
                      
                      {/* Custody Verification seal header */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1">
                               <FileCheck size={10} /> Forensic Custody Ledger
                            </span>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">
                               {selectedRecord.id} Details
                            </h3>
                         </div>
                         <button 
                           onClick={() => setSelectedRecord(null)}
                           className="text-slate-500 hover:text-white transition-colors"
                         >
                            ✕
                         </button>
                      </div>

                      {/* Display thumbnail visual if backed up */}
                      <div className="relative rounded-2xl overflow-hidden h-40 bg-zinc-900 border border-white/10 group">
                         <img 
                           src={selectedRecord.fileUrl} 
                           alt={selectedRecord.title}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                           referrerPolicy="no-referrer"
                         />
                         
                         {/* Secure overlay shield */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                            <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-widest">
                               <span className="text-indigo-400">AES-256 SEAL ENCRYPTED</span>
                               <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                  {selectedRecord.encryptionKeyName}
                               </span>
                            </div>
                         </div>
                      </div>

                      {/* Integrity Checklist information parameters */}
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3 leading-relaxed">
                         <div>
                            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">Description Metadata</span>
                            <p className="text-xs text-slate-300 italic">"{selectedRecord.summary}"</p>
                         </div>

                         <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div>
                               <span className="block text-[8px] text-zinc-500 uppercase tracking-widest">File Name</span>
                               <span className="text-slate-300 font-semibold">{selectedRecord.fileName}</span>
                            </div>
                            <div>
                               <span className="block text-[8px] text-zinc-500 uppercase tracking-widest">Cloud backup</span>
                               <span className="text-indigo-400 font-black">CLOUDINARY</span>
                            </div>
                         </div>
                      </div>

                      {/* Cryptographic Ledger parameters */}
                      <div className="space-y-2">
                         <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest font-mono">Verifiable Chain validation Hash</span>
                         <div className="p-3 bg-black rounded-lg border border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span className="truncate pr-4 text-[9px]">{selectedRecord.hash}</span>
                            <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                         </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest pt-2">
                         <a
                           href={selectedRecord.fileUrl}
                           download={selectedRecord.fileName}
                           target="_blank"
                           rel="noreferrer"
                           onClick={() => playSystemSound(920)}
                           className="py-3.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-center shrink-0 cursor-pointer"
                         >
                            <Download size={13} /> Download File
                         </a>
                         <button
                           onClick={() => handlePurgeRecord(selectedRecord.id)}
                           className="py-3.5 bg-red-950/20 hover:bg-red-650 border border-red-500/15 text-red-400 hover:text-white rounded-xl flex items-center justify-center gap-2 transition-all text-center shrink-0"
                         >
                            <Trash2 size={13} /> Purge Vault
                         </button>
                      </div>

                   </div>
                 ) : (
                   <div className="bg-dashed border-2 border-white/5 rounded-[40px] p-10 text-center space-y-4 opacity-55 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                         <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Integrity Reader</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono uppercase">
                         Select any evidentiary file node to verify server hashes, check Cloudinary secure storage credentials, or initiate purging protocols.
                      </p>
                   </div>
                 )}
              </div>

           </div>

        </div>
      )}

      {/* NEW SECURE EVIDENCE CREATION TAB */}
      {activeSubTab === 'SECURE_UPLOAD' && (
        <form onSubmit={handleEvidenceUpload} className="bg-zinc-950 p-10 rounded-[44px] border border-white/5 space-y-6 max-w-4xl mx-auto relative overflow-hidden animate-in zoom-in-95 leading-normal">
           <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-600/5 rounded-full blur-[45px] pointer-events-none" />
           
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-indigo-400">Vanguard Witness Seal Entry</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Index New Evidentiary Records</h3>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Stores images, audio streams, videos, or legal document elements on Cloudinary + MongoDB ledger.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
              
              {/* Left Side Details */}
              <div className="space-y-4">
                 
                 <div>
                    <label className="text-[8.5px] text-slate-500 font-extrabold uppercase mb-1.5 block tracking-wider">File Title *</label>
                    <input 
                      type="text" 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Unmarked Patrol intake sector 5 corridor"
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
                      required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[8.5px] text-slate-500 font-extrabold uppercase mb-1.5 block tracking-wider">Media Category</label>
                       <select
                         value={formType}
                         onChange={(e) => { playSystemSound(); setFormType(e.target.value as any); }}
                         className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-black uppercase"
                       >
                          <option value="IMAGE">Image File</option>
                          <option value="AUDIO">Audio Stream</option>
                          <option value="VIDEO">Video Element</option>
                          <option value="DOCUMENT">Document PDF/Text</option>
                       </select>
                    </div>

                    <div>
                       <label className="text-[8.5px] text-slate-500 font-extrabold uppercase mb-1.5 block tracking-wider">Encryption Channel Key</label>
                       <select
                         value={formKeyLabel}
                         onChange={(e) => { playSystemSound(); setFormKeyLabel(e.target.value); }}
                         className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-black"
                       >
                          <option value="VANGUARD_AES_NODE_0A">AES_NODE_0A (Primary)</option>
                          <option value="DESYNCHRONIZED_CHRYSTAL_9">CHRYSTAL_9 (Direct)</option>
                          <option value="SOVEREIGN_WITNESS_SEAL">WITNESS_SEAL (Sentry)</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Acquisition Location</label>
                    <input 
                      type="text" 
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Exit check point lounge, sector 3 corridor"
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
                    />
                 </div>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Forensic Summary Notes</label>
                    <textarea 
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="Specify detectable details, voice parameters, license plates, visible threats..."
                      rows={4}
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold leading-relaxed"
                    />
                 </div>

              </div>

              {/* Right Side Drag-and-drop file vault section */}
              <div className="space-y-4">
                 
                 <div className="space-y-2">
                    <label className="text-[8.5px] text-slate-500 font-black uppercase block tracking-wider">Attach Binary payload (Cloudinary Auto-Backup)</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/5 rounded-[24px] p-8 text-center cursor-pointer hover:border-indigo-500/40 bg-slate-950 transition-all relative group"
                    >
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileSelectionChange} 
                         className="hidden" 
                       />
                       {fileBase64 ? (
                         <div className="space-y-4 animate-in zoom-in-95">
                            {formType === 'IMAGE' && (
                              <img src={fileBase64} alt="Pre-upload visual" className="mx-auto h-36 object-cover rounded-xl border border-white/10" referrerPolicy="no-referrer" />
                            )}
                            
                            {formType === 'AUDIO' && (
                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 max-w-xs mx-auto">
                                 <Mic className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
                                 <span className="block text-[8px] text-blue-300 font-mono font-bold uppercase tracking-widest">Audio Track Stream Loaded</span>
                              </div>
                            )}

                            {formType === 'VIDEO' && (
                              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1 max-w-xs mx-auto">
                                 <Video className="w-8 h-8 text-red-400 mx-auto animate-pulse" />
                                 <span className="block text-[8px] text-red-300 font-mono font-bold uppercase tracking-widest">Video Stream Element Engaged</span>
                              </div>
                            )}

                            {formType === 'DOCUMENT' && (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 max-w-xs mx-auto">
                                 <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                                 <span className="block text-[8px] text-emerald-300 font-mono font-bold uppercase tracking-widest">Certified Witness Document</span>
                              </div>
                            )}

                            <div className="space-y-1">
                               <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">{uploadedFileName}</p>
                               <span className="text-[9px] text-slate-500 font-mono">Size parameters matches: {uploadedFileSize}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFileBase64(null); setUploadedFileName(null); setUploadedFileSize(null); }}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase transition-colors"
                            >
                               Scrub payload selection
                            </button>
                         </div>
                       ) : (
                         <div className="space-y-3 py-6">
                            <UploadCloud className="mx-auto text-slate-500 group-hover:text-indigo-400 w-10 h-10 transition-colors" />
                            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload witness bundle file</span>
                            <span className="block text-[8.5px] text-slate-500 uppercase font-mono">Accepts images, recordings, MP4 audio/video logs, or PDF documents</span>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Incident Linking configuration */}
                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Incident Link Coordinates</label>
                    <select
                      value={formIncidentLink}
                      onChange={(e) => { playSystemSound(); setFormIncidentLink(e.target.value); }}
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold"
                    >
                       <option value="General Security Space">Independent Custody (General Vault)</option>
                       <option value="SOS Emergency Alert Response">Primary Panic Event (SOS Alert)</option>
                       <option value="Localized Safe Route Deviation">Sovereign Safe Route incident</option>
                       <option value="Vigilante Suspect Patrol Segment">Anti-Trafficking vigilant report</option>
                       <option value="custom">-- Link custom case / legal incident ID --</option>
                    </select>
                 </div>

                 {formIncidentLink === 'custom' && (
                   <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block">Custom Case incident credentials *</label>
                      <input 
                        type="text"
                        value={customIncident}
                        onChange={(e) => setCustomIncident(e.target.value)}
                        placeholder="e.g. TRAFF-4810 Case Ledger Reference"
                        className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold uppercase"
                        required
                      />
                   </div>
                 )}

              </div>

           </div>

           {/* ACTIONS */}
           <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => { playSystemSound(); setActiveSubTab('EXPLORE'); }}
                className="px-6 py-3.5 bg-white/5 rounded-xl text-[10px] font-semibold uppercase tracking-wider text-slate-350 hover:bg-white/10 transition-colors"
                disabled={submittingUpload}
              >
                 Cancel Action
              </button>
              <button
                type="submit"
                disabled={submittingUpload}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                 {submittingUpload ? (
                   <>
                      <RefreshCw size={11} className="animate-spin" /> Verifying Hashes...
                   </>
                 ) : (
                   <>
                      <Sparkles size={11} /> Cryptographically Seal Element
                   </>
                 )}
              </button>
           </div>

        </form>
      )}

      {activeSubTab === 'LIVE_RECORDER' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 leading-normal">
          
          {/* SYSTEM HEADER AND STATUS HUD */}
          <div className="bg-zinc-950 p-8 rounded-[44px] border border-red-500/20 relative overflow-hidden shadow-2xl">
            {/* Pulsating danger overlay */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] uppercase font-mono tracking-widest font-black text-red-500">
                    SENTRY ACTIVE WITNESS SUITE
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  Emergency Live Recorder
                </h3>
                <p className="text-xs text-slate-400 font-semibold uppercase font-mono">
                  Continuous multi-channel telemetry capture & instant ledger synchronization
                </p>
              </div>

              {/* Status Box */}
              <div className="px-5 py-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                <div className="font-mono text-left">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">RECORDING STATUS</span>
                  <span className="text-xs font-bold text-slate-200 uppercase">{recordingStatusText}</span>
                </div>
              </div>
            </div>

            {/* Quick Metadata HUD strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-[10px] font-mono">
              <div>
                <span className="block text-slate-500 uppercase font-black text-[8px]">System Coordinates</span>
                <span className="text-slate-300 font-bold">
                  {gpsCoordinates ? `${gpsCoordinates.lat.toFixed(4)}, ${gpsCoordinates.lng.toFixed(4)}` : 'Awaiting GPS...'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-black text-[8px]">Time Handshake</span>
                <span className="text-slate-300 font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-black text-[8px]">Audio Input</span>
                <span className="text-emerald-400 font-black">ACTIVE HANDSHAKE</span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-black text-[8px]">Vanguard Protocol</span>
                <span className="text-indigo-400 font-black">WITNESS_SEAL_V2</span>
              </div>
            </div>
          </div>

          {/* MAIN RECORDING STAGE (SPLIT FOR ACTIVE PREVIEWS) */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* RECORDING CONTROLS (COL-SPAN-2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* IF NOT RECORDING: SHOW ONE-CLICK TRIGGERS */}
              {!isRecording ? (
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* COVERT AUDIO BLACKBOX */}
                  <div 
                    onClick={() => startLiveRecording('AUDIO')}
                    className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group hover:scale-[1.02] duration-300 relative overflow-hidden flex flex-col justify-between h-80 shadow-lg text-left"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                    
                    <div className="space-y-4">
                      <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Audio Blackbox</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          One-click voice & ambient audio capture. Optimized for low bandwidth, immediate compression, and dark screen stealth.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">
                      <Play size={12} className="fill-blue-400" />
                      Tap to start audio seal
                    </div>
                  </div>

                  {/* TACTICAL VIDEO RECORDER */}
                  <div 
                    onClick={() => startLiveRecording('VIDEO')}
                    className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group hover:scale-[1.02] duration-300 relative overflow-hidden flex flex-col justify-between h-80 shadow-lg text-left"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
                    
                    <div className="space-y-4">
                      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Video & Audio feed</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          One-click front/rear camera feed recording. Renders active viewfinder preview and packages frames with GPS logs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest font-mono">
                      <Play size={12} className="fill-red-400" />
                      Tap to start video feed
                    </div>
                  </div>

                </div>
              ) : (
                /* ACTIVE RECORDING COMPONENT PANEL */
                <div className="bg-zinc-950 p-8 rounded-[44px] border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.15)] space-y-6 relative overflow-hidden">
                  {/* Blinking red radar effect */}
                  <div className="absolute inset-0 bg-red-500/[0.01] animate-pulse pointer-events-none" />

                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">
                        LIVE CAPTURE TRANSMITTING: {recordingType}
                      </span>
                    </div>

                    {/* Timer */}
                    <div className="font-mono text-2xl font-black text-white tracking-tighter bg-red-950/40 px-4 py-1.5 rounded-xl border border-red-500/20">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60) < 10 ? '0' : ''}{recordingDuration % 60}
                    </div>
                  </div>

                  {/* ACTIVE VIEWPORT / VISUALIZER */}
                  <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 relative overflow-hidden flex items-center justify-center">
                    
                    {/* VIDEO PREVIEW */}
                    <video 
                      ref={videoPreviewRef}
                      className={`w-full h-full object-cover ${recordingType === 'VIDEO' ? 'block' : 'hidden'}`}
                      muted
                      playsInline
                    />

                    {/* AUDIO ANIMATED WAVEFORM */}
                    {recordingType === 'AUDIO' && (
                      <div className="flex items-center justify-center gap-1.5 h-32">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((bar, i) => (
                          <div 
                            key={i} 
                            style={{ 
                              animationDelay: `${i * 0.08}s`,
                              animationDuration: `${0.6 + Math.random() * 0.6}s` 
                            }}
                            className="w-1.5 bg-blue-500 rounded-full animate-bounce h-12"
                          />
                        ))}
                      </div>
                    )}

                    {/* Dark Screen Stealth Overlay */}
                    <div className="absolute top-4 left-4 z-20 bg-black/80 px-3 py-1.5 rounded-lg border border-red-500/20 text-[9px] font-mono text-red-500 flex items-center gap-1.5 uppercase font-bold">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      Sentry Continuous Record Stream
                    </div>

                    {/* Metadata Overlay inside Viewport */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end text-[9px] font-mono text-slate-400 bg-black/60 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                      <div className="space-y-0.5 text-left">
                        <p>LOC: {gpsCoordinates ? `${gpsCoordinates.lat.toFixed(5)}°, ${gpsCoordinates.lng.toFixed(5)}°` : 'Searching GPS...'}</p>
                        <p>DEVICE: SENTRY_WITNESS_SEAL_PORTABLE</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold uppercase">SECURE LINK LOCKED</p>
                        <p>CHUNKS BUFFERING</p>
                      </div>
                    </div>
                  </div>

                  {/* CONTROL BUTTONS */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <button
                      onClick={stopLiveRecording}
                      className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Square size={16} className="fill-white" />
                      STOP & AUTO-UPLOAD RECORDING (SEAL INTEGRITY)
                    </button>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">
                      CRITICAL: STOPPING WILL INSTANTLY COMPILE CHUNKS, STAMP LOCATION, CALCULATE SECURITY HASHES, AND AUTO-UPLOAD.
                    </p>
                  </div>

                </div>
              )}

              {/* GENERAL SETTINGS PANEL */}
              <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6 text-left">
                <div className="border-b border-white/5 pb-4">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Recorder Directives</h4>
                  <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">Configure capture & transport behavior</p>
                </div>

                <div className="space-y-4">
                  {/* AUTO UPLOAD TOGGLE */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white uppercase tracking-tight block">Immediate Auto Upload</span>
                      <span className="text-[10px] text-slate-400 block max-w-sm">
                        Automatically transmit recorded segments to secure Cloudinary buckets upon stopping, guaranteeing bypass of local device seizures.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoUploadOnStop}
                        onChange={(e) => setAutoUploadOnStop(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* BACKGROUND RECORDING CONTINUANCE INFO */}
                  <div className="p-4 bg-indigo-950/15 rounded-2xl border border-indigo-500/10 flex gap-4 items-start leading-relaxed text-left">
                    <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-300 uppercase block">Continuous Background Record Protocol</span>
                      <p className="text-[10px] text-slate-400">
                        Vanguard safety protocols support background execution. If you navigate to other pages (such as checking Legal Resources, chatting with Guardian AI, or viewing Safe Zones), the recording process remains continuous. Return to this sub-tab anytime to stop, view, or review active uploads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* SIDE BAR: INCIDENT TAGGING & CASE LINKING */}
            <div className="space-y-6 text-left">
              
              {/* INCIDENT TAGGER */}
              <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Incident Connector</h4>
                  <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">Connect recording with active SOS cases</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold leading-relaxed">
                    Tagging connects this live recording directly to an SOS distress alert or route deviation incident logged inside the system. Secure witnesses can query these logs during audit processes.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Select Active / Historic Case *</label>
                    <select
                      value={taggedSosIncidentId}
                      onChange={(e) => { playSystemSound(); setTaggedSosIncidentId(e.target.value); }}
                      className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-xs text-white font-bold tracking-wider outline-none"
                    >
                      <option value="General Security Space">-- Independent Record (No Active SOS Link) --</option>
                      
                      {sosIncidents.length > 0 ? (
                        sosIncidents.map((inc) => (
                          <option key={inc.id} value={inc.id}>
                            {inc.id} - {inc.description ? inc.description.slice(0, 30) : 'SOS Alert'}... ({new Date(inc.timestamp).toLocaleDateString()})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="SOS Alert #149">SOS Alert #149 (Simulated Incident)</option>
                          <option value="Suspicious Vehicle Report #102">Suspicious Vehicle Report #102</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* ACTIVE SELECTION DETAIL CARD */}
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">Active Connection Status</span>
                    <div className="flex items-center gap-2 text-xs font-black text-white uppercase">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                      {taggedSosIncidentId === 'General Security Space' ? 'General Storage Vault' : `Linked to: ${taggedSosIncidentId}`}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      {taggedSosIncidentId === 'General Security Space' 
                        ? 'This recording will be archived as independent forensic evidence and remains untagged.' 
                        : `This recording will be cryptographically bound to case ${taggedSosIncidentId} and automatically visible to authorized trust circles/responders connected to that incident.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* RECENTLY UPLOADED FROM RECORDER CARD */}
              <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 text-center space-y-4">
                <AlertTriangle className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-black text-white uppercase">Integrity Guidelines</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                  All emergency recordings are stamped with verified millisecond-level timestamps, coordinates, and local environment state flags. Deleting recordings is strictly partition-checked to guarantee audit trail preservation.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default EvidenceLocker;
