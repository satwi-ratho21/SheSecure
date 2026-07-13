import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldAlert, AlertTriangle, Radio, Heart, Users, Map, Activity, 
  Settings, CheckCircle, Clock, Eye, Trash2, Edit2, ChevronRight, Lock, 
  Send, RefreshCw, Filter, Phone, Mail, Award, CheckCircle2, UserCheck, 
  FileText, Plus, Database, AlertCircle, TrendingUp, Sparkles, MapPin, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { UserProfile } from '../types';
import { SafetyIntelligenceDashboard } from './SafetyIntelligenceDashboard';

interface InfrastructureMonitorProps {
  profile: UserProfile | null;
  onNavigateToOPD?: () => void;
}

// Data structures matching server schemas
interface SOSIncident {
  id: string;
  email: string;
  name: string;
  timestamp: string;
  coordinates: { lat: number; lng: number };
  emergencyMessage: string;
  status: 'ACTIVE' | 'RESOLVED';
  recipients: string[];
  smsStatus: 'SUCCESS' | 'MOCKED' | 'FAILED';
  smsDetails?: string;
}

interface TraffickingReport {
  id: string;
  category: 'Child trafficking' | 'Forced movement' | 'Suspicious activity' | 'Kidnapping';
  location: string;
  vehicleNumber: string;
  description: string;
  photoUrl: string;
  isAnonymous: boolean;
  reporterName: string;
  reporterContact: string;
  status: 'SUBMITTED' | 'INVESTIGATING' | 'REVIEWS_IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  timestamp: string;
  adminNotes?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RescueUpdate {
  time: string;
  note: string;
}

interface MissingPersonReport {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDateTime: string;
  clothingDescription: string;
  distinctFeatures: string;
  photoUrl: string;
  status: 'ACTIVE_SEARCH' | 'FOUND' | 'RESOLVED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporterName: string;
  reporterContact: string;
  rescueUpdates: RescueUpdate[];
  timestamp: string;
}

interface HelpRequest {
  id: string;
  category: 'MEDICAL' | 'SECURITY' | 'ACCIDENT' | 'HARASSMENT' | 'OTHER';
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  reporterName: string;
  reporterPhone: string;
  urgency: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'CLAIMED' | 'RESOLVED';
  claimedByVolunteerId: string | null;
  claimedByVolunteerName: string | null;
  timestamp: string;
}

interface WitnessLog {
  id: string;
  helpRequestId: string;
  testimony: string;
  witnessName: string;
  timestamp: string;
  photoBase64?: string;
}

interface CyberComplaint {
  id: string;
  category: string;
  targetProfileLink: string;
  additionalDetails: string;
  reporterName: string;
  timestamp: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'INVESTIGATING' | 'RESOLVED';
  updates: Array<{ time: string; note: string }>;
}

interface RegisteredUser {
  uid: string;
  email: string;
  name: string;
  role: 'USER' | 'VOLUNTEER' | 'POLICE' | 'ADMIN';
  isVerified: boolean;
  safetyId: string;
  bloodType?: string;
  medicalConditions?: string;
}

interface HeatmapPoint {
  id: string;
  type: 'SOS_ALERT' | 'RESCUE_DISPATCH' | 'TRAFFICKING_REPORT' | 'MISSING_PERSON';
  lat: number;
  lng: number;
  intensity: number;
  description: string;
  timestamp: string;
}

const InfrastructureMonitor: React.FC<InfrastructureMonitorProps> = ({ profile, onNavigateToOPD }) => {
  // Authorization bypass for simulation testing convenience
  const [isAdminBypassed, setIsAdminBypassed] = useState(false);
  const userRole = isAdminBypassed ? 'ADMIN' : (profile?.role || 'USER');
  const isAuthorized = userRole === 'ADMIN' || userRole === 'POLICE';

  const [activeTab, setActiveTab] = useState<'HEATMAP' | 'SOS' | 'TRAFFICKING' | 'MISSING' | 'INCIDENTS' | 'USERS'>('HEATMAP');
  
  // Terminal PIN Lock State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Loaded DB lists
  const [sosIncidents, setSosIncidents] = useState<SOSIncident[]>([]);
  const [traffickingReports, setTraffickingReports] = useState<TraffickingReport[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPersonReport[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [cyberComplaints, setCyberComplaints] = useState<CyberComplaint[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>({
    totalSOS: 0, totalRescue: 0, totalTrafficking: 0, totalMissing: 0, riskIndexAvg: 0
  });

  // UI Interactive controls states
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [witnessLogs, setWitnessLogs] = useState<WitnessLog[]>([]);
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('ALL');

  // Input states for writing admin logs or notes
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [rescueNoteInput, setRescueNoteInput] = useState('');
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  // Sound generator helper for tactical feedbacks
  const playTacticalClick = (pitch = 440, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocks
    }
  };

  // Fetch all administrative intelligence feeds
  const loadAdminFeeds = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}` };

      const [sosRes, trafRes, missRes, helpRes, usersRes, cyberRes, heatRes] = await Promise.all([
        fetch('/api/sos/history', { headers }),
        fetch('/api/trafficking/reports', { headers }),
        fetch('/api/missing-persons/reports', { headers }),
        fetch('/api/rescue/help-requests', { headers }),
        fetch('/api/authority/users', { headers }),
        fetch('/api/cyber-safety/complaints', { headers }),
        fetch('/api/authority/analytics', { headers })
      ]);

      if (sosRes.ok) {
        const d = await sosRes.json();
        setSosIncidents(d.incidents || []);
      }
      if (trafRes.ok) {
        const d = await trafRes.json();
        setTraffickingReports(d.reports || []);
      }
      if (missRes.ok) {
        const d = await missRes.json();
        setMissingPersons(d.reports || []);
      }
      if (helpRes.ok) {
        const d = await helpRes.json();
        setHelpRequests(d.helpRequests || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setRegisteredUsers(d.users || []);
      }
      if (cyberRes.ok) {
        const d = await cyberRes.json();
        setCyberComplaints(d.complaints || []);
      }
      if (heatRes.ok) {
        const d = await heatRes.json();
        setHeatmapPoints(d.heatPoints || []);
        setAnalyticsSummary(d.summary || { totalSOS: 0, totalRescue: 0, totalTrafficking: 0, totalMissing: 0, riskIndexAvg: 70 });
      }
    } catch (err) {
      console.error("Critical error reading secure administrative feeds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminFeeds();
  }, [isAuthorized, isAdminBypassed]);

  // Handler: Lock Screen PIN validation
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1337' || pinInput === '0000') {
      playTacticalClick(600, 0.2);
      setIsAdminBypassed(true);
      setPinError(false);
    } else {
      playTacticalClick(150, 0.4);
      setPinError(true);
      setPinInput('');
    }
  };

  // Action: Resolve SOS incident administratively
  const handleResolveSOS = async (id: string) => {
    playTacticalClick(880, 0.1);
    try {
      const response = await fetch(`/api/authority/sos/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        }
      });
      if (response.ok) {
        setSosIncidents(prev => prev.map(s => s.id === id ? { ...s, status: 'RESOLVED' } : s));
        // Reload summary heatmap data
        loadAdminFeeds();
      } else {
        alert("Action denied by secure tactical endpoint.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Update Trafficking Report status & notes
  const handleUpdateTrafficking = async (id: string, nextStatus: string, finalNotes?: string) => {
    playTacticalClick(523.25, 0.1);
    try {
      const response = await fetch(`/api/trafficking/report/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        },
        body: JSON.stringify({
          status: nextStatus,
          adminNotes: finalNotes || adminNoteInput
        })
      });

      if (response.ok) {
        const d = await response.json();
        setTraffickingReports(prev => prev.map(r => r.id === id ? d.report : r));
        setAdminNoteInput('');
        setUpdatingReportId(null);
        loadAdminFeeds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Add Missing Person Rescue Update Log
  const handleAddMissingUpdate = async (id: string) => {
    if (!rescueNoteInput.trim()) return;
    playTacticalClick(587.33, 0.1);
    try {
      const response = await fetch(`/api/missing-persons/report/${id}/rescue-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        },
        body: JSON.stringify({ note: rescueNoteInput })
      });

      if (response.ok) {
        const d = await response.json();
        setMissingPersons(prev => prev.map(m => m.id === id ? d.report : m));
        setRescueNoteInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Update Missing Person Status
  const handleUpdateMissingStatus = async (id: string, nextStatus: string) => {
    playTacticalClick(659.25, 0.1);
    try {
      const response = await fetch(`/api/missing-persons/report/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        const d = await response.json();
        setMissingPersons(prev => prev.map(m => m.id === id ? d.report : m));
        loadAdminFeeds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Resolve Incident Help Request (Rescue net)
  const handleResolveHelp = async (id: string) => {
    playTacticalClick(783.99, 0.1);
    try {
      const response = await fetch(`/api/rescue/help-request/${id}/resolve`, {
        method: 'POST'
      });
      if (response.ok) {
        setHelpRequests(prev => prev.map(h => h.id === id ? { ...h, status: 'RESOLVED' } : h));
        loadAdminFeeds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: View Incident Witness Testimony
  const handleFetchWitnessLogs = async (req: HelpRequest) => {
    setSelectedIncident(req);
    try {
      const response = await fetch(`/api/rescue/witness/${req.id}`);
      const data = await response.json();
      if (data.success) {
        setWitnessLogs(data.testimonies || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Modify Registered User Role (ADMIN ONLY)
  const handleUpdateUserRole = async (uid: string, nextRole: 'USER' | 'VOLUNTEER' | 'POLICE' | 'ADMIN') => {
    playTacticalClick(880, 0.1);
    try {
      const response = await fetch(`/api/authority/users/${uid}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (response.ok) {
        const d = await response.json();
        setRegisteredUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: d.user.role } : u));
        alert(`User role updated successfully to ${nextRole}`);
      } else {
        alert("Operation denied. You must be authenticated as Primary Admin.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Cyber Complaint Action status update
  const handleUpdateCyberComplaint = async (id: string, status: string, noteText: string) => {
    playTacticalClick(659.25, 0.1);
    try {
      const response = await fetch(`/api/cyber-safety/complaint/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vs_jwt_token')}`
        },
        body: JSON.stringify({ status, note: noteText || "Administrator reviewed cybersecurity incident." })
      });
      if (response.ok) {
        const d = await response.json();
        setCyberComplaints(prev => prev.map(c => c.id === id ? d.complaint : c));
        alert("Cyber complaint tracking status updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recharts Helper Data
  const getSeverityChartData = () => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    traffickingReports.forEach(r => counts[r.urgency || 'MEDIUM']++);
    missingPersons.forEach(m => counts[m.urgency || 'MEDIUM']++);
    sosIncidents.forEach(s => {
      counts['CRITICAL']++;
    });

    return [
      { name: 'Low Priority', value: counts.LOW, fill: '#4f46e5' },
      { name: 'Guarded Risk', value: counts.MEDIUM, fill: '#10b981' },
      { name: 'High Danger', value: counts.HIGH, fill: '#f59e0b' },
      { name: 'Critical Emergency', value: counts.CRITICAL, fill: '#ef4444' }
    ];
  };

  const getSystemLoadsChartData = () => {
    return [
      { name: 'SOS Alarms', count: sosIncidents.length },
      { name: 'Trafficking Reports', count: traffickingReports.length },
      { name: 'Missing Search', count: missingPersons.length },
      { name: 'Volunteer Dispatches', count: helpRequests.length },
      { name: 'Cyber Cyber complaints', count: cyberComplaints.length }
    ];
  };

  // Heatmap Geo filter
  const getFilteredPoints = () => {
    if (activeLayerFilter === 'ALL') return heatmapPoints;
    if (activeLayerFilter === 'SOS') return heatmapPoints.filter(p => p.type === 'SOS_ALERT');
    if (activeLayerFilter === 'RESCUE') return heatmapPoints.filter(p => p.type === 'RESCUE_DISPATCH');
    if (activeLayerFilter === 'TRAFFICKING') return heatmapPoints.filter(p => p.type === 'TRAFFICKING_REPORT');
    if (activeLayerFilter === 'MISSING') return heatmapPoints.filter(p => p.type === 'MISSING_PERSON');
    return heatmapPoints;
  };

  // LATER AUTH BARRIER SCREEN RENDER
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700" id="authority-auth-lockout">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-950 p-10 md:p-14 rounded-[48px] border border-white/5 w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] text-center space-y-8 relative overflow-hidden"
        >
          {/* Cybernetic glowing circle lines */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="w-20 h-20 bg-red-600/10 border-2 border-red-500/30 rounded-3xl mx-auto flex items-center justify-center text-red-500 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Security Lockout</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest leading-relaxed">
              Tactical Command Portal &bull; Vanguard Administration Only
            </p>
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
            You are attempting to access classified authority dashboard resources. Verification authorization tokens or secure credentials must be input below.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4 max-w-xs mx-auto">
            <div className="relative">
              <input 
                type="password"
                maxLength={8}
                placeholder="Secure Auth PIN..."
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className={`w-full bg-slate-900 border text-center font-bold font-mono tracking-[0.6em] p-4 rounded-2xl text-xl text-white placeholder-slate-600 outline-none transition-all ${
                  pinError ? 'border-red-500 animate-bounce' : 'border-white/5 focus:border-red-500'
                }`}
              />
              {pinError && (
                <span className="text-[9px] text-red-500 font-mono font-bold uppercase block mt-2">
                  Credential Handshake Failed. Try PIN: 1337 or Click Bypass
                </span>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)]"
            >
              Verify Secure Handshake
            </button>
          </form>

          <div className="border-t border-white/5 pt-6 text-center space-y-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Simulator Evaluation Control</p>
            <button 
              onClick={() => {
                playTacticalClick(700, 0.15);
                setIsAdminBypassed(true);
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all border border-indigo-500/50 shadow-lg"
            >
              Demo Administrator Override
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHORIZED CONTROL TERMINAL SCREEN RENDER
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-40" id="authority-control-terminal">
      
      {/* HEADER CONTROLS WITH ROLE STATUS DETECTOR */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-zinc-950 p-8 rounded-[40px] border border-white/5">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 bg-red-600/10 border border-red-500/30 rounded-full flex items-center gap-2 text-[9px] font-black tracking-widest text-red-400 uppercase font-mono animate-pulse">
              <ShieldAlert size={12} /> Live Command Feed
            </div>
            {isAdminBypassed && (
              <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 text-[8px] rounded-lg font-mono font-black uppercase">
                DEMO OVERRIDE ACTIVE
              </span>
            )}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Authority Control Terminal</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono ml-1">Secure Sector Defense & Disaster Management Suite</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={loadAdminFeeds}
            className="p-3 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-colors"
            title="Refresh Intelligence Matrix"
          >
            <RefreshCw size={15} className={`${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Sentry indicators */}
          <div className="px-4 py-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex items-center gap-2.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest">SENTRY_GATEWAY_ONLINE</span>
          </div>

          <div className="px-4 py-3 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl flex items-center gap-2 text-[9px] font-mono font-black text-indigo-300 uppercase tracking-widest">
            Operator: {profile?.name || 'Vanguard Sentry'} ({userRole})
          </div>

          {isAdminBypassed && (
            <button 
              onClick={() => {
                playTacticalClick(300, 0.1);
                setIsAdminBypassed(false);
              }}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-wider rounded-2xl transition-all"
            >
              Lock Terminal
            </button>
          )}
        </div>
      </header>

      {/* HORIZONTAL PANELS TAB NAVIGATION */}
      <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-3xl flex flex-wrap gap-2 overflow-x-auto">
        {[
          { id: 'HEATMAP', label: 'Heatmap Analytics', icon: Map, color: 'text-emerald-400' },
          { id: 'SOS', label: 'SOS Logs', icon: Radio, color: 'text-red-500' },
          { id: 'TRAFFICKING', label: 'Trafficking Reports', icon: ShieldAlert, color: 'text-amber-400' },
          { id: 'MISSING', label: 'Missing Persons', icon: Heart, color: 'text-pink-500' },
          { id: 'INCIDENTS', label: 'Incident Management', icon: Activity, color: 'text-indigo-400' },
          { id: 'USERS', label: 'User Reports', icon: Users, color: 'text-blue-400' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              playTacticalClick(500, 0.05);
              setActiveTab(tab.id as any);
            }}
            className={`flex-1 min-w-[150px] py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN SCREEN LOADERS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-xs uppercase font-mono text-slate-500 font-bold tracking-widest animate-pulse">Syncing sector intelligence buffers...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* ================================================================ */}
          {/* TAB 1: HEATMAP ANALYTICS (GEOSPATIAL GRID + CHARTS) */}
          {/* ================================================================ */}
          {activeTab === 'HEATMAP' && (
            <SafetyIntelligenceDashboard />
          )}

          {/* ================================================================ */}
          {/* TAB 2: SOS INCIDENT HISTORY LOGS */}
          {/* ================================================================ */}
          {activeTab === 'SOS' && (
            <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">SOS Disaster Beacon Feed</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Real-Time Twilio Panic triggers & location logs</p>
              </div>

              {sosIncidents.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-mono font-black uppercase text-xs">No active SOS logs found in the sector buffer.</div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {sosIncidents.map(sos => (
                    <div 
                      key={sos.id} 
                      className={`p-6 bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center ${
                        sos.status === 'RESOLVED' ? 'opacity-55' : ''
                      }`}
                    >
                      <div className={`absolute top-0 left-0 h-full w-1.5 ${sos.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />

                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-2.5 py-1 text-[8px] font-mono font-black uppercase rounded ${
                            sos.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {sos.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-black">{new Date(sos.timestamp).toLocaleString()}</span>
                          <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">ID: {sos.id}</span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-white uppercase">Citizen: {sos.name} ({sos.email})</p>
                          <p className="text-xs text-slate-300 italic font-medium">"{sos.emergencyMessage}"</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" /> Coords: {sos.coordinates?.lat?.toFixed(5)}, {sos.coordinates?.lng?.toFixed(5)}</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-indigo-400" /> Recipients Count: {sos.recipients?.length || 0} ({sos.recipients?.join(', ')})</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="p-3 bg-zinc-950 border border-white/5 rounded-2xl space-y-1 text-left min-w-[150px]">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">SMS Broadcast</p>
                          <span className={`text-[9px] font-mono font-black ${
                            sos.smsStatus === 'SUCCESS' ? 'text-emerald-400' : sos.smsStatus === 'MOCKED' ? 'text-indigo-400' : 'text-red-400'
                          }`}>
                            {sos.smsStatus}
                          </span>
                          <p className="text-[8px] text-slate-600 truncate max-w-[140px] font-mono">{sos.smsDetails}</p>
                        </div>

                        {sos.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handleResolveSOS(sos.id)}
                            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} /> Resolve SOS
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: HUMAN TRAFFICKING REPORTS */}
          {/* ================================================================ */}
          {activeTab === 'TRAFFICKING' && (
            <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Trafficking Sighting Logbook</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Border reports, vehicle monitoring, and handler records</p>
              </div>

              {traffickingReports.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-mono font-black uppercase text-xs">No trafficking logs registered.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {traffickingReports.map(report => (
                    <div key={report.id} className="p-6 bg-slate-900/60 border border-white/5 rounded-[32px] space-y-6 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                report.urgency === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {report.urgency}
                              </span>
                              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{report.category}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-mono mt-1">Submitted: {new Date(report.timestamp).toLocaleDateString()}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] font-mono block text-slate-500 mb-1">ID: {report.id}</span>
                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] rounded-full font-black uppercase">
                              {report.status}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <p className="text-xs text-slate-300 font-medium italic">"{report.description}"</p>
                          <div className="p-3 bg-zinc-950/80 border border-white/5 rounded-2xl text-[10px] font-mono space-y-1">
                            <p className="text-slate-500 uppercase tracking-widest text-[8px] font-black">Identified Assets / Vectors</p>
                            <p className="text-white"><span className="text-indigo-400 font-bold uppercase">Spot:</span> {report.location}</p>
                            {report.vehicleNumber && <p className="text-white"><span className="text-indigo-400 font-bold uppercase">Vehicle:</span> {report.vehicleNumber}</p>}
                          </div>
                        </div>

                        {/* Image Attachment with Referrer policy */}
                        {report.photoUrl && (
                          <div className="w-full h-44 rounded-2xl border border-white/10 overflow-hidden relative">
                            <img 
                              src={report.photoUrl} 
                              alt="Trafficking Sighting Attachment" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                              <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Secure Evidence Record</span>
                            </div>
                          </div>
                        )}

                        {/* Admin Notes */}
                        <div className="p-4 bg-slate-950/40 border border-indigo-500/10 rounded-2xl space-y-1.5">
                          <p className="text-[8px] font-black uppercase text-indigo-400 tracking-wider font-mono">Administrative Notes</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {report.adminNotes || "No notes registered. Update notes using control panel below."}
                          </p>
                        </div>
                      </div>

                      {/* Controls Area */}
                      <div className="border-t border-white/5 pt-4 mt-4 space-y-4">
                        <div className="flex gap-2">
                          {/* Dropdown status update */}
                          <select 
                            onChange={(e) => handleUpdateTrafficking(report.id, e.target.value)}
                            value={report.status}
                            className="bg-slate-900 border border-white/10 text-xs text-white p-3 rounded-xl focus:border-indigo-500 outline-none flex-1 font-bold uppercase"
                          >
                            <option value="SUBMITTED">Submitted</option>
                            <option value="INVESTIGATING">Investigating</option>
                            <option value="REVIEWS_IN_PROGRESS">Review Pending</option>
                            <option value="RESOLVED">Resolved Case</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>

                          <button 
                            onClick={() => setUpdatingReportId(updatingReportId === report.id ? null : report.id)}
                            className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                          >
                            Append Note
                          </button>
                        </div>

                        {updatingReportId === report.id && (
                          <div className="space-y-2 animate-in slide-in-from-top-2">
                            <textarea 
                              rows={2}
                              value={adminNoteInput}
                              onChange={(e) => setAdminNoteInput(e.target.value)}
                              placeholder="Write administrative review notes..."
                              className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none"
                            />
                            <button 
                              onClick={() => handleUpdateTrafficking(report.id, report.status, adminNoteInput)}
                              className="w-full py-2 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-colors"
                            >
                              Save Notes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: MISSING PERSONS PORTAL */}
          {/* ================================================================ */}
          {activeTab === 'MISSING' && (
            <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Missing Persons Sentry Log</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Active Search & Rescue updates</p>
              </div>

              {missingPersons.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-mono font-black uppercase text-xs">No missing person records.</div>
              ) : (
                <div className="space-y-8">
                  {missingPersons.map(person => (
                    <div key={person.id} className="p-6 bg-slate-900/60 border border-white/5 rounded-[36px] flex flex-col lg:flex-row gap-8 justify-between items-start">
                      
                      {/* Left: Picture and Bio */}
                      <div className="flex flex-col sm:flex-row gap-6 w-full lg:max-w-xl">
                        {person.photoUrl && (
                          <div className="w-full sm:w-44 h-48 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                            <img 
                              src={person.photoUrl} 
                              alt={person.fullName} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="space-y-3 flex-1">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 text-[8px] font-mono font-black uppercase rounded ${
                                person.status === 'ACTIVE_SEARCH' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {person.status.replace('_', ' ')}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">ID: {person.id}</span>
                            </div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight mt-1">{person.fullName}</h4>
                            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">Age: {person.age} &bull; Gender: {person.gender}</p>
                          </div>

                          <div className="text-xs text-slate-300 space-y-1">
                            <p><span className="text-slate-500 font-bold uppercase">Last Spotted:</span> {person.lastSeenLocation} ({person.lastSeenDateTime})</p>
                            <p><span className="text-slate-500 font-bold uppercase">Clothing:</span> {person.clothingDescription}</p>
                            <p><span className="text-slate-500 font-bold uppercase">Distinct Marks:</span> {person.distinctFeatures}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Live Chronology Feed of Rescue Updates */}
                      <div className="flex-1 w-full bg-zinc-950 p-6 rounded-[28px] border border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Chronological Search Timeline</p>
                        
                        <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2">
                          {person.rescueUpdates?.length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-600 uppercase text-center py-4">No rescue search logs uploaded yet.</p>
                          ) : (
                            person.rescueUpdates?.map((update, idx) => (
                              <div key={idx} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl space-y-0.5 text-[10px]">
                                <p className="text-indigo-400 font-bold font-mono text-[8px]">{new Date(update.time).toLocaleString()}</p>
                                <p className="text-slate-300 font-medium italic">"{update.note}"</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Log submission inside timeline */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={rescueNoteInput}
                              onChange={e => setRescueNoteInput(e.target.value)}
                              placeholder="Add chronological sighting update note..."
                              className="flex-1 bg-slate-900 border border-white/5 p-2.5 rounded-xl text-xs text-white placeholder-slate-600 outline-none"
                            />
                            <button 
                              onClick={() => handleAddMissingUpdate(person.id)}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase rounded-xl transition-all"
                            >
                              Add Log
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Urgent Status updates */}
                      <div className="w-full lg:w-auto flex flex-col gap-2 flex-shrink-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">Modify Status</p>
                        <button 
                          onClick={() => handleUpdateMissingStatus(person.id, 'ACTIVE_SEARCH')}
                          className="px-5 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Mark Active Search
                        </button>
                        <button 
                          onClick={() => handleUpdateMissingStatus(person.id, 'FOUND')}
                          className="px-5 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Mark as Found
                        </button>
                        <div className="p-3 bg-zinc-950 border border-white/5 rounded-2xl text-[9px] font-mono space-y-1">
                          <p className="text-slate-500 uppercase font-black text-[8px]">Reporter Sighting contact</p>
                          <p className="text-white font-bold">{person.reporterName}</p>
                          <p className="text-slate-400 text-[8px]">{person.reporterContact}</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: COMMUNITY RESCUE DISPATCH & INCIDENTS (INCIDENT MANAGEMENT) */}
          {/* ================================================================ */}
          {activeTab === 'INCIDENTS' && (
            <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Citizen Rescue Dispatch</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Active Community volunteers & Distress help tickets</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Active dispatch lists */}
                <div className="lg:col-span-7 space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Live Distress Beacon Feeds</p>
                  
                  {helpRequests.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono text-center uppercase py-10">No active dispatches.</p>
                  ) : (
                    helpRequests.map(req => (
                      <div 
                        key={req.id} 
                        className={`p-6 bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between ${
                          req.status === 'RESOLVED' ? 'opacity-55' : ''
                        }`}
                      >
                        <div className={`absolute left-0 top-0 w-1.5 h-full ${
                          req.status === 'RESOLVED' ? 'bg-emerald-500' : req.status === 'CLAIMED' ? 'bg-indigo-500' : 'bg-red-500'
                        }`} />

                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded ${
                                req.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : req.status === 'CLAIMED' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400 animate-pulse'
                              }`}>
                                {req.status}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{req.category}</span>
                            </div>
                            <h4 className="text-base font-black text-white mt-2 uppercase">{req.locationName}</h4>
                            <p className="text-xs text-slate-300 italic font-medium">"{req.description}"</p>
                          </div>

                          <span className={`px-2 py-0.5 text-[8px] font-mono font-black rounded ${
                            req.urgency === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-between items-center border-t border-white/5 pt-4 mt-4 text-[10px]">
                          <div className="text-slate-500 font-bold uppercase">
                            <p>Reporter: {req.reporterName} ({req.reporterPhone})</p>
                            {req.claimedByVolunteerName && <p className="text-indigo-400 font-bold mt-0.5">En route: {req.claimedByVolunteerName}</p>}
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleFetchWitnessLogs(req)}
                              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-300 text-[9px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <FileText size={12} /> Inspect Witnesses
                            </button>

                            {req.status !== 'RESOLVED' && (
                              <button 
                                onClick={() => handleResolveHelp(req.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Witness testimonies inspector side drawer panel */}
                <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-[32px] border border-white/5 space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Witness Log Vault</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mono tracking-widest">Accountability & Sighting testimonies</p>
                  </div>

                  {selectedIncident ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 text-[10px] space-y-1">
                        <p className="font-mono text-indigo-400 font-bold uppercase">Selected Dispatch Location</p>
                        <p className="font-black text-white uppercase">{selectedIncident.locationName}</p>
                        <p className="text-slate-400 italic">"{selectedIncident.description}"</p>
                      </div>

                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                        {witnessLogs.length === 0 ? (
                          <p className="text-center py-10 text-[10px] text-slate-500 font-bold uppercase">No testimonies uploaded for this incident.</p>
                        ) : (
                          witnessLogs.map(wit => (
                            <div key={wit.id} className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between text-[8px] font-mono font-black uppercase">
                                <span className="text-indigo-400">{wit.witnessName}</span>
                                <span className="text-slate-500">{new Date(wit.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-300 italic">"{wit.testimony}"</p>

                              {wit.photoBase64 && (
                                <div className="w-full h-32 rounded-xl border border-white/10 overflow-hidden">
                                  <img 
                                    src={wit.photoBase64} 
                                    alt="Witness testimony Attachment" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px]">
                      Click "Inspect Witnesses" on any help dispatch ticket to review log records.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: USER REPORTS & SYSTEM USERS (USER REPORTS) */}
          {/* ================================================================ */}
          {activeTab === 'USERS' && (
            <div className="space-y-10">
              
              {/* Row: Users database grid list */}
              <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">System Membership Registry</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Enforce security role privileges and active volunteers</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">
                        <th className="pb-4">Name & Email</th>
                        <th className="pb-4">Safety ID</th>
                        <th className="pb-4">Role Privileges</th>
                        <th className="pb-4">Medical Parameters</th>
                        <th className="pb-4 text-right">Promote / Demote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {registeredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 pr-4">
                            <p className="font-black text-white uppercase">{u.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{u.email}</p>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="font-mono text-indigo-400 font-black">{u.safetyId || 'N/A'}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`px-2 py-0.5 rounded font-mono font-black text-[9px] ${
                              u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : u.role === 'POLICE' ? 'bg-indigo-500/20 text-indigo-400' : u.role === 'VOLUNTEER' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-[10px] text-slate-500 font-mono">
                            <p>Blood: {u.bloodType || 'Unknown'}</p>
                            <p>Allergies: {u.medicalConditions || 'None'}</p>
                          </td>
                          <td className="py-4 text-right">
                            <select 
                              disabled={u.email.toLowerCase() === 'admin@vanguard.mesh'} // Lock seed superadmin from accidental demotion
                              onChange={(e) => handleUpdateUserRole(u.uid, e.target.value as any)}
                              value={u.role}
                              className="bg-slate-900 border border-white/10 text-[10px] text-white p-2.5 rounded-xl focus:border-indigo-500 outline-none font-bold uppercase"
                            >
                              <option value="USER">User</option>
                              <option value="VOLUNTEER">Volunteer</option>
                              <option value="POLICE">Police</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cyber Safety complaints / logs section */}
              <div className="bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Cyber Safety Impersonation complaints</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Sextortion, cyber threats, and identity theft logs</p>
                </div>

                {cyberComplaints.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono text-center py-10 uppercase font-black">No cyber complaints reported yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {cyberComplaints.map(complaint => (
                      <div key={complaint.id} className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-black text-[8px] uppercase">
                                {complaint.category}
                              </span>
                              <p className="text-[9px] text-slate-500 font-mono mt-1">Filed: {new Date(complaint.timestamp).toLocaleString()}</p>
                            </div>

                            <span className={`px-2 py-0.5 text-[8px] font-mono font-black rounded ${
                              complaint.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : complaint.status === 'INVESTIGATING' ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white animate-pulse'
                            }`}>
                              {complaint.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Offending Account link</p>
                            <a href={complaint.targetProfileLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs hover:underline truncate block">
                              {complaint.targetProfileLink}
                            </a>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Incident description Details</p>
                            <p className="text-xs text-slate-300 font-medium italic">"{complaint.additionalDetails}"</p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider font-mono">History Log updates</p>
                            <div className="space-y-1 max-h-[100px] overflow-y-auto pr-2">
                              {complaint.updates?.map((up, idx) => (
                                <div key={idx} className="p-2 bg-zinc-950 rounded-lg text-[9px] font-mono">
                                  <p className="text-slate-500">{new Date(up.time).toLocaleString()}</p>
                                  <p className="text-slate-300">{up.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/5 text-[9px]">
                          <button 
                            onClick={() => handleUpdateCyberComplaint(complaint.id, 'INVESTIGATING', "Cyber division investigator assigned to audit the impersonation signature.")}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase rounded-xl transition-all"
                          >
                            Mark Investigating
                          </button>
                          <button 
                            onClick={() => handleUpdateCyberComplaint(complaint.id, 'RESOLVED', "Impersonating target account suspended. Take down notice finalized.")}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all"
                          >
                            Mark Resolved
                          </button>
                        </div>

                      </div>
                    ))}
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

export default InfrastructureMonitor;
