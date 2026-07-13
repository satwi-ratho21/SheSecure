import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Users, Mail, Phone, MapPin, AlertTriangle, CheckCircle2, 
  MoreVertical, Plus, Heart, HelpCircle, FileText, Send, Landmark, 
  Search, Eye, Share2, EyeOff, UserMinus, PlusCircle,
  UploadCloud, Car, ShieldCheck, Trash2, Clipboard, Globe, FileCheck,
  AlertCircle, Filter, Folder, UserCheck, RefreshCw, FileSearch, UserX
} from 'lucide-react';

// Pre-seeded Contacts
const INITIAL_CONTACTS: any[] = [
  {
    id: 'c1',
    name: 'Sarah Vanguard',
    relation: 'SISTER',
    phone: '+1 555-0101',
    isEmergencyContact: true,
    avatar: 'S',
    trustLevel: 'GUARDIAN',
    permissions: ['GPS', 'AUDIO', 'SOS_TRIGGER']
  },
  {
    id: 'c2',
    name: 'Elena Rossi',
    relation: 'PARTNER',
    phone: '+1 555-0102',
    isEmergencyContact: true,
    avatar: 'H',
    trustLevel: 'GUARDIAN',
    permissions: ['GPS', 'AUDIO']
  },
  {
    id: 'c3',
    name: 'Officer Davids',
    relation: 'TRUSTED_OFFICR',
    phone: '+1 555-0911',
    isEmergencyContact: false,
    avatar: 'O',
    trustLevel: 'RESPONDER',
    permissions: ['GPS']
  }
];

// Missing Persons Preseed
interface MissingPerson {
  id: string;
  name: string;
  age: number;
  lastSeenLocation: string;
  dateTime: string;
  description: string;
  contactNumber: string;
  status: 'MISSING' | 'FOUND' | 'SEARCHING';
}

const INITIAL_MISSING: MissingPerson[] = [
  {
    id: 'm1',
    name: 'Aria Thompson',
    age: 22,
    lastSeenLocation: 'Sector 4, near subway terminal',
    dateTime: '2026-05-25 21:00',
    description: 'Wearing dark green jacket, black jeans. Small scar on left cheek. 5’6”.',
    contactNumber: '+1 (555) 911-3040',
    status: 'SEARCHING'
  },
  {
    id: 'm2',
    name: 'Karla Winston',
    age: 19,
    lastSeenLocation: 'Downtown Commercial Corridor',
    dateTime: '2026-05-22 18:30',
    description: 'Blonde shoulder-length hair. Floral backpack. Last spotted on sector camera C5.',
    contactNumber: '+1 (555) 205-1950',
    status: 'MISSING'
  }
];

// Trafficking Incidents
interface TraffickingLog {
  id: string;
  location: string;
  description: string;
  timestamp: string;
  indicators: string[];
  status: 'SUBMITTED' | 'INVESTIGATING' | 'VERIFIED';
}

const INITIAL_TRAFFICKING: TraffickingLog[] = [
  {
    id: 't1',
    location: 'Border Crossing / Transit Term 3',
    description: 'Multiple young females accompanied by handlers moving with restricted behavior, restricted language cues, no individual documents.',
    timestamp: '2026-05-26 11:30',
    indicators: ['Controlled movement', 'Restricted communication', 'Lack of personal IDs'],
    status: 'INVESTIGATING'
  }
];

