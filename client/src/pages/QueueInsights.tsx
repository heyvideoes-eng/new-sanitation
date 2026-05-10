import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Activity, ShieldCheck, 
  MapPin, Users, Camera, Check, 
  ArrowRight, Info, AlertCircle, BarChart3,
  TrendingUp, Smartphone, QrCode, Search,
  ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../context/LiveDataContext';

const QueueInsights: React.FC = () => {
  const navigate = useNavigate();
  const { facilities, recommendation, isLive } = useLiveData();
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initializing logic to ensure data is present
  useEffect(() => {
    if (facilities.length > 0) {
      const timer = setTimeout(() => setIsInitializing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [facilities]);

  const activeUnit = useMemo(() => {
    if (selectedUnitId) return facilities.find(f => f.id === selectedUnitId) || facilities[0];
    return recommendation?.best || facilities[0] || null;
  }, [selectedUnitId, facilities, recommendation]);

  const steps = [
    {
      title: "Sensors detect usage",
      desc: "IR motion sensors and cubicle occupancy detectors count entries and exits in real-time.",
      icon: <Users size={20} />,
      status: isLive ? "Active Sensing" : "Connecting...",
      active: true
    },
    {
      title: "System calculates",
      desc: "Occupancy percentage, estimated wait times, and pressure levels are computed instantly.",
      icon: <Activity size={20} />,
      status: "Logic Layer",
      active: isLive
    },
    {
      title: "Public sees availability",
      desc: "Live status nodes update across all city platforms and maps instantly.",
      icon: <MapPin size={20} />,
      status: "Broadcast",
      active: true
    },
    {
      title: "Decision support",
      desc: "The system recommends the best nearby facility based on your location and current wait times.",
      icon: <Zap size={20} />,
      status: recommendation?.best ? "Optimal Found" : "Scanning...",
      active: !!recommendation?.best
    },
    {
      title: "Hygiene monitoring",
      desc: "Air quality and usage intensity sensors monitor cleanliness and trigger cleaning alerts.",
      icon: <ShieldCheck size={20} />,
      status: "Quality Control",
      active: true
    },
    {
      title: "Rapid response",
      desc: "Maintenance teams receive automated alerts and verify services via QR and photo proof.",
      icon: <Clock size={20} />,
      status: "Field Ops",
      active: true
    },
    {
      title: "Trust & Transparency",
      desc: "Every service action is logged to the public budget portal for full accountability.",
      icon: <BarChart3 size={20} />,
      status: "Public Audit",
      active: true
    }
  ];

  if (isInitializing || facilities.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center text-center px-6">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-12 relative"
        >
          <div className="absolute inset-0 bg-premium-accent/40 blur-[40px] rounded-full" />
          <Zap className="text-premium-accent relative z-10" size={64} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-premium-text tracking-tighter uppercase">Synchronizing Neural Stream</h2>
          <div className="flex items-center gap-3 justify-center text-premium-muted">
             <RefreshCw size={14} className="animate-spin" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Handshaking with Dehradun Grid</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-bg pt-32 pb-20 px-6 overflow-x-hidden">
      {/* ULTRA 3D FLIGHT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#07090D]">
        {/* Deep Atmosphere Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[100%] h-[100%] bg-premium-accent/20 rounded-full blur-[200px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-5%] left-[-10%] w-[80%] h-[80%] bg-emerald-500/15 rounded-full blur-[180px]" 
        />

        {/* 3D High-Velocity Grid */}
        <div className="absolute inset-0 perspective-1000">
          <motion.div 
            initial={{ rotateX: 68, y: "15%" }}
            animate={{ backgroundPosition: ["0px 0px", "0px 180px"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-150%] left-[-100%] right-[-100%] top-[-50%] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:90px_90px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_90%)] pointer-events-none"
          />
        </div>

        {/* High-Density Z-Axis Star Field */}
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              z: -2000,
              opacity: 0
            }}
            animate={{ 
              z: [null, 2000],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 4 + 2, 
              repeat: Infinity, 
              ease: "easeIn",
              delay: Math.random() * 12
            }}
            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transform-gpu"
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="max-w-3xl mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-[1px] bg-premium-accent" />
            <span className="text-premium-accent text-[10px] font-bold uppercase tracking-[0.4em]">Live Intelligence</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="text-5xl md:text-7xl font-bold text-premium-text tracking-tighter mb-8 leading-[1.1]"
          >
            Live Crowd & <br />
            <span className="text-premium-subtle italic">Queue Monitor</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-premium-muted leading-relaxed"
          >
            Connected to {facilities.length} active units across Dehradun. Our neural sensing layer 
            processes footfall and hygiene data to provide {isLive ? "real-time" : "recent"} wayfinding support.
          </motion.p>
        </header>

        {/* 7-Step System Logic Flow */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-premium-text tracking-tight">System Intelligence Flow</h2>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
               <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-status-issue'}`} />
               <span className="text-[9px] font-bold text-premium-subtle uppercase tracking-widest">{isLive ? 'Network Active' : 'Connecting...'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-panel p-8 flex flex-col group hover:border-premium-accent/30 transition-all ${i === steps.length - 1 ? 'lg:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-3 rounded-2xl transition-colors ${step.active ? 'bg-premium-accent/10' : 'bg-white/5'}`}>
                    {React.cloneElement(step.icon as React.ReactElement, { 
                      className: step.active ? "text-premium-accent" : "text-premium-muted",
                      size: 20 
                    })}
                  </div>
                  <span className="text-[8px] font-bold text-premium-subtle uppercase tracking-widest">Step 0{i + 1}</span>
                </div>
                <h3 className={`text-lg font-bold mb-3 transition-colors ${step.active ? 'text-premium-text group-hover:text-premium-accent' : 'text-premium-muted'}`}>{step.title}</h3>
                <p className="text-sm text-premium-muted leading-relaxed mb-8 flex-1">{step.desc}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-premium-subtle uppercase tracking-widest">{step.status}</span>
                  {step.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hardware Mockup & Predictive Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-premium-text tracking-tight">Smart Display Interface</h2>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-premium-muted uppercase tracking-widest">Live Node</div>
              </div>
              
              <div className="relative group min-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-premium-muted" size={12} />
                <select 
                  value={selectedUnitId || (activeUnit?.id || '')}
                  onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-[10px] font-bold text-premium-text uppercase tracking-widest outline-none focus:border-premium-accent/40 appearance-none cursor-pointer hover:bg-white/10 transition-colors shadow-lg"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id} className="bg-[#1C202B]">{f.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-premium-muted">
                   <ChevronRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>
            
            {/* Smart Pole Mockup (Subtle 3D) */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeUnit?.id}
                initial={{ opacity: 0, rotateY: -25, scale: 0.85 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 25, scale: 0.85 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="relative p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden group perspective-2000 shadow-[0_60px_120px_rgba(0,0,0,0.7)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-premium-accent/15 to-transparent pointer-events-none" />
                
                <motion.div 
                  whileHover={{ rotateY: 10, rotateX: -6 }}
                  className="max-w-sm mx-auto bg-[#1C202B] p-12 rounded-[3rem] border border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.8)] transform-gpu transition-transform duration-800 relative z-10"
                >
                  <div className="flex items-center justify-between mb-12">
                     <span className="text-[12px] font-bold text-premium-accent uppercase tracking-[0.25em]">{activeUnit?.name?.split(' – ')[0] || 'Unknown Unit'}</span>
                     <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${['GREEN', 'OPEN'].includes(activeUnit?.current_status || '') ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-status-issue/20 text-status-issue border border-status-issue/30'}`}>
                       {activeUnit?.current_status || 'SCANNING'}
                     </div>
                  </div>

                  {/* Hardware Traffic Light */}
                  <div className="flex gap-4 mb-14 justify-center">
                     <div className={`w-16 h-3 rounded-full transition-all duration-700 ${activeUnit && activeUnit.occupancy < 60 ? 'bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]' : 'bg-white/5'}`} />
                     <div className={`w-16 h-3 rounded-full transition-all duration-700 ${activeUnit && activeUnit.occupancy >= 60 && activeUnit.occupancy < 85 ? 'bg-status-attention shadow-[0_0_25px_rgba(245,158,11,0.7)]' : 'bg-white/5'}`} />
                     <div className={`w-16 h-3 rounded-full transition-all duration-700 ${activeUnit && activeUnit.occupancy >= 85 ? 'bg-status-issue shadow-[0_0_25px_rgba(239,68,68,0.7)]' : 'bg-white/5'}`} />
                  </div>

                  <div className="space-y-10">
                     <div className="flex justify-between items-baseline border-b border-white/5 pb-8">
                        <span className="text-[12px] font-bold text-premium-muted uppercase tracking-widest">Wait Time</span>
                        <span className="text-5xl font-bold text-white tracking-tighter">
                          {activeUnit?.wait_time && activeUnit.wait_time !== 'NaN' ? `${String(activeUnit.wait_time).padStart(2, '0')} MIN` : '00 MIN'}
                        </span>
                     </div>
                     <div className="flex justify-between items-baseline border-b border-white/5 pb-8">
                        <span className="text-[12px] font-bold text-premium-muted uppercase tracking-widest">Occupancy</span>
                        <span className={`text-5xl font-bold tracking-tighter ${activeUnit && activeUnit.occupancy >= 85 ? 'text-status-issue' : 'text-white'}`}>
                          {activeUnit?.occupancy || 0}%
                        </span>
                     </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-[12px] font-bold text-premium-muted uppercase tracking-widest">Health</span>
                        <span className="text-5xl font-bold text-emerald-500 tracking-tighter uppercase">Optimal</span>
                     </div>
                  </div>

                  <div className="mt-16 p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group/qr cursor-pointer hover:bg-white/10 transition-all hover:border-premium-accent/40 shadow-xl">
                     <div className="flex items-center gap-5">
                       <QrCode size={28} className="text-premium-accent group-hover/qr:scale-110 transition-transform" />
                       <span className="text-[11px] font-bold text-premium-subtle uppercase tracking-widest leading-relaxed">Unit Identity <br /> & Audit Profile</span>
                     </div>
                     <ArrowRight size={20} className="text-premium-subtle group-hover/qr:translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                <p className="mt-12 text-center text-[12px] text-premium-muted uppercase tracking-[0.5em] font-bold">
                  Node Stream: {activeUnit?.name || 'Syncing Grid...'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-premium-text tracking-tight">Predictions</h2>
            </div>

            {/* Predictive Rush Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-8 relative overflow-hidden group border-white/5 hover:border-status-attention/30 shadow-xl"
            >
               <TrendingUp className="text-status-attention mb-6" size={24} />
               <h4 className="text-lg font-bold text-premium-text mb-2 tracking-tight">Expected Rush</h4>
               <p className="text-xs text-premium-muted mb-8 leading-relaxed">
                 {recommendation?.best && recommendation.best.occupancy > 70 
                   ? `High density detected at ${recommendation.best.name?.split(' – ')[0] || 'Unit'}. Alternative routing advised.`
                   : "Traffic patterns indicate a 15% increase in the next 20 mins based on transit arrivals."}
               </p>
               <div className={`flex items-center gap-2 px-4 py-2 border rounded-full w-fit ${recommendation?.best && recommendation.best.occupancy > 70 ? 'bg-status-issue/10 border-status-issue/30 text-status-issue shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-status-attention/10 border-status-attention/30 text-status-attention shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {recommendation?.best && recommendation.best.occupancy > 70 ? "Alternative Suggested" : "Rush in 15 mins"}
                  </span>
               </div>
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Activity size={72} className="text-status-attention" />
               </div>
            </motion.div>

            {/* Cleanliness Impact Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-8 border-white/5 hover:border-emerald-500/30 shadow-xl"
            >
               <ShieldCheck className="text-emerald-500 mb-6" size={24} />
               <h4 className="text-lg font-bold text-premium-text mb-2 tracking-tight">Hygiene Threshold</h4>
               <p className="text-xs text-premium-muted mb-8 leading-relaxed">
                 Cleaning urgency is automatically adjusted based on footfall and air quality sensors.
               </p>
               <div className="space-y-5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                     <span className="text-premium-subtle">Usage Intensity</span>
                     <span className="text-premium-text">{activeUnit?.occupancy || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activeUnit?.occupancy || 0}%` }}
                        className={`h-full transition-all duration-1000 ${activeUnit && activeUnit.occupancy > 80 ? 'bg-status-issue shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                     />
                  </div>
                  <p className="text-[10px] text-premium-muted uppercase font-bold tracking-[0.2em]">
                    {activeUnit && activeUnit.occupancy > 80 ? "Cleaning alert generated" : "Surface health: Optimal"}
                  </p>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Public Feedback Integration */}
        <motion.section 
          whileHover={{ y: -5 }}
          className="p-16 glass-panel rounded-[5rem] border-white/5 overflow-hidden relative shadow-[0_80px_160px_rgba(0,0,0,0.8)]"
        >
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl font-bold text-premium-text mb-6 tracking-tighter">Public Accountability</h2>
            <p className="text-premium-muted text-lg mb-10 leading-relaxed">
              Every unit has a unique identity. Negative reports are immediately synchronized 
              with our field operations and surface in the public transparency log.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => navigate('/cleaner')}
                className="flex items-center gap-4 px-12 py-6 bg-premium-accent text-white rounded-[1.5rem] text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-premium-accent/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Smartphone size={20} /> Open Field Service
              </button>
              <button 
                onClick={() => navigate('/budget')}
                className="flex items-center gap-4 px-12 py-6 bg-white/5 text-white rounded-[1.5rem] border border-white/10 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl"
              >
                <QrCode size={20} /> Public Audit Log
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-16 opacity-5 hidden lg:block">
             <QrCode size={340} className="text-premium-accent" />
          </div>
        </motion.section>

        <footer className="mt-20 pt-12 border-t border-white/5 text-center">
           <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto text-[12px] text-premium-muted font-bold uppercase tracking-[0.4em] hover:text-premium-text transition-colors group"
           >
             <ArrowRight className="rotate-180" size={18} /> Back to Dashboard
           </button>
        </footer>
      </div>
    </div>
  );
};

export default QueueInsights;
