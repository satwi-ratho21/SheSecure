import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  Shield, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Heart, 
  Calendar, 
  SlidersHorizontal, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Filter, 
  RefreshCw,
  Globe,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import L from 'leaflet';

// CSS link injection helper for Leaflet
const injectLeafletStyles = () => {
  const cssId = 'leaflet-css-cdn';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
};

// Fix default Leaflet marker icon issues in React builds
const setupLeafletMarkerIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface DashboardFilters {
  startDate: string;
  endDate: string;
  incidentType: string;
  location: string;
  severity: string;
}

export const SafetyIntelligenceDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    incidentType: 'ALL',
    location: 'ALL',
    severity: 'ALL',
  });

  const [activeMapMode, setActiveMapMode] = useState<'HEATMAP' | 'TRAFFICKING_HOTSPOTS' | 'INCIDENT_DENSITY'>('INCIDENT_DENSITY');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const playTacticalBeep = (freq = 550, vol = 0.05, duration = 0.05) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Ignored if blocked by browser
    }
  };

  // Fetch data with aggregation parameters
  const fetchAggregatedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('vs_jwt_token');
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        incidentType: filters.incidentType,
        location: filters.location,
        severity: filters.severity,
      });

      const res = await fetch(`/api/authority/safety-intelligence/aggregation?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Data fetch failure: Status ${res.status}`);
      }

      const responseJson = await res.json();
      if (responseJson.success) {
        setDashboardData(responseJson.data);
      } else {
        throw new Error(responseJson.error || "Unknown query aggregation failure");
      }
    } catch (err: any) {
      console.error("[Dashboard Load Error]", err);
      setError(err.message || "Failed to load intelligence database indices.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger load on filter changes
  useEffect(() => {
    fetchAggregatedData();
  }, [filters]);

  // Leaflet map setup and life-cycle management
  useEffect(() => {
    injectLeafletStyles();
    setupLeafletMarkerIcons();

    if (!mapContainerRef.current) return;

    // Visakhapatnam coordinates center
    const defaultCenter: [number, number] = [17.6868, 83.2185];
    
    // Initialize map if not yet instantiated
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(defaultCenter, 12);

      // Dark theme tactical cartography style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Add zoom control manually at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersGroupRef.current = null;
      }
    };
  }, []);

  // Update map overlays on data change or map mode change
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current || !dashboardData) return;

    const map = mapRef.current;
    const layersGroup = layersGroupRef.current;
    layersGroup.clearLayers();

    const incidentsList = dashboardData.allIncidents || [];

    if (incidentsList.length === 0) return;

    // Auto-fit bounds if we have points
    const points: L.LatLngExpression[] = [];

    if (activeMapMode === 'HEATMAP') {
      // 1. Crime Heatmap Mode
      incidentsList.forEach((inc: any) => {
        const latLng: [number, number] = [inc.lat, inc.lng];
        points.push(latLng);

        // Map severity weights to size and color intensities
        let radius = 300;
        let color = '#ef4444';
        let fillOpacity = 0.25;

        if (inc.severity === 'CRITICAL') {
          radius = 500;
          fillOpacity = 0.45;
        } else if (inc.severity === 'HIGH') {
          radius = 400;
          fillOpacity = 0.35;
        } else if (inc.severity === 'LOW') {
          radius = 200;
          fillOpacity = 0.15;
        }

        L.circle(latLng, {
          color: color,
          fillColor: color,
          fillOpacity: fillOpacity,
          weight: 1,
          radius: radius
        }).bindPopup(`
          <div class="p-2 space-y-1 bg-slate-950 text-white font-sans text-xs rounded-lg" style="color: #ffffff">
            <div class="flex items-center gap-1.5 border-b border-white/10 pb-1 mb-1">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span class="font-bold uppercase tracking-wider text-[10px] text-red-400">Heatpoint Area</span>
            </div>
            <p class="font-semibold text-[11px]">${inc.description.substring(0, 100)}...</p>
            <div class="grid grid-cols-2 gap-1 pt-1 text-[9px] text-slate-400 font-mono">
              <div>Type: <b>${inc.type}</b></div>
              <div>Severity: <b style="color: #f87171">${inc.severity}</b></div>
              <div>District: <b>${inc.district}</b></div>
              <div>Time: <b>${new Date(inc.timestamp).toLocaleDateString()}</b></div>
            </div>
          </div>
        `).addTo(layersGroup);
      });
    } else if (activeMapMode === 'TRAFFICKING_HOTSPOTS') {
      // 2. Human Trafficking Hotspot Detection
      // Highlight trafficking incident zones specifically with distinct amber rings and dense warnings
      const traffickingList = incidentsList.filter((i: any) => i.type === 'TRAFFICKING');

      if (traffickingList.length === 0) {
        // Fallback or message
      }

      traffickingList.forEach((inc: any) => {
        const latLng: [number, number] = [inc.lat, inc.lng];
        points.push(latLng);

        // Core hotspot beacon circle
        L.circle(latLng, {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.35,
          weight: 2,
          radius: 450
        }).bindPopup(`
          <div class="p-2.5 space-y-1.5 bg-slate-950 text-white font-sans text-xs rounded-lg" style="color: #ffffff">
            <div class="flex items-center gap-1.5 border-b border-amber-500/20 pb-1 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span class="font-bold uppercase tracking-wider text-[10px] text-amber-400">Trafficking Hotspot Beacon</span>
            </div>
            <p class="font-semibold text-[11px]">${inc.description}</p>
            <div class="grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-mono pt-1">
              <div>ID: <b>${inc.id}</b></div>
              <div>Hotspot: <b>${inc.district}</b></div>
              <div>Urgency: <b class="text-amber-500">${inc.severity}</b></div>
              <div>Sighting: <b>${new Date(inc.timestamp).toLocaleDateString()}</b></div>
            </div>
          </div>
        `).addTo(layersGroup);

        // Expanding border warning ring
        L.circle(latLng, {
          color: '#f59e0b',
          fillColor: 'transparent',
          weight: 1,
          dashArray: '5, 8',
          radius: 800
        }).addTo(layersGroup);
      });
    } else {
      // 3. Incident Density Map Mode
      incidentsList.forEach((inc: any) => {
        const latLng: [number, number] = [inc.lat, inc.lng];
        points.push(latLng);

        let color = '#ef4444'; // SOS Red
        if (inc.type === 'TRAFFICKING') color = '#f59e0b'; // Amber
        if (inc.type === 'RESCUE') color = '#6366f1'; // Indigo
        if (inc.type === 'MISSING') color = '#ec4899'; // Pink
        if (inc.type === 'CYBER') color = '#3b82f6'; // Blue

        L.circleMarker(latLng, {
          radius: 9,
          fillColor: color,
          color: '#020617',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).bindPopup(`
          <div class="p-2 space-y-1 bg-slate-950 text-white font-sans text-xs rounded-lg" style="color: #ffffff">
            <div class="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
              <span class="font-bold uppercase tracking-wider text-[10px]" style="color: ${color}">${inc.type} Incident</span>
              <span class="text-[8px] font-mono px-1.5 py-0.5 bg-white/5 rounded text-slate-400">${inc.status}</span>
            </div>
            <p class="font-medium text-[10.5px]">${inc.description.substring(0, 120)}...</p>
            <div class="grid grid-cols-2 gap-1 text-[8.5px] text-slate-400 font-mono pt-1">
              <div>District: <b>${inc.district}</b></div>
              <div>Severity: <b>${inc.severity}</b></div>
              <div>Response Time: <b>${inc.responseTimeMins}m</b></div>
              <div>Logged: <b>${new Date(inc.timestamp).toLocaleDateString()}</b></div>
            </div>
          </div>
        `).addTo(layersGroup);
      });
    }

    // Centering map to fit points elegantly
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [dashboardData, activeMapMode]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    playTacticalBeep(650, 0.04, 0.04);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getDistrictChartData = () => {
    if (!dashboardData || !dashboardData.districtAggregation) return [];
    return dashboardData.districtAggregation;
  };

  const getMonthlyTrendsData = () => {
    if (!dashboardData || !dashboardData.monthlyTrends) return [];
    return dashboardData.monthlyTrends;
  };

  const getSeverityChartData = () => {
    if (!dashboardData || !dashboardData.severityAggregation) return [];
    const colorsMap: { [key: string]: string } = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#10b981',
    };
    return dashboardData.severityAggregation.map((item: any) => ({
      ...item,
      fill: colorsMap[item.name] || '#6366f1'
    }));
  };

  const getTypeChartData = () => {
    if (!dashboardData || !dashboardData.typeAggregation) return [];
    const colorsMap: { [key: string]: string } = {
      SOS: '#ef4444',
      TRAFFICKING: '#f59e0b',
      RESCUE: '#6366f1',
      MISSING: '#ec4899',
      CYBER: '#3b82f6',
    };
    return dashboardData.typeAggregation.map((item: any) => ({
      ...item,
      fill: colorsMap[item.name] || '#10b981'
    }));
  };

  const getMetrics = () => {
    if (!dashboardData || !dashboardData.metrics) {
      return { totalCount: 0, avgResponseTime: 0, activeCount: 0, resolvedCount: 0, resolutionRate: 0 };
    }
    return dashboardData.metrics;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="safety-intelligence-dashboard">
      
      {/* 1. TOP HEADER & METRIC TILES */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-zinc-950 p-6 rounded-[36px] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vanguard Safety Intelligence</h2>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest mt-1">
            Real-time geospatial overlay, crime hotspots & aggregated MongoDB pipeline diagnostics
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 px-4 py-2.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>INTEL STREAM ONLINE</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <button 
            onClick={() => { fetchAggregatedData(); playTacticalBeep(700, 0.05, 0.06); }}
            className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-indigo-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* METRIC CARD BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Logs', count: getMetrics().totalCount, desc: 'Processed records', icon: Database, color: 'text-slate-400 bg-slate-400/5 border-slate-500/20' },
          { label: 'Avg Dispatch', count: `${getMetrics().avgResponseTime} min`, desc: 'Emergency response time', icon: Clock, color: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/20' },
          { label: 'Active Alerts', count: getMetrics().activeCount, desc: 'Unresolved events', icon: AlertTriangle, color: 'text-red-500 bg-red-500/5 border-red-500/20 animate-pulse' },
          { label: 'Resolution Rate', count: `${getMetrics().resolutionRate}%`, desc: 'Average claim closure', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' },
          { label: 'Sovereign Sectors', count: '7 Area grids', desc: 'Active spatial districts', icon: Globe, color: 'text-amber-500 bg-amber-500/5 border-amber-500/20' }
        ].map(tile => (
          <div key={tile.label} className={`p-5 bg-zinc-950 rounded-[28px] border-2 shadow-lg flex flex-col justify-between h-36 transition-transform hover:scale-[1.02] duration-300 ${tile.color}`}>
            <div className="flex justify-between items-start">
              <p className="text-[9px] font-black uppercase tracking-wider opacity-60 font-mono">{tile.label}</p>
              <tile.icon className="w-4 h-4 opacity-75" />
            </div>
            <div>
              <p className="text-3.5xl font-black italic tracking-tighter">{tile.count}</p>
              <p className="text-[9px] font-medium opacity-50 mt-1 uppercase font-mono">{tile.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. DYNAMIC CONTROLS & FILTER BAR */}
      <div className="bg-zinc-950 p-6 rounded-[36px] border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Tactical Intelligence Filters</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Start Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-9 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">End Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-9 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Incident Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Incident Type</label>
            <select 
              value={filters.incidentType}
              onChange={(e) => handleFilterChange('incidentType', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="SOS">SOS Trigger</option>
              <option value="TRAFFICKING">Human Trafficking</option>
              <option value="RESCUE">Community Rescue</option>
              <option value="MISSING">Missing Persons</option>
              <option value="CYBER">Cyber Safety</option>
            </select>
          </div>

          {/* District / Location */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Sovereign District</label>
            <select 
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Districts</option>
              <option value="Loop">Loop</option>
              <option value="Near North Side">Near North Side</option>
              <option value="Hyde Park">Hyde Park</option>
              <option value="River North">River North</option>
              <option value="West Loop">West Loop</option>
              <option value="South Loop">South Loop</option>
              <option value="Uptown">Uptown</option>
            </select>
          </div>

          {/* Severity Tier */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Severity Tier</label>
            <select 
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. INTERACTIVE GEOSPATIAL MAP COMPONENT */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEAFLET GEOSPATIAL MAP PANEL */}
        <div className="lg:col-span-8 bg-zinc-950 p-6 rounded-[48px] border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Interactive Cartography Visualizer</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Leaflet GPS Coordinate Aggregation Mapper</p>
            </div>

            {/* Toggle layers */}
            <div className="flex gap-2 p-1 bg-black/60 border border-white/10 rounded-2xl">
              {[
                { id: 'INCIDENT_DENSITY', label: 'Incident Density', color: 'border-indigo-500/20 text-indigo-400' },
                { id: 'HEATMAP', label: 'Crime Heatmap', color: 'border-red-500/20 text-red-500' },
                { id: 'TRAFFICKING_HOTSPOTS', label: 'Trafficking Hotspots', color: 'border-amber-500/20 text-amber-500 animate-pulse' }
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => { setActiveMapMode(mode.id as any); playTacticalBeep(600, 0.05, 0.05); }}
                  className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeMapMode === mode.id 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Leaflet Map Canvas */}
          <div className="relative h-[480px] bg-black/60 rounded-[36px] border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
            {/* The Map Div */}
            <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

            {/* Custom Legend Overlay on Map */}
            <div className="absolute bottom-5 left-5 z-20 p-4 bg-zinc-950/90 border border-white/10 rounded-2xl space-y-2 text-[9px] font-mono shadow-2xl backdrop-blur-md">
              <p className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1 mb-1">Visual Layer Index</p>
              
              {activeMapMode === 'INCIDENT_DENSITY' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> <span className="text-slate-400">SOS distress alarms</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> <span className="text-slate-400">Trafficking sightings</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" /> <span className="text-slate-400">Rescue Net requests</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /> <span className="text-slate-400">Missing search areas</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> <span className="text-slate-400">Cyber safety reports</span></div>
                </div>
              )}

              {activeMapMode === 'HEATMAP' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> <span className="text-slate-400">Critical Threat Heatpoint</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /> <span className="text-slate-400">High Threat Heatpoint</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500/30" /> <span className="text-slate-400">Low Threat Heatpoint</span></div>
                </div>
              )}

              {activeMapMode === 'TRAFFICKING_HOTSPOTS' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" /> <span className="text-slate-400">Active Trafficking Hotspot</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 border border-dashed border-amber-500/70 rounded-full" /> <span className="text-slate-400">800m Surveillance Zone</span></div>
                </div>
              )}
            </div>

            {/* Total count bubble on map */}
            <div className="absolute top-5 left-5 z-20 px-4 py-2.5 bg-indigo-950/80 border border-indigo-500/20 rounded-2xl shadow-xl backdrop-blur-md">
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-wider font-mono">Geospatial Nodes</p>
              <p className="text-xl font-black text-white font-mono leading-tight">{dashboardData?.allIncidents?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* RECHARTS EMERGENCY RESPONSE STATISTICS & SEVERITY */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Pie chart representing severity */}
          <div className="bg-zinc-950 p-6 rounded-[36px] border border-white/5 space-y-4">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Distress Severity Breakdown</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">MongoDB $group aggregation results</p>
            </div>

            <div className="h-44 flex items-center justify-center">
              {getSeverityChartData().length === 0 ? (
                <p className="text-xs text-slate-500 font-mono uppercase">No records found</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSeverityChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {getSeverityChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              {getSeverityChartData().map((item: any) => (
                <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-slate-400 font-bold">{item.name}:</span>
                  <span className="text-white font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Type breakdown */}
          <div className="bg-zinc-950 p-6 rounded-[36px] border border-white/5 space-y-4">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Incident Type Density</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Dynamic category volumes</p>
            </div>

            <div className="h-44 flex items-center justify-center">
              {getTypeChartData().length === 0 ? (
                <p className="text-xs text-slate-500 font-mono uppercase">No records found</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTypeChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {getTypeChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              {getTypeChartData().map((item: any) => (
                <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-slate-400 font-bold">{item.name}:</span>
                  <span className="text-white font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. CHARTS ROW: MONTHLY TRENDS & DISTRICT WISE COMPARISONS */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* MONTHLY TRENDS AREA CHART */}
        <div className="bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Monthly Incident Trends</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Chronological area distribution over time</p>
          </div>

          <div className="h-72">
            {getMonthlyTrendsData().length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border border-white/5 bg-black/30 rounded-2xl text-xs text-slate-500 uppercase font-mono">
                No monthly logs compiled
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getMonthlyTrendsData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSOS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#475569" fontSize={9} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="total" name="All Incidents" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="SOS" name="SOS Panic" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSOS)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DISTRICT-WISE COMPARISON BAR CHART */}
        <div className="bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">District-Wise Comparison</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Incident counts & average response times</p>
          </div>

          <div className="h-72">
            {getDistrictChartData().length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border border-white/5 bg-black/30 rounded-2xl text-xs text-slate-500 uppercase font-mono">
                No district records grouped
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getDistrictChartData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="district" stroke="#475569" fontSize={8} fontClassName="font-mono" />
                  <YAxis stroke="#475569" fontSize={9} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <Bar dataKey="count" name="Total Incidents" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="avgResponseTime" name="Avg Dispatch (m)" fill="#eab308" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 5. INDIVIDUAL AGGREGATED ALERTS LIST TABLE */}
      <div className="bg-zinc-950 p-8 rounded-[48px] border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Aggregated Live Stream Logs</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mono tracking-widest">Raw incident elements parsed via matching stage</p>
          </div>
          <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl font-bold">
            MongoDB Stage: Match & Project
          </div>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-white/5 bg-black/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4 font-mono">Incident ID</th>
                <th className="p-4 font-mono">Category</th>
                <th className="p-4 font-mono">District / Coordinates</th>
                <th className="p-4 font-mono">Log Description</th>
                <th className="p-4 font-mono">Logged Date</th>
                <th className="p-4 font-mono">Severity</th>
                <th className="p-4 font-mono text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {!dashboardData?.allIncidents || dashboardData.allIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono uppercase italic">
                    No records matches active filtration parameters.
                  </td>
                </tr>
              ) : (
                dashboardData.allIncidents.map((inc: any) => {
                  let badgeColor = 'bg-red-500/15 text-red-400 border-red-500/20';
                  if (inc.type === 'TRAFFICKING') badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
                  if (inc.type === 'RESCUE') badgeColor = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';
                  if (inc.type === 'MISSING') badgeColor = 'bg-pink-500/15 text-pink-400 border-pink-500/20';
                  if (inc.type === 'CYBER') badgeColor = 'bg-blue-500/15 text-blue-400 border-blue-500/20';

                  let sevColor = 'text-green-400';
                  if (inc.severity === 'CRITICAL') sevColor = 'text-red-500 font-black';
                  if (inc.severity === 'HIGH') sevColor = 'text-orange-400 font-bold';
                  if (inc.severity === 'MEDIUM') sevColor = 'text-yellow-400';

                  return (
                    <tr key={inc.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 font-mono text-[10px] text-slate-400">{inc.id}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-lg ${badgeColor}`}>
                          {inc.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{inc.district}</p>
                        <p className="text-[8.5px] font-mono text-slate-500">Lat: {inc.lat.toFixed(4)}, Lng: {inc.lng.toFixed(4)}</p>
                      </td>
                      <td className="p-4 max-w-sm text-slate-300 font-medium truncate">{inc.description}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{new Date(inc.timestamp).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider font-mono ${sevColor}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-1 rounded-md uppercase">
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
