import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Heart, Shield, Users, AlertTriangle, Radio, Send, CheckCircle2, 
  MapPin, Phone, Award, UserCheck, Star, RefreshCw, Upload, Eye, FileText,
  Clock, ShieldAlert, Check, X, ShieldCheck, Activity, Bell, MessageSquare
} from 'lucide-react';
import { UserProfile } from '../types';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  verificationStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  credentialsInfo: string;
  skills: string[];
  latitude: number;
  longitude: number;
  isActiveDuty: boolean;
  rating: number;
}

interface BroadcastAlert {
  id: string;
  message: string;
  locationName: string;
  latitude: number;
  longitude: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  senderName: string;
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
  assignedVolunteerId?: string | null;
  assignedVolunteerName?: string | null;
  assignmentStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | null;
  etaMinutes?: number | null;
  liveLocation?: { lat: number; lng: number } | null;
}

interface WitnessLog {
  id: string;
  helpRequestId: string;
  testimony: string;
  witnessName: string;
  timestamp: string;
  photoBase64?: string;
}

interface LiveNotification {
  id: string;
  type: 'emergency-broadcast' | 'new-help-request' | 'help-claimed' | 'help-resolved' | 'new-witness';
  title: string;
  message: string;
  timestamp: string;
}

interface CommunityRescueNetworkProps {
  profile: UserProfile | null;
}

