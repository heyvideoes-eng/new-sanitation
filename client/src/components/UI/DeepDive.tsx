import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, AlertTriangle, Clock, TrendingUp, ShieldCheck, PieChart, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLiveData } from '../../context/LiveDataContext';

interface DeepDiveProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeepDive: React.FC<DeepDiveProps> = ({ isOpen, onClose }) => {
  const { alerts, facilities, globalStats, govtMode, budgetSummary, wardPerformance, contractorPerformance } = useLiveData();

  const chartData = [
    { time: '00:00', ammonia: 12, users: 40 },
    { time: '04:00', ammonia: 8, users: 10 },
    { time: '08:00', ammonia: 25, users: 95 },
    { time: '12:00', ammonia: 18, users: 120 },
    { time: '16:00', ammonia: 30, users: 150 },
    { time: '20:00', ammonia: 15, users: 80 },
    { time: '23:59', ammonia: 10, users: 30 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-atmosBg/90 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-7xl h-full max-h-[92vh] bg-atmosBgAlt/60 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div>
                <h2 className="text-3xl font-bold text-atmosText tracking-tighter font-outfit">Neural Deep Dive</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-atmosTextSubtle text-[8px] md:text-[10px] uppercase tracking-widest font-inter font-bold">Operational Intelligence Center</span>
                  {govtMode && (
                    <div className="px-2 py-0.5 bg-atmosAccent/10 border border-atmosAccent/20 rounded-full text-[8px] text-atmosAccent font-bold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={10} />
                      Municipal Oversight Active
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-atmosText"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 custom-scrollbar">
              
              {/* Left Column: Real-time Incident Feed */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                   <Activity className="text-atmosAccent" size={20} />
                   <h3 className="text-xl font-bold text-atmosText tracking-tight font-outfit">Live Feed</h3>
                </div>
                <div className="space-y-4 pr-2">
                  {alerts.slice(0, 8).map((alert) => (
                    <div key={alert.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-atmosAccent/30 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-atmosAccent font-bold uppercase tracking-widest">{alert.facility_name}</span>
                        <span className="text-[10px] text-atmosTextMuted font-mono">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-xs text-atmosText font-bold mb-1 group-hover:text-atmosAccent transition-colors">{alert.task_type}</div>
                      <p className="text-[10px] text-atmosTextSubtle leading-relaxed line-clamp-2">{alert.description}</p>
                      
                      {alert.photo && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/10 aspect-video grayscale hover:grayscale-0 transition-all cursor-zoom-in">
                          <img src={alert.photo} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center & Right Columns: Analytics and Municipal Panels */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Global KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'City Spend', value: `₹${(budgetSummary?.total_spent || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-atmosAccent' },
                    { label: 'Active Tasks', value: globalStats?.open_alerts || 0, icon: AlertTriangle, color: 'text-red-500' },
                    { label: 'Avg SLA Response', value: `${globalStats?.avg_response_time_mins_today || 0}m`, icon: Clock, color: 'text-atmosViolet' },
                    { label: 'Service Coverage', value: '99.8%', icon: ShieldCheck, color: 'text-atmosSuccess' }
                  ].map((s, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -4 }}
                      className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-md"
                    >
                      <s.icon className={s.color} size={18} />
                      <div className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mt-3">{s.label}</div>
                      <div className="text-2xl font-bold text-atmosText mt-1 font-outfit tracking-tighter">{s.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Main Telemetry & Ward Performance */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   {/* Chart */}
                   <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 h-[350px]">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-lg font-bold text-atmosText tracking-tight font-outfit">City-Wide Pulse</h3>
                         <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-atmosAccent" />
                               <span className="text-[9px] text-atmosTextSubtle uppercase font-bold tracking-widest">Hygiene</span>
                            </div>
                         </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorAmmonia" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                          <Area type="monotone" dataKey="ammonia" stroke="#22D3EE" fillOpacity={1} fill="url(#colorAmmonia)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   {/* Ward Performance Panel */}
                   <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-lg font-bold text-atmosText tracking-tight font-outfit">Ward Distribution</h3>
                         <PieChart size={18} className="text-atmosTextSubtle" />
                      </div>
                      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                         {wardPerformance.map((w, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div>
                                 <div className="text-[10px] text-atmosText font-bold uppercase">{w.ward_number || 'Zone X'}</div>
                                 <div className="text-[8px] text-atmosTextMuted uppercase tracking-widest font-bold mt-1">{w.toilet_count} Facilities · {w.total_complaints} Incidents</div>
                              </div>
                              <div className="text-right">
                                 <div className={`text-sm font-bold ${w.avg_compliance > 80 ? 'text-atmosSuccess' : 'text-atmosWarning'}`}>
                                   {w.avg_compliance?.toFixed(1)}%
                                 </div>
                                 <div className="text-[8px] text-atmosTextSubtle uppercase font-bold tracking-widest">Compliance</div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Contractor & SLA Panel (Conditional) */}
                {govtMode && (
                  <div className="p-8 bg-atmosAccent/5 rounded-[2.5rem] border border-atmosAccent/10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <Users className="text-atmosAccent" size={20} />
                          <h3 className="text-lg font-bold text-atmosText tracking-tight font-outfit">Contractor Accountability Matrix</h3>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {contractorPerformance.map((c, i) => (
                         <div key={i} className="p-5 bg-atmosBgAlt/40 rounded-2xl border border-white/5 hover:border-atmosAccent/30 transition-all">
                            <div className="text-atmosText font-bold text-xs uppercase mb-3 truncate">{c.contractor_name}</div>
                            <div className="space-y-3">
                               <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-atmosTextSubtle uppercase font-bold tracking-widest">SLA Compliance</span>
                                  <span className="text-xs font-bold text-atmosAccent">{c.avg_score?.toFixed(1)}%</span>
                               </div>
                               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-atmosAccent transition-all" style={{ width: `${c.avg_score}%` }} />
                               </div>
                               <div className="flex justify-between text-[8px] text-atmosTextMuted font-bold uppercase tracking-widest pt-1">
                                  <span>{c.managed_facilities} Units</span>
                                  <span>{c.tasks_done} Verified Cleans</span>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeepDive;
