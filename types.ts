
export enum AppView {
  AUTH = 'AUTH',
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  GUARDIAN_AI = 'GUARDIAN_AI', 
  SAFE_ZONES = 'SAFE_ZONES', 
  TRUST_CIRCLE = 'TRUST_CIRCLE', 
  SOS_CONSOLE = 'SOS_CONSOLE', 
  VIGILANTE_COMMUNITY = 'VIGILANTE_COMMUNITY', 
  EVIDENCE_LOCKER = 'EVIDENCE_LOCKER', 
  SAFE_ROUTES = 'SAFE_ROUTES', 
  LEGAL_RESOURCES = 'LEGAL_RESOURCES', 
  DISCREET_TOOLS = 'DISCREET_TOOLS', 
  SETTINGS = 'SETTINGS',
  SITEMAP = 'SITEMAP',
  AUTHORITY_DASHBOARD = 'AUTHORITY_DASHBOARD',
  SAFETY_EDUCATION = 'SAFETY_EDUCATION',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  MISSING_PERSON_PORTAL = 'MISSING_PERSON_PORTAL',
  CYBER_SAFETY_REPORTING = 'CYBER_SAFETY_REPORTING',
  COMMUNITY_RESCUE = 'COMMUNITY_RESCUE',
  AI_THREAT_DETECTION = 'AI_THREAT_DETECTION',
  NOTIFICATION_CENTER = 'NOTIFICATION_CENTER'
}

export interface VanguardNotification {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SENT' | 'FAILED' | 'PENDING';
  recipient: string;
  retryCount: number;
  failureReason?: string;
  ownerEmail?: string;
}

export enum SafetyStatus {
  SECURE = 'SECURE',
  GUARDED = 'GUARDED',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL'
}

export interface TrustContact {
  name: string;
  phone: string;
  relation: string;
  isBroadcasting: boolean;
  lastSeen?: string;
  email?: string;
  priority?: 1 | 2 | 3; // 1 = Primary Guardian, 2 = Secondary Guardian, 3 = Emergency Backup
  isVerified?: 'PENDING' | 'VERIFIED' | 'DENIED';
  permissions?: {
    canViewLocation: boolean;
    receiveAlerts: boolean;
    viewEvidence: boolean;
  };
}

export interface SafetyMetrics {
  environmentSafety: number;
  crowdDensity: number;
  lightingQuality: number;
  proximityToSafeZones: number;
  riskIndex: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'USER' | 'VOLUNTEER' | 'POLICE' | 'ADMIN';
  trustCircle: TrustContact[];
  bloodType?: string;
  medicalConditions?: string;
  hasCompletedOnboarding?: boolean;
  avatarUrl?: string;
  safetyId: string;
  healthId?: string;
  checkupReportSummary?: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'POLICE' | 'HOSPITAL' | 'SHELTER' | 'VERIFIED_COMMUNITY';
  address: string;
  distance: string;
  isOpen24h: boolean;
  rating: number;
}

export interface ReportedIncident {
  id: string;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  verifiedCount: number;
}

export interface GuardSimulation {
  projectedRisk: number;
  strategicAdvice: string;
  safeActions: string[];
}

export interface EvidenceRecord {
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

export interface SafetyMetricHUD {
  label: string;
  value: string | number;
  color: string;
}