const CommunityRescueNetwork: React.FC<CommunityRescueNetworkProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'HELP_REQUESTS' | 'BROADCASTS' | 'VERIFICATION' | 'DISPATCH'>('MAP');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastAlert[]>([]);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  
  // Create Help Request state
  const [reqCategory, setReqCategory] = useState<'MEDICAL' | 'SECURITY' | 'ACCIDENT' | 'HARASSMENT' | 'OTHER'>('MEDICAL');
  const [reqDesc, setReqDesc] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Broadcast state
  const [broadMsg, setBroadMsg] = useState('');
  const [broadLocation, setBroadLocation] = useState('');
  const [broadSeverity, setBroadSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Verification application form
  const [vCreds, setVCreds] = useState('');
  const [vSkillsInput, setVSkillsInput] = useState('');
  const [isApplyingVerif, setIsApplyingVerif] = useState(false);

  // Witness state
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [testimonies, setTestimonies] = useState<WitnessLog[]>([]);
  const [witnessName, setWitnessName] = useState('');
  const [witnessText, setWitnessText] = useState('');
  const [witnessFile, setWitnessFile] = useState<string | null>(null);
  const [isSubmittingWitness, setIsSubmittingWitness] = useState(false);

  // Local user's volunteer info state
  const [myVolunteerProfile, setMyVolunteerProfile] = useState<Volunteer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Volunteer Dispatch Module state variables
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<string | null>(null); // holds helpRequestId of active simulation

  const selectedIncident = helpRequests.find(r => r.id === selectedIncidentId);

  // Simple Euclidean distance function for visual discovery
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2)); // distance in km
  };

  // Action: Assign Help Request to volunteer
  const handleAssignIncident = async (incidentId: string, volunteerId: string) => {
    try {
      const res = await fetch(`/api/rescue/help-request/${incidentId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId })
      });
      if (res.ok) {
        playAlertSound('info');
      } else {
        alert("Failed to assign incident to volunteer.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Respond to Assignment (Accept/Reject)
  const handleRespondAssignment = async (incidentId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/rescue/help-request/${incidentId}/respond-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        playAlertSound(status === 'ACCEPTED' ? 'info' : 'danger');
      } else {
        alert("Failed to transmit assignment response.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Advance Telemetry Coordinates Step-by-Step
  const handleAdvanceTelemetry = async (incidentId: string) => {
    const inc = helpRequests.find(r => r.id === incidentId);
    if (!inc || !inc.liveLocation) return;

    const targetLat = inc.latitude;
    const targetLng = inc.longitude;
    const currLat = inc.liveLocation.lat;
    const currLng = inc.liveLocation.lng;

    const latDiff = targetLat - currLat;
    const lngDiff = targetLng - currLng;
    const distanceLeft = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    let nextLat = currLat;
    let nextLng = currLng;
    let nextEta = inc.etaMinutes !== null && inc.etaMinutes !== undefined ? Math.max(0, inc.etaMinutes - 1) : 0;

    // If within roughly 50 meters, snap to target and clear ETA
    if (distanceLeft < 0.0006) {
      nextLat = targetLat;
      nextLng = targetLng;
      nextEta = 0;
    } else {
      nextLat = currLat + latDiff * 0.25;
      nextLng = currLng + lngDiff * 0.25;
    }

    try {
      await fetch(`/api/rescue/help-request/${incidentId}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: nextLat,
          longitude: nextLng,
          etaMinutes: nextEta
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Effect to automatically run the step-by-step dispatch live tracking advancement
  useEffect(() => {
    let intervalId: any = null;
    if (isSimulatingTelemetry) {
      intervalId = setInterval(() => {
        const inc = helpRequests.find(r => r.id === isSimulatingTelemetry);
        if (inc && inc.liveLocation) {
          const latDiff = inc.latitude - inc.liveLocation.lat;
          const lngDiff = inc.longitude - inc.liveLocation.lng;
          const distanceLeft = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          if (distanceLeft < 0.0001 && inc.etaMinutes === 0) {
            setIsSimulatingTelemetry(null);
            playAlertSound('info');
          } else {
            handleAdvanceTelemetry(isSimulatingTelemetry);
          }
        } else {
          setIsSimulatingTelemetry(null);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulatingTelemetry, helpRequests]);

  const socketRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sound generator helper for real-time alerts
  const playAlertSound = (type: 'info' | 'danger') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'danger') {
        // High urgency alarm tone
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Standard notification chime
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Sound blocked or not supported by browser constraints.");
    }
  };

  // Setup Socket.io and fetch initial values
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, hRes, bRes] = await Promise.all([
          fetch('/api/rescue/volunteers'),
          fetch('/api/rescue/help-requests'),
          fetch('/api/rescue/broadcasts')
        ]);

        const vData = await vRes.json();
        const hData = await hRes.json();
        const bData = await bRes.json();

        if (vData.success) {
          setVolunteers(vData.volunteers);
          if (profile) {
            const matched = vData.volunteers.find(
              (v: Volunteer) => v.email.toLowerCase() === profile.email.toLowerCase()
            );
            if (matched) setMyVolunteerProfile(matched);
          }
        }
        if (hData.success) setHelpRequests(hData.helpRequests);
        if (bData.success) setBroadcasts(bData.broadcasts);
      } catch (err) {
        console.error("Error reading community rescue data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Establish socket connections for live notifications
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.io Client] Connected successfully. ID: ${socket.id}`);
    });

    socket.on('emergency-broadcast', (data: BroadcastAlert) => {
      setBroadcasts(prev => [data, ...prev]);
      addLiveNotification({
        id: Math.random().toString(),
        type: 'emergency-broadcast',
        title: `🚨 EMERGENCY BROADCAST: ${data.severity}`,
        message: `${data.message} (${data.locationName})`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('danger');
    });

    socket.on('new-help-request', (data: HelpRequest) => {
      setHelpRequests(prev => [data, ...prev]);
      addLiveNotification({
        id: Math.random().toString(),
        type: 'new-help-request',
        title: `🆘 HELP REQUEST SUBMITTED`,
        message: `${data.category}: ${data.description.substring(0, 60)}... (${data.locationName})`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('danger');
    });

    socket.on('help-request-claimed', (data: HelpRequest) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? data : r));
      addLiveNotification({
        id: Math.random().toString(),
        type: 'help-claimed',
        title: `🤝 MISSION ACCEPTED`,
        message: `Volunteer ${data.claimedByVolunteerName} is en route to ${data.locationName}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('info');
    });

    socket.on('help-request-resolved', (data: HelpRequest) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? data : r));
      addLiveNotification({
        id: Math.random().toString(),
        type: 'help-resolved',
        title: `✅ MISSION RESOLVED`,
        message: `Incident at ${data.locationName} has been successfully cleared.`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('info');
    });

    socket.on('new-witness-testimony', (data: WitnessLog) => {
      setTestimonies(prev => [data, ...prev]);
      addLiveNotification({
        id: Math.random().toString(),
        type: 'new-witness',
        title: `👁️ NEW WITNESS UPDATE`,
        message: `${data.witnessName} posted testimony for current rescue event.`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('info');
    });

    socket.on('volunteer-updated', (data: Volunteer) => {
      setVolunteers(prev => {
        const index = prev.findIndex(v => v.id === data.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = data;
          return next;
        } else {
          return [...prev, data];
        }
      });

      if (profile && data.email.toLowerCase() === profile.email.toLowerCase()) {
        setMyVolunteerProfile(data);
      }
    });

    socket.on('help-request-assigned', (data: HelpRequest) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? { ...r, ...data } : r));
      addLiveNotification({
        id: Math.random().toString(),
        type: 'help-claimed',
        title: `⚡ MISSION DISPATCHED`,
        message: `Incident at ${data.locationName} is assigned to ${data.assignedVolunteerName}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound('info');
    });

    socket.on('help-request-assignment-response', (data: HelpRequest) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? { ...r, ...data } : r));
      addLiveNotification({
        id: Math.random().toString(),
        type: data.assignmentStatus === 'ACCEPTED' ? 'help-claimed' : 'help-resolved',
        title: data.assignmentStatus === 'ACCEPTED' ? `✅ MISSION ACCEPTED` : `❌ MISSION REJECTED`,
        message: `${data.assignedVolunteerName || 'Volunteer'} has ${data.assignmentStatus === 'ACCEPTED' ? 'accepted' : 'rejected'} dispatch request for ${data.locationName}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      playAlertSound(data.assignmentStatus === 'ACCEPTED' ? 'info' : 'danger');
    });

    socket.on('help-request-telemetry', (data: { id: string; liveLocation: { lat: number; lng: number }; etaMinutes: number }) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? { ...r, liveLocation: data.liveLocation, etaMinutes: data.etaMinutes } : r));
    });

    socket.on('help-request-updated', (data: HelpRequest) => {
      setHelpRequests(prev => prev.map(r => r.id === data.id ? { ...r, ...data } : r));
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [profile]);

  const addLiveNotification = (notif: LiveNotification) => {
    setNotifications(prev => [notif, ...prev].slice(0, 5));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Action: Create Help Request
  const handleCreateHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDesc.trim() || !reqLocation.trim()) return;

    setIsSubmittingReq(true);
    try {
      const payload = {
        category: reqCategory,
        description: reqDesc,
        locationName: reqLocation,
        latitude: 17.6868 + (Math.random() - 0.5) * 0.015,
        longitude: 83.2185 + (Math.random() - 0.5) * 0.015,
        reporterName: profile?.name || "Anonymous Resident",
        reporterPhone: profile?.trustCircle?.[0]?.phone || "N/A",
        urgency: reqUrgency
      };

      const response = await fetch('/api/rescue/help-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setReqDesc('');
        setReqLocation('');
      } else {
        alert("Failed to submit rescue dispatch request.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // Action: Broadcast Alert
  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadMsg.trim() || !broadLocation.trim()) return;

    setIsBroadcasting(true);
    try {
      const payload = {
        message: broadMsg,
        locationName: broadLocation,
        latitude: 17.6868 + (Math.random() - 0.5) * 0.02,
        longitude: 83.2185 + (Math.random() - 0.5) * 0.02,
        severity: broadSeverity,
        senderName: profile?.name || "Operator"
      };

      const response = await fetch('/api/rescue/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setBroadMsg('');
        setBroadLocation('');
      } else {
        alert("Failed to post emergency broadcast.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Action: Claim Help Request
  const handleClaimRequest = async (id: string) => {
    if (!myVolunteerProfile || !myVolunteerProfile.isVerified) {
      alert("Only verified active-duty volunteers are authorized to claim rescue missions.");
      return;
    }

    try {
      const response = await fetch(`/api/rescue/help-request/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: myVolunteerProfile.id,
          volunteerName: myVolunteerProfile.name
        })
      });

      if (!response.ok) {
        alert("Error accepting the rescue mission.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Resolve Help Request
  const handleResolveRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/rescue/help-request/${id}/resolve`, {
        method: 'POST'
      });
      if (!response.ok) {
        alert("Error marking rescue request as resolved.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Submit Volunteer Application
  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsApplyingVerif(true);
    try {
      const response = await fetch('/api/rescue/volunteer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.trustCircle?.[0]?.phone || "+1 (555) 000-1111",
          credentialsInfo: vCreds,
          skills: vSkillsInput.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setVCreds('');
        setVSkillsInput('');
        alert("Verification credentials transmitted successfully. Review is under process.");
      } else {
        alert("Failed to transmit credentials.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingVerif(false);
    }
  };

  // Action: Toggle Active Duty
  const handleToggleActiveDuty = async () => {
    if (!myVolunteerProfile) return;

    const nextDuty = !myVolunteerProfile.isActiveDuty;
    try {
      const response = await fetch('/api/rescue/volunteer/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: myVolunteerProfile.id,
          isActiveDuty: nextDuty,
          latitude: 17.6868 + (Math.random() - 0.5) * 0.015,
          longitude: 83.2185 + (Math.random() - 0.5) * 0.015
        })
      });

      if (!response.ok) {
        alert("Failed to modify active-duty parameters.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Select help request to inspect testimonies
  const handleSelectRequest = async (req: HelpRequest) => {
    setSelectedRequest(req);
    try {
      const res = await fetch(`/api/rescue/witness/${req.id}`);
      const data = await res.json();
      if (data.success) {
        setTestimonies(data.testimonies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Submit Witness Testimony
  const handleAddWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !witnessText.trim()) return;

    setIsSubmittingWitness(true);
    try {
      const response = await fetch('/api/rescue/witness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helpRequestId: selectedRequest.id,
          testimony: witnessText,
          witnessName: witnessName || "Anonymous Witness",
          photoBase64: witnessFile || ""
        })
      });

      if (response.ok) {
        setWitnessText('');
        setWitnessName('');
        setWitnessFile(null);
        // Refresh testimonies
        handleSelectRequest(selectedRequest);
      } else {
        alert("Failed to save testimony.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingWitness(false);
    }
  };

  // Admin approval helper (Directly approved for the demo convenience)
  const handleAdminVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/rescue/volunteer/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        const d = await response.json();
        // Update local list
        setVolunteers(prev => prev.map(v => v.id === id ? d.volunteer : v));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Photo input conversion to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        setWitnessFile(r.result as string);
      };
      r.readAsDataURL(file);
    }
  };

  // Manual Trigger Simulation Hub events for direct UI testing
  const handleTriggerSimulateAlert = (type: string) => {
    if (!socketRef.current) return;

    if (type === 'BROADCAST') {
      socketRef.current.emit('emergency-broadcast', {
        id: "broad_sim_" + Date.now(),
        message: "SIMULATION CONSOLE: Highly critical weather/infrastructure alert issued. Extreme winds en route.",
        locationName: "Visakhapatnam Beach Transit Corridor",
        latitude: 17.6914,
        longitude: 83.2215,
        severity: "CRITICAL",
        timestamp: new Date().toISOString(),
        senderName: "Digital Sentry Simulator"
      });
    } else if (type === 'REQUEST') {
      socketRef.current.emit('new-help-request', {
        id: "help_sim_" + Date.now(),
        category: "SECURITY",
        description: "SIMULATION CONSOLE: Distress trigger en route. Civilian requests rapid companion visual guard.",
        locationName: "RK Beach Central Park Walkway",
        latitude: 17.6850,
        longitude: 83.2190,
        reporterName: "Anjali S. (Mock Client)",
        reporterPhone: "+91 99881 10200",
        urgency: "HIGH",
        status: "PENDING",
        claimedByVolunteerId: null,
        claimedByVolunteerName: null,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-36" id="rescue-network-container">
      
      {/* REAL-TIME SOCKET FLOATING NOTIFICATIONS TOASTS */}
      <div className="fixed top-24 right-6 z-[200] max-w-sm w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-4 bg-slate-950/95 border-2 border-indigo-500/50 rounded-2xl shadow-[0_15px_30px_rgba(79,70,229,0.3)] pointer-events-auto flex gap-3 items-start relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500" />
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5 animate-pulse">
                <Bell size={16} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-tight">{n.title}</p>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{n.message}</p>
                <span className="text-[8px] font-mono text-slate-500 block">{n.timestamp}</span>
              </div>
              <button 
                onClick={() => removeNotification(n.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BRANDING HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Community Rescue</h2>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mono">Real-Time Volunteer Dispatch & Witness Coordination</p>
        </div>

        {/* ACTIVE VOLUNTEERS BADGE */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-2xl flex items-center gap-3">
            <Users className="w-4 h-4 text-indigo-400 animate-pulse" />
            <p className="text-[10px] font-black tracking-wider uppercase text-white mono">
              {volunteers.filter(v => v.isActiveDuty).length} Active Responders Nearby
            </p>
          </div>
          
          {/* VOLUNTEER CONTROLLER */}
          {myVolunteerProfile && (
            <button 
              onClick={handleToggleActiveDuty}
              className={`p-3 border-2 rounded-2xl flex items-center gap-2 font-mono font-black text-[10px] uppercase transition-all tracking-wider ${
                myVolunteerProfile.isActiveDuty 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' 
                  : 'bg-zinc-950 border-white/5 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              <Activity className="w-4 h-4" />
              {myVolunteerProfile.isActiveDuty ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
            </button>
          )}
        </div>
      </header>

      {/* CORE SELECTION TAB NAVIGATION */}
      <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-3xl flex flex-wrap gap-2">
        {[
          { id: 'MAP', label: 'Responders & Alerts', icon: MapPin },
          { id: 'HELP_REQUESTS', label: 'Help Dispatch Center', icon: Heart },
          { id: 'DISPATCH', label: 'Tactical Dispatch', icon: ShieldAlert },
          { id: 'BROADCASTS', label: 'Safety Broadcasts', icon: Radio },
          { id: 'VERIFICATION', label: 'Volunteer Verification', icon: Award }
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

      {/* MAIN SCREEN PANELS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">Syncing with encrypted dispatch matrix...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* TAB CONTENT: RESPONDERS AND ALERTS MAP VIEW */}
          {activeTab === 'MAP' && (
            <>
              {/* Left hand details panel */}
              <div className="lg:col-span-5 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Responders</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">En-Route & Standby Telemetry</p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {volunteers.map(vol => (
                    <div 
                      key={vol.id} 
                      className={`p-4 rounded-3xl border flex items-center gap-4 transition-all ${
                        vol.isActiveDuty 
                          ? 'bg-indigo-600/5 border-indigo-500/20' 
                          : 'bg-white/5 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-400">
                        {vol.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white truncate uppercase">{vol.name}</p>
                          {vol.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mono truncate tracking-wider mt-0.5">
                          {vol.skills.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end text-[10px] text-amber-400 font-bold">
                          <Star size={12} className="fill-amber-400" />
                          <span>{vol.rating.toFixed(1)}</span>
                        </div>
                        <span className={`text-[8px] font-mono font-black mt-1 inline-block px-1.5 py-0.5 rounded ${
                          vol.isActiveDuty ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {vol.isActiveDuty ? 'ACTIVE' : 'STANDBY'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated alert dispatching triggers */}
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-400 animate-pulse" />
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Live Simulation Dashboard</p>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tight font-medium leading-relaxed">
                    Test the real-time Socket.io notification alerts instantly right in this frame:
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTriggerSimulateAlert('BROADCAST')}
                      className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                    >
                      Trigger Mock Alert
                    </button>
                    <button 
                      onClick={() => handleTriggerSimulateAlert('REQUEST')}
                      className="flex-1 py-2.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                    >
                      Trigger Mock Help
                    </button>
                  </div>
                </div>
              </div>

              {/* Right hand layout showing spatial visualizer map */}
              <div className="lg:col-span-7 bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Vanguard Defense Grid</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Incident locations & Active volunteer coordinates</p>
                </div>

                {/* Spatial Grid representation */}
                <div className="h-[380px] bg-[#050b18] border-2 border-white/5 rounded-[32px] p-4 relative overflow-hidden flex items-center justify-center">
                  
                  {/* Glowing Radar scan rings */}
                  <div className="absolute w-[300px] h-[300px] border border-indigo-500/10 rounded-full animate-ping pointer-events-none" />
                  <div className="absolute w-[180px] h-[180px] border border-indigo-500/5 rounded-full animate-ping pointer-events-none" style={{ animationDelay: '1s' }} />
                  <div className="absolute w-[1px] h-full bg-indigo-500/5 left-1/2 top-0" />
                  <div className="absolute h-[1px] w-full bg-indigo-500/5 top-1/2 left-0" />

                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Centered citizen point */}
                  <div className="absolute z-10 flex flex-col items-center justify-center gap-1">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full border-4 border-[#050b18] shadow-[0_0_20px_rgba(79,70,229,1)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <span className="text-[8px] font-mono font-black text-indigo-300 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded border border-white/10">You (Client)</span>
                  </div>

                  {/* Volunteers positions */}
                  {volunteers.filter(v => v.isActiveDuty).map((vol, i) => {
                    const xOffset = ((vol.latitude - 17.6868) * 3500) % 150;
                    const yOffset = ((vol.longitude - 83.2185) * 3500) % 150;
                    return (
                      <div 
                        key={vol.id}
                        className="absolute flex flex-col items-center justify-center gap-1 group cursor-pointer transition-transform hover:scale-110 z-10"
                        style={{ transform: `translate(${xOffset}px, ${yOffset}px)` }}
                      >
                        <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050b18] shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                        <span className="text-[7px] font-mono font-black text-emerald-400 bg-slate-950 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {vol.name} ({vol.rating}⭐)
                        </span>
                      </div>
                    );
                  })}

                  {/* Help requests pending positions */}
                  {helpRequests.filter(r => r.status === 'PENDING').map((req, i) => {
                    const xOffset = ((req.latitude - 17.6868) * 3200) % 130;
                    const yOffset = ((req.longitude - 83.2185) * 3200) % 130;
                    return (
                      <div 
                        key={req.id}
                        className="absolute flex flex-col items-center justify-center gap-1 group cursor-pointer transition-transform hover:scale-110 z-10 animate-bounce"
                        style={{ transform: `translate(${xOffset}px, ${yOffset}px)` }}
                      >
                        <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-[#050b18] shadow-[0_0_15px_rgba(220,38,38,0.8)] flex items-center justify-center text-[10px] text-white">
                          ⚠️
                        </div>
                        <span className="text-[7px] font-mono font-black text-red-400 bg-slate-950 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {req.category} DISPATCH
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span>Volunteers Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                    <span>Distress Beacons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                    <span>Client Safe Center</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB CONTENT: HELP DISPATCH CENTER (HELP REQUESTS) */}
          {activeTab === 'HELP_REQUESTS' && (
            <div className="lg:col-span-12 space-y-10 animate-in fade-in">
              <div className="grid md:grid-cols-12 gap-10 items-start">
                
                {/* Form to submit help request */}
                <div className="md:col-span-5 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Signal For Aid</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Instantly Alerts nearby volunteers</p>
                  </div>

                  <form onSubmit={handleCreateHelpRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Emergency Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['MEDICAL', 'SECURITY', 'ACCIDENT', 'HARASSMENT', 'OTHER'] as const).map(cat => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setReqCategory(cat)}
                            className={`py-3 px-2 rounded-xl border text-[10px] font-black tracking-wider uppercase text-center transition-all ${
                              reqCategory === cat 
                                ? 'bg-red-600/15 border-red-500 text-red-400 shadow-md' 
                                : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Exact Spot / Landmark</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Platform B near main escalator..."
                        value={reqLocation}
                        onChange={e => setReqLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Crisis Incident Context</label>
                      <textarea 
                        rows={3}
                        placeholder="Describe what occurred, immediate help needed, any visible markers or risks..."
                        value={reqDesc}
                        onChange={e => setReqDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Urgency Priority Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['MEDIUM', 'HIGH', 'CRITICAL'] as const).map(lvl => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setReqUrgency(lvl)}
                            className={`py-2.5 rounded-xl border text-[10px] font-black uppercase text-center transition-all ${
                              reqUrgency === lvl 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReq}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
                    >
                      {isSubmittingReq ? 'BROADCASTING DISPATCH...' : 'SEND SOS DISPATCH REQUEST'}
                    </button>
                  </form>
                </div>

                {/* Right Feed of requests */}
                <div className="md:col-span-7 bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Distress Feeds</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Claimed & Pending Rescue operations</p>
                  </div>

                  <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                    {helpRequests.map(req => (
                      <div 
                        key={req.id} 
                        className={`p-6 bg-white/5 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between ${
                          req.status === 'RESOLVED' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className={`absolute left-0 top-0 w-1.5 h-full ${
                          req.status === 'RESOLVED' 
                            ? 'bg-emerald-500' 
                            : req.status === 'CLAIMED' 
                              ? 'bg-indigo-500' 
                              : 'bg-red-500'
                        }`} />

                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                req.status === 'RESOLVED' 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : req.status === 'CLAIMED' 
                                    ? 'bg-indigo-500/10 text-indigo-400' 
                                    : 'bg-red-500/10 text-red-400'
                              }`}>
                                {req.status}
                              </span>
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                                {req.category}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight mt-2">{req.locationName}</h4>
                            <p className="text-xs text-slate-300 italic font-medium mt-1 leading-relaxed">"{req.description}"</p>
                          </div>

                          <span className={`px-2.5 py-1 font-mono font-black text-[8px] rounded ${
                            req.urgency === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 mt-4 text-[10px]">
                          <div className="text-slate-500 font-bold uppercase tracking-wide">
                            <span>Reporter: {req.reporterName}</span>
                            {req.claimedByVolunteerName && (
                              <span className="text-indigo-400 block mt-0.5">Claimed by {req.claimedByVolunteerName}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Witness Testimony action button */}
                            <button 
                              onClick={() => handleSelectRequest(req)}
                              className="px-4 py-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare size={12} />
                              Witnesses ({testimonies.filter(w => w.helpRequestId === req.id).length || 0})
                            </button>

                            {req.status === 'PENDING' && myVolunteerProfile?.isVerified && (
                              <button 
                                onClick={() => handleClaimRequest(req.id)}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                Accept Mission
                              </button>
                            )}

                            {req.status === 'CLAIMED' && (
                              <button 
                                onClick={() => handleResolveRequest(req.id)}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Witness Testimonies drawer modal overlay */}
              {selectedRequest && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[40px] p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                    
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>

                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Incident witness system</span>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight mt-1">{selectedRequest.locationName}</h4>
                      <p className="text-xs text-slate-400 mt-2">Submit testimonies or evidence files to safeguard accountability and aid en-route responders.</p>
                    </div>

                    {/* Testimony submission form */}
                    <form onSubmit={handleAddWitness} className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider font-mono">Submit Testimony</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text"
                          placeholder="Your Name..."
                          value={witnessName}
                          onChange={e => setWitnessName(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white"
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-white/5 rounded-xl p-2 text-center cursor-pointer flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 transition-colors"
                        >
                          <Upload size={14} />
                          {witnessFile ? 'Photo Loaded' : 'Attach Photo'}
                          <input 
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>

                      <textarea 
                        rows={2}
                        placeholder="Provide details about what you witnessed at the scene..."
                        value={witnessText}
                        onChange={e => setWitnessText(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                        required
                      />

                      <button 
                        type="submit"
                        disabled={isSubmittingWitness}
                        className="w-full py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-colors"
                      >
                        {isSubmittingWitness ? 'TRANSFUSING TESTIMONY...' : 'UPLOAD WITNESS LOG ENTRY'}
                      </button>
                    </form>

                    {/* Witness Testimonies list */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Witness Log Records</p>
                      {testimonies.length === 0 ? (
                        <p className="text-xs text-slate-500 font-bold uppercase text-center py-6">No witness entries registered yet for this incident.</p>
                      ) : (
                        <div className="space-y-3">
                          {testimonies.map(t => (
                            <div key={t.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 text-[9px] text-indigo-400 font-mono font-black uppercase">
                                  <span>{t.witnessName}</span>
                                  <span>•</span>
                                  <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-xs text-slate-300 font-semibold italic">"{t.testimony}"</p>
                              </div>
                              {t.photoBase64 && (
                                <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                                  <img src={t.photoBase64} alt="Evidence" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SAFETY BROADCASTS */}
          {activeTab === 'BROADCASTS' && (
            <>
              {/* Broadcast creation panel */}
              <div className="lg:col-span-5 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Issue Broadcast</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Broadcast safety alerts to the community</p>
                </div>

                <form onSubmit={handleCreateBroadcast} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sector Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Northeast subway corridor..."
                      value={broadLocation}
                      onChange={e => setBroadLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Broadcast Alert Message</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Flash floods warning or dynamic infrastructure closure details..."
                      value={broadMsg}
                      onChange={e => setBroadMsg(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Threat/Severity Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(lvl => (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => setBroadSeverity(lvl)}
                          className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase text-center transition-all ${
                            broadSeverity === lvl 
                              ? 'bg-red-600/20 border-red-500 text-red-400' 
                              : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
                  >
                    {isBroadcasting ? 'TRANSMITTING...' : 'SEND BROADCAST'}
                  </button>
                </form>
              </div>

              {/* Broadcasts Feed */}
              <div className="lg:col-span-7 bg-zinc-950 p-10 rounded-[48px] border border-white/5 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Broadcast Grid</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Enforcing neighborhood vigilance</p>
                </div>

                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2">
                  {broadcasts.map(broad => (
                    <div key={broad.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl relative overflow-hidden space-y-3">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{broad.locationName}</h4>
                          <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Posted by {broad.senderName} • {new Date(broad.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-[8px] font-black rounded-full uppercase tracking-wider ${
                          broad.severity === 'CRITICAL' 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-indigo-600/20 text-indigo-400'
                        }`}>
                          {broad.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"{broad.message}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB CONTENT: VOLUNTEER VERIFICATION APPLICATION */}
          {activeTab === 'VERIFICATION' && (
            <div className="lg:col-span-12 space-y-10 animate-in fade-in">
              <div className="grid md:grid-cols-12 gap-10 items-start">
                
                {/* Information panel */}
                <div className="md:col-span-5 bg-zinc-950 p-8 rounded-[40px] border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Become A Vanguard Responder</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Help secure nearby lives</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed uppercase font-medium">
                    Our platform relies on a verified, highly capable civil patrol network. Verified volunteers have authorization to claim active rescue missions, coordinates are streamed to dispatchers, and they obtain standard badges of honor.
                  </p>

                  <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl space-y-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mono">Current Application Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-mono font-black text-white uppercase">
                        {myVolunteerProfile 
                          ? `STATUS: ${myVolunteerProfile.verificationStatus}` 
                          : 'STATUS: NOT APPLIED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Application submission panel */}
                <div className="md:col-span-7 bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Credentials Transmission</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">End-to-end encrypted storage</p>
                  </div>

                  {myVolunteerProfile && myVolunteerProfile.isVerified ? (
                    <div className="p-10 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[32px] text-center space-y-4">
                      <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">Identity Fully Verified</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Your professional profile is active on the secure community network index. You have full clearance to intercept active rescue missions and stream real-time GPS telemetry.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyVerification} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Professional Credentials</label>
                        <textarea 
                          rows={3}
                          placeholder="e.g. Certified CPR Instructor, EMT-B training, medical qualifications, or former safety coordinator details..."
                          value={vCreds}
                          onChange={e => setVCreds(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Specialized Skills (Comma-separated)</label>
                        <input 
                          type="text" 
                          placeholder="First Aid, CPR, Crisis Counseling, Physical Security..."
                          value={vSkillsInput}
                          onChange={e => setVSkillsInput(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl text-xs text-white placeholder-slate-600 font-semibold focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isApplyingVerif}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
                      >
                        {isApplyingVerif ? 'TRANSMITTING VERIFICATION MATRICES...' : 'SUBMIT PATROL PATRON APPLICATION'}
                      </button>
                    </form>
                  )}

                  {/* ADMIN SIMULATION VERIFIER HUB (Highly convenient for quick tests inside iframe) */}
                  <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl space-y-4 mt-6">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-indigo-400" />
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Operator Approvals Panel (Developer Convenience)</p>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Simulate verification status approval/rejection instantly inside this panel:
                    </p>

                    <div className="space-y-2">
                      {volunteers.map(vol => (
                        <div key={vol.id} className="flex justify-between items-center p-3 bg-zinc-950/80 rounded-xl border border-white/5 text-xs">
                          <span className="font-bold text-white uppercase">{vol.name}</span>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-mono font-black text-slate-500 uppercase px-1.5 py-0.5 bg-slate-900 rounded">{vol.verificationStatus}</span>
                            <button 
                              onClick={() => handleAdminVerify(vol.id, 'VERIFIED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black rounded uppercase"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAdminVerify(vol.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black rounded uppercase"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: VOLUNTEER DISPATCH MODULE */}
          {activeTab === 'DISPATCH' && (
            <div className="lg:col-span-12 grid lg:grid-cols-12 gap-8 animate-in fade-in">
              
              {/* Left Column: Distress Incidents & Active Beacons */}
              <div className="lg:col-span-4 bg-zinc-950 p-6 rounded-[32px] border border-white/5 space-y-4">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-tight">Distress Dispatch Log</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Select incident to resolve</p>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {helpRequests.filter(r => r.status !== 'RESOLVED').length === 0 ? (
                    <div className="p-8 text-center border border-white/5 rounded-2xl bg-white/5">
                      <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">No Active Incidents</p>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold mt-1">All distress beacons cleared!</p>
                    </div>
                  ) : (
                    helpRequests.filter(r => r.status !== 'RESOLVED').map(req => {
                      const isSelected = req.id === selectedIncidentId;
                      return (
                        <div 
                          key={req.id}
                          onClick={() => setSelectedIncidentId(req.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                            isSelected 
                              ? 'bg-indigo-600/10 border-indigo-500/80' 
                              : 'bg-white/5 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className={`absolute left-0 top-0 w-1 h-full ${
                            req.urgency === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'
                          }`} />

                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[8px] font-mono font-black px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded uppercase">
                              {req.category}
                            </span>
                            <span className={`text-[8px] font-mono font-black uppercase ${
                              req.urgency === 'CRITICAL' ? 'text-red-400 animate-pulse' : 'text-orange-400'
                            }`}>
                              {req.urgency}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                            {req.locationName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                            "{req.description}"
                          </p>

                          <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-2 text-[8px] font-mono text-slate-500 uppercase">
                            <span>{new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className={`font-black ${
                              req.assignmentStatus === 'ACCEPTED' 
                                ? 'text-emerald-400' 
                                : req.assignmentStatus === 'PENDING' 
                                  ? 'text-yellow-400 animate-pulse' 
                                  : 'text-red-400'
                            }`}>
                              {req.assignmentStatus ? `STATUS: ${req.assignmentStatus}` : 'STATUS: UNASSIGNED'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[8px] font-mono font-black text-indigo-400 uppercase tracking-widest">OPERATIONAL MEMORANDUM</p>
                  <p className="text-[9px] text-slate-400 uppercase font-medium leading-relaxed">
                    Vanguard Dispatch coordinates nearby active-duty rescue agents instantly over encrypted Socket.io bridges to maximize citizen safety response rates.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Dispatch Tactical Operations Hub */}
              <div className="lg:col-span-8 bg-zinc-950 p-8 rounded-[40px] border border-white/5 min-h-[500px] flex flex-col justify-between">
                {!selectedIncident ? (
                  <div className="m-auto text-center max-w-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
                      <Radio className="text-indigo-400 w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Awaiting Tactical Selection</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono mt-1">Select an active incident from the left log to deploy rescue resources</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    
                    {/* Part A: Incident Details Header */}
                    <div className="flex flex-wrap justify-between items-start gap-4 bg-[#0a0f1d] p-5 rounded-2xl border border-indigo-500/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                          <h4 className="text-sm font-black text-red-500 uppercase tracking-widest font-mono">ACTIVE DISTRESS BEACON</h4>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">{selectedIncident.locationName}</h3>
                        <p className="text-xs text-slate-300 italic font-medium mt-1">"{selectedIncident.description}"</p>
                      </div>

                      <div className="text-right text-[10px] font-mono space-y-1">
                        <p className="text-slate-400 uppercase font-bold">REPORTER: <span className="text-white">{selectedIncident.reporterName}</span></p>
                        <p className="text-slate-400 uppercase font-bold">CONTACT: <span className="text-white">{selectedIncident.reporterPhone}</span></p>
                        <p className="text-slate-400 uppercase font-bold">GPS: <span className="text-indigo-400">{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span></p>
                      </div>
                    </div>

                    {/* Part B: Dispatch Assignment & Live Tracking */}
                    <div className="flex-1 mt-6">
                      
                      {/* Scenario 1: Awaiting Assignment */}
                      {!selectedIncident.assignedVolunteerId && (
                        <div className="space-y-4 animate-in fade-in">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Nearby Volunteers Discovery</h4>
                            <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              {volunteers.filter(v => v.isActiveDuty).length} ON-DUTY NOW
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            {volunteers.filter(v => v.isActiveDuty).length === 0 ? (
                              <div className="sm:col-span-2 p-8 text-center border border-white/5 rounded-2xl bg-white/5">
                                <Users size={24} className="text-slate-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-400 font-bold uppercase">No On-Duty Volunteers Detected</p>
                                <p className="text-[9px] text-slate-500 uppercase font-medium mt-1">
                                  Go to the "Volunteer Verification" tab to approve volunteers or toggle active state
                                </p>
                              </div>
                            ) : (
                              volunteers
                                .filter(v => v.isActiveDuty)
                                .map(vol => {
                                  const distance = getDistance(
                                    selectedIncident.latitude, 
                                    selectedIncident.longitude, 
                                    vol.latitude, 
                                    vol.longitude
                                  );
                                  return (
                                    <div key={vol.id} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all">
                                      <div>
                                        <div className="flex justify-between items-start gap-2">
                                          <p className="text-xs font-black text-white uppercase">{vol.name}</p>
                                          <span className="text-[8px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
                                            {distance} km away
                                          </span>
                                        </div>
                                        <p className="text-[8px] font-mono text-slate-400 uppercase mt-1">
                                          SKILLS: {vol.skills.slice(0, 2).join(' • ')}
                                        </p>
                                        <div className="flex items-center gap-1 text-[8px] font-bold text-amber-400 uppercase mt-1">
                                          <Star size={10} className="fill-amber-400" />
                                          <span>{vol.rating.toFixed(1)} / 5.0 Rating</span>
                                        </div>
                                      </div>

                                      <button 
                                        onClick={() => handleAssignIncident(selectedIncident.id, vol.id)}
                                        className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <ShieldCheck size={12} />
                                        Deploy & Dispatch
                                      </button>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Scenario 2: Proposed / Awaiting radio acknowledgement */}
                      {selectedIncident.assignedVolunteerId && selectedIncident.assignmentStatus === 'PENDING' && (
                        <div className="p-8 bg-amber-500/5 border-2 border-amber-500/20 rounded-[32px] text-center space-y-6 animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                            <Clock className="text-amber-400 w-6 h-6 animate-spin" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">PROPOSAL TRANSMITTED</h4>
                            <p className="text-xs text-slate-300 max-w-sm mx-auto mt-2 font-medium">
                              Awaiting critical radio acceptance from Vanguard officer <span className="text-indigo-400 font-bold uppercase">{selectedIncident.assignedVolunteerName}</span>. Coordinates, telemetry links, and hazard status are staged.
                            </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 space-y-3">
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MOCK VOLUNTEER INTERACTION TERMINAL</p>
                            <div className="flex gap-4 max-w-md mx-auto">
                              <button 
                                onClick={() => handleRespondAssignment(selectedIncident.id, 'ACCEPTED')}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                              >
                                Accept Dispatch Invitation
                              </button>
                              <button 
                                onClick={() => handleRespondAssignment(selectedIncident.id, 'REJECTED')}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                              >
                                Reject & Declining
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scenario 3: Rescue Active & Live Tracking Telemetry Map */}
                      {selectedIncident.assignedVolunteerId && selectedIncident.assignmentStatus === 'ACCEPTED' && (
                        <div className="grid md:grid-cols-12 gap-6 animate-in fade-in">
                          
                          {/* Telemetry tracking and map visualizer */}
                          <div className="md:col-span-7 bg-[#040813] border border-white/5 p-5 rounded-3xl flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-wider">LIVE TELEMETRY ACTIVE</span>
                                </div>
                                <span className="text-[8px] font-mono text-slate-500 uppercase">1Hz REFRESH SPEED</span>
                              </div>

                              {/* Path Progression Visualizer */}
                              <div className="h-44 bg-zinc-950 border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
                                {/* Grid background */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:16px_16px]" />
                                
                                {/* Pulse circles */}
                                <div className="absolute w-24 h-24 border border-indigo-500/10 rounded-full animate-ping pointer-events-none" />

                                {/* Interactive linear line representing distance */}
                                <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full relative">
                                  {/* Incident location indicator */}
                                  <div className="absolute right-0 -top-2 flex flex-col items-center">
                                    <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black">
                                      🚨
                                    </div>
                                    <span className="text-[6px] font-mono text-red-400 font-bold uppercase mt-1 whitespace-nowrap">Target</span>
                                  </div>

                                  {/* Volunteer moving indicator */}
                                  {selectedIncident.liveLocation && (
                                    <div 
                                      className="absolute -top-2 flex flex-col items-center transition-all duration-1000"
                                      style={{ 
                                        left: `${Math.min(100, Math.max(0, 100 - (selectedIncident.etaMinutes || 0) * 12))}%` 
                                      }}
                                    >
                                      <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                      <span className="text-[6px] font-mono text-emerald-400 font-bold uppercase mt-1 whitespace-nowrap">Officer</span>
                                    </div>
                                  )}
                                </div>

                                <div className="absolute bottom-2 text-center">
                                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                                    {selectedIncident.etaMinutes && selectedIncident.etaMinutes > 0 
                                      ? `DISTANCE DETECTED: EN-ROUTE (ETA: ${selectedIncident.etaMinutes} MINS)` 
                                      : 'PATROL HAS ARRIVED AT DISTRESS INTERSECTION!'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                                <p className="text-[8px] font-mono text-slate-500 uppercase font-bold">ESTIMATED ETA</p>
                                <p className="text-lg font-mono font-black text-indigo-400 mt-1">
                                  {selectedIncident.etaMinutes && selectedIncident.etaMinutes > 0 
                                    ? `${selectedIncident.etaMinutes} mins` 
                                    : 'ARRIVED'}
                                </p>
                              </div>
                              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                                <p className="text-[8px] font-mono text-slate-500 uppercase font-bold">CURRENT COORDINATES</p>
                                <p className="text-xs font-mono font-black text-white mt-1.5 truncate">
                                  {selectedIncident.liveLocation 
                                    ? `${selectedIncident.liveLocation.lat.toFixed(4)}, ${selectedIncident.liveLocation.lng.toFixed(4)}` 
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>

                          </div>

                          {/* Control panel and actions */}
                          <div className="md:col-span-5 bg-zinc-900/60 border border-white/5 p-5 rounded-3xl flex flex-col justify-between space-y-4">
                            <div>
                              <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">RADIO NEXUS LINKS</p>
                              <h4 className="text-xs font-black text-white uppercase tracking-tight">Active Duty Dispatch Control</h4>
                              <p className="text-[9px] text-slate-400 font-medium leading-relaxed uppercase mt-2">
                                Control and advance coordinates telemetry simulation to model real-time incident intercept en route.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <button 
                                onClick={() => {
                                  if (isSimulatingTelemetry === selectedIncident.id) {
                                    setIsSimulatingTelemetry(null);
                                  } else {
                                    setIsSimulatingTelemetry(selectedIncident.id);
                                  }
                                }}
                                className={`w-full py-3 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                  isSimulatingTelemetry === selectedIncident.id 
                                    ? 'bg-amber-600 hover:bg-amber-500' 
                                    : 'bg-[#101935] hover:bg-[#18254c] border border-indigo-500/30'
                                }`}
                              >
                                <RefreshCw size={12} className={isSimulatingTelemetry === selectedIncident.id ? 'animate-spin' : ''} />
                                {isSimulatingTelemetry === selectedIncident.id ? 'PAUSE AUTO-TRAFFIC' : 'ACTIVATE AUTO-DRIVE'}
                              </button>

                              <button 
                                onClick={() => handleAdvanceTelemetry(selectedIncident.id)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                              >
                                Step Telemetry (Manual +1)
                              </button>
                            </div>

                            {selectedIncident.etaMinutes === 0 && (
                              <button 
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/rescue/help-request/${selectedIncident.id}/resolve`, {
                                      method: 'POST'
                                    });
                                    if (res.ok) {
                                      setSelectedIncidentId(null);
                                      setIsSimulatingTelemetry(null);
                                      playAlertSound('info');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all animate-bounce"
                              >
                                Mark Rescue Completed
                              </button>
                            )}

                          </div>
                          
                        </div>
                      )}

                    </div>

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

export default CommunityRescueNetwork;
