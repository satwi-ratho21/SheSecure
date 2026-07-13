
import React from 'react';
import { SafeZone } from '../types';
import { MapPin, Navigation, Shield, ShieldCheck, Clock, Star } from 'lucide-react';

const MOCK_SAFE_ZONES: SafeZone[] = [
  {
    id: '1',
    name: 'Sector 4 District Police',
    type: 'POLICE',
    address: '42 Tactical Ridge, Sector 4',
    distance: '0.8 km',
    isOpen24h: true,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Metropulse Crisis Shelter',
    type: 'SHELTER',
    address: '99 Guardian Way',
    distance: '1.4 km',
    isOpen24h: true,
    rating: 4.7
  },
  {
    id: '3',
    name: 'City General Medical',
    type: 'HOSPITAL',
    address: 'Bio-Hub Alpha, North Sector',
    distance: '2.5 km',
    isOpen24h: true,
    rating: 4.5
  },
  {
    id: '4',
    name: 'Grace Community SafeHouse',
    type: 'VERIFIED_COMMUNITY',
    address: '15 Peace St (Private Entry)',
    distance: '0.5 km',
    isOpen24h: false,
    rating: 5.0
  }
];

const SafeZones: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Safe Zones</h2>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_rgba(16,185,129,1)]" />
             <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.4em] mono">Vanguard Verified Grid Map</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">Filter</button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">Expand Map</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {MOCK_SAFE_ZONES.map(zone => (
          <div key={zone.id} className="glass-card p-8 rounded-[48px] border-4 border-white/5 hover:border-indigo-500/40 transition-all group relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl shadow-inner border border-white/10 ${
                  zone.type === 'POLICE' ? 'bg-blue-600 text-white shadow-blue-500/20' :
                  zone.type === 'SHELTER' ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
                  zone.type === 'HOSPITAL' ? 'bg-red-600 text-white shadow-red-500/20' :
                  'bg-indigo-600 text-white shadow-indigo-500/20'
                }`}>
                  {zone.type === 'POLICE' ? <Shield className="w-8 h-8" /> : 
                   zone.type === 'SHELTER' ? <ShieldCheck className="w-8 h-8" /> :
                   zone.type === 'HOSPITAL' ? <Star className="w-8 h-8" /> : 
                   <MapPin className="w-8 h-8" />}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mono">{zone.type}</span>
                    {zone.rating >= 4.8 && (
                       <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Top Rated</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{zone.name}</h3>
                  <div className="flex items-center gap-2 font-bold text-slate-500 text-[11px] mono uppercase">
                    <MapPin className="w-3 h-3" />
                    {zone.address}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-[32px] border border-white/5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Distance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-white mono">{zone.distance.split(' ')[0]}</p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase">KM</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-[32px] border border-white/5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 text-white">
                   <Clock className="w-4 h-4 text-emerald-500" />
                   <p className="text-sm font-black uppercase tracking-tighter">{zone.isOpen24h ? 'Open 24/7' : 'Business Hours'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex-1 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                 <Navigation className="w-4 h-4" />
                 Tactical Nav
              </button>
              <button className="w-16 h-14 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-900 transition-all shadow-inner">
                 <Shield className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER INTELLIGENCE */}
      <footer className="glass-card p-10 rounded-[48px] border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
         <div className="space-y-1 text-center md:text-left">
            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mono">Nearby Response Units</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">AI Analysis: 4 tactical safe zones detected within 3km of your pulse.</p>
         </div>
         <button className="whitespace-nowrap px-10 py-5 bg-white/5 border-2 border-white/10 rounded-full text-[11px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-900 transition-all shadow-xl">Update Perimeters</button>
      </footer>
    </div>
  );
};

export default SafeZones;
