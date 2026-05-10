import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, ChevronDown, AlertCircle, Clock } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

const InteractiveHero: React.FC<{ onOpenDeepDive: () => void }> = ({ onOpenDeepDive }) => {
  const { facilities, isLive, lastUpdated, globalStats } = useLiveData();

  const stats = useMemo(() => {
    const totalHubs = facilities.length;
    const totalStalls = facilities.reduce((acc, f) => acc + (f.total_stalls || 0), 0);
    const greenCount = facilities.filter(f => f.current_status === 'GREEN').length;
    const activeAlerts = facilities.filter(f => f.current_status === 'RED' || f.current_status === 'AMBER').length;
    const avgWait = facilities.length > 0 
      ? (facilities.reduce((acc, f) => acc + (f.wait_time || 0), 0) / totalHubs).toFixed(0) 
      : 0;

    return { totalHubs, totalStalls, greenCount, activeAlerts, avgWait };
  }, [facilities]);

  const systemStatus = useMemo(() => {
    if (!isLive) return 'OFFLINE';
    if (stats.activeAlerts > stats.totalHubs * 0.3) return 'DEGRADED';
    return 'ONLINE';
  }, [isLive, stats]);

  const systemLoadText = useMemo(() => {
    const loadPct = (stats.activeAlerts / stats.totalHubs) * 100;
    if (loadPct > 50) return 'Critical Overload';
    if (loadPct > 20) return 'Network Strained';
    return 'Optimal Path Verified';
  }, [stats]);

  const situationSummary = useMemo(() => {
    if (stats.activeAlerts > 1) {
      return `We're currently managing high-load rushes at ${stats.activeAlerts} locations. Tactical units have been dispatched. Look for GREEN badges below for the most optimal experience.`;
    }
    if (stats.greenCount > stats.totalHubs * 0.8 && stats.totalHubs > 0) {
      return `Infrastructure is operating at peak efficiency. Most hubs are green and ready. You can expect sub-2 minute wait times across the network.`;
    }
    const bestFacility = [...facilities].sort((a, b) => (a.wait_time || 0) - (b.wait_time || 0))[0];
    if (bestFacility) {
      return `${bestFacility.name} is currently your most optimal choice with a ${bestFacility.wait_time}m wait and fresh sanitization verified just moments ago.`;
    }
    return "Synchronizing with municipal sensors. Real-time hygiene telemetry is active and verified across all connected hubs.";
  }, [stats, facilities]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-24 lg:px-32 py-20 relative overflow-hidden">
      {/* Interactive Hero Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-4xl bg-atmosBgAlt/40 backdrop-blur-3xl p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl relative z-40 mx-auto lg:mx-0"
      >
        <div className="flex items-center gap-4 mb-6 md:mb-8">
           <div className="p-2.5 md:p-3 rounded-2xl bg-atmosAccent/10 border border-atmosAccent/20">
              <Shield className="text-atmosAccent" size={24} />
           </div>
           <div>
              <div className="text-[8px] md:text-[10px] text-atmosAccent font-bold uppercase tracking-[0.4em] mb-1 font-inter">System Status</div>
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${
                   systemStatus === 'ONLINE' ? 'bg-atmosSuccess animate-pulse' : 
                   systemStatus === 'DEGRADED' ? 'bg-atmosWarning animate-pulse' : 'bg-red-500'
                 }`} />
                 <span className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.2em] font-inter">
                   {systemStatus}
                 </span>
              </div>
           </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tighter text-atmosText leading-[0.9] lg:leading-[0.85] font-outfit">
          One glance, <br className="hidden md:block" />
          <span className="text-atmosAccent">clean facilities.</span>
        </h1>

        <div className="mb-8 md:mb-10">
          <div className="text-lg md:text-2xl text-atmosText font-bold tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 font-outfit">
            Monitoring <span className="text-atmosAccent">{facilities.length} facilities</span> 
            <span className="text-white/20 hidden sm:block">·</span> 
            across <span className="text-atmosAccent">Old Cantt, Subhash Nagar & ISBT</span>
          </div>
          <div className="text-[8px] md:text-[10px] text-atmosTextSubtle font-bold uppercase tracking-[0.3em] font-inter">
            Real-time ratings and status sync active
          </div>
        </div>

        {/* Dynamic Metric Bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
           <button 
             onClick={() => scrollToSection('facility-grid')}
             className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-atmosAccent/10 hover:border-atmosAccent/30 transition-all text-left"
           >
              <Clock className="text-atmosAccent" size={18} />
              <div>
                 <div className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.2em] font-inter">Avg Wait Time</div>
                 <div className="text-base md:text-lg font-bold text-atmosText font-outfit tracking-tight">
                   {globalStats?.avg_response_time_mins_today || stats.avgWait} Minutes
                 </div>
              </div>
           </button>
           <button 
             onClick={() => scrollToSection('facility-grid')}
             className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-atmosAccent/10 hover:border-atmosAccent/30 transition-all text-left"
           >
              <Zap className="text-atmosAccentSoft" size={18} />
              <div>
                 <div className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.2em] font-inter">Clean Index</div>
                 <div className="text-base md:text-lg font-bold text-atmosText font-outfit tracking-tight">
                   {globalStats?.overall_cleanliness_index || stats.greenCount} / {stats.totalHubs || '...'} Operational
                 </div>
              </div>
           </button>
           <button 
             onClick={() => scrollToSection('admin-alerts')}
             className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-atmosAccent/10 hover:border-atmosAccent/30 transition-all text-left"
           >
              <AlertCircle className={stats.activeAlerts > 0 ? "text-red-500 animate-pulse" : "text-atmosTextMuted"} size={18} />
              <div>
                 <div className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.2em] font-inter">Active Alerts</div>
                 <div className="text-base md:text-lg font-bold text-atmosText font-outfit tracking-tight">
                   {globalStats?.open_alerts || stats.activeAlerts} Reports Pending
                 </div>
              </div>
           </button>
           <button 
             onClick={() => scrollToSection('impact-analytics')}
             className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-atmosAccent/10 hover:border-atmosAccent/30 transition-all text-left"
           >
              <TrendingUp className="text-atmosViolet" size={18} />
              <div>
                 <div className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.2em] font-inter">System Load</div>
                 <div className="text-base md:text-lg font-bold text-atmosText font-outfit tracking-tight">
                   {systemLoadText}
                 </div>
              </div>
           </button>
        </div>

        {/* Situational Micro-copy */}
        <p className="text-atmosTextMuted text-sm md:text-lg leading-relaxed mb-8 md:mb-12 border-l-2 border-atmosAccent/20 pl-4 md:pl-6 italic font-inter font-light">
          "{situationSummary}"
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
             onClick={() => scrollToSection('facility-grid')}
             className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-atmosAccent text-black text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-atmosAccentSoft transition-all shadow-lg shadow-atmosAccent/20 font-inter"
           >
             Inspect All Units
           </button>
           <button 
             onClick={() => {
               const best = [...facilities].sort((a,b) => (a.wait_time || 0) - (b.wait_time || 0))[0];
               if (best) {
                  const el = document.getElementById(`facility-${best.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  else scrollToSection('facility-grid');
               }
             }}
             className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-white/5 text-atmosText text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-white/10 border border-white/10 transition-all font-inter"
           >
             Locate Best Facility
           </button>
        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on very small screens */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 opacity-30 cursor-pointer"
        onClick={onOpenDeepDive}
      >
         <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Initialize Deep Dive</span>
         <ChevronDown size={16} />
      </motion.div>
    </section>
  );
};

export default InteractiveHero;
