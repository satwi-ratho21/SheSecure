import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Smartphone, Mail, ShieldAlert, CheckCircle2, AlertOctagon, 
  RefreshCw, Trash2, Send, Filter, Search, Shield, Server, Activity, 
  HelpCircle, ArrowRight, Check, X, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AppView, UserProfile, VanguardNotification } from '../types';

interface UnifiedNotificationCenterProps {
  profile: UserProfile | null;
  onNavigate?: (view: AppView) => void;
}

const UnifiedNotificationCenter: React.FC<UnifiedNotificationCenterProps> = ({ profile, onNavigate }) => {
  const [notifications, setNotifications] = useState<VanguardNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'FAILED' | 'PENDING'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');

  // Form Dispatch states
  const [dispatchChannel, setDispatchChannel] = useState<'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP'>('SMS');
  const [dispatchPriority, setDispatchPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [dispatchRecipient, setDispatchRecipient] = useState('+1 (555) 382-9102');
  const [dispatchTitle, setDispatchTitle] = useState('Guardian Beacon Ping');
  const [dispatchMessage, setDispatchMessage] = useState('Vanguard system is monitoring your active route coordinates. Stay safe.');
  const [forceFailure, setForceFailure] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Action feedback states
  const [retryingIds, setRetryingIds] = useState<string[]>([]);
  const socketRef = useRef<any>(null);

  // Play synthetic system audio beep alert
  const playAlertSound = (type: 'success' | 'failure' | 'ping') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'failure') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(110, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      console.warn("Audio Context init blocked or not supported:", e);
    }
  };

  // Pre-fill recipient based on channel select
  useEffect(() => {
    if (dispatchChannel === 'SMS') {
      setDispatchRecipient(profile?.trustCircle?.[0]?.phone || '+1 (555) 382-9102');
      setDispatchTitle('Vanguard Guardian Warning');
    } else if (dispatchChannel === 'EMAIL') {
      setDispatchRecipient(profile?.email || 'satwi033@gmail.com');
      setDispatchTitle('Sealed Evidence Backups');
    } else if (dispatchChannel === 'PUSH') {
      setDispatchRecipient('Satwinder Mobile Device #1');
      setDispatchTitle('Safe Route Alert');
    } else {
      setDispatchRecipient('Global Broadcast Mesh');
      setDispatchTitle('Regional Safety Intelligence Bulletin');
    }
  }, [dispatchChannel, profile]);

  // Load all notifications initially
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Setup live WebSockets connection
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log(`[Unified Notifications Socket Client] Live link linked: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('new-vanguard-notification', (notif: VanguardNotification) => {
      setNotifications(prev => [notif, ...prev]);
      playAlertSound('ping');
    });

    socket.on('vanguard-notification-updated', (notif: VanguardNotification) => {
      setNotifications(prev => prev.map(n => n.id === notif.id ? notif : n));
      if (notif.status === 'SENT') {
        playAlertSound('success');
      } else if (notif.status === 'FAILED') {
        playAlertSound('failure');
      }
    });

    socket.on('vanguard-notification-deleted', (data: { id: string }) => {
      setNotifications(prev => prev.filter(n => n.id !== data.id));
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Trigger Outbound Notification Dissemination
  const handleDisseminate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTitle.trim() || !dispatchMessage.trim()) return;

    setIsSending(true);
    try {
      const payload = {
        channel: dispatchChannel,
        priority: dispatchPriority,
        recipient: dispatchRecipient,
        title: dispatchTitle,
        message: dispatchMessage,
        status: forceFailure ? 'FAILED' : 'SENT',
        ownerEmail: profile?.email || 'satwi033@gmail.com'
      };

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDispatchMessage('');
        if (forceFailure) {
          playAlertSound('failure');
        } else {
          playAlertSound('success');
        }
      }
    } catch (err) {
      console.error(err);
      playAlertSound('failure');
    } finally {
      setIsSending(false);
    }
  };

  // Trigger Retry Transmission for single failed alert
  const handleRetryNotification = async (id: string) => {
    if (retryingIds.includes(id)) return;
    
    setRetryingIds(prev => [...prev, id]);
    playAlertSound('ping');

    // Simulate 1.5 seconds network delay for high fidelity
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/notifications/${id}/retry`, {
          method: 'POST'
        });
        if (res.ok) {
          // Socket will broadcast the update, but let's refresh locally as fallback
          const data = await res.json();
          setNotifications(prev => prev.map(n => n.id === id ? data.notification : n));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRetryingIds(prev => prev.filter(item => item !== id));
      }
    }, 1500);
  };

  // Delete notification log entry
  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/delete`, {
        method: 'POST'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        playAlertSound('success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Statistics summaries
  const totalCount = notifications.length;
  const sentCount = notifications.filter(n => n.status === 'SENT').length;
  const failedCount = notifications.filter(n => n.status === 'FAILED').length;
  const pendingCount = notifications.filter(n => n.status === 'PENDING').length;
  const successRate = totalCount > 0 ? Math.round((sentCount / (totalCount - pendingCount)) * 100) : 100;

  const smsCount = notifications.filter(n => n.channel === 'SMS').length;
  const pushCount = notifications.filter(n => n.channel === 'PUSH').length;
  const emailCount = notifications.filter(n => n.channel === 'EMAIL').length;
  const inAppCount = notifications.filter(n => n.channel === 'IN_APP').length;

  // Render correct icon for each channel
  const getChannelIcon = (channel: 'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP', className = "w-4 h-4") => {
    switch (channel) {
      case 'SMS': return <Smartphone className={className} />;
      case 'PUSH': return <Bell className={className} />;
      case 'EMAIL': return <Mail className={className} />;
      case 'IN_APP': return <ShieldAlert className={className} />;
    }
  };

  // Render correct color for priority tag
  const getPriorityBadge = (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (priority) {
      case 'LOW': 
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">LOW</span>;
      case 'MEDIUM': 
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">MEDIUM</span>;
      case 'HIGH': 
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">HIGH</span>;
      case 'CRITICAL': 
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase animate-bounce">CRITICAL</span>;
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChannel = channelFilter === 'ALL' || notif.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || notif.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || notif.priority === priorityFilter;

    return matchesSearch && matchesChannel && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100" id="unified-notifications-view">
      
      {/* Cybernetic Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-black uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4 animate-pulse" />
            <span>Tactical Intelligence Mesh</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Unified Notification Center
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">
            Encrypted alert dispatcher bridging SMS carriers, email clusters, push networks, and local telemetry
          </p>
        </div>

        {/* HUD connection and sound status panels */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase font-bold">
          <button 
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`px-3 py-1.5 border rounded-full transition-all ${
              soundEnabled 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                : 'bg-zinc-900 border-white/5 text-slate-500'
            }`}
          >
            AUDIO FEEDBACK: {soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>

          <div className={`px-3 py-1.5 border rounded-full flex items-center gap-1.5 ${
            socketConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
            SOCKET BRIDGE: {socketConnected ? 'SYNCED' : 'OFFLINE'}
          </div>

          {onNavigate && (
            <button 
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full transition-all text-white flex items-center gap-1"
            >
              Back to HUD <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of panels */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Admin dispatch & statistics (Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Admin Stats Panel */}
          <div className="bg-zinc-950 p-6 rounded-[32px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Server size={80} className="text-indigo-400" />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Gateway Operational Metrics</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Real-time carrier packet statistics</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <p className="text-[8px] font-mono text-slate-500 uppercase font-black">Total Transmitted</p>
                <p className="text-2xl font-mono font-black text-white mt-1">{totalCount}</p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <p className="text-[8px] font-mono text-slate-500 uppercase font-black">Success Delivery Rate</p>
                <p className={`text-2xl font-mono font-black mt-1 ${
                  successRate > 90 ? 'text-emerald-400' : successRate > 70 ? 'text-amber-400' : 'text-red-400'
                }`}>{successRate}%</p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <p className="text-[8px] font-mono text-slate-500 uppercase font-black">Routing Failed</p>
                <p className={`text-2xl font-mono font-black mt-1 ${failedCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                  {failedCount}
                </p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <p className="text-[8px] font-mono text-slate-500 uppercase font-black">In Queue</p>
                <p className="text-2xl font-mono font-black text-indigo-400 mt-1">{pendingCount}</p>
              </div>
            </div>

            {/* Channel distribution graph summary */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-wider">Channel Distribution</h4>
              
              <div className="space-y-2.5">
                {/* SMS channel block */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Smartphone className="w-3 h-3 text-cyan-400" /> SMS Carriers
                    </span>
                    <span>{smsCount} packets</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${totalCount > 0 ? (smsCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Push notification block */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Bell className="w-3 h-3 text-indigo-400" /> Push Notifications
                    </span>
                    <span>{pushCount} packets</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: `${totalCount > 0 ? (pushCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Email block */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Mail className="w-3 h-3 text-purple-400" /> Email Clusters
                    </span>
                    <span>{emailCount} packets</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${totalCount > 0 ? (emailCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* In-App Alerts block */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> In-App Alerts
                    </span>
                    <span>{inAppCount} packets</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${totalCount > 0 ? (inAppCount / totalCount) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Outbound Dispatch Form Panel */}
          <div className="bg-zinc-950 p-6 rounded-[32px] border border-white/5">
            <div className="mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Outbound Alert Dissemination</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Deploy high-priority community emergency broadcasts</p>
            </div>

            <form onSubmit={handleDisseminate} className="space-y-4">
              
              {/* Channel Selector */}
              <div>
                <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Delivery Channel</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['SMS', 'PUSH', 'EMAIL', 'IN_APP'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setDispatchChannel(ch)}
                      className={`py-2 px-1 text-[9px] font-mono font-black uppercase rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        dispatchChannel === ch 
                          ? 'bg-indigo-600/15 border-indigo-500/80 text-white' 
                          : 'bg-zinc-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {getChannelIcon(ch, "w-3.5 h-3.5")}
                      {ch === 'IN_APP' ? 'IN-APP' : ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Tier */}
              <div>
                <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority Classification</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(pr => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setDispatchPriority(pr)}
                      className={`py-1.5 text-[9px] font-mono font-black uppercase rounded-xl border transition-all ${
                        dispatchPriority === pr 
                          ? pr === 'CRITICAL' 
                            ? 'bg-red-600/20 border-red-500/80 text-red-400' 
                            : pr === 'HIGH' 
                              ? 'bg-amber-600/20 border-amber-500/80 text-amber-400'
                              : pr === 'MEDIUM'
                                ? 'bg-indigo-600/20 border-indigo-500/80 text-indigo-400'
                                : 'bg-slate-700/20 border-slate-500/80 text-slate-400'
                          : 'bg-zinc-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Event signature title */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Target Recipient Address</label>
                  <input 
                    type="text"
                    value={dispatchRecipient}
                    onChange={(e) => setDispatchRecipient(e.target.value)}
                    placeholder="Recipient phone or email"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Event Header Signature</label>
                  <input 
                    type="text"
                    value={dispatchTitle}
                    onChange={(e) => setDispatchTitle(e.target.value)}
                    placeholder="Signature header label"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Message Payload */}
              <div>
                <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Encrypted Notification Message Body</label>
                <textarea 
                  value={dispatchMessage}
                  onChange={(e) => setDispatchMessage(e.target.value)}
                  placeholder="Draft emergency notification details..."
                  className="w-full h-24 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Force failure flag (high fidelity troubleshooting simulation) */}
              <div className="flex items-center gap-3 p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
                <input 
                  type="checkbox"
                  id="force-failure-checkbox"
                  checked={forceFailure}
                  onChange={(e) => setForceFailure(e.target.checked)}
                  className="w-4 h-4 accent-red-500 cursor-pointer rounded bg-zinc-900 border-white/10"
                />
                <label htmlFor="force-failure-checkbox" className="text-[10px] font-bold text-red-400 uppercase cursor-pointer select-none">
                  Simulate routing failure (Force status: FAILED)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Transmitting payload packet...
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    Disseminate Outbound Alert
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive logs, retries & filters (Span 7) */}
        <div className="lg:col-span-7 bg-zinc-950 p-6 sm:p-8 rounded-[40px] border border-white/5 min-h-[600px] flex flex-col justify-between">
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* Part A: Filters, Search, & Settings Header */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-black text-white uppercase tracking-tight">Vanguard Dispatch logs</h3>
                <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-black">
                  {filteredNotifications.length} MATCHES FOUND
                </span>
              </div>

              {/* Search input field */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search packet titles, messages, or target recipients..."
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Triple Filter Controls */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Channel Filter */}
                <div>
                  <label className="block text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Channel filter</label>
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">ALL CHANNELS</option>
                    <option value="SMS">SMS ONLY</option>
                    <option value="PUSH">PUSH ONLY</option>
                    <option value="EMAIL">EMAIL ONLY</option>
                    <option value="IN_APP">IN-APP ONLY</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Delivery Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">ALL STATUSES</option>
                    <option value="SENT">DELIVERED (SENT)</option>
                    <option value="FAILED">ROUTING FAILED</option>
                    <option value="PENDING">PENDING IN QUEUE</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Priority tag</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">ALL PRIORITIES</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Part B: Live History List */}
            <div className="flex-1 overflow-y-auto max-h-[600px] pr-1 space-y-4">
              <AnimatePresence initial={false}>
                {filteredNotifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center border border-white/5 rounded-[32px] bg-white/5 m-auto"
                  >
                    <AlertOctagon size={40} className="text-slate-500 mx-auto mb-3" />
                    <h4 className="text-sm font-black text-white uppercase">No Alerts Found</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Adjust your diagnostic filters or submit an outbound broadcast alert</p>
                  </motion.div>
                ) : (
                  filteredNotifications.map(notif => {
                    const isRetrying = retryingIds.includes(notif.id);
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                          notif.status === 'FAILED' 
                            ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/25' 
                            : notif.priority === 'CRITICAL'
                              ? 'bg-[#150a0a] border-red-500/20 hover:border-red-500/40'
                              : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Urgent subtle glow effect for critical logs */}
                        {notif.priority === 'CRITICAL' && notif.status !== 'FAILED' && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-xl pointer-events-none rounded-full" />
                        )}

                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3">
                            {/* Visual circle indicating delivery channel */}
                            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                              notif.status === 'FAILED'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : notif.channel === 'SMS'
                                  ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                                  : notif.channel === 'PUSH'
                                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                                    : notif.channel === 'EMAIL'
                                      ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                                      : 'bg-red-500/10 border-red-500/25 text-red-400'
                            }`}>
                              {getChannelIcon(notif.channel)}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-xs font-black text-white uppercase tracking-tight">
                                  {notif.title}
                                </h4>
                                {getPriorityBadge(notif.priority)}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {notif.message}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-mono text-slate-500 uppercase pt-1">
                                <span className="font-bold">TARGET: <span className="text-indigo-400">{notif.recipient}</span></span>
                                <span>RETRY COUNT: <span className="text-slate-300">{notif.retryCount || 0}</span></span>
                                <span>{new Date(notif.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Action & Status Badge Block */}
                          <div className="flex flex-col items-end gap-3 font-mono flex-shrink-0">
                            {/* Status Badge */}
                            {notif.status === 'SENT' && (
                              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                <CheckCircle2 size={10} /> Delivered
                              </span>
                            )}
                            {notif.status === 'FAILED' && (
                              <span className="text-[8px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1 uppercase animate-pulse">
                                <AlertCircle size={10} /> Routing Failed
                              </span>
                            )}
                            {notif.status === 'PENDING' && (
                              <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                <Clock size={10} className="animate-spin" /> In Queue
                              </span>
                            )}

                            {/* Options action buttons */}
                            <div className="flex items-center gap-1.5">
                              {notif.status === 'FAILED' && (
                                <button
                                  onClick={() => handleRetryNotification(notif.id)}
                                  disabled={isRetrying}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-1 text-[8px] font-black uppercase"
                                  title="Retry Packet Delivery"
                                >
                                  <RefreshCw size={10} className={isRetrying ? 'animate-spin' : ''} />
                                  {isRetrying ? 'Retrying...' : 'Retry'}
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDeleteNotification(notif.id)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-500 hover:text-red-400 border border-white/5 rounded-lg transition-colors"
                                title="Remove Entry"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable detailed fail report if status is FAILED */}
                        {notif.status === 'FAILED' && notif.failureReason && (
                          <div className="mt-3.5 p-3 bg-red-950/20 border border-red-500/15 rounded-xl space-y-1 text-[10px]">
                            <p className="font-mono font-black text-red-400 uppercase tracking-widest">GATEWAY DIAGNOSTICS DEVIATION LOG:</p>
                            <p className="text-slate-400 italic">
                              "{notif.failureReason}"
                            </p>
                          </div>
                        )}

                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Tactical Operational Notice */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 space-y-1.5">
              <p className="text-[8px] font-mono font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} className="text-indigo-400 animate-pulse" /> SYSTEM SAFETY INTEGRATION STATEMENT
              </p>
              <p className="text-[9px] text-slate-400 uppercase font-medium leading-relaxed">
                Packets are mirrored with military AES-256 blocks before dissemination. SMS routes are verified periodically via Twilio clusters. Safe Zone alerts route directly over immediate web broadcast pipelines.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default UnifiedNotificationCenter;
