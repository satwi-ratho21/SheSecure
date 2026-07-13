import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Search, Plus, UploadCloud, Calendar, MapPin, Shirt, Tag, 
  AlertTriangle, Heart, Send, MessageSquare, RefreshCw, 
  CheckCircle2, Trash2, Filter, Clock, Eye, AlertCircle, 
  ChevronRight, ArrowRight, UserCheck, Phone, Info, HelpCircle
} from 'lucide-react';

export interface RescueUpdate {
  id: string;
  timestamp: string;
  summary: string;
  author: string;
  locationState?: string;
}

export interface MissingPersonReport {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDateTime: string;
  clothingDescription: string;
  distinctFeatures: string;
  photoUrl: string;
  cloudinaryPublicId: string;
  status: 'ACTIVE_SEARCH' | 'SPOTTED' | 'PLACED_SAFE' | 'REUNIFIED' | 'ARCHIVED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporterName: string;
  reporterContact: string;
  rescueUpdates: RescueUpdate[];
  timestamp: string;
}

const MissingPersonPortal: React.FC = () => {
  // Navigation tabs inside portal
  const [activeSubTab, setActiveSubTab] = useState<'EXPLORE' | 'REPORT_FORM'>('EXPLORE');

  // Load state
  const [reports, setReports] = useState<MissingPersonReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Form states for creating a new report
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('Female');
  const [formLastLocation, setFormLastLocation] = useState('');
  const [formLastDateTime, setFormLastDateTime] = useState('');
  const [formClothing, setFormClothing] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formPhotoBase64, setFormPhotoBase64] = useState<string | null>(null);
  const [formPhotoName, setFormPhotoName] = useState<string | null>(null);
  const [formUrgency, setFormUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [formReporterName, setFormReporterName] = useState('');
  const [formReporterContact, setFormReporterContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  // Interactive logs / Rescue updates adding
  const [activeReportForUpdate, setActiveReportForUpdate] = useState<string | null>(null);
  const [newLogSummary, setNewLogSummary] = useState('');
  const [newLogAuthor, setNewLogAuthor] = useState('');
  const [newLogLocation, setNewLogLocation] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Status updating window
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('ACTIVE_SEARCH');
  const [editingUrgency, setEditingUrgency] = useState<string>('HIGH');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const playSystemSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 high note for tactical feedback
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // Ignored if browser security blocks audio contexts
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const res = await fetch('/api/missing-persons/reports');
      if (!res.ok) {
        throw new Error("Local instance network failure or unavailable endpoints.");
      }
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        throw new Error(data.error || "Encountered parsing response failure.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Failed to parse records from simulated MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Establish interval polling to synchronize local MongoDB vault rescue updates dynamically
    const poll = setInterval(fetchReports, 9000);
    return () => clearInterval(poll);
  }, []);

  const handleImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Invalid format! Please pair raw image visuals (PNG/JPEG/WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormPhotoBase64(reader.result as string);
      setFormPhotoName(file.name);
      playSystemSound();
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  // Submit missing person card form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLastLocation || !formReporterName) {
      alert("Please ensure core identifying particulars are declared (Full Name, Last Seen, Contact).");
      return;
    }

    setSubmitting(true);
    playSystemSound();

    try {
      const payload = {
        fullName: formName,
        age: formAge ? Number(formAge) : undefined,
        gender: formGender,
        lastSeenLocation: formLastLocation,
        lastSeenDateTime: formLastDateTime,
        clothingDescription: formClothing,
        distinctFeatures: formFeatures,
        photoBase64: formPhotoBase64 || '',
        urgency: formUrgency,
        reporterName: formReporterName,
        reporterContact: formReporterContact
      };

      const response = await fetch('/api/missing-persons/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        alert("Success! Missing Person Profile safely published to the Secure MongoDB Ledger in sync with Cloudinary media CDN caching.");
        
        // Reset state values
        setFormName('');
        setFormAge('');
        setFormGender('Female');
        setFormLastLocation('');
        setFormLastDateTime('');
        setFormClothing('');
        setFormFeatures('');
        setFormPhotoBase64(null);
        setFormPhotoName(null);
        setFormReporterName('');
        setFormReporterContact('');
        setFormUrgency('HIGH');

        // Toggle back to active grid list
        setActiveSubTab('EXPLORE');
        fetchReports();
      } else {
        alert(`Storage registration failed: ${data.error || "Unknown response defect."}`);
      }
    } catch (err) {
      alert("Network transmission timeout. Simulated MongoDB pipeline is active.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit dynamic Rescue update log
  const handleRescueUpdateSubmit = async (reportId: string) => {
    if (!newLogSummary || !newLogAuthor) {
      alert("Please specify the progress summary and author credentials.");
      return;
    }
    setSubmittingLog(true);
    playSystemSound();

    try {
      const response = await fetch(`/api/missing-persons/report/${reportId}/rescue-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: newLogSummary,
          author: newLogAuthor,
          locationState: newLogLocation
        })
      });

      if (response.ok) {
        setNewLogSummary('');
        setNewLogLocation('');
        setActiveReportForUpdate(null);
        fetchReports();
      } else {
        alert("Failed to record rescue updates. Please query authority levels.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingLog(false);
    }
  };

  // Perform quick update state
  const handleStateUpdate = async (reportId: string) => {
    playSystemSound();
    try {
      const response = await fetch(`/api/missing-persons/report/${reportId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: editingStatus,
          urgency: editingUrgency
        })
      });

      if (response.ok) {
        setEditingReportId(null);
        fetchReports();
      } else {
        alert("Error modifying status metrics.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCase = async (reportId: string) => {
    if (!confirm(`Confirm complete deletion of secure missing file ${reportId}? This archives and purges binary items.`)) {
      return;
    }
    playSystemSound();
    try {
      const response = await fetch(`/api/missing-persons/report/${reportId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchReports();
      } else {
        alert("Error archiving registry index.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Safe search match rules
  const matchesFilter = (item: MissingPersonReport) => {
    const text = searchQuery.toLowerCase();
    const queryMatch = !searchQuery ? true : (
      item.fullName.toLowerCase().includes(text) ||
      item.clothingDescription.toLowerCase().includes(text) ||
      item.lastSeenLocation.toLowerCase().includes(text) ||
      item.distinctFeatures.toLowerCase().includes(text) ||
      item.id.toLowerCase().includes(text)
    );

    const statusMatch = filterStatus === 'ALL' ? true : item.status === filterStatus;
    const urgencyMatch = filterUrgency === 'ALL' ? true : item.urgency === filterUrgency;

    return queryMatch && statusMatch && urgencyMatch;
  };

  const filteredCollection = reports.filter(matchesFilter);

  // Status mapping colors & labels for responsive bento view
  const getStatusConfig = (status: MissingPersonReport['status']) => {
    switch (status) {
      case 'ACTIVE_SEARCH':
        return { label: 'Active Search', bg: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'SPOTTED':
        return { label: 'Spotted Near Area', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'PLACED_SAFE':
        return { label: 'Placed in Shelter', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'REUNIFIED':
        return { label: 'Reunified Safe', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Archived Case', bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-10 pb-44">
      
      {/* SECTION TITLE HERO BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 p-10 rounded-[44px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="space-y-2 relative z-101">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-red-600/10 border border-red-500/35 rounded-2xl flex items-center justify-center text-red-400">
                <Heart className="w-6 h-6 animate-pulse" />
             </div>
             <h2 className="text-3xl font-black text-white uppercase tracking-tight">Missing Person Portal</h2>
          </div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest font-mono">
             Coordinated emergency lookup with secure MongoDB ledger sync & Cloudinary evidence vaults.
          </p>
        </div>

        {/* SUBTABS */}
        <div className="flex gap-2 relative z-10 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
           <button
             onClick={() => { playSystemSound(); setActiveSubTab('EXPLORE'); }}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
               activeSubTab === 'EXPLORE' ? 'bg-red-600 text-white shadow-lg shadow-red-650/40' : 'text-slate-400 hover:text-white'
             }`}
           >
              Find Missing Profiles
           </button>
           <button
             onClick={() => { playSystemSound(); setActiveSubTab('REPORT_FORM'); }}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
               activeSubTab === 'REPORT_FORM' ? 'bg-red-600 text-white shadow-lg shadow-red-650/40' : 'text-slate-400 hover:text-white'
             }`}
           >
              <Plus size={11} /> Launch New Case file
           </button>
        </div>
      </div>

      {/* DETAILED CONTENT AREA */}

      {activeSubTab === 'EXPLORE' && (
        <div className="space-y-8">
           
           {/* SEARCH FILTER HEADBAR */}
           <div className="bg-zinc-950 p-6 rounded-[30px] border border-white/5 grid md:grid-cols-4 gap-4 items-center animate-in slide-in-from-top-4 duration-500">
              {/* Query filter */}
              <div className="relative">
                 <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search Name, clothing or features..."
                   className="w-full bg-slate-900 border border-white/5 pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
                 />
              </div>

              {/* Status Filter */}
              <div>
                 <select
                   value={filterStatus}
                   onChange={(e) => { playSystemSound(); setFilterStatus(e.target.value); }}
                   className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white font-bold uppercase tracking-wider outline-none"
                 >
                    <option value="ALL">All Status Tracking</option>
                    <option value="ACTIVE_SEARCH">ACTIVE SEARCH</option>
                    <option value="SPOTTED">SPOTTED NEARBY</option>
                    <option value="PLACED_SAFE">PLACED IN SHELTER</option>
                    <option value="REUNIFIED">REUNIFIED SAFE</option>
                    <option value="ARCHIVED">ARCHIVED CASE</option>
                 </select>
              </div>

              {/* Urgency Filter */}
              <div>
                 <select
                   value={filterUrgency}
                   onChange={(e) => { playSystemSound(); setFilterUrgency(e.target.value); }}
                   className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white font-bold uppercase tracking-wider outline-none"
                 >
                    <option value="ALL">All Urgencies</option>
                    <option value="LOW">Low Alert</option>
                    <option value="MEDIUM">Medium Alert</option>
                    <option value="HIGH">High Alert</option>
                    <option value="CRITICAL">Critical Alert</option>
                 </select>
              </div>

              {/* Refresher and count metrics */}
              <div className="flex md:justify-end gap-3 items-center">
                 <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">
                    Found {filteredCollection.length} Records
                 </span>
                 <button
                   onClick={() => { playSystemSound(); fetchReports(); }}
                   className="p-2.5 bg-slate-900 border-2 border-white/5 hover:border-red-500/20 rounded-xl text-slate-300 hover:text-white transition-all"
                   title="Force Database Sync"
                 >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                 </button>
              </div>
           </div>

           {/* MAIN CARDS GRID */}
           {loading ? (
             <div className="text-center p-24 bg-zinc-950 rounded-[44px] border border-white/5 space-y-4">
                <RefreshCw className="mx-auto w-10 h-10 text-red-500 animate-spin" />
                <p className="text-xs uppercase font-mono tracking-widest text-slate-500">Retrieving encrypted cases from cluster ledger...</p>
             </div>
           ) : errorText ? (
             <div className="text-center p-16 bg-zinc-950 rounded-[44px] border-2 border-red-500/10 space-y-4">
                <AlertCircle className="mx-auto w-12 h-12 text-red-500" />
                <p className="text-xs uppercase font-bold text-red-400">{errorText}</p>
                <button
                  onClick={fetchReports}
                  className="px-6 py-2.5 bg-red-600/20 text-white rounded-xl text-xs uppercase font-bold"
                >
                   Retry Connection
                </button>
             </div>
           ) : filteredCollection.length === 0 ? (
             <div className="text-center p-24 bg-zinc-950 rounded-[44px] border border-white/5 space-y-4">
                <HelpCircle className="mx-auto w-12 h-12 text-slate-600" />
                <p className="text-sm font-black text-slate-400 uppercase">Registry contains no records for active filters</p>
                <p className="text-xs text-slate-600 uppercase font-mono">Create an entry to start localized defense networks</p>
                <button
                  onClick={() => setActiveSubTab('REPORT_FORM')}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                >
                   Index New Missing Person
                </button>
             </div>
           ) : (
             <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                
                {filteredCollection.map((person) => {
                  const statusConf = getStatusConfig(person.status);
                  const isEditing = editingReportId === person.id;
                  const isAddingUpdate = activeReportForUpdate === person.id;

                  return (
                    <div 
                      key={person.id} 
                      className="bg-zinc-950 rounded-[40px] border-4 border-white/5 hover:border-red-600/20 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between relative group hover:translate-y-[-4px] transition-all"
                    >
                       {/* Top alert level indicator */}
                       <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                         person.urgency === 'CRITICAL' ? 'bg-red-600 shadow-[0_3px_15px_rgba(220,38,38,0.7)]' :
                         person.urgency === 'HIGH' ? 'bg-amber-500' :
                         person.urgency === 'MEDIUM' ? 'bg-yellow-500' : 'bg-slate-600'
                       }`} />

                       {/* Card Head (Portrait Image + Basics) */}
                       <div>
                          <div className="relative h-64 bg-slate-900">
                             <img 
                               src={person.photoUrl} 
                               alt={person.fullName} 
                               className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                               referrerPolicy="no-referrer"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                             
                             {/* Floating dynamic tags */}
                             <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 ${statusConf.bg}`}>
                                   {statusConf.label}
                                </span>
                                <span className="bg-black/80 backdrop-blur-md text-[8px] px-2 py-0.5 rounded font-mono text-slate-400 uppercase tracking-widest border border-white/10">
                                   Cloudinary CDN Active
                                </span>
                             </div>

                             {/* Floating Case ID */}
                             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono text-white tracking-wider border border-white/5 font-bold">
                                {person.id}
                             </div>

                             {/* Name and Age block overlaid */}
                             <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                                <div>
                                   <p className="text-2xl font-black text-white leading-none uppercase tracking-tight">{person.fullName}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mt-1">
                                      {person.gender} • {person.age ? `${person.age} Years Old` : 'Age Unspecified'}
                                   </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase inline-block ${
                                  person.urgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300'
                                }`}>
                                   {person.urgency} Action
                                </span>
                             </div>
                          </div>

                          {/* Details Specs Container */}
                          <div className="p-6 space-y-4">
                             
                             {/* Last Seen Parameters */}
                             <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-start gap-2.5">
                                   <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                   <div>
                                      <p className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold block">Last Seen Location</p>
                                      <p className="text-[11px] text-white uppercase font-black leading-snug">{person.lastSeenLocation}</p>
                                   </div>
                                </div>

                                <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                   <Clock className="w-3.5 h-3.5 text-[#818cf8]" />
                                   <span className="text-[9px] text-slate-300 font-bold font-mono">
                                      {person.lastSeenDateTime ? new Date(person.lastSeenDateTime).toLocaleString() : 'Date unspecified'}
                                   </span>
                                </div>
                             </div>

                             {/* Physical description cards */}
                             <div className="grid grid-cols-2 gap-3 text-[10px]">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                   <span className="text-[8.5px] text-slate-500 font-extrabold uppercase block tracking-wider mb-0.5">Identifiable Clothing</span>
                                   <p className="text-slate-300 font-semibold leading-normal capitalize italic">"{person.clothingDescription || 'No detail'}"</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                   <span className="text-[8.5px] text-slate-500 font-extrabold uppercase block tracking-wider mb-0.5">Physical Identifiers</span>
                                   <p className="text-slate-300 font-semibold leading-normal capitalize italic">"{person.distinctFeatures || 'None listed'}"</p>
                                </div>
                             </div>

                             {/* Historic chronicles of rescue reports */}
                             <div className="space-y-2 border-t border-white/5 pt-4">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
                                   <MessageSquare size={11} className="text-red-400" /> Active Rescue Chronicle Updates ({person.rescueUpdates?.length || 0})
                                </p>

                                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                   {person.rescueUpdates && person.rescueUpdates.length > 0 ? (
                                     person.rescueUpdates.map((upd) => (
                                       <div key={upd.id} className="p-2.5 bg-[#0e1628]/80 rounded-xl border border-white/5 text-[9.5px] space-y-1">
                                          <div className="flex justify-between text-slate-500 font-bold font-mono uppercase text-[8px]">
                                             <span>🖊️ {upd.author}</span>
                                             <span>{new Date(upd.timestamp).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-slate-200 uppercase leading-snug">{upd.summary}</p>
                                          {upd.locationState && (
                                            <span className="inline-block text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                               @ {upd.locationState}
                                            </span>
                                          )}
                                       </div>
                                     ))
                                   ) : (
                                     <p className="text-[9px] text-slate-600 italic uppercase">No active field update transmissions logged. Search perimeters active.</p>
                                   )}
                                </div>
                             </div>

                             {/* Adding progress updates controls */}
                             {isAddingUpdate && (
                               <div className="p-4 bg-slate-900 rounded-3xl border border-red-500/10 space-y-3 mt-4 animate-in zoom-in-95 leading-normal">
                                  <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">Transmit Live Spotted Update</p>
                                  <div className="space-y-2">
                                     <input 
                                       type="text" 
                                       placeholder="Your identity code / name *" 
                                       value={newLogAuthor}
                                       onChange={(e) => setNewLogAuthor(e.target.value)}
                                       className="w-full bg-slate-950 border border-white/5 px-3 py-2 rounded-lg text-[10px] text-white"
                                     />
                                     <input 
                                       type="text" 
                                       placeholder="Current spotted area (e.g. Subway 5)" 
                                       value={newLogLocation}
                                       onChange={(e) => setNewLogLocation(e.target.value)}
                                       className="w-full bg-slate-950 border border-white/5 px-3 py-2 rounded-lg text-[10px] text-white"
                                     />
                                     <textarea 
                                       placeholder="Exact visible activity parameters seen..."
                                       rows={2}
                                       value={newLogSummary}
                                       onChange={(e) => setNewLogSummary(e.target.value)}
                                       className="w-full bg-slate-950 border border-white/5 px-3 py-2 rounded-lg text-[10px] text-white"
                                     />
                                  </div>
                                  <div className="flex gap-2 text-[9px] font-black uppercase">
                                     <button
                                       onClick={() => handleRescueUpdateSubmit(person.id)}
                                       disabled={submittingLog}
                                       className="flex-1 py-1.5 bg-red-600 text-white rounded hover:bg-slate-200 hover:text-black transition-colors"
                                     >
                                        Log Broadcast
                                     </button>
                                     <button
                                       onClick={() => { playSystemSound(); setActiveReportForUpdate(null); }}
                                       className="px-3 bg-white/5 text-slate-300 rounded"
                                     >
                                        Cancel
                                     </button>
                                  </div>
                                </div>
                             )}

                             {/* Editing Status Window inside Card */}
                             {isEditing && (
                               <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-white/5 space-y-3 animate-in fade-in duration-300">
                                  <p className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest block font-mono">Index Control Parameters</p>
                                  
                                  <div className="space-y-2 text-[10px]">
                                     <div>
                                        <label className="text-[8px] text-slate-500 uppercase block mb-1">Status Classification</label>
                                        <select
                                          value={editingStatus}
                                          onChange={(e) => setEditingStatus(e.target.value)}
                                          className="w-full bg-slate-900 border border-white/5 p-1.5 rounded text-white font-bold"
                                        >
                                           <option value="ACTIVE_SEARCH">ACTIVE SEARCH</option>
                                           <option value="SPOTTED">SPOTTED NEARBY</option>
                                           <option value="PLACED_SAFE">PLACED IN SHELTER</option>
                                           <option value="REUNIFIED">REUNIFIED SAFE</option>
                                           <option value="ARCHIVED">ARCHIVED CASE</option>
                                        </select>
                                     </div>

                                     <div>
                                        <label className="text-[8px] text-slate-500 uppercase block mb-1">Urgency Alert Threshold</label>
                                        <select
                                          value={editingUrgency}
                                          onChange={(e) => setEditingUrgency(e.target.value as any)}
                                          className="w-full bg-slate-900 border border-white/5 p-1.5 rounded text-white font-bold"
                                        >
                                           <option value="LOW">LOW</option>
                                           <option value="MEDIUM">MEDIUM</option>
                                           <option value="HIGH">HIGH</option>
                                           <option value="CRITICAL">CRITICAL</option>
                                        </select>
                                     </div>
                                  </div>

                                  <div className="flex gap-2 pt-2 text-[8.5px] font-black uppercase">
                                     <button
                                       onClick={() => handleStateUpdate(person.id)}
                                       className="flex-1 py-1.5 bg-indigo-600 text-white rounded hover:bg-white hover:text-black transition-colors"
                                     >
                                        Commit Case State
                                     </button>
                                     <button
                                       onClick={() => setEditingReportId(null)}
                                       className="px-2 bg-white/5 text-slate-300 rounded"
                                     >
                                        Cancel
                                     </button>
                                  </div>
                               </div>
                             )}

                          </div>
                       </div>

                       {/* Card Footer (Actions, Reporter Metadata) */}
                       <div className="p-6 border-t border-white/5 bg-[#050914] text-[9px] font-semibold text-slate-400 space-y-4">
                          <div className="flex justify-between items-center text-[10px]">
                             <div>
                                <span className="block text-[7.5px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Reported By</span>
                                <span className="text-white font-black uppercase">{person.reporterName}</span>
                             </div>
                             {person.reporterContact && (
                               <div className="text-right">
                                  <span className="block text-[7.5px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Emergency Contact</span>
                                  <span className="text-slate-300 font-mono">{person.reporterContact}</span>
                               </div>
                             )}
                          </div>

                          {/* Quick interactions */}
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                             {!isAddingUpdate && (
                               <button
                                 onClick={() => {
                                   playSystemSound();
                                   setActiveReportForUpdate(person.id);
                                   setNewLogAuthor('');
                                   setNewLogSummary('');
                                 }}
                                 className="flex-1 py-2 bg-red-600/10 hover:bg-red-650 text-red-400 font-bold uppercase rounded-xl tracking-wider text-[8.5px] border border-red-500/10 hover:text-white transition-all text-center"
                               >
                                  Broadcast Rescue Log
                               </button>
                             )}

                             <button
                               onClick={() => {
                                 playSystemSound();
                                 setEditingReportId(person.id);
                                 setEditingStatus(person.status);
                                 setEditingUrgency(person.urgency);
                               }}
                               className="px-3.5 py-2 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-xl text-[8.5px] font-bold uppercase"
                             >
                                Change Status
                             </button>

                             <button
                               onClick={() => handleDeleteCase(person.id)}
                               className="p-2 bg-red-950/20 hover:bg-red-650 border border-red-500/15 text-red-400 hover:text-white rounded-xl transition-colors"
                               title="Archive Secure File"
                             >
                                <Trash2 size={13} />
                             </button>
                          </div>
                       </div>

                    </div>
                  );
                })}

             </div>
           )}

        </div>
      )}


      {/* B. REPORT THREAT PORTAL FORM */}
      {activeSubTab === 'REPORT_FORM' && (
        <form onSubmit={handleFormSubmit} className="bg-zinc-950 p-10 rounded-[44px] border border-white/5 space-y-6 max-w-4xl mx-auto relative overflow-hidden animate-in zoom-in-95">
           <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/5 rounded-full blur-[45px]" />
           
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-red-400">Section 502 Clearance Target</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Index Missing Person Data Records</h3>
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Publish encrypted telemetry profile directly to MongoDB & asset server.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
              
              {/* Left Column: Identifiers */}
              <div className="space-y-4">
                 <p className="text-[9.5px] font-black text-red-400 uppercase tracking-widest">A. PERSON DESCRIPTION IDENTIFIERS</p>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Full Legal Name *</label>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter legal name"
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:border-red-500/40 outline-none transition-colors"
                      required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Age (Years)</label>
                       <input 
                         type="number" 
                         value={formAge}
                         onChange={(e) => setFormAge(e.target.value)}
                         placeholder="e.g. 15"
                         className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white outline-none"
                       />
                    </div>

                    <div>
                       <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Legal Sex / Gender</label>
                       <select
                         value={formGender}
                         onChange={(e) => setFormGender(e.target.value)}
                         className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold"
                       >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Undisclosed">Undisclosed</option>
                       </select>
                    </div>
                 </div>

                 {/* Photo dropzone widget */}
                 <div className="space-y-2">
                    <label className="text-[8.5px] text-slate-500 font-black uppercase block tracking-wider">Portrait Visual Asset Pair (Requires Cloudinary Pipe)</label>
                    <div 
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center cursor-pointer hover:border-red-500/40 bg-slate-950 transition-colors relative group"
                    >
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileChange} 
                         className="hidden" 
                         accept="image/*"
                       />
                       {formPhotoBase64 ? (
                         <div className="space-y-3">
                            <img src={formPhotoBase64} alt="Thumbnail preview" className="mx-auto h-32 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                            <p className="text-[9px] text-emerald-400 font-mono font-bold uppercase">{formPhotoName || 'image_payload.png'}</p>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setFormPhotoBase64(null); setFormPhotoName(null); }}
                              className="px-4 py-1.5 bg-red-600 text-white rounded text-[8.5px] uppercase font-bold"
                            >
                               Remove
                            </button>
                         </div>
                       ) : (
                         <div className="space-y-2">
                            <UploadCloud className="mx-auto text-slate-500 group-hover:text-red-400 w-8 h-8 transition-colors" />
                            <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Select Portrait Graphic</span>
                            <span className="block text-[8px] text-slate-600">Drag & Drop PNG, JPG or WEBP image</span>
                         </div>
                       )}
                    </div>
                 </div>

              </div>

              {/* Right Column: Tracking specs */}
              <div className="space-y-4">
                 <p className="text-[9.5px] font-black text-red-400 uppercase tracking-widest">B. CRISIS ENVELOPE PARAMETERS</p>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Last Seen Location Description *</label>
                    <input 
                      type="text" 
                      value={formLastLocation}
                      onChange={(e) => setFormLastLocation(e.target.value)}
                      placeholder="e.g. Exit check point lounge, sector 3 corridor"
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:border-red-500/40 outline-none transition-colors"
                      required
                    />
                 </div>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Last Seen Date & Exact Time</label>
                    <input 
                      type="datetime-local" 
                      value={formLastDateTime}
                      onChange={(e) => setFormLastDateTime(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white"
                    />
                 </div>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Clothing Description</label>
                    <input 
                      type="text" 
                      value={formClothing}
                      onChange={(e) => setFormClothing(e.target.value)}
                      placeholder="Coat color, shoes, bag identifiers..."
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white"
                    />
                 </div>

                 <div>
                    <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block tracking-wider">Distinct Features / Birthmarks / Accent</label>
                    <input 
                      type="text" 
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="Spectacles, birthmarks, scar landmarks..."
                      className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white"
                    />
                 </div>

                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                       <label className="text-[8.5px] text-slate-500 font-black uppercase mb-1.5 block block block">Threat Level Selection</label>
                       <select
                         value={formUrgency}
                         onChange={(e) => setFormUrgency(e.target.value as any)}
                         className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold"
                       >
                          <option value="LOW">LOWALERT</option>
                          <option value="MEDIUM">MEDIUM ALERT</option>
                          <option value="HIGH">HIGH ALERT</option>
                          <option value="CRITICAL">CRITICAL URGENT</option>
                       </select>
                    </div>
                 </div>

              </div>

           </div>

           {/* C. REPORTER IDENTITY INFORMATION */}
           <div className="p-6 bg-red-650/5 rounded-3xl border border-red-500/10 space-y-4">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono">C. REPORTER CONTACT DETAILS</span>
              
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-[8.5px] text-slate-500 font-extrabold uppercase mb-1 block">Your Name (Reporter) *</label>
                    <input 
                      type="text" 
                      value={formReporterName}
                      onChange={(e) => setFormReporterName(e.target.value)}
                      placeholder="Authorized contact name"
                      className="w-full bg-slate-900 border border-white/5 p-3 rounded-lg text-xs text-white"
                      required
                    />
                 </div>
                 <div>
                    <label className="text-[8.5px] text-slate-500 font-extrabold uppercase mb-1 block">Rescue Contact Vector (Phone / Email)</label>
                    <input 
                      type="text" 
                      value={formReporterContact}
                      onChange={(e) => setFormReporterContact(e.target.value)}
                      placeholder="e.g. +1 (555) 0192-332"
                      className="w-full bg-slate-900 border border-white/5 p-3 rounded-lg text-xs text-white"
                    />
                 </div>
              </div>
           </div>

           {/* Submit & Reset actions */}
           <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => { playSystemSound(); setActiveSubTab('EXPLORE'); }}
                className="px-6 py-3.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300"
              >
                 Cancel Action
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-3.5 bg-red-600 text-white hover:bg-slate-200 hover:text-black transition-colors rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-center shadow-md"
              >
                 {submitting ? (
                   <>
                      <RefreshCw size={12} className="animate-spin" /> Committing to ledger...
                   </>
                 ) : (
                   <>
                      <Send size={12} /> Index Case Records
                   </>
                 )}
              </button>
           </div>

        </form>
      )}

    </div>
  );
};

export default MissingPersonPortal;
