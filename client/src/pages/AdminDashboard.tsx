import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertCircle, CheckCircle, Clock, 
  MapPin, Plus, Filter, Layout, ArrowLeft,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../context/LiveDataContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../lib/api';
import FacilityMap from '../components/Map/FacilityMap';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { facilities, alerts, globalStats, recommendation, isLive } = useLiveData();
  const { showToast } = useToast();
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL'>('ALL');

  const filteredAlerts = useMemo(() => 
    filterMode === 'ALL' 
      ? alerts.filter(a => a.status === 'PENDING') 
      : alerts.filter(a => a.status === 'PENDING' && a.priority === 'CRITICAL'),
    [alerts, filterMode]
  );

  const stats = useMemo(() => ({
    total: facilities.length,
    activeAlerts: alerts.filter(a => a.status === 'PENDING').length,
    inProgress: alerts.filter(a => a.status === 'IN_PROGRESS').length,
    avgResponse: globalStats?.avg_response_time_mins_today ? `${globalStats.avg_response_time_mins_today}m` : '12m',
    uptime: '99.9%'
  }), [facilities, alerts, globalStats]);

  const acknowledgeAlert = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance/${id}/accept`, {
        method: 'PUT'
      });
      if (res.ok) {
        showToast('Alert acknowledged & assigned', 'success');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-premium-bg pt-24 pb-12 px-6 overflow-x-hidden">
      {/* Background Depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-premium-accent/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-[10px] text-premium-muted font-bold uppercase tracking-widest hover:text-premium-text transition-all mb-6"
            >
              <div className="p-2 rounded-full border border-white/5 group-hover:bg-white/5 transition-all">
                <ArrowLeft size={14} />
              </div>
              Back to map
            </button>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-[1px] bg-premium-accent" />
               <span className="text-premium-accent text-[10px] font-bold uppercase tracking-[0.3em]">Operations</span>
            </div>
            <h1 className="text-5xl font-bold text-premium-text tracking-tighter">
              Administrative <span className="text-premium-subtle">Portal</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-xl">
             <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-status-issue'}`} />
                <span className="text-[10px] text-premium-subtle font-bold uppercase tracking-widest">{isLive ? 'Live Sync' : 'Offline'}</span>
             </div>
             <button 
               onClick={() => setFilterMode(prev => prev === 'ALL' ? 'CRITICAL' : 'ALL')}
               className={`p-2.5 rounded-full transition-all ${filterMode === 'CRITICAL' ? 'bg-status-issue/20 text-status-issue' : 'text-premium-muted hover:text-premium-text hover:bg-white/5'}`}
             >
               <Filter size={16} />
             </button>
             <button 
               onClick={() => showToast('Initializing manual service log...', 'info')}
               className="p-2.5 bg-premium-accent text-white rounded-full shadow-lg shadow-premium-accent/20 hover:scale-105 active:scale-95 transition-all"
             >
               <Plus size={18} />
             </button>
          </div>
        </header>

        {/* AI Insight Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 glass-panel border-premium-accent/30 bg-premium-accent/5 flex items-center gap-6 relative overflow-hidden group"
        >
          <div className="p-4 bg-premium-accent/10 rounded-2xl relative z-10 shadow-inner">
            <Activity size={24} className="text-premium-accent animate-pulse" />
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-premium-accent uppercase tracking-widest">NVIDIA NIM AI Insight</span>
               <div className="w-1.5 h-1.5 rounded-full bg-premium-accent animate-ping" />
            </div>
            <p className="text-sm font-medium text-premium-text">
              {recommendation?.best?.ai_insight || "Analyzing Dehradun network telemetry for optimization..."}
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-premium-accent/10 to-transparent pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
             <Shield size={160} className="text-premium-accent" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Units', value: stats.total, icon: Layout, color: 'text-premium-accent' },
            { label: 'Service Alerts', value: stats.activeAlerts, icon: AlertCircle, color: 'text-status-issue' },
            { label: 'Active Tasks', value: stats.inProgress, icon: Clock, color: 'text-status-attention' },
            { label: 'Avg Response', value: stats.avgResponse, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'System Uptime', value: stats.uptime, icon: Activity, color: 'text-violet-400' }
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-8 relative overflow-hidden group hover:border-premium-accent/30 transition-all"
            >
              <div className={`mb-6 ${kpi.color} p-2 bg-white/5 rounded-lg w-fit`}>
                <kpi.icon size={20} />
              </div>
              <div className="text-3xl font-bold text-premium-text mb-1 tracking-tight">{kpi.value}</div>
              <div className="text-[9px] text-premium-muted font-bold uppercase tracking-widest">{kpi.label}</div>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Shield size={12} className="text-white/10" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Service Feed */}
          <div className="lg:col-span-1 glass-panel p-8 flex flex-col h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-premium-text tracking-tight">Recent Activity</h3>
              <div className="px-2.5 py-1 bg-status-issue/10 text-status-issue text-[8px] font-bold rounded-md uppercase tracking-widest">Live</div>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.map((alert) => (
                  <motion.div 
                    key={alert.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] text-premium-accent font-bold uppercase tracking-widest">{alert.facility_name}</span>
                       <span className="text-[8px] text-premium-subtle font-medium">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-premium-text font-medium mb-4 leading-relaxed line-clamp-2">{alert.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${alert.priority === 'CRITICAL' ? 'bg-status-issue' : 'bg-status-attention'}`} />
                        <span className="text-[8px] text-premium-muted uppercase font-bold tracking-widest">{alert.priority}</span>
                      </div>
                      <span className="text-[9px] text-premium-accent font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Acknowledge →</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredAlerts.length === 0 && (
                <div className="text-center py-20">
                  <CheckCircle size={32} className="text-emerald-500/20 mx-auto mb-4" />
                  <p className="text-[10px] text-premium-subtle uppercase tracking-widest">All units operational</p>
                </div>
              )}
            </div>
          </div>

          {/* Unified Network View (Map) */}
          <div className="lg:col-span-2 glass-panel p-4 h-fit overflow-hidden">
             <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                   <MapPin size={16} className="text-premium-accent" />
                   <span className="text-[10px] text-premium-text font-bold uppercase tracking-widest">Network Verification</span>
                </div>
                <div className="flex gap-6">
                   <div className="flex items-center gap-2 text-[9px] text-premium-subtle font-bold uppercase">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Optimal
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-premium-subtle font-bold uppercase">
                     <div className="w-1.5 h-1.5 rounded-full bg-status-issue" /> Critical
                   </div>
                </div>
             </div>
             <div className="h-[600px] w-full rounded-2xl overflow-hidden grayscale invert opacity-90 brightness-[0.8] contrast-[1.2]">
                <FacilityMap facilities={facilities} onMarkerClick={(id) => navigate(`/facility/${id}`)} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
