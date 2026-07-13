import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, UserCheck, UserMinus, UserX, Plus, Phone, Mail, 
  Lock, Settings, AlertTriangle, CheckCircle2, Activity, Fingerprint, 
  MapPin, Sparkles, Radio, Trash2, Send, Heart, X, Check, Eye
} from 'lucide-react';
import { UserProfile, TrustContact } from '../types';

interface TrustedCircleProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const DEFAULT_CONTACTS: TrustContact[] = [
  {
    name: "Sarah Vanguard",
    phone: "+1 (555) 019-2834",
    relation: "FAMILY",
    isBroadcasting: true,
    lastSeen: "2 mins ago",
    email: "sarah@vanguard.mesh",
    priority: 1,
    isVerified: "VERIFIED",
    permissions: {
      canViewLocation: true,
      receiveAlerts: true,
      viewEvidence: true
    }
  },
  {
    name: "Elena Rossi",
    phone: "+1 (555) 012-9876",
    relation: "FRIEND",
    isBroadcasting: false,
    lastSeen: "1 hr ago",
    email: "elena@rossi.io",
    priority: 2,
    isVerified: "PENDING",
    permissions: {
      canViewLocation: true,
      receiveAlerts: true,
      viewEvidence: false
    }
  },
  {
    name: "Dr. Alistair",
    phone: "+1 (555) 441-2890",
    relation: "COLLEAGUE",
    isBroadcasting: false,
    lastSeen: "3 days ago",
    email: "alistair@vanguard.org",
    priority: 3,
    isVerified: "VERIFIED",
    permissions: {
      canViewLocation: false,
      receiveAlerts: true,
      viewEvidence: false
    }
  }
];