const VigilanteCommunity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CIRCLE' | 'RESCUE_MESH' | 'MISSING_HUB' | 'ANTI_TRAFFICKING'>('CIRCLE');

  // --- TRUST CIRCLE STATE ---
  const [contacts, setContacts] = useState<any[]>(INITIAL_CONTACTS);
  const [activeContact, setActiveContact] = useState<any | null>(INITIAL_CONTACTS[0]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('FRIEND');
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  // --- RESCUE MESH STATE ---
  const [meshReports, setMeshReports] = useState([
    { id: 'r1', location: 'Commercial Central Plaza', message: 'Visual shadow observed in unlit alley. Active security escort requested.', timestamp: '22:15', volunteerCount: 3, status: 'DISPATCHED' },
    { id: 'r2', location: 'North Subway Corridor', message: 'Localized SOS triggered. 2 volunteers en-route to check zone parameters.', timestamp: '22:04', volunteerCount: 2, status: 'STANDBY' }
  ]);
  const [newMeshMsg, setNewMeshMsg] = useState('');
  const [newMeshLoc, setNewMeshLoc] = useState('');

  // --- MISSING PERSONS STATE ---
  const [missingList, setMissingList] = useState<MissingPerson[]>(INITIAL_MISSING);
  const [showMissingForm, setShowMissingForm] = useState(false);
  const [missingName, setMissingName] = useState('');
  const [missingAge, setMissingAge] = useState('');
  const [missingLoc, setMissingLoc] = useState('');
  const [missingDesc, setMissingDesc] = useState('');
  const [missingPhone, setMissingPhone] = useState('');

  // --- ANTI-TRAFFICKING STATE ---
  const [traffickingList, setTraffickingList] = useState<TraffickingLog[]>(INITIAL_TRAFFICKING);
  const [showAntiForm, setShowAntiForm] = useState(false);
  const [traffLoc, setTraffLoc] = useState('');
  const [traffDesc, setTraffDesc] = useState('');
  const [checkedIndicators, setCheckedIndicators] = useState<string[]>([]);

  // --- ANTI-TRAFFICKING REAL SYSTEM EXPANSION ---
  const [traffCategory, setTraffCategory] = useState<'Child trafficking' | 'Forced movement' | 'Suspicious activity' | 'Kidnapping'>('Child trafficking');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'REPORT' | 'ADMIN_BOARD'>('REPORT');
  
  // Admin Filter States
  const [adminFilterCategory, setAdminFilterCategory] = useState<string>('ALL');
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('ALL');
  const [adminSearch, setAdminSearch] = useState('');
  
  // Actions
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'SUBMITTED' | 'INVESTIGATING' | 'REVIEWS_IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED'>('INVESTIGATING');
  const [editNotes, setEditNotes] = useState('');
  const [editUrgency, setEditUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchApiReports = async () => {
    try {
      const response = await fetch('/api/trafficking/reports');
      const data = await response.json();
      if (data.success && data.reports) {
        setApiReports(data.reports);
      }
    } catch (e) {
      console.error("Failed to load live reports from MongoDB instance:", e);
    }
  };

  useEffect(() => {
    fetchApiReports();
    // Intermittent pooling for live dashboards
    const t = setInterval(fetchApiReports, 5000);
    return () => clearInterval(t);
  }, []);

  const traffickingIndicatorsList = [
    "Controlled / restricted movements under escort",
    "Unable to speak or communicate independently",
    "Possession of documents restricted by other parties",
    "Signs of extreme stress, anxiety, or physical coercion",
    "Working in lock-and-key setups or monitored venues"
  ];

  // Helper Beep
  const playPulseSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 520;
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  // Handler: Add Trust Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const newContact: any = {
      id: Math.random().toString(),
      name: newContactName,
      relation: newContactRelation as any,
      phone: newContactPhone,
      isEmergencyContact: true,
      avatar: newContactName.charAt(0).toUpperCase(),
      trustLevel: 'GUARDIAN',
      permissions: ['GPS', 'AUDIO']
    };
    setContacts([...contacts, newContact]);
    setActiveContact(newContact);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContactForm(false);
    playPulseSound();
  };

  const handleRemoveContact = (id: string) => {
    const next = contacts.filter(c => c.id !== id);
    setContacts(next);
    if (activeContact?.id === id) {
      setActiveContact(next[0] || null);
    }
  };

  // Handler: Add Mesh Report
  const handleAddMeshReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeshMsg || !newMeshLoc) return;
    const newRep = {
      id: Math.random().toString(),
      location: newMeshLoc,
      message: newMeshMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      volunteerCount: 0,
      status: 'STANDBY'
    };
    setMeshReports([newRep, ...meshReports]);
    setNewMeshMsg('');
    setNewMeshLoc('');
    playPulseSound();
  };

  // Handler: Add Missing Person
  const handleAddMissingPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingName || !missingLoc || !missingDesc) return;
    const newMissing: MissingPerson = {
      id: Math.random().toString(),
      name: missingName,
      age: parseInt(missingAge) || 20,
      lastSeenLocation: missingLoc,
      dateTime: new Date().toISOString().substring(0, 16).replace('T', ' '),
      description: missingDesc,
      contactNumber: missingPhone || '+1 (555) 911-3040',
      status: 'SEARCHING'
    };
    setMissingList([newMissing, ...missingList]);
    setMissingName('');
    setMissingAge('');
    setMissingLoc('');
    setMissingDesc('');
    setMissingPhone('');
    setShowMissingForm(false);
    playPulseSound();
  };

  // --- LIVE HUMAN TRAFFICKING ACTIONS (MONGODB + CLOUDINARY INTEGRATION) ---

  // Helper reader to convert file upload to Base64
  const processImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Invalid format! Please upload an image file (PNG/JPG/WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
      setPhotoName(file.name);
      playPulseSound();
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Drag and drop events for photo upload compliance
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleAddTrafficking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traffLoc || !traffDesc) {
      alert("Please provide the incident location and descriptive details.");
      return;
    }

    setSubmittingReport(true);
    playPulseSound();

    try {
      const payload = {
        category: traffCategory,
        location: traffLoc,
        vehicleNumber: vehicleNumber || "None specified",
        description: traffDesc,
        photoBase64: photoBase64 || "",
        isAnonymous,
        reporterName: isAnonymous ? "Anonymous" : reporterName,
        reporterContact: isAnonymous ? "None (Tor Routed)" : reporterContact,
        urgency
      };

      const response = await fetch('/api/trafficking/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        alert("En-Suite Encrypted Case File has been safely broadcasted to the Secure MongoDB Vault and media buffered through Cloudinary CDN successfully!");
        
        // Reset states
        setTraffLoc('');
        setTraffDesc('');
        setVehicleNumber('');
        setPhotoBase64(null);
        setPhotoName(null);
        setIsAnonymous(true);
        setReporterName('');
        setReporterContact('');
        setUrgency('HIGH');
        setShowAntiForm(false);
        
        // Reload list
        fetchApiReports();
      } else {
        alert(`Failed to store case report in MongoDB: ${data.error || "Unknown server issue"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network routing error while persisting case details.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleUpdateReport = async (reportId: string) => {
    try {
      playPulseSound();
      const response = await fetch(`/api/trafficking/report/${reportId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editNotes,
          urgency: editUrgency
        })
      });

      if (response.ok) {
        setEditingReportId(null);
        setEditNotes('');
        fetchApiReports();
      } else {
        alert("Error modifying incident records in the database.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(`Are you absolutely confident you wish to archive and delete critical log ${reportId}?`)) return;
    try {
      playPulseSound();
      const response = await fetch(`/api/trafficking/report/${reportId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchApiReports();
      } else {
        alert("Could not process report deletion.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleIndicatorCheckbox = (ind: string) => {
    if (checkedIndicators.includes(ind)) {
      setCheckedIndicators(checkedIndicators.filter(i => i !== ind));
    } else {
      setCheckedIndicators([...checkedIndicators, ind]);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-44">
      
      {/* HEADER BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white border border-white/10 shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Community Mesh</h2>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono">Crowdsourced Vigilance & Decentralized Rescue</p>
        </div>

        {/* MESH CAP Badge */}
        <div className="p-3 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-2xl flex items-center gap-3">
           <Heart className="w-4 h-4 text-indigo-400 animate-pulse" />
           <p className="text-[9px] font-black tracking-widest uppercase text-white mono">4,120 Volunteers On Duty</p>
        </div>
      </header>

      {/* TABS CONTROLLER */}
      <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-3xl flex flex-wrap gap-2">
         {[
           { id: 'CIRCLE', label: 'Trust Circle', icon: Shield },
           { id: 'RESCUE_MESH', label: 'Rescue network', icon: Heart },
           { id: 'MISSING_HUB', label: 'Missing Persons', icon: Search },
           { id: 'ANTI_TRAFFICKING', label: 'Anti-Trafficking', icon: AlertTriangle }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex-1 min-w-[130px] py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
               activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
             }`}
           >
              <tab.icon className="w-4 h-4" />
              {tab.label}
           </button>
         ))}
      </div>

      {/* --- RENDER TAB: TRUST CIRCLE --- */}
      {activeTab === 'CIRCLE' && (
        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
               <header className="flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Your Circle</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase mono tracking-widest">Verified Guardians</p>
                  </div>
                  <button 
                    onClick={() => setShowAddContactForm(!showAddContactForm)}
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  >
                     <Plus size={18} />
                  </button>
               </header>

               {showAddContactForm && (
                 <form onSubmit={handleAddContact} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Introduce Node</p>
                    <div className="space-y-3">
                       <input 
                         type="text" 
                         placeholder="Guardian Name..."
                         value={newContactName}
                         onChange={(e) => setNewContactName(e.target.value)}
                         className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs font-semibold text-white outline-none"
                         required
                       />
                       <input 
                         type="tel" 
                         placeholder="Phone +1 555-..."
                         value={newContactPhone}
                         onChange={(e) => setNewContactPhone(e.target.value)}
                         className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs font-semibold text-white outline-none"
                         required
                       />
                       <select 
                         value={newContactRelation} 
                         onChange={(e) => setNewContactRelation(e.target.value)}
                         className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs font-black text-slate-400 outline-none"
                       >
                         <option value="SISTER">SISTER</option>
                         <option value="BROTHER">BROTHER</option>
                         <option value="PARENT">PARENT</option>
                         <option value="SPOUSE">SPOUSE</option>
                         <option value="FRIEND">FRIEND</option>
                         <option value="RESCUER">TRUSTED CIVILIAN</option>
                       </select>
                       <button 
                         type="submit"
                         className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                       >
                         Authorize Guard Node
                       </button>
                    </div>
                 </form>
               )}

               <div className="space-y-3">
                  {contacts.map(contact => (
                    <button 
                      key={contact.id}
                      onClick={() => setActiveContact(contact)}
                      className={`w-full p-4 rounded-3xl border transition-all flex items-center gap-4 text-left ${
                        activeContact?.id === contact.id ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-lg font-black text-white">
                         {contact.avatar}
                      </div>
                      <div className="flex-1">
                         <p className="font-black text-white text-xs uppercase tracking-tight">{contact.name}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{contact.relation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black ${
                        contact.trustLevel === 'GUARDIAN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                         {contact.trustLevel}
                      </span>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-zinc-950 p-10 rounded-[48px] border border-white/5 flex flex-col justify-between">
             {activeContact ? (
               <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <header className="flex justify-between items-start border-b border-white/5 pb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                           {activeContact.avatar}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-white uppercase tracking-tight">{activeContact.name}</h4>
                           <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mt-0.5">{activeContact.relation} • SYSTEM VERIFIED</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleRemoveContact(activeContact.id)}
                       className="p-3 bg-red-600/10 border border-red-500/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                     >
                        <UserMinus size={18} />
                     </button>
                  </header>

                  <div className="grid md:grid-cols-2 gap-4">
                     {[
                       { label: 'Live GPS Mapping', active: true, desc: 'Receive secure continuous telemetry stream on SOS events' },
                       { label: 'Ambient Audio Streaming', active: activeContact.permissions.includes('AUDIO'), desc: 'Enforce remote microphone routing and voice classification triggers' },
                       { label: 'Remote Emergency Force', active: activeContact.permissions.includes('SOS_TRIGGER'), desc: 'Authorize this contact to force-push an SOS countdown from their terminal' }
                     ].map((perm, idx) => (
                       <div key={idx} className={`p-6 rounded-3xl border ${perm.active ? 'bg-indigo-600/5 border-indigo-500/20 text-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-xs font-black uppercase tracking-wide">{perm.label}</p>
                             <span className={`text-[8px] px-2 py-0.5 rounded font-black ${perm.active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                {perm.active ? 'GRANTED' : 'REVOKED'}
                             </span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-tight uppercase mono font-semibold">{perm.desc}</p>
                       </div>
                     ))}
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mono">Send Covert Signal</p>
                     <div className="flex flex-wrap gap-2">
                        <a href={`tel:${activeContact.phone}`} className="flex-1 py-4 bg-[#0a0f1d] border border-white/10 text-center rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                           <Phone size={14} /> Voice Call
                        </a>
                        <button className="flex-1 py-4 bg-[#0a0f1d] border border-white/10 text-center rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                           <Mail size={14} /> SMS Verification
                        </button>
                        <button className="flex-1 py-4 bg-red-600/20 border border-red-500/10 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                           <AlertTriangle size={14} /> Ping Alarm
                        </button>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <Heart className="w-16 h-16 mb-4 text-slate-500" />
                  <p className="text-xs uppercase font-mono text-slate-400 font-bold">Add verified contacts to unlock tracking telemetry routines</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- RENDER TAB: RESCUE MESH --- */}
      {activeTab === 'RESCUE_MESH' && (
        <div className="grid lg:grid-cols-12 gap-10">
           
           <div className="lg:col-span-5 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6 flex flex-col justify-between">
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Issue Mesh Beacon</h3>
                 <p className="text-xs font-semibold text-slate-500 leading-relaxed uppercase mono">Broadcast local neighborhood anomalies or secure transit requests directly to nearby volunteer guardians.</p>
              </div>

              <form onSubmit={handleAddMeshReport} className="space-y-4 mt-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono mb-1 block">Vanguard Grid Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sector 4 commercial lobby..."
                      value={newMeshLoc}
                      onChange={(e) => setNewMeshLoc(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-xs font-semibold text-white outline-none"
                      required
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono mb-1 block">Context Alert Details</label>
                    <textarea 
                      rows={3}
                      placeholder="Provide critical pointers, visibility issues, presence of other individuals..."
                      value={newMeshMsg}
                      onChange={(e) => setNewMeshMsg(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-xs font-semibold text-white outline-none"
                      required
                    />
                 </div>
                 <button 
                   type="submit"
                   className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                 >
                   Broadcast Alert Matrix
                 </button>
              </form>
           </div>

           <div className="lg:col-span-7 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-6">
              <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                 <Shield className="text-indigo-400 animate-pulse" /> Local Distress Feed
              </h4>

              <div className="space-y-4">
                 {meshReports.map(rep => (
                   <div key={rep.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider">{rep.location}</p>
                            <p className="text-[8px] font-mono text-slate-500 mt-0.5">Broadcasted at {rep.timestamp}</p>
                         </div>
                         <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-[8px] font-black rounded-full">
                            {rep.status}
                         </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium italic">"{rep.message}"</p>
                      
                      <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5">
                         <span className="text-[9px] font-mono text-slate-400 uppercase font-black">{rep.volunteerCount} Responders Intercepting</span>
                         <button 
                           onClick={() => {
                             playPulseSound();
                             setMeshReports(meshReports.map(m => m.id === rep.id ? { ...m, volunteerCount: m.volunteerCount + 1 } : m));
                           }}
                           className="px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-wider hover:bg-indigo-500"
                         >
                            Join Mission
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>
      )}

      {/* --- RENDER TAB: MISSING PERSONS --- */}
      {activeTab === 'MISSING_HUB' && (
        <div className="space-y-10 animate-in fade-in">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Missing Person Registry</h3>
                 <p className="text-xs font-semibold text-slate-500 uppercase mono">Search coordination profiles and digital trace checkpoints.</p>
              </div>
              <button 
                onClick={() => setShowMissingForm(!showMissingForm)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 hover:text-black transition-all"
              >
                 + File Search Profile
              </button>
           </div>

           {showMissingForm && (
             <form onSubmit={handleAddMissingPerson} className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-6">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Missing Subject Information</p>
                   <input 
                     type="text" 
                     placeholder="Subject Full Name..." 
                     value={missingName} 
                     onChange={(e) => setMissingName(e.target.value)}
                     className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white placeholder-slate-600 font-semibold"
                     required
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        placeholder="Age..." 
                        value={missingAge} 
                        onChange={(e) => setMissingAge(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white"
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="Crisis Phone contact..." 
                        value={missingPhone} 
                        onChange={(e) => setMissingPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white"
                      />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Last Seen Location & Sector..." 
                     value={missingLoc} 
                     onChange={(e) => setMissingLoc(e.target.value)}
                     className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white placeholder-slate-600 font-semibold"
                     required
                   />
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Description & Distinguishing Features</p>
                   <textarea 
                     rows={3}
                     placeholder="Hair color, clothes when spotted, visual identifiers, height details..."
                     value={missingDesc}
                     onChange={(e) => setMissingDesc(e.target.value)}
                     className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white"
                     required
                   />
                   <button 
                     type="submit" 
                     className="w-full py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest"
                   >
                      Generate Digital Poster & Publish
                   </button>
                </div>
             </form>
           )}

           {/* LIST GRID */}
           <div className="grid md:grid-cols-2 gap-6">
              {missingList.map(person => (
                <div key={person.id} className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden hover:border-indigo-500/30 transition-all justify-between">
                   <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{person.name}</h4>
                            <span className="text-xs font-bold text-slate-500 mono bg-slate-900 px-3 py-0.5 rounded-full">{person.age} Yrs</span>
                         </div>
                         <p className="text-[9px] text-[#818cf8] font-black uppercase tracking-widest mono">CHECKPOINT: {person.lastSeenLocation}</p>
                      </div>

                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase italic">"{person.description}"</p>
                      
                      <div className="flex gap-4 border-t border-white/5 pt-4 text-[9px] text-slate-500">
                         <span>Time: {person.dateTime}</span>
                         <span>Rescue Line: {person.contactNumber}</span>
                      </div>
                   </div>

                   <div className="flex flex-col justify-between items-end gap-4 border-l border-white/5 pl-4 flex-shrink-0">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${
                        person.status === 'FOUND' ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-400'
                      }`}>
                         {person.status}
                      </span>
                      <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-indigo-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 px-4">
                         <Share2 size={12} /> Share Hub
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- RENDER TAB: ANTI-TRAFFICKING --- */}
      {activeTab === 'ANTI_TRAFFICKING' && (
        <div className="space-y-10 animate-in fade-in duration-300">
           
           {/* SUB-TABS INTERFACE */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-4 rounded-3xl border border-white/5">
              <div className="flex flex-wrap gap-2">
                 <button 
                   onClick={() => { playPulseSound(); setActiveSubTab('REPORT'); }}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'REPORT' ? 'bg-red-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                    <AlertTriangle className="w-3.5 h-3.5" /> File Incident Report
                 </button>
                 <button 
                   onClick={() => { playPulseSound(); setActiveSubTab('ADMIN_BOARD'); }}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'ADMIN_BOARD' ? 'bg-indigo-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                    <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Admin Review Dashboard ({apiReports.length})
                 </button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                 <span>MongoDB connection: ACTIVE</span>
              </div>
           </div>

           {/* A. REPORT THREAT CLIENT SCREEN */}
           {activeSubTab === 'REPORT' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                 
                 {/* REPORT PANEL FORM */}
                 <div className="lg:col-span-7 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[45px]" />
                    
                    <div className="space-y-1">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                          <Shield className="text-red-500" /> Secure Protocol Upload
                       </h4>
                       <p className="text-xs text-slate-500 uppercase font-bold mono">All transmissions are routed through end-to-end encrypted tunnels.</p>
                    </div>

                    <form onSubmit={handleAddTrafficking} className="space-y-6">
                       
                       {/* Row 1: Category selections */}
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Selected Category Group</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {(['Child trafficking', 'Forced movement', 'Suspicious activity', 'Kidnapping'] as const).map((cat) => {
                               const selected = traffCategory === cat;
                               return (
                                 <button
                                   type="button"
                                   key={cat}
                                   onClick={() => { playPulseSound(); setTraffCategory(cat); }}
                                   className={`py-3 px-2 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all text-center ${
                                     selected ? 'bg-red-600/15 border-red-500 text-red-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
                                   }`}
                                 >
                                    {cat}
                                 </button>
                               );
                             })}
                          </div>
                       </div>

                       {/* Row 2: Location and Vehicle Number */}
                       <div className="grid md:grid-cols-2 gap-4">
                          <div>
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Incident location *</label>
                             <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="e.g. Sector 8 terminal, flight gate C"
                                  value={traffLoc}
                                  onChange={(e) => setTraffLoc(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/5 pl-10 pr-4 py-3.5 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:border-red-500 transition-colors"
                                  required
                                />
                             </div>
                          </div>

                          <div>
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Vehicle Number / Spot Details</label>
                             <div className="relative">
                                <Car className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="e.g. CO-421-VAN (Dark SUV)"
                                  value={vehicleNumber}
                                  onChange={(e) => setVehicleNumber(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/5 pl-10 pr-4 py-3.5 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:border-red-500 transition-colors"
                                />
                             </div>
                          </div>
                       </div>

                       {/* Row 3: Photo Upload Drag & Drop Area */}
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Evidence Attachment (Cloudinary Pipeline)</label>
                          <div 
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="relative border-2 border-dashed border-white/5 rounded-2xl p-6 text-center cursor-pointer hover:border-red-500/30 transition-all bg-[#0a0f1d] group"
                          >
                             <input 
                               type="file" 
                               ref={fileInputRef} 
                               onChange={handleFileChange} 
                               className="hidden" 
                               accept="image/*"
                             />
                             {photoBase64 ? (
                               <div className="space-y-3">
                                  <img src={photoBase64} alt="Upload preview" className="mx-auto h-32 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                                  <p className="text-[9px] text-green-400 font-mono font-bold uppercase">{photoName || 'attachment_ready.png'}</p>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); setPhotoBase64(null); setPhotoName(null); }}
                                    className="px-4 py-1.5 bg-red-600/30 hover:bg-red-600 text-white text-[9px] font-black uppercase rounded-lg transition-colors"
                                  >
                                     Remove Image
                                  </button>
                               </div>
                             ) : (
                               <div className="space-y-2">
                                  <UploadCloud className="mx-auto text-slate-500 group-hover:text-red-400 w-8 h-8 transition-colors" />
                                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Drag & Drop Incriminating Image</span>
                                  <span className="block text-[8px] text-slate-500">Or click to select local evidence file (PNG/JPG/WEBP)</span>
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Row 4: Context details */}
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Activity Context / Handlers Description *</label>
                          <textarea
                            rows={4}
                            placeholder="Describe unverified credentials holding, restricted movement cues, extreme signs of duress, or suspicious escort behavior..."
                            value={traffDesc}
                            onChange={(e) => setTraffDesc(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-xs text-white placeholder-slate-600"
                            required
                          />
                       </div>

                       {/* Row 5: Anonymous toggle and parameters */}
                       <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-4">
                          <button
                            type="button"
                            onClick={() => { playPulseSound(); setIsAnonymous(!isAnonymous); }}
                            className="flex items-center gap-3 w-full justify-between"
                          >
                             <div className="flex items-center gap-2 text-left">
                                <div className={`p-1.5 rounded-lg ${isAnonymous ? 'bg-red-500/25 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                                   <EyeOff className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-white uppercase tracking-tight">Report Anonymously</p>
                                   <p className="text-[8px] text-slate-500 font-semibold uppercase">Strip device and reporter fingerprint telemetry from MongoDB node.</p>
                                </div>
                             </div>
                             <div className={`w-5 h-5 rounded border ${isAnonymous ? 'bg-red-600 border-red-500 flex items-center justify-center' : 'border-slate-700'}`}>
                                {isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                             </div>
                          </button>

                          {!isAnonymous && (
                            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-4">
                               <div>
                                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Your Name</label>
                                  <input 
                                    type="text" 
                                    placeholder="Enter your name" 
                                    value={reporterName} 
                                    onChange={(e) => setReporterName(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/5 p-3 rounded-lg text-xs text-white placeholder-slate-600"
                                  />
                               </div>
                               <div>
                                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Your Crisis Contact Info</label>
                                  <input 
                                    type="text" 
                                    placeholder="Phone or email" 
                                    value={reporterContact} 
                                    onChange={(e) => setReporterContact(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/5 p-3 rounded-lg text-xs text-white placeholder-slate-600"
                                  />
                               </div>
                            </div>
                          )}
                       </div>

                       {/* Row 6: Emergency Urgency levels */}
                       <div className="flex md:items-center justify-between gap-4 flex-col md:flex-row pb-2">
                          <div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Threat Level Urgency</span>
                             <div className="flex gap-1.5">
                                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => {
                                  const select = urgency === level;
                                  return (
                                    <button
                                      type="button"
                                      key={level}
                                      onClick={() => { playPulseSound(); setUrgency(level); }}
                                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all ${
                                        select ? 'bg-red-600 border-red-500 text-white font-black' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                       {level}
                                    </button>
                                  );
                                })}
                             </div>
                          </div>

                          <button 
                            type="submit"
                            disabled={submittingReport}
                            className="px-8 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-200 hover:text-black transition-all flex items-center gap-2 justify-center"
                          >
                             {submittingReport ? (
                               <>
                                  <RefreshCw size={12} className="animate-spin" /> Publishing...
                                </>
                             ) : (
                               <>
                                  <Send size={12} /> Encrypt & Report Threat
                               </>
                             )}
                          </button>
                       </div>

                    </form>
                 </div>

                 {/* RESOURCES / INFO BOARD */}
                 <div className="lg:col-span-5 space-y-6">
                    <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-4">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Anti-Trafficking Ledger Stats</p>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">MongoDB Registry</h3>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[8px] text-slate-500 font-bold uppercase">Total Logged</p>
                             <p className="text-2xl font-black text-white font-mono mt-1">{apiReports.length}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[8px] text-red-400 font-bold uppercase">Critical Spikes</p>
                             <p className="text-2xl font-black text-red-400 font-mono mt-1">
                                {apiReports.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length}
                             </p>
                          </div>
                       </div>

                       <div className="space-y-2 border-t border-white/5 pt-4">
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                             <span>Child trafficking</span>
                             <span className="font-mono">{apiReports.filter(r => r.category === 'Child trafficking').length}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                             <span>Forced movement</span>
                             <span className="font-mono">{apiReports.filter(r => r.category === 'Forced movement').length}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                             <span>Suspicious Activity</span>
                             <span className="font-mono">{apiReports.filter(r => r.category === 'Suspicious activity').length}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                             <span>Kidnapping</span>
                             <span className="font-mono">{apiReports.filter(r => r.category === 'Kidnapping').length}</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-4">
                       <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mono">Indicators Checklist</h4>
                       <p className="text-[11px] text-zinc-400 leading-relaxed uppercase">Look for these key indicators when surveying transit and checkpoint terminals:</p>
                       <ul className="space-y-2 text-[10px] text-slate-300 font-bold uppercase list-disc list-inside">
                          <li>Restriction of passport / personal identification storage</li>
                          <li>Guarded movement and restriction of conversational liberty</li>
                          <li>Physical fatigue, dehydration, extreme anxiety under escort</li>
                          <li>Lack of personal luggage components</li>
                       </ul>
                    </div>
                 </div>

              </div>
           )}

           {/* B. ADMIN REVIEW DASHBOARD VIEW */}
           {activeSubTab === 'ADMIN_BOARD' && (
              <div className="space-y-6">
                 
                 {/* ADMIN SEARCH FILTERS */}
                 <div className="bg-zinc-950 p-6 rounded-[30px] border border-white/5 grid md:grid-cols-4 gap-4 items-center animate-in slide-in-from-top-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">Keyword / Vehicle filter</label>
                       <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input 
                            type="text"
                            placeholder="Type to search..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            className="bg-slate-900 border border-white/5 pl-9 pr-4 py-2 w-full rounded-xl text-xs text-white"
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">Category classification</label>
                       <select
                         value={adminFilterCategory}
                         onChange={(e) => setAdminFilterCategory(e.target.value)}
                         className="bg-slate-900 border border-white/5 p-2 w-full rounded-xl text-xs text-white uppercase font-bold"
                       >
                          <option value="ALL">ALL CATEGORIES</option>
                          <option value="Child trafficking">Child trafficking</option>
                          <option value="Forced movement">Forced movement</option>
                          <option value="Suspicious activity">Suspicious activity</option>
                          <option value="Kidnapping">Kidnapping</option>
                       </select>
                    </div>

                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">Case status</label>
                       <select
                         value={adminFilterStatus}
                         onChange={(e) => setAdminFilterStatus(e.target.value)}
                         className="bg-slate-900 border border-white/5 p-2 w-full rounded-xl text-xs text-white uppercase font-bold"
                       >
                          <option value="ALL">ALL STATUSES</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="REVIEWS_IN_PROGRESS">REVIEWS_IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                       </select>
                    </div>

                    <div className="flex md:justify-end">
                       <button
                         onClick={() => { playPulseSound(); fetchApiReports(); }}
                         className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                       >
                          <RefreshCw size={12} /> Sync Database
                       </button>
                    </div>
                 </div>

                 {/* LIST CORE LEDGER */}
                 <div className="space-y-4">
                    {apiReports.filter(report => {
                      if (adminFilterCategory !== 'ALL' && report.category !== adminFilterCategory) return false;
                      if (adminFilterStatus !== 'ALL' && report.status !== adminFilterStatus) return false;
                      if (adminSearch.trim() !== '') {
                        const word = adminSearch.toLowerCase();
                        const textMatch = report.location.toLowerCase().includes(word) || 
                                          report.description.toLowerCase().includes(word) || 
                                          report.vehicleNumber.toLowerCase().includes(word) ||
                                          report.id.toLowerCase().includes(word);
                        if (!textMatch) return false;
                      }
                      return true;
                    }).map((report) => {
                      const isEditing = editingReportId === report.id;
                      
                      return (
                        <div key={report.id} className="bg-zinc-950 p-8 rounded-[40px] border border-white/5 grid md:grid-cols-12 gap-6 relative overflow-hidden">
                           
                           {/* Priority color band */}
                           <div className={`absolute top-0 left-0 w-1.5 h-full ${
                             report.urgency === 'CRITICAL' ? 'bg-red-600' :
                             report.urgency === 'HIGH' ? 'bg-amber-500' :
                             report.urgency === 'MEDIUM' ? 'bg-yellow-500' : 'bg-slate-600'
                           }`} />

                           {/* Left side: Photo & details */}
                           <div className="md:col-span-8 space-y-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-mono bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-slate-300 font-bold">
                                          {report.id}
                                       </span>
                                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                         report.urgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                                       }`}>
                                          {report.urgency} Priority
                                       </span>
                                       <span className="text-[9px] text-[#818cf8] font-bold uppercase tracking-wider">
                                          {report.category}
                                       </span>
                                    </div>
                                    <h4 className="text-xl font-black text-white mt-1 uppercase tracking-tight">{report.location}</h4>
                                 </div>
                                 <span className="text-[9px] text-slate-500 font-mono">{new Date(report.timestamp).toLocaleString()}</span>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed uppercase italic">"{report.description}"</p>

                              {/* Vehicles and reporter metadata */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-b border-white/5 py-3 text-[10px] font-bold uppercase text-slate-400">
                                 <div>
                                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Vehicle Index</span>
                                    <span className="text-white font-mono">{report.vehicleNumber}</span>
                                 </div>
                                 <div>
                                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Reporter status</span>
                                    <span className="text-slate-300">
                                       {report.isAnonymous ? '🔒 ANONYMOUS SENDER' : `👤 ${report.reporterName}`}
                                    </span>
                                 </div>
                                 <div>
                                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Contact Vector</span>
                                    <span className="text-slate-300">{report.reporterContact}</span>
                                 </div>
                              </div>

                              {/* Admin notes present */}
                              {report.adminNotes && (
                                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-1">
                                   <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active Dispatcher Notes:</div>
                                   <p className="text-xs text-indigo-200 italic font-medium">"{report.adminNotes}"</p>
                                </div>
                              )}
                           </div>

                           {/* Right side: Image preview & Status controls */}
                           <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-900 h-32">
                                 <img 
                                   src={report.photoUrl} 
                                   alt="Evidence" 
                                   className="w-full h-full object-cover" 
                                   referrerPolicy="no-referrer"
                                 />
                                 <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400">
                                    Cloudinary Cache
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Current Status</span>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${
                                      report.status === 'RESOLVED' ? 'bg-emerald-600 text-white' :
                                      report.status === 'INVESTIGATING' ? 'bg-amber-600 text-white' :
                                      report.status === 'REVIEWS_IN_PROGRESS' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                                    }`}>
                                       {report.status}
                                    </span>
                                 </div>

                                 {/* Edit toggles */}
                                 {isEditing ? (
                                   <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3 mt-2 animate-in zoom-in-95">
                                      <div>
                                         <label className="text-[8px] font-black text-slate-500 block mb-1 uppercase">Update Status</label>
                                         <select
                                           value={editStatus}
                                           onChange={(e) => setEditStatus(e.target.value as any)}
                                           className="bg-slate-900 border border-white/5 p-1.5 w-full rounded text-[10px] text-white uppercase font-bold"
                                         >
                                            <option value="SUBMITTED">SUBMITTED</option>
                                            <option value="INVESTIGATING">INVESTIGATING</option>
                                            <option value="REVIEWS_IN_PROGRESS">REVIEWS_IN_PROGRESS</option>
                                            <option value="RESOLVED">RESOLVED</option>
                                            <option value="ARCHIVED">ARCHIVED</option>
                                         </select>
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black text-slate-500 block mb-1 uppercase">Notes</label>
                                         <textarea
                                           rows={2}
                                           placeholder="Interpol notification codes, dispatch coordinates..."
                                           value={editNotes}
                                           onChange={(e) => setEditNotes(e.target.value)}
                                           className="bg-slate-900 border border-white/5 p-1.5 w-full rounded text-[10px] text-white"
                                         />
                                      </div>
                                      <div className="flex gap-2">
                                         <button
                                           onClick={() => handleUpdateReport(report.id)}
                                           className="flex-1 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded transition-all"
                                         >
                                            Save Status
                                         </button>
                                         <button
                                           onClick={() => setEditingReportId(null)}
                                           className="px-2 py-1.5 bg-white/5 text-slate-300 text-[9px] font-black uppercase rounded"
                                         >
                                            Cancel
                                         </button>
                                      </div>
                                   </div>
                                 ) : (
                                   <div className="flex gap-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingReportId(report.id);
                                          setEditStatus(report.status);
                                          setEditNotes(report.adminNotes || '');
                                          setEditUrgency(report.urgency);
                                          playPulseSound();
                                        }}
                                        className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[9px] font-black uppercase rounded-lg tracking-wider"
                                      >
                                         Manage Case
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReport(report.id)}
                                        className="px-3 py-2 bg-red-650 hover:bg-red-600 text-red-400 border border-red-500/20 rounded-lg"
                                        title="Delete Log"
                                      >
                                         <Trash2 size={12} />
                                      </button>
                                   </div>
                                 )}
                              </div>

                           </div>
                        </div>
                      );
                    })}
                    
                    {apiReports.length === 0 && (
                      <div className="text-center p-12 bg-zinc-950 border border-white/5 rounded-[40px] text-slate-500 uppercase font-black tracking-widest textxs space-y-4">
                         <UserX className="mx-auto w-12 h-12 text-slate-600 animate-bounce" />
                         <span>No trafficking cases indexed in local MongoDB instance.</span>
                      </div>
                    )}
                 </div>
              </div>
           )}

        </div>
      )}

    </div>
  );
};

export default VigilanteCommunity;
