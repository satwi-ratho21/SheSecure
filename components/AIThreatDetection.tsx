import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Brain, PlusCircle, Activity, Trash2, MapPin, 
  AlertTriangle, CheckCircle, Clock, ArrowRight, Search, 
  RefreshCw, FileText, AlertCircle, Filter, Zap, Compass, ShieldCheck
} from 'lucide-react';

interface ThreatReport {
  id: string;
  timestamp: string;
  description: string;
  keywords: string[];
  location: string;
  previousIncidents: string;
  threatScore: number;
  urgencyLevel: string;
  riskClassification: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';
  recommendedAction: string;
  alertPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyThreats: string[];
  vulnerabilityAssessment: string;
}

const AIThreatDetection: React.FC = () => {
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ANALYZE' | 'DATABASE'>('ANALYZE');

  // Input states
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [previousIncidents, setPreviousIncidents] = useState('');
  
  // Suggested quick tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const quickTags = [
    "Surveillance", "Stalking", "Suspicious Vehicle", 
    "Intrusion", "Extortion", "Physical Threat", 
    "Harassment", "Weapon Sighted", "Unlit Route"
  ];

  // Latest analysis output display state
  const [latestAnalysis, setLatestAnalysis] = useState<ThreatReport | null>(null);

  // Filters for database view
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) {
        setErrorText("Unauthenticated session. Please sign in to access secure threat intelligence databases.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/threat-detection/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to load secure threat records from server partition.");
      }

      const data = await res.json();
      if (data.success && data.reports) {
        // Sort reports by newest first
        setReports(data.reports.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch (err: any) {
      setErrorText(err.message || "An error occurred while linking to the MongoDB cluster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAnalyzeThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      setErrorText("Please fill out both the threat description and current location.");
      return;
    }

    // Merge manually typed keywords and quick tags
    const typedTags = keywordsInput.split(',').map(t => t.trim()).filter(Boolean);
    const finalKeywords = Array.from(new Set([...selectedTags, ...typedTags]));

    try {
      setAnalyzing(true);
      setErrorText(null);
      setSuccessMessage(null);
      setLatestAnalysis(null);

      const token = localStorage.getItem('vs_jwt_token');
      if (!token) {
        setErrorText("Authentication token expired. Re-authenticate to access the Vanguard AI system.");
        setAnalyzing(false);
        return;
      }

      const response = await fetch('/api/threat-detection/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          location,
          keywords: finalKeywords,
          previousIncidents: previousIncidents || "None"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit threat details to AI engine.");
      }

      if (data.success && data.report) {
        setLatestAnalysis(data.report);
        setSuccessMessage("Threat successfully processed by Vanguard AI and registered in MongoDB.");
        // Reset form fields
        setDescription('');
        setLocation('');
        setKeywordsInput('');
        setSelectedTags([]);
        setPreviousIncidents('');
        // Re-fetch database logs to sync the history
        fetchReports();
      }
    } catch (err: any) {
      setErrorText(err.message || "An anomaly occurred during the neural synthesis processing pass.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive and remove this threat analysis record? This is permanently purged from MongoDB.")) return;
    
    try {
      const token = localStorage.getItem('vs_jwt_token');
      if (!token) return;

      const res = await fetch(`/api/threat-detection/report/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Unable to archive the selected record.");
      }

      const data = await res.json();
      if (data.success) {
        setReports(reports.filter(r => r.id !== id));
        if (latestAnalysis?.id === id) {
          setLatestAnalysis(null);
        }
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRisk = 
      riskFilter === 'ALL' || 
      r.riskClassification.toUpperCase() === riskFilter.toUpperCase() ||
      r.riskClassification.toUpperCase().replace(" ", "_") === riskFilter.toUpperCase();

    return matchesSearch && matchesRisk;
  });

  // Get color for Threat Score Gauge
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score < 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (score < 80) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
    return 'text-red-500 border-red-500/20 bg-red-500/5';
  };

  const getScoreProgressColor = (score: number) => {
    if (score < 40) return 'bg-emerald-500';
    if (score < 60) return 'bg-amber-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-600';
  };

  // Get Badge style for classifications
  const getBadgeStyle = (classification: string) => {
    const cls = classification.toLowerCase();
    if (cls.includes('low')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (cls.includes('medium')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (cls.includes('high')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4 animate-in fade-in" id="ai-threat-detection-system">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950/60 p-8 rounded-[36px] border border-white/5 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">AI Threat Detection</h2>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
            Vanguard Tactical Neural Assessor & Simulated MongoDB Core
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('ANALYZE')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'ANALYZE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
            id="tab-analyze"
          >
            <Zap className="w-3.5 h-3.5" />
            Vanguard Assessor
          </button>
          <button 
            onClick={() => setActiveTab('DATABASE')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'DATABASE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
            id="tab-database"
          >
            <Activity className="w-3.5 h-3.5" />
            MongoDB Archive ({reports.length})
          </button>
        </div>
      </div>

      {errorText && (
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold animate-pulse" id="error-banner">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold" id="success-banner">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ACTIVE VIEW MAPPING */}
      {activeTab === 'ANALYZE' ? (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Submit form: Col Span 7 */}
          <div className="lg:col-span-7 bg-slate-950 p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Submit Incident for Threat Analysis
              </h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">
                Feed multi-vector input data into the safety classification matrix
              </p>
            </div>

            <form onSubmit={handleAnalyzeThreat} className="space-y-6">
              
              {/* User Description */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex justify-between">
                  <span>Incident Description / Observations *</span>
                  <span className="text-indigo-400">Semantic Vector Input</span>
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you observed (e.g. suspicious surveillance, a dark vehicle casing, aggressive behavior, unlit routes, direct threat calls...)"
                  className="w-full h-36 bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none font-medium leading-relaxed"
                  required
                />
              </div>

              {/* Grid Location */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Tactical Grid Location *
                </label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. South Loop Sector 3, 400 State St, Digital Layer"
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                  required
                />
              </div>

              {/* Previous Incident context */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex justify-between">
                  <span>Previous Incident Context / Recurring Symptoms</span>
                  <span className="text-slate-500">Historical correlation weight</span>
                </label>
                <textarea 
                  value={previousIncidents}
                  onChange={(e) => setPreviousIncidents(e.target.value)}
                  placeholder="Have you noticed this before? Any preceding event logs, stalking history, or patterns?"
                  className="w-full h-20 bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Keywords Tag Selector */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  Multi-threat classification keywords
                </label>
                
                {/* Custom input */}
                <input 
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="Enter custom tags separated by commas (e.g. stalker, unlit alley, danger)"
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                />

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickTags.map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                          active 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                disabled={analyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[11px] tracking-widest py-4 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-3 font-mono"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Synthesizing Neural Threat Assessment...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-white" />
                    Trigger AI Threat Intelligence Pass
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Analysis output display: Col Span 5 */}
          <div className="lg:col-span-5 space-y-8">
            {latestAnalysis ? (
              <div className="bg-slate-950 rounded-[44px] border border-white/5 p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
                {/* Glowing alert accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${getScoreProgressColor(latestAnalysis.threatScore)}`} />

                <div className="flex justify-between items-start pt-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest">ANALYSIS RESPONSE</span>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter font-mono mt-1">
                      {latestAnalysis.id}
                    </h4>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${getBadgeStyle(latestAnalysis.riskClassification)}`}>
                    {latestAnalysis.riskClassification}
                  </span>
                </div>

                {/* Score Section */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase font-black">
                    <span>Threat Score Gauge</span>
                    <span className="text-white text-lg font-black">{latestAnalysis.threatScore}/100</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getScoreProgressColor(latestAnalysis.threatScore)}`} 
                      style={{ width: `${latestAnalysis.threatScore}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 pt-1">
                    <span>LOW RISK</span>
                    <span>MEDIUM</span>
                    <span>HIGH RISK</span>
                    <span>CRITICAL</span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">ALERT LEVEL</span>
                    <p className="text-white font-black uppercase text-[11px] truncate">{latestAnalysis.urgencyLevel}</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">ALERT PRIORITY</span>
                    <p className={`font-black uppercase text-[11px] truncate ${
                      latestAnalysis.alertPriority === 'CRITICAL' || latestAnalysis.alertPriority === 'HIGH' ? 'text-red-400' : 'text-slate-300'
                    }`}>{latestAnalysis.alertPriority}</p>
                  </div>
                </div>

                {/* Key Threats */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">Identified Threat Vectors</span>
                  <div className="flex flex-wrap gap-1.5">
                    {latestAnalysis.keyThreats.map((t, idx) => (
                      <span key={idx} className="bg-slate-900 px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-300 border border-white/5 uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vulnerability Assessment */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">Vulnerability Assessment</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {latestAnalysis.vulnerabilityAssessment}
                  </p>
                </div>

                {/* Recommended Action */}
                <div className="bg-indigo-600/10 border-2 border-indigo-500/20 p-6 rounded-[28px] space-y-2 shadow-inner">
                  <span className="text-[9px] text-indigo-400 uppercase font-black tracking-widest font-mono flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Recommended Tactical Action
                  </span>
                  <p className="text-xs text-indigo-100 font-bold leading-relaxed">
                    {latestAnalysis.recommendedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 rounded-[44px] border border-white/5 p-8 h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center text-slate-500">
                  <Brain className="w-8 h-8 animate-pulse" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono">Awaiting Input Vectors</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Submit coordinates, previous event symptoms, and behavioral descriptions to trigger Vanguard's AI assessment pipeline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DATABASE VIEW */
        <div className="bg-slate-950 p-8 rounded-[48px] border border-white/5 shadow-2xl space-y-8">
          
          {/* Header block with filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                MongoDB Threat Database
              </h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">
                Persistent audit of AI-evaluated threat reports from your security partition
              </p>
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search input */}
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search location, keywords..."
                  className="w-full md:w-60 bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Dropdown filter */}
              <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3.5 py-2.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase text-white outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">ALL RISKS</option>
                  <option value="LOW RISK" className="bg-slate-900 text-white">LOW RISK</option>
                  <option value="MEDIUM RISK" className="bg-slate-900 text-white">MEDIUM RISK</option>
                  <option value="HIGH RISK" className="bg-slate-900 text-white">HIGH RISK</option>
                  <option value="CRITICAL RISK" className="bg-slate-900 text-white">CRITICAL RISK</option>
                </select>
              </div>

              {/* Refresh button */}
              <button 
                onClick={fetchReports}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-indigo-400 transition-colors"
                title="Refresh logs from MongoDB"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table / List representation */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Querying MongoDB cluster...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-tight font-mono">No matching records found</p>
                <p className="text-[10px] text-slate-500">Try adjusting your filters or search constraints.</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6" id="reports-grid">
              {filteredReports.map(report => (
                <div 
                  key={report.id} 
                  className="bg-slate-900/60 p-6 rounded-[28px] border border-white/5 hover:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all group"
                >
                  {/* Score gauge strip on the side */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${getScoreProgressColor(report.threatScore)}`} />

                  <div className="space-y-4 pl-2">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                        <h4 className="text-sm font-black text-white font-mono uppercase mt-1">
                          {report.id}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-mono font-black uppercase tracking-wider border ${getBadgeStyle(report.riskClassification)}`}>
                        {report.riskClassification}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-[10px] font-mono text-indigo-300 font-bold uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {report.location}
                    </p>

                    {/* Description */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider font-mono">OBSERVATION REPORT</span>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-medium">
                        "{report.description}"
                      </p>
                    </div>

                    {/* Threat Score display */}
                    <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-slate-500 uppercase font-bold">THREAT SCORE</span>
                      <span className={`font-black ${getScoreColor(report.threatScore)}`}>{report.threatScore}/100</span>
                    </div>

                    {/* Action recommended */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">AI RECOMMENDED ACTION</span>
                      <p className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-normal">
                        {report.recommendedAction}
                      </p>
                    </div>

                    {/* Keywords tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {report.keywords.map((kw, i) => (
                        <span key={i} className="bg-slate-950 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400 uppercase">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
                    <button 
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-500/50 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/5 transition-colors flex items-center gap-1 text-[9px] font-mono font-black uppercase"
                      title="Delete threat record permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                      Archive / Purge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIThreatDetection;