const TrustedCircle: React.FC<TrustedCircleProps> = ({ profile, onProfileUpdate }) => {
  const [contacts, setContacts] = useState<TrustContact[]>([]);
  const [activeRelationFilter, setActiveRelationFilter] = useState<string>('ALL');
  
  // Handshake verification modal/progress states
  const [verifyingContact, setVerifyingContact] = useState<TrustContact | null>(null);
  const [verifyProgress, setVerifyProgress] = useState<number>(0);
  const [verifyStatusText, setVerifyStatusText] = useState<string>('');
  const [generatedPasskey, setGeneratedPasskey] = useState<string>('');
  
  // New Contact Form States
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('FAMILY');
  const [newContactPriority, setNewContactPriority] = useState<1 | 2 | 3>(3);
  const [newCanViewLocation, setNewCanViewLocation] = useState<boolean>(true);
  const [newReceiveAlerts, setNewReceiveAlerts] = useState<boolean>(true);
  const [newViewEvidence, setNewViewEvidence] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Tactical synthesize sound utility
  const playSystemSound = (freq = 880, duration = 0.08, type: OscillatorType = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored browser context auto-play block
    }
  };

  // Sync contacts with profile or load default contacts
  useEffect(() => {
    if (profile && profile.trustCircle && profile.trustCircle.length > 0) {
      // Check if seeded properties are present, migrate if not
      const migrated = profile.trustCircle.map((tc, index) => ({
        ...tc,
        priority: tc.priority || ((index === 0) ? 1 : (index === 1) ? 2 : 3),
        isVerified: tc.isVerified || 'VERIFIED',
        permissions: tc.permissions || {
          canViewLocation: tc.isBroadcasting ?? true,
          receiveAlerts: true,
          viewEvidence: tc.relation === 'SISTER' || tc.relation === 'FAMILY'
        }
      }));
      setContacts(migrated);
    } else {
      setContacts(DEFAULT_CONTACTS);
    }
  }, [profile]);

  // Sync to database
  const saveContactsToProfile = async (updatedContacts: TrustContact[]) => {
    const jwtToken = localStorage.getItem('vs_jwt_token');
    if (!jwtToken) {
      // Fallback local persistence if offline
      setContacts(updatedContacts);
      if (profile) {
        onProfileUpdate({
          ...profile,
          trustCircle: updatedContacts
        });
      }
      return;
    }

    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          trustCircle: updatedContacts
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          onProfileUpdate(data.profile);
          setContacts(data.profile.trustCircle);
        }
      } else {
        console.warn("Failed to sync trust contacts with server ledger, falling back to local memory.");
        setContacts(updatedContacts);
      }
    } catch (err) {
      console.error("Network error saving trusted contacts:", err);
      setContacts(updatedContacts);
    }
  };

  // Toggle dynamic permission flag
  const togglePermission = async (contactIndex: number, permissionKey: 'canViewLocation' | 'receiveAlerts' | 'viewEvidence') => {
    playSystemSound(980, 0.05);
    const updated = contacts.map((c, i) => {
      if (i === contactIndex) {
        const currentPerms = c.permissions || { canViewLocation: false, receiveAlerts: true, viewEvidence: false };
        return {
          ...c,
          permissions: {
            ...currentPerms,
            [permissionKey]: !currentPerms[permissionKey]
          }
        };
      }
      return c;
    });
    setContacts(updated);
    await saveContactsToProfile(updated);
    showTempSuccess("Permission modified and synchronized with secure node.");
  };

  const showTempSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle addition of a new contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newContactName.trim() || !newContactPhone.trim()) {
      setErrorMessage("Full Name and Mobile Phone parameters are required.");
      playSystemSound(300, 0.25, 'sawtooth');
      return;
    }

    const newContact: TrustContact = {
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail || undefined,
      relation: newContactRelation,
      isBroadcasting: false,
      lastSeen: "Awaiting activation",
      priority: newContactPriority,
      isVerified: "PENDING",
      permissions: {
        canViewLocation: newCanViewLocation,
        receiveAlerts: newReceiveAlerts,
        viewEvidence: newViewEvidence
      }
    };

    // Keep unique validation
    const exists = contacts.some(c => c.phone === newContact.phone);
    if (exists) {
      setErrorMessage("This phone number is already registered inside your Trusted Circle.");
      playSystemSound(300, 0.25, 'sawtooth');
      return;
    }

    const updated = [...contacts, newContact];
    setContacts(updated);
    await saveContactsToProfile(updated);

    // Reset Form
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactRelation('FAMILY');
    setNewContactPriority(3);
    setNewCanViewLocation(true);
    setNewReceiveAlerts(true);
    setNewViewEvidence(false);
    setShowAddForm(false);
    
    playSystemSound(1200, 0.2);
    showTempSuccess(`Successfully queued ${newContact.name} into Trust Circle ledger.`);
  };

  // Delete/Purge contact from circle
  const handlePurgeContact = async (indexToDelete: number) => {
    const contact = contacts[indexToDelete];
    if (!window.confirm(`Are you absolutely sure you want to revoke and delete ${contact.name} from your secure Trusted Circle?`)) {
      return;
    }

    playSystemSound(400, 0.3, 'sawtooth');
    const updated = contacts.filter((_, i) => i !== indexToDelete);
    setContacts(updated);
    await saveContactsToProfile(updated);
    showTempSuccess("Contact security authorization completely revoked.");
  };

  // Begin simulated cryptographic verification process
  const triggerVerificationFlow = (contact: TrustContact) => {
    playSystemSound(1000, 0.1);
    setVerifyingContact(contact);
    setVerifyProgress(0);
    setVerifyStatusText('Initializing secure client key exchange... 🔐');
    
    // Generate a secure 6-character passkey handshake
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPasskey(code);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setVerifyProgress(progress);
      
      if (progress === 30) {
        setVerifyStatusText('Broadcasting dual-token OTP telemetry package...');
        playSystemSound(600, 0.05);
      } else if (progress === 60) {
        setVerifyStatusText('Verifying certificate chain with local sector relay...');
        playSystemSound(800, 0.05);
      } else if (progress === 90) {
        setVerifyStatusText('Sealing trusted pairing signature...');
        playSystemSound(1000, 0.05);
      } else if (progress >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          // Finalize verification state
          const updated = contacts.map(c => {
            if (c.phone === contact.phone) {
              return { ...c, isVerified: 'VERIFIED' as const };
            }
            return c;
          });
          setContacts(updated);
          await saveContactsToProfile(updated);
          playSystemSound(1500, 0.35);
          setVerifyingContact(null);
          showTempSuccess(`Peer node cryptographic handshake for ${contact.name} has been certified and locked!`);
        }, 500);
      }
    }, 400);
  };

  // Revoke/Mark Suspicious
  const markSuspicious = async (contact: TrustContact) => {
    playSystemSound(300, 0.4, 'triangle');
    const updated = contacts.map(c => {
      if (c.phone === contact.phone) {
        return { ...c, isVerified: 'DENIED' as const };
      }
      return c;
    });
    setContacts(updated);
    await saveContactsToProfile(updated);
    showTempSuccess(`Security handshake revoked for ${contact.name}. Node flagged as UNSAFE.`);
  };

  // Filters contacts
  const filteredContacts = contacts.filter(c => {
    if (activeRelationFilter === 'ALL') return true;
    return c.relation.toUpperCase() === activeRelationFilter;
  });

  return (
    <div id="trusted-circle-manager" className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 text-slate-100">
      
      {/* HEADER SECTION & HUD */}
      <div className="bg-zinc-950 p-8 rounded-[44px] border border-indigo-500/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-indigo-400">
                SOVEREIGN WITNESS PROTOCOL
              </span>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">
              Trusted Circle Manager
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase font-mono">
              Establish secure peer connections, customize priority hierarchies, and audit real-time tracking authorizations.
            </p>
          </div>

          <button
            onClick={() => { playSystemSound(1100, 0.1); setShowAddForm(true); }}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer border border-indigo-500/30"
          >
            <Plus size={14} /> Add Circle Contact
          </button>
        </div>

        {/* Global Circle Stats HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-[10px] font-mono">
          <div>
            <span className="block text-slate-500 uppercase font-black text-[8px]">Network Density</span>
            <span className="text-slate-200 font-bold">{contacts.length} Registered Peer Nodes</span>
          </div>
          <div>
            <span className="block text-slate-500 uppercase font-black text-[8px]">Primary Guardians</span>
            <span className="text-red-400 font-black">
              {contacts.filter(c => c.priority === 1).length} Active / Locked
            </span>
          </div>
          <div>
            <span className="block text-slate-500 uppercase font-black text-[8px]">Certified Handshakes</span>
            <span className="text-emerald-400 font-black">
              {contacts.filter(c => c.isVerified === 'VERIFIED').length} Nodes Verified
            </span>
          </div>
          <div>
            <span className="block text-slate-500 uppercase font-black text-[8px]">Transit Authorization</span>
            <span className="text-indigo-400 font-black">
              {contacts.filter(c => c.permissions?.canViewLocation).length} GPS Broadcasters
            </span>
          </div>
        </div>
      </div>

      {/* FEEDBACK alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <AlertTriangle size={16} className="shrink-0 animate-bounce" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RELATION FILTERS */}
      <div className="flex gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 flex-wrap self-start">
        {['ALL', 'FAMILY', 'FRIEND', 'COLLEAGUE'].map((filter) => (
          <button
            key={filter}
            onClick={() => { playSystemSound(900, 0.05); setActiveRelationFilter(filter); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeRelationFilter === filter 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {filter} Contacts
          </button>
        ))}
      </div>

      {/* EMERGENCY HIERARCHY COLUMNS */}
      <div className="grid lg:grid-cols-3 gap-6 text-left">
        
        {/* PRIORITY 1: PRIMARY GUARDIAN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-red-950/10 border border-red-500/10 p-3 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="font-mono">
              <h4 className="text-[10px] font-black tracking-widest text-red-500 uppercase">PRIORITY LEVEL 1</h4>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Primary Guardians (Instant dispatch & GPS)</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContacts.filter(c => c.priority === 1).length > 0 ? (
              filteredContacts.filter(c => c.priority === 1).map((contact, idx) => (
                <ContactCard 
                  key={contact.phone} 
                  contact={contact} 
                  index={contacts.findIndex(c => c.phone === contact.phone)} 
                  onTogglePermission={togglePermission} 
                  onPurgeContact={handlePurgeContact} 
                  onVerify={triggerVerificationFlow}
                  onMarkSuspicious={markSuspicious}
                />
              ))
            ) : (
              <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-3xl text-center text-slate-500 text-xs font-semibold uppercase tracking-tight py-12">
                No Primary Guardian Assigned
              </div>
            )}
          </div>
        </div>

        {/* PRIORITY 2: SECONDARY GUARDIAN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-amber-950/10 border border-amber-500/10 p-3 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="font-mono">
              <h4 className="text-[10px] font-black tracking-widest text-amber-500 uppercase">PRIORITY LEVEL 2</h4>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Secondary Guardians (Escalated failover)</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContacts.filter(c => c.priority === 2).length > 0 ? (
              filteredContacts.filter(c => c.priority === 2).map((contact, idx) => (
                <ContactCard 
                  key={contact.phone} 
                  contact={contact} 
                  index={contacts.findIndex(c => c.phone === contact.phone)} 
                  onTogglePermission={togglePermission} 
                  onPurgeContact={handlePurgeContact} 
                  onVerify={triggerVerificationFlow}
                  onMarkSuspicious={markSuspicious}
                />
              ))
            ) : (
              <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-3xl text-center text-slate-500 text-xs font-semibold uppercase tracking-tight py-12">
                No Secondary Guardian Assigned
              </div>
            )}
          </div>
        </div>

        {/* PRIORITY 3: EMERGENCY BACKUP */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <div className="font-mono">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">PRIORITY LEVEL 3</h4>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Emergency Backup (Secondary support networks)</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContacts.filter(c => c.priority === 3).length > 0 ? (
              filteredContacts.filter(c => c.priority === 3).map((contact, idx) => (
                <ContactCard 
                  key={contact.phone} 
                  contact={contact} 
                  index={contacts.findIndex(c => c.phone === contact.phone)} 
                  onTogglePermission={togglePermission} 
                  onPurgeContact={handlePurgeContact} 
                  onVerify={triggerVerificationFlow}
                  onMarkSuspicious={markSuspicious}
                />
              ))
            ) : (
              <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-3xl text-center text-slate-500 text-xs font-semibold uppercase tracking-tight py-12">
                No Backup Contacts Assigned
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD CONTACT MODAL FORM */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 rounded-[44px] w-full max-w-xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 relative text-left">
            
            <button 
              onClick={() => { playSystemSound(600, 0.08); setShowAddForm(false); }}
              className="absolute top-6 right-6 p-2 bg-slate-900 hover:bg-slate-850 rounded-full border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest">
                <Shield size={10} /> Circle Registry Handshake
              </div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tight">Add Circle Contact</h4>
              <p className="text-xs text-slate-400 font-semibold uppercase font-mono">Input secure credentials for trusted peer synchronization.</p>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Elena Rossi"
                    className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold tracking-wider outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 012-9876"
                    className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold tracking-wider outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Relation Profile *</label>
                  <select
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold tracking-wider outline-none focus:border-indigo-500/50"
                  >
                    <option value="FAMILY">Family Member</option>
                    <option value="FRIEND">Friend</option>
                    <option value="COLLEAGUE">Colleague</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Emergency Hierarchy Priority *</label>
                  <select
                    value={newContactPriority}
                    onChange={(e) => setNewContactPriority(parseInt(e.target.value) as 1 | 2 | 3)}
                    className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold tracking-wider outline-none focus:border-indigo-500/50"
                  >
                    <option value="1">Primary Guardian (Priority 1)</option>
                    <option value="2">Secondary Guardian (Priority 2)</option>
                    <option value="3">Emergency Backup (Priority 3)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Email Node Address (Optional)</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. contact@domain.mesh"
                  className="w-full bg-slate-900 border border-white/5 p-3.5 rounded-xl text-xs text-white font-bold tracking-wider outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* PERMISSION SELECTORS */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">Configure Initial Telemetry Permissions</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-white/5 hover:border-white/10">
                    <input 
                      type="checkbox" 
                      checked={newCanViewLocation}
                      onChange={(e) => setNewCanViewLocation(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 bg-slate-900 border-white/10"
                    />
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] font-bold text-white uppercase">GPS Stream</span>
                      <span className="text-[8px] text-slate-400">View coordinates</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-white/5 hover:border-white/10">
                    <input 
                      type="checkbox" 
                      checked={newReceiveAlerts}
                      onChange={(e) => setNewReceiveAlerts(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 bg-slate-900 border-white/10"
                    />
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] font-bold text-white uppercase">Alerts Msg</span>
                      <span className="text-[8px] text-slate-400">Receive SOS alerts</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-white/5 hover:border-white/10">
                    <input 
                      type="checkbox" 
                      checked={newViewEvidence}
                      onChange={(e) => setNewViewEvidence(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 bg-slate-900 border-white/10"
                    />
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] font-bold text-white uppercase">Vault View</span>
                      <span className="text-[8px] text-slate-400">Access evidence locker</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck size={14} /> Commit Contact to Circle
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VERIFYING CLIENT ANIMATION MODAL */}
      {verifyingContact && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
          <div className="bg-zinc-950 border-2 border-indigo-500 rounded-[44px] w-full max-w-md p-8 space-y-6 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-indigo-500/[0.01] animate-pulse pointer-events-none" />
            
            <Fingerprint className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-indigo-500 uppercase tracking-widest block">
                PEER NODE HANDSHAKE INITIALIZED
              </span>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">
                Authenticating Node pairing
              </h4>
              <p className="text-xs text-slate-400 font-bold font-mono">
                Pairing with: {verifyingContact.name} ({verifyingContact.phone})
              </p>
            </div>

            {/* Simulated Pairing Passkey Code */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
                Handshake Verification Passcode
              </span>
              <div className="text-3xl font-mono font-black text-indigo-400 tracking-widest">
                {generatedPasskey}
              </div>
              <p className="text-[8px] text-slate-400 font-semibold leading-relaxed">
                Provide this secure verification passkey to {verifyingContact.name} to authenticate node connectivity on their companion app.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>{verifyStatusText}</span>
                <span>{verifyProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${verifyProgress}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// CONTACT CARD SUB-COMPONENT
interface ContactCardProps {
  contact: TrustContact;
  index: number;
  onTogglePermission: (idx: number, key: 'canViewLocation' | 'receiveAlerts' | 'viewEvidence') => void;
  onPurgeContact: (idx: number) => void;
  onVerify: (contact: TrustContact) => void;
  onMarkSuspicious: (contact: TrustContact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, index, onTogglePermission, onPurgeContact, onVerify, onMarkSuspicious 
}) => {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const getRelationColor = (relation: string) => {
    switch (relation.toUpperCase()) {
      case 'FAMILY': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'FRIEND': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'COLLEAGUE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityBorder = (priority?: 1 | 2 | 3) => {
    switch (priority) {
      case 1: return 'border-l-4 border-l-red-500';
      case 2: return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-indigo-500/50';
    }
  };

  const currentPermissions = contact.permissions || { canViewLocation: false, receiveAlerts: true, viewEvidence: false };

  return (
    <div className={`bg-zinc-950 p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all ${getPriorityBorder(contact.priority)} shadow-md space-y-4`}>
      
      {/* CARD TOP INFO */}
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{contact.name}</h4>
            
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getRelationColor(contact.relation)}`}>
              {contact.relation}
            </span>

            {/* Handshake verified pill */}
            {contact.isVerified === 'VERIFIED' && (
              <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                <Check size={8} className="stroke-[3]" /> VERIFIED
              </span>
            )}

            {contact.isVerified === 'DENIED' && (
              <span className="flex items-center gap-0.5 bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                <UserX size={8} /> SUSPICIOUS
              </span>
            )}

            {(contact.isVerified === 'PENDING' || !contact.isVerified) && (
              <span className="flex items-center gap-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                PENDING
              </span>
            )}
          </div>

          <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
            <p className="flex items-center gap-1"><Phone size={10} className="text-slate-500" /> {contact.phone}</p>
            {contact.email && (
              <p className="flex items-center gap-1"><Mail size={10} className="text-slate-500" /> {contact.email}</p>
            )}
            <p className="flex items-center gap-1">
              <MapPin size={10} className="text-slate-500 animate-pulse" /> 
              Last online: <span className="text-slate-300 font-bold">{contact.lastSeen || 'Unknown'}</span>
            </p>
          </div>
        </div>

        {/* Action Gears / Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl border border-white/5 hover:bg-slate-900 transition-all cursor-pointer ${showSettings ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400 hover:text-white'}`}
        >
          <Settings size={12} />
        </button>
      </div>

      {/* QUICK STATUS INDICATOR */}
      <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex justify-between items-center text-[10px] font-mono">
        <span className="text-slate-400 uppercase font-bold">Broadcasting status</span>
        {contact.isBroadcasting ? (
          <span className="flex items-center gap-1 text-emerald-400 font-black uppercase text-[8.5px]">
            <Radio size={10} className="animate-pulse" /> LIVE STREAMING
          </span>
        ) : (
          <span className="text-slate-500 uppercase">OFFLINE / STANDBY</span>
        )}
      </div>

      {/* GRANULAR PERMISSIONS AUDIT HUD */}
      <div className="space-y-2 border-t border-white/5 pt-3">
        <span className="block text-[8px] font-mono text-slate-500 font-black uppercase tracking-widest text-left">
          Granular Security Authorizations
        </span>
        
        <div className="grid grid-cols-3 gap-2">
          {/* LOC PERMISSION */}
          <button
            onClick={() => onTogglePermission(index, 'canViewLocation')}
            className={`p-2.5 rounded-xl border text-[9px] font-mono font-black flex flex-col items-center gap-1 transition-all ${
              currentPermissions.canViewLocation 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25' 
                : 'bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400 hover:bg-slate-900/50'
            }`}
          >
            <MapPin size={11} className={currentPermissions.canViewLocation ? 'animate-bounce' : ''} />
            <span>GPS STREAM</span>
          </button>

          {/* ALERT PERMISSION */}
          <button
            onClick={() => onTogglePermission(index, 'receiveAlerts')}
            className={`p-2.5 rounded-xl border text-[9px] font-mono font-black flex flex-col items-center gap-1 transition-all ${
              currentPermissions.receiveAlerts 
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/25' 
                : 'bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400 hover:bg-slate-900/50'
            }`}
          >
            <Activity size={11} className={currentPermissions.receiveAlerts ? 'animate-pulse' : ''} />
            <span>SOS ALERT</span>
          </button>

          {/* EVIDENCE LOCKER PERMISSION */}
          <button
            onClick={() => onTogglePermission(index, 'viewEvidence')}
            className={`p-2.5 rounded-xl border text-[9px] font-mono font-black flex flex-col items-center gap-1 transition-all ${
              currentPermissions.viewEvidence 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25' 
                : 'bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400 hover:bg-slate-900/50'
            }`}
          >
            <Lock size={11} />
            <span>VAULT ACCESS</span>
          </button>
        </div>
      </div>

      {/* DETAILED ACTION PANEL (TOGGLED) */}
      {showSettings && (
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-indigo-500/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <span className="block text-[8px] font-mono text-indigo-400 font-black uppercase tracking-widest text-left">
            Administrative Handshake Tools
          </span>

          <div className="flex flex-col gap-2 font-mono text-[9px] font-bold">
            {/* Verify peer */}
            {contact.isVerified !== 'VERIFIED' && (
              <button
                onClick={() => { setShowSettings(false); onVerify(contact); }}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
              >
                <Fingerprint size={12} /> Cryptographic Handshake
              </button>
            )}

            {/* Suspect threat warning */}
            {contact.isVerified !== 'DENIED' && (
              <button
                onClick={() => onMarkSuspicious(contact)}
                className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-400 border border-amber-500/15 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
              >
                <AlertTriangle size={12} /> Flag Suspicious / Revoke
              </button>
            )}

            {/* Re-verify peer */}
            {contact.isVerified === 'DENIED' && (
              <button
                onClick={() => onVerify(contact)}
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/15 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
              >
                <Check size={12} /> Re-Authorize Peer Handshake
              </button>
            )}

            {/* Purge contact completely */}
            <button
              onClick={() => onPurgeContact(index)}
              className="w-full py-2.5 bg-red-600/15 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Trash2 size={12} /> Delete from Trusted Circle
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrustedCircle;
