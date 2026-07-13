import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, UploadCloud, Trash2, Clock, CheckCircle2, Search,
  Send, Info, Lock, UserX, Skull, Flame, FileImage, FileText, ArrowRight, RefreshCw, Eye
} from 'lucide-react';

interface TrackingLogEntry {
  time: string;
  note: string;
}

interface CyberComplaint {
  id: string;
  timestamp: string;
  type: 'FAKE_PROFILE' | 'SEXTORTION' | 'CYBER_STALKING';
  reportedUser: string;
  description: string;
  evidenceUrl?: string;
  evidenceName?: string;
  evidenceSize?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'CLOSED';
  trackingLog: TrackingLogEntry[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerEmail: string;
}

const CyberSafetyReporting: React.FC = () => {
  const [complaints, setComplaints] = useState<CyberComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TRACK' | 'NEW_REPORT' | 'EDUCATION'>('TRACK');

  // Passcode authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Form states
  const [formType, setFormType] = useState<'FAKE_PROFILE' | 'SEXTORTION' | 'CYBER_STALKING'>('FAKE_PROFILE');
  const [reportedUser, setReportedUser] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceSize, setEvidenceSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detail view state
  const [selectedComplaint, setSelectedComplaint] = useState<CyberComplaint | null>(null);
  const [newLogNote, setNewLogNote] = useState('');
  const [updatingLog, setUpdatingLog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) {
        setErrorText("Unauthenticated session. Please sign in to access secure cyber reporting.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/cyber-safety/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to load secure complaint logs from server partition.");
      }

      const data = await res.json();
      if (data.success && data.complaints) {
        setComplaints(data.complaints);
        if (selectedComplaint) {
          const updated = data.complaints.find((c: CyberComplaint) => c.id === selectedComplaint.id);
          if (updated) setSelectedComplaint(updated);
        }
      }
    } catch (err: any) {
      setErrorText(err.message || "An error occurred while linking to the secure database.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (num: string) => {
    setPasscodeError(null);
    if (passcode.length < 4) {
      const nextCode = passcode + num;
      setPasscode(nextCode);
      if (nextCode === '2468') {
        setIsDecrypting(true);
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsDecrypting(false);
          setPasscode('');
        }, 1000);
      } else if (nextCode.length === 4) {
        setTimeout(() => {
          setPasscodeError("DECRYPTION FAIL: ACCESS CREDENTIALS REJECTED");
          setPasscode('');
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPasscodeError(null);
    setPasscode(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode, isAuthenticated]);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setEvidenceName(file.name);
    setEvidenceSize(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidenceUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setEvidenceName(file.name);
    setEvidenceSize(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidenceUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedUser.trim() || !description.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage(null);
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) {
        alert("Session expired. Please re-authenticate.");
        return;
      }

      const res = await fetch('/api/cyber-safety/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: formType,
          reportedUser,
          description,
          evidenceUrl,
          evidenceName,
          evidenceSize,
          severity
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Your cyber threat report has been successfully transmitted & digitally signed on the security matrix.");
        // Reset form
        setReportedUser('');
        setDescription('');
        setEvidenceUrl('');
        setEvidenceName('');
        setEvidenceSize('');
        setFormType('FAKE_PROFILE');
        setSeverity('MEDIUM');
        fetchComplaints();
        // Redirect to tracking tab
        setTimeout(() => {
          setActiveTab('TRACK');
          setSuccessMessage(null);
        }, 3000);
      } else {
        alert(data.error || "Submission failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: failed to route complaint pack.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLogNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim() || !selectedComplaint) return;

    try {
      setUpdatingLog(true);
      const token = localStorage.getItem('vs_jwt_token');
      const res = await fetch(`/api/cyber-safety/complaint/${selectedComplaint.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: newLogNote })
      });

      const data = await res.json();
      if (data.success) {
        setNewLogNote('');
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingLog(false);
    }
  };

  const handleUpdateStatus = async (status: 'CLOSED' | 'UNDER_REVIEW' | 'ACTION_TAKEN') => {
    if (!selectedComplaint) return;
    try {
      setUpdatingLog(true);
      const token = localStorage.getItem('vs_jwt_token');
      const res = await fetch(`/api/cyber-safety/complaint/${selectedComplaint.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (data.success) {
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingLog(false);
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm("Are you sure you want to archive and completely delete this complaint file?")) return;

    try {
      const token = localStorage.getItem('vs_jwt_token');
      const res = await fetch(`/api/cyber-safety/complaint/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FAKE_PROFILE': return 'Fake Profile Impersonation';
      case 'SEXTORTION': return 'Sextortion / Cyber Blackmail';
      case 'CYBER_STALKING': return 'Cyber Stalking Harassment';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FAKE_PROFILE': return <UserX className="w-5 h-5 text-amber-400" />;
      case 'SEXTORTION': return <Skull className="w-5 h-5 text-red-500" />;
      case 'CYBER_STALKING': return <Flame className="w-5 h-5 text-orange-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'UNDER_REVIEW': return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse';
      case 'ACTION_TAKEN': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'CLOSED': return 'bg-slate-800/80 border-slate-700/50 text-slate-400';
      default: return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-600/20 text-red-400 border border-red-500/30';
      case 'HIGH': return 'bg-orange-600/20 text-orange-400 border border-orange-500/30';
      case 'MEDIUM': return 'bg-amber-600/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  // Helper stats calculation
  const totalReports = complaints.length;
  const activeReview = complaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const actionTakenCount = complaints.filter(c => c.status === 'ACTION_TAKEN').length;
  const pendingCount = complaints.filter(c => c.status === 'SUBMITTED').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-500 py-12 px-4" id="cyber-safety-lock-screen">
        <div className="w-full max-w-md glass-card p-8 rounded-[40px] border-indigo-500/20 shadow-2xl relative overflow-hidden text-center space-y-8 bg-slate-950/40 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-red-500/5 rounded-full blur-[40px] pointer-events-none" />

          {/* Secure Lock Header */}
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-slate-950/85 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 relative shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              {isDecrypting ? (
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              ) : passcodeError ? (
                <Lock className="w-8 h-8 text-red-500 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">CYBER SECURITY VAULT</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mono">Restricted Tactical Partition</p>
            </div>
          </div>

          {/* Passcode Dots Indicator */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isDecrypting 
                      ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : passcode.length > index 
                        ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                        : 'bg-slate-950 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {passcodeError ? (
              <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mono animate-pulse">
                {passcodeError}
              </p>
            ) : isDecrypting ? (
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider mono animate-pulse">
                DECRYPTING DOSSIER MATRIX...
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mono">
                Enter secure 4-digit passcode
              </p>
            )}
          </div>

          {/* Visual Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                disabled={isDecrypting}
                className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 text-lg font-black text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPasscode('')}
              disabled={isDecrypting || passcode.length === 0}
              className="w-16 h-16 rounded-2xl bg-slate-950/40 border border-white/5 text-[10px] font-black text-slate-400 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={isDecrypting}
              className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 text-lg font-black text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isDecrypting || passcode.length === 0}
              className="w-16 h-16 rounded-2xl bg-slate-950/40 border border-white/5 text-[10px] font-black text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer"
            >
              BACK
            </button>
          </div>

          {/* Additional info footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono">SECURE SENTRY SYNC CHRONOLOGY v2.6</span>
            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mono">Unauthorized access triggers visual beacon alert.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto pb-40" id="cyber-safety-reporting-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-10 rounded-[32px] border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[20px] flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Cyber Security Vault</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mono mt-1">Anti-Impersonation • Extortion Blackmail Defenses • Stalking Sentinel</p>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 relative z-10">
          <button 
            onClick={() => { setActiveTab('TRACK'); setSelectedComplaint(null); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'TRACK' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Complaints
          </button>
          <button 
            onClick={() => setActiveTab('NEW_REPORT')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'NEW_REPORT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            File Complaint
          </button>
          <button 
            onClick={() => setActiveTab('EDUCATION')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'EDUCATION' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Defense Manual
          </button>
        </div>
      </div>

      {/* QUICK STATUS TICKERS */}
      {activeTab === 'TRACK' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">TOTAL FILED</p>
            <p className="text-4xl font-black text-white mt-2 leading-none">{totalReports}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">UNDER REVIEW</p>
            <p className="text-4xl font-black text-cyan-400 mt-2 leading-none">{activeReview}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">DEFENSES ACTIVE</p>
            <p className="text-4xl font-black text-emerald-400 mt-2 leading-none">{actionTakenCount}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">PENDING MATRIX</p>
            <p className="text-4xl font-black text-amber-400 mt-2 leading-none">{pendingCount}</p>
          </div>
        </div>
      )}

      {/* ERROR DISPLAY */}
      {errorText && (
        <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400">
          <Info className="flex-shrink-0" />
          <p className="text-sm font-bold">{errorText}</p>
        </div>
      )}

      {/* TAB 1: TRACK COMPLAINTS COMPONENT */}
      {activeTab === 'TRACK' && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* COMPLAINTS LISTING */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between ml-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mono">Active Cyberspace Incidents</h3>
              <button 
                onClick={fetchComplaints}
                className="p-2 text-slate-500 hover:text-white transition-colors"
                title="Force Resync"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {loading && complaints.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl border-white/5">
                <RefreshCw className="animate-spin text-indigo-500 mx-auto w-8 h-8 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mono">Establishing secure communication link...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="glass-card p-16 text-center rounded-[40px] border-white/5 space-y-6">
                <div className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">No Threat Complaints Indexed</h4>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">Your cyber partition is currently safe. If you encounter impersonators, cyber stalkers, or digital extortion, file a secured report immediately.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('NEW_REPORT')}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg"
                >
                  File Complaint File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`glass-card p-8 rounded-[32px] cursor-pointer transition-all border-2 text-left group relative ${
                      selectedComplaint?.id === c.id 
                        ? 'border-indigo-500 bg-indigo-950/20' 
                        : 'border-white/5 hover:border-white/10 hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-950 border border-white/10 rounded-[14px] flex items-center justify-center">
                          {getTypeIcon(c.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-white tracking-tight text-lg">{getTypeLabel(c.type)}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getSeverityStyle(c.severity)}`}>
                              {c.severity}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">Reported: <span className="text-indigo-400 font-mono">@{c.reportedUser}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mono">
                            {new Date(c.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-[9px] text-slate-600 mt-0.5 mono">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm mt-4 line-clamp-2 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4">
                      "{c.description}"
                    </p>

                    {/* Screenshot thumbnail attachment indicator */}
                    {c.evidenceUrl && (
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">
                        <FileImage size={12} />
                        <span>Screenshot Included ({c.evidenceName || 'log_screenshot.png'})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE TRACKING CHRONOLOGY PANEL */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mono ml-2">Audit Chronology</h3>
            
            {selectedComplaint ? (
              <div className="glass-card p-8 rounded-[36px] border-indigo-500/20 relative overflow-hidden space-y-6 text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">{selectedComplaint.id}</span>
                    <h4 className="font-black text-white text-xl mt-1">{getTypeLabel(selectedComplaint.type)}</h4>
                  </div>
                  <button 
                    onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                    title="Archive Case"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mono">INCIDENT COMPLAINT RECORD</p>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-black tracking-wide">Target Profile / Handle</p>
                    <p className="text-sm font-bold text-white mt-1">@{selectedComplaint.reportedUser}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-black tracking-wide">Description</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1 italic">"{selectedComplaint.description}"</p>
                  </div>
                  {selectedComplaint.evidenceUrl && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wide mb-2">Screenshot Evidence</p>
                      <div className="relative rounded-xl overflow-hidden border border-white/10 group bg-slate-900 flex flex-col">
                        <img 
                          src={selectedComplaint.evidenceUrl} 
                          alt="Screenshot Evidence" 
                          className="w-full max-h-44 object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="p-3 bg-slate-950/90 flex justify-between items-center text-[10px] font-mono border-t border-white/5">
                          <span className="text-slate-400 truncate max-w-[150px]">{selectedComplaint.evidenceName}</span>
                          <span className="text-slate-500">{selectedComplaint.evidenceSize}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* TIMELINE TRACKING LOG */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-400 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">Security Chronology</p>
                  </div>

                  <div className="relative border-l-2 border-indigo-500/20 pl-6 space-y-6 ml-2">
                    {selectedComplaint.trackingLog.map((log, index) => (
                      <div key={index} className="relative group">
                        {/* Bullet point node */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-indigo-500 bg-[#020617] flex items-center justify-center shadow-lg">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 mono">
                          {new Date(log.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* USER INTERACTIVE COMMENT / LOG RESPONSE */}
                <form onSubmit={handleAddLogNote} className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Secure Transmission Bridge</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Transmit message to secure investigation nodes..." 
                      value={newLogNote}
                      onChange={(e) => setNewLogNote(e.target.value)}
                      className="flex-grow bg-slate-950 border border-white/10 px-4 py-3 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={updatingLog || !newLogNote.trim()}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>

                {/* QUICK MANUAL OPERATIONS FOR SIMULATION */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mono">Simulator Matrix Controls</p>
                  <div className="flex gap-2">
                    {selectedComplaint.status !== 'ACTION_TAKEN' && (
                      <button 
                        onClick={() => handleUpdateStatus('ACTION_TAKEN')}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase text-emerald-400 tracking-wider transition-colors"
                      >
                        Simulate Defense Action
                      </button>
                    )}
                    {selectedComplaint.status !== 'CLOSED' ? (
                      <button 
                        onClick={() => handleUpdateStatus('CLOSED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-black uppercase text-slate-400 tracking-wider transition-colors"
                      >
                        Simulate Close Case
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-lg text-[9px] font-black uppercase text-cyan-400 tracking-wider transition-colors"
                      >
                        Simulate Reopen File
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-card p-12 text-center rounded-[36px] border-white/5 text-slate-500 text-xs space-y-4">
                <Info size={24} className="mx-auto text-indigo-500/30" />
                <p className="font-bold uppercase tracking-widest text-[10px] mono">Select an active complaint dossier from the list to view secure chronological updates, trace actions, and connect directly with the response node.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: FILE NEW COMPLAINT COMPONENT */}
      {activeTab === 'NEW_REPORT' && (
        <div className="glass-card p-12 rounded-[48px] border-indigo-500/20 shadow-2xl relative overflow-hidden text-left max-w-3xl mx-auto">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="space-y-3 mb-8">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mono">VANGUARD PROTOCOL SECURE INCIDENT REPORT</span>
            <h3 className="text-3xl font-black text-white tracking-tight uppercase">File Cyber Complaint dossier</h3>
            <p className="text-slate-400 text-xs">Fill out this secure cryptographic form to index the cyber stalker, blackmail vector, or imposter profile into the decentralized defense ledger.</p>
          </div>

          {successMessage && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 text-emerald-400 animate-bounce mb-8">
              <CheckCircle2 size={24} className="flex-shrink-0" />
              <p className="text-sm font-bold">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmitComplaint} className="space-y-6">
            
            {/* THREAT TYPE SELECTOR */}
            <div className="grid md:grid-cols-3 gap-4">
              <div 
                onClick={() => setFormType('FAKE_PROFILE')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  formType === 'FAKE_PROFILE' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <UserX className="w-6 h-6 text-amber-400" />
                  <div className={`w-3 h-3 rounded-full ${formType === 'FAKE_PROFILE' ? 'bg-indigo-400' : 'bg-transparent'}`} />
                </div>
                <h4 className="font-black uppercase tracking-wider text-[11px] mt-6">Fake Profile</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Impersonation and photo theft on platforms.</p>
              </div>

              <div 
                onClick={() => setFormType('SEXTORTION')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  formType === 'SEXTORTION' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Skull className="w-6 h-6 text-red-500" />
                  <div className={`w-3 h-3 rounded-full ${formType === 'SEXTORTION' ? 'bg-indigo-400' : 'bg-transparent'}`} />
                </div>
                <h4 className="font-black uppercase tracking-wider text-[11px] mt-6">Sextortion</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Digital blackmail, extortion & revenge threats.</p>
              </div>

              <div 
                onClick={() => setFormType('CYBER_STALKING')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  formType === 'CYBER_STALKING' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <div className={`w-3 h-3 rounded-full ${formType === 'CYBER_STALKING' ? 'bg-indigo-400' : 'bg-transparent'}`} />
                </div>
                <h4 className="font-black uppercase tracking-wider text-[11px] mt-6">Cyber Stalking</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Harassment, threats, and digital tracking.</p>
              </div>
            </div>

            {/* TARGET PROFILE / ACCOUNT HANDLE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">Reported Profile / Account Handle / URL *</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="e.g. instagram_username, telegram_id, or email address" 
                  value={reportedUser}
                  onChange={(e) => setReportedUser(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-white/5 focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm text-white outline-none transition-colors"
                />
              </div>
            </div>

            {/* SEVERITY LEVEL & DURATION */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">Threat Severity Index</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      severity === sev 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25' 
                        : 'bg-slate-950/40 text-slate-500 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">Incident Description & Facts *</label>
              <textarea 
                required
                rows={4}
                placeholder="Detail the cyberstalking incidents, fake accounts activity, or threatening extortion communications. Include dates, platforms, and messages verbatim if possible." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border-2 border-white/5 focus:border-indigo-500 rounded-2xl p-5 text-sm text-white outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* DRAG AND DROP SCREENSHOT UPLOAD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">Screenshot Evidence / Threat Logs</label>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-3xl p-8 bg-slate-950/30 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center min-h-[160px]"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden" 
                />
                
                {evidenceUrl ? (
                  <div className="flex items-center gap-4 text-left w-full max-w-md bg-slate-950 p-4 border border-white/10 rounded-2xl">
                    <img src={evidenceUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-white truncate">{evidenceName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{evidenceSize}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEvidenceUrl('');
                        setEvidenceName('');
                        setEvidenceSize('');
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <UploadCloud className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 transition-colors mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">Drag & drop threatening screenshot here, or <span className="text-indigo-400">browse files</span></p>
                      <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-wider mono">Supports PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COMPLIANCE WARNING & DISCREET OPTION */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex gap-4 text-slate-400">
              <Info className="text-indigo-400 flex-shrink-0" size={18} />
              <p className="text-[10px] leading-relaxed font-bold uppercase tracking-wider">
                Vanguard encrypts all filed report dossiers using military-grade security before committing to disk. Submissions automatically log metadata tags to flag malicious recidivism across servers.
              </p>
            </div>

            {/* FORM SUBMIT */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {submitting ? "Transmitting Complaint Dossier..." : "Transmit Verifiable Cyber Complaint"}
              <ArrowRight size={14} />
            </button>

          </form>
        </div>
      )}

      {/* TAB 3: CYBER MANUAL EDUCATION / PROTOCOLS */}
      {activeTab === 'EDUCATION' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mono">VANGUARD INCIDENT SHIELD</span>
            <h3 className="text-4xl font-black text-white uppercase tracking-tight">Cyber Security Playbooks</h3>
            <p className="text-slate-400 text-sm">Actionable tactical procedures to execute immediately when faced with digital impersonation, sextortion vectors, or persistent online stalking.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            
            {/* PLAYBOOK 1: FAKE PROFILE IMPERSONATION */}
            <div className="glass-card p-8 rounded-3xl border-white/5 space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-400">
                <UserX size={20} />
              </div>
              <h4 className="font-black text-white text-lg">Fake Profile Defense</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an actor clones your social identity or uses your photographs to scam contacts:
              </p>
              <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong className="text-slate-300">Document Everything:</strong> Screenshot the clone profile URL, follower list, and any scam DMs.</li>
                <li><strong className="text-slate-300">Warn Your Circle:</strong> Post a security bulletin on your genuine handles alerting people to block the clone.</li>
                <li><strong className="text-slate-300">Execute Takedowns:</strong> Report the impersonation using Vanguard automatic takedown bridges.</li>
              </ul>
            </div>

            {/* PLAYBOOK 2: SEXTORTION / BLACKMAIL */}
            <div className="glass-card p-8 rounded-3xl border-white/5 space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center text-red-400">
                <Skull size={20} />
              </div>
              <h4 className="font-black text-white text-lg">Sextortion Protocol</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If blackmailed with intimate images, chats, or personal private details:
              </p>
              <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong className="text-slate-300">Never Pay:</strong> Extortionists never stop after the first payment. Paying validates their leverage.</li>
                <li><strong className="text-slate-300">Cease Communication:</strong> Immediately block the blackmailer. Do not explain, negotiate, or provoke them.</li>
                <li><strong className="text-slate-300">Log IP & Signatures:</strong> Keep communication trails unaltered for law enforcement.</li>
              </ul>
            </div>

            {/* PLAYBOOK 3: CYBER STALKING */}
            <div className="glass-card p-8 rounded-3xl border-white/5 space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame size={20} />
              </div>
              <h4 className="font-black text-white text-lg">Cyber Stalking Guard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If subjected to persistent harassment, virtual surveillance, or direct threats:
              </p>
              <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong className="text-slate-300">Hard Privacy:</strong> Switch accounts to maximum privacy. Restrict friend requests.</li>
                <li><strong className="text-slate-300">Audit Footprint:</strong> Search search engines for your telephone or home details to trigger removal requests.</li>
                <li><strong className="text-slate-300">Deploy Sentinels:</strong> Use digital evidence lockers to log timeline tracking logs.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CyberSafetyReporting;
