import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, IndianRupee, Plus, Filter, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../context/LiveDataContext';
import { useToast } from '../context/ToastContext';
import FacilityMap from '../components/Map/FacilityMap';
import Skeleton from '../components/UI/Skeleton';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { facilities, isLive, govtMode } = useLiveData();
  const { showToast } = useToast();
  const [overview, setOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL'>('ALL');

  const filteredAlerts = filterMode === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.priority === 'CRITICAL');

  const fetchDashboardData = async () => {
    try {
      const hostname = window.location.hostname;
      const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:4000`;
      
      const [ovRes, alRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/overview`),
        fetch(`${API_URL}/api/dashboard/alerts-stream`)
      ]);
      setOverview(await ovRes.json());
      setAlerts(await alRes.json());
    } catch (e) {
      showToast('Neural link synchronization failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (taskId: number, facilityId: number, issue: string) => {
    // Optimistic UI: Remove from list immediately
    setAlerts(prev => prev.filter(a => a.id !== taskId));
    showToast('Deploying specialized unit...', 'info');
    
    try {
      const hostname = window.location.hostname;
      const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:4000`;
      
      const res = await fetch(`${API_URL}/api/maintenance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          facility_id: facilityId, 
          issue_reason: issue, 
          severity: 'HIGH',
          assigned_to: 'Team Alpha-6'
        })
      });
      
      if (res.ok) {
        showToast(`Team Alpha-6 deployed to ${facilities.find(f => f.id === facilityId)?.name}`, 'success');
        // Refresh to ensure sync, but the local removal handled the 'vanish' requirement
        fetchDashboardData();
      }
    } catch (e) {
      showToast('Failed to deploy maintenance unit', 'error');
      fetchDashboardData(); // Restore if failed
    }
  };

  const handleManualIncident = async () => {
    const facilityId = facilities[Math.floor(Math.random() * facilities.length)]?.id;
    if (!facilityId) return;

    showToast('Manual override: Deploying protocol...', 'info');
    try {
      const hostname = window.location.hostname;
      const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:4000`;
      
      await fetch(`${API_URL}/api/maintenance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          facility_id: facilityId, 
          issue_reason: 'MANUAL OVERRIDE: Proactive Deep Sanitization Required', 
          severity: 'MEDIUM',
          assigned_to: 'Team Bravo-9'
        })
      });
      showToast('Proactive task deployed to network', 'success');
      fetchDashboardData();
    } catch (e) {
      showToast('Neural link error', 'error');
    }
  };

  const kpis = [
    { label: 'Network Units', value: facilities.length || '0', icon: Activity, color: 'text-blue-400' },
    { label: 'Priority Alerts', value: alerts.length || '0', icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Active Deployments', value: overview?.tasks_in_progress || '0', icon: Clock, color: 'text-amber-400' },
    { label: 'SLA Response', value: `${overview?.avg_response_time_mins_today || 0}m`, icon: CheckCircle, color: 'text-green-400' },
    { label: "Daily Ops Burn", value: `₹${overview?.today_cost_inr || 0}`, icon: IndianRupee, color: 'text-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-atmosBg pt-20 md:pt-24 pb-12 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors mb-6 group"
          >
            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-atmosAccent/10 transition-colors">
              <Activity className="w-3.5 h-3.5 rotate-180" />
            </div>
            Back to Surface
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-atmosAccent" />
            <span className="text-atmosAccent text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Command Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-atmosText tracking-tighter">
            Network <span className="text-atmosAccentSoft">Operations</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 bg-atmosBgAlt/30 border border-white/5 p-2 rounded-full backdrop-blur-xl self-start md:self-auto">
           <div className="flex items-center gap-2 px-3 md:px-4 border-r border-white/10">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500'} `} />
              <span className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest">{isLive ? 'LIVE LINK' : 'OFFLINE'}</span>
           </div>
           <button 
             onClick={() => setFilterMode(prev => prev === 'ALL' ? 'CRITICAL' : 'ALL')}
             className={`p-2 md:p-3 transition-colors rounded-full ${filterMode === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'hover:text-atmosAccent'}`}
             title={filterMode === 'ALL' ? 'Filter: All Incidents' : 'Filter: Critical Only'}
           >
             <Filter className="w-4 h-4 md:w-4.5 md:h-4.5" />
           </button>
           <button 
             onClick={handleManualIncident}
             className="p-2 md:p-3 bg-atmosAccent text-black rounded-full shadow-lg shadow-atmosAccent/20 hover:scale-110 transition-transform active:scale-95"
             title="Deploy Manual Protocol"
           >
             <Plus className="w-4 h-4 md:w-4.5 md:h-4.5" />
           </button>
        </div>
      </header>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 md:p-8 bg-atmosBgAlt/50 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden"
          >
            <div className={`mb-4 md:mb-6 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            {isLoading ? <Skeleton className="h-8 md:h-10 w-20 md:w-24 mb-2" /> : (
              <div className="text-2xl md:text-3xl font-bold text-atmosText mb-1 font-outfit tracking-tight">{kpi.value}</div>
            )}
            <div className="text-[8px] md:text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.3em] font-inter">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Alerts & Tactical Stream */}
        <div className="lg:col-span-1 p-6 md:p-8 bg-atmosBgAlt/30 border border-white/5 rounded-[2rem] md:rounded-[3rem]">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-bold text-atmosText tracking-tight">Active Incident Stream</h3>
            <div className="px-2 py-1 bg-red-500/10 text-red-500 text-[7px] md:text-[8px] font-bold rounded-md animate-pulse">CRITICAL</div>
          </div>
          
          <div className="space-y-4 max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
              <AnimatePresence>
                {filteredAlerts.map((alert) => (
                  <motion.div 
                    key={alert.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-5 md:p-6 bg-white/5 border-l-4 border-red-500 rounded-r-2xl hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => handleCreateTask(alert.id, alert.facility_id, alert.issue_reason)}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] md:text-[10px] text-red-400 font-bold uppercase tracking-widest truncate">{alert.facility_name}</span>
                       <span className="text-[8px] md:text-[9px] text-atmosTextSubtle font-mono whitespace-nowrap ml-2">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs md:text-sm text-atmosText font-medium mb-3 md:mb-4 line-clamp-2">{alert.issue_reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] text-atmosTextMuted uppercase font-bold tracking-widest">Priority: {alert.priority}</span>
                      <button className="text-[8px] md:text-[9px] text-atmosAccent font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Deploy Team Alpha →</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {!isLoading && filteredAlerts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-atmosSuccess/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle className="text-atmosSuccess opacity-20 w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-[8px] md:text-[10px] text-atmosTextSubtle uppercase tracking-[0.4em]">All units operational</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Operations Map */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
           <div className="p-3 md:p-4 bg-atmosBgAlt/30 border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/5 mb-4">
                 <div className="flex items-center gap-3">
                    <Layout className="w-3.5 h-3.5 md:w-4 md:h-4 text-atmosAccent" />
                    <span className="text-[9px] md:text-[10px] text-atmosText font-bold uppercase tracking-widest">Tactical Network View</span>
                 </div>
                 <div className="hidden sm:flex gap-4">
                    <div className="flex items-center gap-2 text-[8px] text-atmosTextSubtle font-bold uppercase"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Optimal</div>
                    <div className="flex items-center gap-2 text-[8px] text-atmosTextSubtle font-bold uppercase"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical</div>
                 </div>
              </div>
              <div className="h-[350px] md:h-[500px] lg:h-[600px] w-full">
                <FacilityMap facilities={facilities} height="100%" zoom={13} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
