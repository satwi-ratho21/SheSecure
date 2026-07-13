
import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from './types';
import EmergencySOS from './components/EmergencySOS';
import SafeZones from './components/SafeZones';
import DiscreetTools from './components/DiscreetTools';
import GuardianAI from './components/GuardianAI';
import VoiceAssistant from './components/VoiceAssistant';
import OnboardingFlow from './components/OnboardingFlow';
import SafeRoutes from './components/SafeRoutes';
import { DecoyOverlay } from './components/DecoyOverlay';
import EvidenceLocker from './components/EvidenceLocker';
import VigilanteCommunity from './components/VigilanteCommunity';
import MissingPersonPortal from './components/MissingPersonPortal';
import LegalResources from './components/LegalResources';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/VanguardSettings';
import SiteMap from './components/SiteMap';
import SafetyEducation from './components/SafetyEducation';
import InfrastructureMonitor from './components/InfrastructureMonitor';
import CyberSafetyReporting from './components/CyberSafetyReporting';
import CommunityRescueNetwork from './components/CommunityRescueNetwork';
import PublicHome from './components/PublicHome';
import AIThreatDetection from './components/AIThreatDetection';
import TrustedCircle from './components/TrustedCircle';
import UnifiedNotificationCenter from './components/UnifiedNotificationCenter';
import { TRANSLATIONS } from './services/translations';
import { Shield, MapPin, Lock, Brain, Users, Settings, Radio, Globe, BookOpen, Heart, ShieldAlert, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isDecoyActive, setIsDecoyActive] = useState(false);

  // Covert background Silent SOS broadcast action
  const triggerQuietSOS = async (reason: string) => {
    const jwtToken = localStorage.getItem('vs_jwt_token');
    
    // Save covert dispatch log entries to localStorage for verification
    const timestamp = new Date().toLocaleTimeString();
    const triggerLogs = JSON.parse(localStorage.getItem('vs_silent_sos_logs') || '[]');
    const newLog = `[${timestamp}] GLOBAL COVERT: ${reason}`;
    localStorage.setItem('vs_silent_sos_logs', JSON.stringify([newLog, ...triggerLogs].slice(0, 50)));
    localStorage.setItem('vs_silent_sos_triggered_status', 'ACTIVE');

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    if (!jwtToken) {
      console.warn("[App Global SOS] Offline boundary: local storage cached.");
      return;
    }

    const sendData = async (lat: number, lng: number, details: string) => {
      try {
        const contacts = profile?.trustCircle || (profile as any)?.emergencyContacts || [];
        const recipients = contacts.map((c: any) => c.phone).filter(Boolean);
        const customMsg = localStorage.getItem('vs_custom_sos_message') || '';

        await fetch('/api/sos/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            coordinates: { lat, lng },
            emergencyMessage: `SILENT SOS BROADCAST: ${customMsg || "Assistance needed immediately."} Reason: ${details}`,
            recipients
          })
        });
      } catch (err) {
        console.error("Failed to POST silent SOS trigger:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendData(pos.coords.latitude, pos.coords.longitude, reason),
        () => sendData(41.8781, -87.6298, reason + " (GPS Lock timed out, fallback coordinates loaded)")
      );
    } else {
      sendData(41.8781, -87.6298, reason + " (GPS Not Supported)");
    }
  };

  // Setup Global Keyboard Hotkey Trigger Listeners
  useEffect(() => {
    let typedBuffer = '';
    const handleGlobalHotKeys = (e: KeyboardEvent) => {
      const activePhrase = (localStorage.getItem('vs_silent_sos_phrase') || 'red balloon').toLowerCase();
      
      // 1. Toggle Decoy Disguised Overlay globally via Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDecoyActive(prev => !prev);
        return;
      }

      // 2. Secret Keyboard Shortcut: Ctrl+Shift+S triggers Silent SOS
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerQuietSOS("Global Hotkey shortcut triggered (Ctrl+Shift+S)");
        return;
      }

      // 3. Secret typed phrase anywhere globally (when not typing inside inputs)
      const targetChar = e.key.toLowerCase();
      const targetElement = e.target as HTMLElement;
      const isInput = targetElement && (
        targetElement.tagName === 'INPUT' || 
        targetElement.tagName === 'TEXTAREA' || 
        targetElement.isContentEditable
      );
      
      if (!isInput && targetChar.length === 1 && /[a-z ]/.test(targetChar)) {
        typedBuffer = (typedBuffer + targetChar).slice(-30);
        if (typedBuffer.includes(activePhrase)) {
          triggerQuietSOS(`Global secret phrase typed anywhere ("${activePhrase}")`);
          typedBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleGlobalHotKeys);
    return () => window.removeEventListener('keydown', handleGlobalHotKeys);
  }, [profile]);

  const initializeSession = async () => {
    // Automatically log in as the default Administrator to bypass Auth entirely and run with pre-verified system capabilities
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@vanguard.mesh', password: 'Password123!' })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.token && loginData.profile) {
          localStorage.setItem('vs_jwt_token', loginData.token);
          localStorage.setItem('vs_active_user_id', loginData.profile.email);
          setProfile(loginData.profile);
          setCurrentView(AppView.DASHBOARD);
          return;
        }
      }
    } catch (err) {
      console.warn("Vanguard auto-login backend handshake bypassed (using local session fallback):", err);
    }

    // Local fallback in case of server restart latency or offline sandboxing
    const defaultAdminProfile: UserProfile = {
      uid: 'admin-uid-99',
      email: 'admin@vanguard.mesh',
      role: 'ADMIN',
      name: 'Vanguard System Administrator',
      safetyId: 'SYS-ADMIN-99',
      trustCircle: [],
      hasCompletedOnboarding: true,
      avatarUrl: ''
    };
    setProfile(defaultAdminProfile);
    setCurrentView(AppView.DASHBOARD);
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const handleAuthSuccess = (authenticatedProfile: UserProfile, token?: string) => {
    setProfile(authenticatedProfile);
    localStorage.setItem('vs_active_user_id', authenticatedProfile.email);
    if (token) {
      localStorage.setItem('vs_jwt_token', token);
    }
    
    if (authenticatedProfile.hasCompletedOnboarding) {
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.ONBOARDING);
    }
  };

  const handleOnboardingComplete = (completedProfile: UserProfile) => {
    const finalProfile = { ...completedProfile, hasCompletedOnboarding: true };
    setProfile(finalProfile);
    
    const users = JSON.parse(localStorage.getItem('vs_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === finalProfile.email);
    
    if (userIndex !== -1) {
      users[userIndex] = finalProfile;
    } else {
      users.push(finalProfile);
    }
    
    localStorage.setItem('vs_users', JSON.stringify(users));
    localStorage.setItem('vs_active_user_id', finalProfile.email);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('vs_active_user_id');
    localStorage.removeItem('vs_jwt_token');
    setProfile(null);
    initializeSession();
  };

  const handleSOSState = (active: boolean) => {
    setIsSOSActive(active);
  };

  if (currentView === AppView.LANDING) {
    return (
      <div className="min-h-screen relative bg-[#020617] techno-grid text-slate-100 overflow-x-hidden">
        <PublicHome onGetStarted={() => setCurrentView(AppView.DASHBOARD)} />
      </div>
    );
  }

  if (currentView === AppView.ONBOARDING) {
    return <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] techno-grid"><OnboardingFlow initialProfile={profile} onComplete={handleOnboardingComplete} /></div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD: 
        return <Dashboard profile={profile} onNavigate={setCurrentView} onEmergency={() => handleSOSState(true)} />;
      case AppView.EVIDENCE_LOCKER: return <EvidenceLocker profile={profile} isEmergencyMode={isSOSActive} />;
      case AppView.DISCREET_TOOLS: return <DiscreetTools onLaunchDecoy={() => setIsDecoyActive(true)} />;
      case AppView.SAFE_ZONES: return <SafeZones />;
      case AppView.GUARDIAN_AI: return <GuardianAI profile={profile} />;
      case AppView.VIGILANTE_COMMUNITY: return <VigilanteCommunity />;
      case AppView.SAFE_ROUTES: return <SafeRoutes />;
      case AppView.LEGAL_RESOURCES: return <LegalResources profile={profile} />;
      case AppView.SETTINGS: return <SettingsPanel profile={profile} onLogout={handleLogout} />;
      case AppView.SITEMAP: return <SiteMap onNavigate={setCurrentView} />;
      case AppView.AUTHORITY_DASHBOARD: return <InfrastructureMonitor profile={profile} onNavigateToOPD={() => setCurrentView(AppView.SAFE_ROUTES)} />;
      case AppView.SAFETY_EDUCATION: return <SafetyEducation />;
      case AppView.MISSING_PERSON_PORTAL: return <MissingPersonPortal />;
      case AppView.CYBER_SAFETY_REPORTING: return <CyberSafetyReporting />;
      case AppView.COMMUNITY_RESCUE: return <CommunityRescueNetwork profile={profile} />;
      case AppView.AI_THREAT_DETECTION: return <AIThreatDetection />;
      case AppView.NOTIFICATION_CENTER: return <UnifiedNotificationCenter profile={profile} onNavigate={setCurrentView} />;
      case AppView.VOICE_ASSISTANT: return <VoiceAssistant onEmergencyDetected={() => handleSOSState(true)} onSilentEmergencyDetected={triggerQuietSOS} onNavigate={setCurrentView} language={currentLanguage} />;
      case AppView.TRUST_CIRCLE: return (
        <TrustedCircle profile={profile} onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)} />
      );
      default: return <Dashboard profile={profile} onNavigate={setCurrentView} onEmergency={() => handleSOSState(true)} />;
    }
  };

  return (
    <div className="min-h-screen relative bg-[#020617] techno-grid text-slate-100 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 py-10 relative">
        <header className="flex items-center justify-between mb-12 glass-card px-10 py-6 rounded-[32px] sticky top-6 z-[100] border-indigo-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] gap-4 flex-wrap md:flex-nowrap">
          {/* Quick Header Navigation shortcuts */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 order-last md:order-none">
             <button 
               onClick={() => setCurrentView(AppView.SAFETY_EDUCATION)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.SAFETY_EDUCATION ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <BookOpen size={13} />
                Edu Hub
             </button>
             <button 
               onClick={() => setCurrentView(AppView.MISSING_PERSON_PORTAL)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.MISSING_PERSON_PORTAL ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Heart size={13} />
                Missing Portal
             </button>
             <button 
               onClick={() => setCurrentView(AppView.AUTHORITY_DASHBOARD)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.AUTHORITY_DASHBOARD ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Shield size={13} />
                Dispatcher
             </button>
             <button 
               onClick={() => setCurrentView(AppView.VOICE_ASSISTANT)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.VOICE_ASSISTANT ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Brain size={13} />
                Vocal Scan
             </button>
             <button 
               onClick={() => setCurrentView(AppView.CYBER_SAFETY_REPORTING)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.CYBER_SAFETY_REPORTING ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <ShieldAlert size={13} />
                Cyber Safety
             </button>
             <button 
               onClick={() => setCurrentView(AppView.AI_THREAT_DETECTION)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.AI_THREAT_DETECTION ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Brain size={13} />
                AI Threat
             </button>
             <button 
               onClick={() => setCurrentView(AppView.NOTIFICATION_CENTER)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.NOTIFICATION_CENTER ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Bell size={13} />
                Alert Center
             </button>
             <button 
               onClick={() => setCurrentView(AppView.COMMUNITY_RESCUE)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                 currentView === AppView.COMMUNITY_RESCUE ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
               }`}
             >
                <Users size={13} />
                Rescue Net
             </button>
          </div>

          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="w-12 h-12 bg-indigo-600 rounded-[16px] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-transform group-hover:rotate-6">V</div>
            <div>
               <h1 className="text-xl font-black tracking-tighter leading-none text-white">Vanguard</h1>
               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mono">Tactical Safety OS v6.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Multilingual Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl">
               <Globe className="w-4 h-4 text-indigo-400" />
               <select 
                 value={currentLanguage} 
                 onChange={(e) => setCurrentLanguage(e.target.value)}
                 className="bg-transparent font-black tracking-tight text-[10px] uppercase text-white outline-none cursor-pointer"
               >
                 <option value="English" className="bg-slate-900 text-white">EN</option>
                 <option value="Spanish" className="bg-slate-900 text-white">ES</option>
                 <option value="Hindi" className="bg-slate-900 text-white">HI</option>
                 <option value="French" className="bg-slate-900 text-white">FR</option>
                 <option value="Arabic" className="bg-slate-900 text-white">AR</option>
               </select>
            </div>

            {/* Quick System Role Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 border border-indigo-500/20 px-4 py-2 rounded-xl hover:border-indigo-500/40 transition-colors">
               <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
               <select 
                 value={profile?.role || 'ADMIN'} 
                 onChange={async (e) => {
                   const targetRole = e.target.value as 'USER' | 'VOLUNTEER' | 'POLICE' | 'ADMIN';
                   let email = 'admin@vanguard.mesh';
                   if (targetRole === 'USER') email = 'user@vanguard.mesh';
                   else if (targetRole === 'VOLUNTEER') email = 'volunteer@vanguard.mesh';
                   else if (targetRole === 'POLICE') email = 'police@vanguard.mesh';
                   
                   try {
                     const loginRes = await fetch('/api/auth/login', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ email, password: 'Password123!' })
                     });
                     if (loginRes.ok) {
                       const loginData = await loginRes.json();
                       if (loginData.token && loginData.profile) {
                         localStorage.setItem('vs_jwt_token', loginData.token);
                         localStorage.setItem('vs_active_user_id', loginData.profile.email);
                         setProfile(loginData.profile);
                         return;
                       }
                     }
                   } catch (err) {
                     console.warn("Handshake role switch failed, utilizing client state simulation:", err);
                   }
                   
                   // Offline fallback
                   setProfile({
                     email,
                     role: targetRole,
                     name: `${targetRole.charAt(0) + targetRole.slice(1).toLowerCase()} Node`,
                     safetyId: `SYS-${targetRole}-88`,
                     uid: "fallback-uid-switch",
                     trustCircle: [],
                     hasCompletedOnboarding: true,
                     avatarUrl: ''
                   });
                 }}
                 className="bg-transparent font-black tracking-tight text-[10px] uppercase text-indigo-300 outline-none cursor-pointer"
               >
                 <option value="ADMIN" className="bg-slate-900 text-indigo-300">ADMIN</option>
                 <option value="POLICE" className="bg-slate-900 text-indigo-300">POLICE</option>
                 <option value="VOLUNTEER" className="bg-slate-900 text-indigo-300">VOLUNTEER</option>
                 <option value="USER" className="bg-slate-900 text-indigo-300">USER</option>
               </select>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-xs font-black text-white leading-none mono">{profile?.safetyId || 'OPERATOR'}</p>
              <button onClick={() => setCurrentView(AppView.SETTINGS)} className="text-[9px] font-black text-indigo-500/50 hover:text-indigo-400 uppercase tracking-tighter mt-1 transition-colors">OS Configuration</button>
            </div>
            <div 
              onClick={() => setCurrentView(AppView.SETTINGS)}
              className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-lg border border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg overflow-hidden"
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name ? profile.name[0].toUpperCase() : '?'
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[80vh] relative mb-32">
          {renderContent()}
        </main>

        <EmergencySOS profile={profile} isActive={isSOSActive} onStateChange={handleSOSState} isGlobal={true} />
        <DecoyOverlay isActive={isDecoyActive} onClose={() => setIsDecoyActive(false)} profile={profile} />

        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-2 rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex justify-around items-center z-[150]">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`p-4 rounded-3xl transition-all ${currentView === AppView.DASHBOARD ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}>
            <Shield className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView(AppView.SAFE_ZONES)} className={`p-4 rounded-3xl transition-all ${currentView === AppView.SAFE_ZONES ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <MapPin className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => handleSOSState(true)} 
            className="flex-shrink-0 -mt-20 bg-red-600 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(220,38,38,0.7)] border-[8px] border-[#020617] hover:scale-110 active:scale-95 transition-all z-20 sos-pulse"
          >
             <span className="font-black text-2xl tracking-tighter">SOS</span>
          </button>

          <button onClick={() => setCurrentView(AppView.GUARDIAN_AI)} className={`p-4 rounded-3xl transition-all ${currentView === AppView.GUARDIAN_AI ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <Radio className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView(AppView.EVIDENCE_LOCKER)} className={`p-4 rounded-3xl transition-all ${currentView === AppView.EVIDENCE_LOCKER ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <Lock className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
