import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp, Search, Clock, ArrowLeft, BarChart3, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  // Simulated Analytics Data
  const heatmap = useMemo(() => {
    return Array.from({ length: 168 }).map((_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      value: Math.floor(Math.random() * 100)
    }));
  }, []);

  const trends = useMemo(() => ({
    peak_hours: ['14:00', '18:30'],
    satisfaction: [4.2, 4.5, 3.8, 4.1, 4.3, 4.6, 4.8]
  }), []);

  return (
    <div className="min-h-screen bg-premium-bg pt-24 pb-20 px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-[10px] text-premium-muted font-bold uppercase tracking-widest hover:text-premium-text transition-all mb-6"
            >
              <div className="p-2 rounded-full border border-white/5 group-hover:bg-white/5 transition-all">
                <ArrowLeft size={14} />
              </div>
              Back to surface
            </button>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-[1px] bg-premium-accent" />
               <span className="text-premium-accent text-[10px] font-bold uppercase tracking-[0.3em]">Insights</span>
            </div>
            <h1 className="text-5xl font-bold text-premium-text tracking-tighter">System <span className="text-premium-subtle">Dynamics</span></h1>
          </div>

          <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-xl">
             <Search size={14} className="ml-3 text-premium-muted" />
             <select className="bg-transparent text-[10px] text-premium-text font-bold uppercase focus:outline-none appearance-none cursor-pointer pr-4 py-2">
               <option className="bg-premium-bg">Global Network</option>
               <option className="bg-premium-bg">Transit Zone</option>
               <option className="bg-premium-bg">Commercial Zone</option>
             </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Density Heatmap */}
          <div className="lg:col-span-2 glass-panel p-8">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-premium-accent/10 rounded-lg">
                      <BarChart3 size={18} className="text-premium-accent" />
                   </div>
                   <h3 className="text-lg font-bold text-premium-text tracking-tight">Usage Density Matrix</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-bold text-premium-muted uppercase tracking-widest">7 Day Cycle</div>
             </div>
             
             <div className="grid grid-cols-[auto_1fr] gap-4">
                <div className="flex flex-col justify-between text-[8px] text-premium-subtle font-bold uppercase py-2">
                   {['Mon', 'Wed', 'Fri', 'Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-24 gap-1">
                   {heatmap.map((h, i) => (
                     <motion.div 
                      key={i} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.002 }}
                      className="aspect-square rounded-sm transition-all hover:scale-150 cursor-crosshair"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${h.value / 100})`,
                      }}
                     />
                   ))}
                </div>
             </div>

             <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <TrendingUp size={14} className="text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-[10px] text-premium-muted font-bold uppercase tracking-widest mb-1">Observation</p>
                      <p className="text-xs text-premium-text font-medium leading-relaxed max-w-sm">
                        Network traffic peaks consistently during transit transitions (08:00 - 10:00).
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4 text-[8px] text-premium-muted font-bold uppercase tracking-widest">
                   <span>Low</span>
                   <div className="flex gap-1">
                      {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
                        <div key={o} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(59, 130, 246, ${o})` }} />
                      ))}
                   </div>
                   <span>Peak</span>
                </div>
             </div>
          </div>

          {/* Secondary Intelligence Cards */}
          <div className="lg:col-span-1 space-y-8">
             <div className="glass-panel p-8 relative overflow-hidden group">
               <div className="relative z-10">
                 <Zap className="text-status-attention mb-6 group-hover:scale-110 transition-transform" size={24} />
                 <div className="text-[10px] text-premium-muted font-bold uppercase tracking-widest mb-2">Efficiency Forecast</div>
                 <div className="text-4xl font-bold text-premium-text mb-2 tracking-tighter">{trends.peak_hours[0]}</div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-premium-subtle font-bold uppercase tracking-widest">Optimal Cleaning Window</span>
                 </div>
               </div>
               <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <PieChart size={120} />
               </div>
             </div>

             <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-10">
                   <h4 className="text-[10px] text-premium-muted font-bold uppercase tracking-widest">Public Satisfaction</h4>
                   <Activity size={14} className="text-premium-subtle" />
                </div>
                
                <div className="flex items-end gap-2 h-32 mb-6">
                  {trends.satisfaction.map((s, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      animate={{ height: `${(s / 5) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                      className="flex-1 bg-premium-accent/20 border-t border-premium-accent rounded-t-sm relative group"
                    >
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-white">
                         {s}
                       </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-premium-subtle font-bold uppercase tracking-widest">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
             </div>

             <div className="p-6 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-4">
                <Clock size={16} className="text-premium-accent" />
                <span className="text-[9px] text-premium-muted font-bold uppercase tracking-widest leading-relaxed">
                  Real-time synchronization active. Last recalculated 2m ago.
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
