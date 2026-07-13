export interface TranslationSet {
  emergencySOS: string;
  silentSOS: string;
  guardianTracking: string;
  traffickingReporting: string;
  missingPersonHub: string;
  safeRoutes: string;
  evidenceVault: string;
  fakeCall: string;
  cyberSafety: string;
  safeWordDetection: string;
  communityRescue: string;
  authorityDashboard: string;
  safetyEducation: string;
  settings: string;
  statusSecure: string;
  statusGuarded: string;
  statusAlert: string;
  statusCritical: string;
  sosOverride: string;
  vulnerabilitySearch: string;
  operator: string;
}

export const TRANSLATIONS: Record<string, TranslationSet> = {
  English: {
    emergencySOS: "Emergency SOS",
    silentSOS: "Silent SOS Protocol",
    guardianTracking: "Guardian Live Tracking",
    traffickingReporting: "Anti-Trafficking Registry",
    missingPersonHub: "Missing Person Hub",
    safeRoutes: "Safe Route Navigation",
    evidenceVault: "Secure Evidence Vault",
    fakeCall: "Stealth Calling Suite",
    cyberSafety: "Cyber Safety Tracker",
    safeWordDetection: "Safe Word Detection",
    communityRescue: "Vanguard Rescue Mesh",
    authorityDashboard: "Dispatcher Terminal",
    safetyEducation: "Tactical Defense Hub",
    settings: "OS Configuration",
    statusSecure: "STATE: SECURE",
    statusGuarded: "STATE: GUARDED",
    statusAlert: "STATE: WARNING ALERT",
    statusCritical: "STATE: CRITICAL SOS",
    sosOverride: "SOS OVERRIDE",
    vulnerabilitySearch: "Search Neighborhood Sectors",
    operator: "OPERATOR DESK"
  },
  Spanish: {
    emergencySOS: "S.O.S. de Emergencia",
    silentSOS: "Protocolo S.O.S. Silencioso",
    guardianTracking: "Rastreo de Guardián en Vivo",
    traffickingReporting: "Registro Anti-Tráfico",
    missingPersonHub: "Buscador de Personas",
    safeRoutes: "Navegación de Rutas Seguras",
    evidenceVault: "Bóveda de Pruebas Segura",
    fakeCall: "Llamada de Distracción",
    cyberSafety: "Monitoreo de Ciberseguridad",
    safeWordDetection: "Detección de Palabra Clave",
    communityRescue: "Red de Rescate Comunitario",
    authorityDashboard: "Consola de Despacho",
    safetyEducation: "Centro de Defensa Táctica",
    settings: "Configuración del Sistema",
    statusSecure: "ESTADO: SEGURO",
    statusGuarded: "ESTADO: BAJO GUARDIA",
    statusAlert: "ESTADO: ALERTA DE RIESGO",
    statusCritical: "ESTADO: CRÍTICO S.O.S.",
    sosOverride: "S.O.S. MANUAL",
    vulnerabilitySearch: "Buscar Sectores del Barrio",
    operator: "OPERADOR DE CRISIS"
  },
  Hindi: {
    emergencySOS: "आपातकालीन एसओएस",
    silentSOS: "साइलेंट एसओएस प्रोटोकॉल",
    guardianTracking: "लाइव गार्जियन ट्रैकिंग",
    traffickingReporting: "तस्करी निवारण रिपोर्टिंग",
    missingPersonHub: "लापता व्यक्ति खोज केंद्र",
    safeRoutes: "सुरक्षित मार्ग नेविगेशन",
    evidenceVault: "सुरक्षित साक्ष्य वॉल्ट",
    fakeCall: "दिखावटी कॉल फ़ीचर",
    cyberSafety: "साइबर सुरक्षा रिपोर्टर",
    safeWordDetection: "सुरक्षित शब्द पहचान",
    communityRescue: "कम्युनिटी रेस्क्यू नेटवर्क",
    authorityDashboard: "कंट्रोल रूम टर्मिनल",
    safetyEducation: "सुरक्षा एवं आत्मरक्षा हब",
    settings: "सिस्टम कॉन्फ़िगरेशन",
    statusSecure: "स्थिति: सुरक्षित",
    statusGuarded: "स्थिति: सतर्क",
    statusAlert: "स्थिति: खतरा चेतावनी",
    statusCritical: "स्थिति: गंभीर संकट",
    sosOverride: "एसओएस ओवरराइड",
    vulnerabilitySearch: "क्षेत्र सुरक्षा खोजें",
    operator: "प्रशासन डेस्क"
  },
  French: {
    emergencySOS: "SOS d'Urgence",
    silentSOS: "Protocole SOS Silencieux",
    guardianTracking: "Suivi Live Gardien",
    traffickingReporting: "Registre Anti-Trafic",
    missingPersonHub: "Recherche de Disparus",
    safeRoutes: "Navigation Sécurisée",
    evidenceVault: "Coffre-fort de Preuves",
    fakeCall: "Fausse Appel de Défense",
    cyberSafety: "Traqueur de Cybersécurité",
    safeWordDetection: "Détection du Mot d'Ordre",
    communityRescue: "Réseau de Sauvetage Communal",
    authorityDashboard: "Terminal de Dispatching",
    safetyEducation: "Centre d'Éducation Tactique",
    settings: "Configuration du Système",
    statusSecure: "SITUATION : SÉCURISÉ",
    statusGuarded: "SITUATION : EN GARDE",
    statusAlert: "SITUATION : ALARME DANGER",
    statusCritical: "SITUATION : SOS CRITIQUE",
    sosOverride: "SOS MANUEL",
    vulnerabilitySearch: "Vérifier la Sécurité du Quartier",
    operator: "RETRAL DE CRISES"
  },
  Arabic: {
    emergencySOS: "استغاثة الطوارئ",
    silentSOS: "بروتوكول الاستغاثة الصامتة",
    guardianTracking: "تتبع الحارس المباشر",
    traffickingReporting: "سجل مكافحة الاتجار بالبشر",
    missingPersonHub: "مركز المفقودين",
    safeRoutes: "ملاحقة المسار الآمن",
    evidenceVault: "قبو الأدلة المشفر",
    fakeCall: "شاشة الاتصال التمويهي",
    cyberSafety: "تتبع السلامة الرقمية",
    safeWordDetection: "كشف الكاميرا والكلمة الحساسة",
    communityRescue: "شبكة الإنقاذ المجتمعية",
    authorityDashboard: "شاشة التحكم والعمليات",
    safetyEducation: "مركز التدريب والدفاع التكتيكي",
    settings: "تفعيل تهيئة النظام",
    statusSecure: "الحالة: مؤمن تمامًا",
    statusGuarded: "الحالة: خاضع للحظر",
    statusAlert: "الحالة: تحذير من خطورة",
    statusCritical: "الحالة: استغاثة حرجة",
    sosOverride: "تجاوز الاستغاثة",
    vulnerabilitySearch: "استعلام عن قطاع الأمن",
    operator: "مكتب الطوارئ"
  }
};
