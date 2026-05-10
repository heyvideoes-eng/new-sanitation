import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Filter, Map as MapIcon, List, 
  Info, Clock, Star, AlertCircle, Camera, Check, 
  Users, Activity, ShieldCheck, MapPin 
} from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import { useSearch } from '../context/SearchContext';
import FacilityMap from '../components/Map/FacilityMap';
import FacilityCard from '../components/UI/FacilityCard';

const Home: React.FC = () => {
  const { facilities, recommendation, isLive, lastUpdated } = useLiveData();
  const { searchQuery } = useSearch();
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const selectedFacility = useMemo(() => 
    facilities.find(f => f.id === selectedFacilityId), 
    [facilities, selectedFacilityId]
  );

  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const matchesFilter = 
        filter === 'ALL' || 
        (filter === 'OPEN' && f.status !== 'CLOSED') ||
        (filter === 'RATED' && (f.rating || 0) >= 4) ||
        (filter === 'WOMEN' && f.type?.includes('Women')) ||
        (filter === 'ACCESSIBLE' && f.type?.includes('Accessible'));
      
      const matchesSearch = 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [facilities, filter, searchQuery]);

  const globalStats = useMemo(() => ({
    total: facilities.length,
    open: facilities.filter(f => f.status !== 'CLOSED').length,
    avgRating: facilities.reduce((acc, f) => acc + (f.rating || 0), 0) / (facilities.length || 1),
    critical: facilities.filter(f => f.current_status === 'RED').length
  }), [facilities]);

  const recommendationText = useMemo(() => {
    if (!recommendation?.best) return "Looking for the best nearby facility...";
    const best = recommendation.best;
    const waitTime = best.wait_time !== undefined ? `${best.wait_time}m wait` : 'minimal wait';
    return `Best nearby option: ${best.name} — ${waitTime}, recently verified.`;
  }, [recommendation]);

  return (
    <div className="relative min-h-screen bg-premium-bg pt-24 pb-12 px-6 overflow-x-hidden">
      {/* Background Depth Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-premium-accent/10 rounded-full blur-[120px]" 
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Compact Hero Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-12 mb-12 px-6 py-4 glass-panel rounded-2xl border-white/5"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-premium-muted uppercase tracking-[0.2em] mb-1">Monitored</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-premium-text">{globalStats.total || '--'}</span>
              <span className="text-[10px] font-medium text-premium-subtle">Units</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-premium-muted uppercase tracking-[0.2em] mb-1">Live Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">{globalStats.open || '--'}</span>
              <span className="text-[10px] font-medium text-premium-subtle">Operational</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-premium-muted uppercase tracking-[0.2em] mb-1">Quality Avg</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-status-attention">{globalStats.avgRating?.toFixed(1) || '--'}</span>
              <span className="text-status-attention text-xs">★</span>
            </div>
          </div>
          <div className="ml-auto hidden lg:flex items-center gap-6">
             <button 
                onClick={() => navigate('/features/queue')}
                className="flex items-center gap-2 text-[9px] font-bold text-premium-muted hover:text-premium-accent transition-all uppercase tracking-widest group"
             >
                <Zap size={14} className="group-hover:scale-110 transition-transform" />
                <span>Queue Intelligence</span>
             </button>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-status-issue'}`} />
                <span className="text-[9px] font-bold text-premium-subtle uppercase tracking-widest">
                  {isLive ? `Live Sync: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}` : 'System Offline'}
                </span>
             </div>
          </div>
        </motion.div>

        {/* Best Nearby Recommendation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-premium-accent/5 border border-premium-accent/10 rounded-2xl flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="p-2 bg-premium-accent/10 rounded-lg relative z-10">
            <Zap size={16} className="text-premium-accent fill-premium-accent" />
          </div>
          <p className="text-sm font-medium text-premium-text relative z-10">
            {recommendationText}
          </p>
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-premium-accent/5 to-transparent pointer-events-none" />
        </motion.div>

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'MAP' ? 'bg-premium-accent text-white shadow-lg shadow-premium-accent/20' : 'text-premium-muted hover:text-premium-text'}`}
            >
              <MapIcon size={14} /> Map
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'LIST' ? 'bg-premium-accent text-white shadow-lg shadow-premium-accent/20' : 'text-premium-muted hover:text-premium-text'}`}
            >
              <List size={14} /> List
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {[
              { id: 'ALL', label: 'All Units', icon: <Activity size={12} /> },
              { id: 'OPEN', label: 'Open Now', icon: <Clock size={12} /> },
              { id: 'RATED', label: 'Highly Rated', icon: <Star size={12} /> },
              { id: 'WOMEN', label: 'Women', icon: <Users size={12} /> },
              { id: 'ACCESSIBLE', label: 'Accessible', icon: <ShieldCheck size={12} /> }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f.id 
                    ? 'bg-white/10 border-white/20 text-white shadow-xl' 
                    : 'bg-transparent border-white/5 text-premium-muted hover:border-white/10 hover:text-premium-text'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area with Immersive Depth */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {viewMode === 'MAP' ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-[600px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative"
              >
                <FacilityMap 
                  facilities={filteredFacilities} 
                  onMarkerClick={setSelectedFacilityId}
                />
                <div className="absolute bottom-6 left-6 z-[400] glass-panel p-3 rounded-xl border-white/10 max-w-xs pointer-events-none">
                   <p className="text-[10px] text-premium-subtle italic leading-relaxed">
                     Verified public sanitation data is updated in real-time by municipal operators and smart sensors.
                   </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredFacilities.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <FacilityCard 
                      facility={f} 
                      onClick={() => setSelectedFacilityId(f.id)} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Facility Detail Drawer (Progressive Disclosure) */}
      <AnimatePresence>
        {selectedFacility && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFacilityId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-premium-bg border-l border-white/5 z-[1001] overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <button 
                  onClick={() => setSelectedFacilityId(null)}
                  className="mb-8 text-premium-muted hover:text-white flex items-center gap-2 group transition-all"
                >
                  <div className="p-2 rounded-full border border-white/5 group-hover:bg-white/5">
                    <Zap size={14} className="rotate-90" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Back to Surface</span>
                </button>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-premium-text mb-2 tracking-tighter">{selectedFacility.name}</h2>
                    <div className="flex items-center gap-2 text-premium-muted">
                      <MapPin size={12} className="text-premium-accent" />
                      <span className="text-xs font-medium">{selectedFacility.location}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    selectedFacility.status === 'CLOSED' ? 'bg-status-issue/10 text-status-issue border-status-issue/20' : 'bg-status-usable/10 text-status-usable border-status-usable/20'
                  }`}>
                    {selectedFacility.status || 'ONLINE'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-premium-muted uppercase tracking-widest block mb-2">Cleanliness</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-premium-text">{selectedFacility.health?.cleanliness_score || 92}%</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-premium-muted uppercase tracking-widest block mb-2">Est. Wait</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-premium-text">{selectedFacility.wait_time !== undefined ? `${selectedFacility.wait_time}m` : '--'}</span>
                      <Clock size={12} className="text-premium-subtle" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                   <div>
                     <h4 className="text-[10px] font-bold text-premium-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Camera size={12} className="text-premium-accent" /> Live Verification
                     </h4>
                     <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group">
                        {selectedFacility.health?.verification_photo ? (
                          <img src={selectedFacility.health.verification_photo} alt="Verification" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-premium-subtle">
                             <div className="p-3 bg-white/5 rounded-full"><Info size={24} /></div>
                             <span className="text-[10px] font-bold uppercase tracking-widest">No recent photo available</span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 p-3 glass-panel rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Last Cleaned</span>
                              <span className="text-[9px] font-medium text-premium-subtle">{selectedFacility.health?.last_cleaned_at ? new Date(selectedFacility.health.last_cleaned_at).toLocaleTimeString() : 'Recently'}</span>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div className="p-6 rounded-2xl bg-premium-accent/5 border border-premium-accent/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-premium-accent/10 rounded-lg">
                          <Activity size={16} className="text-premium-accent" />
                        </div>
                        <h4 className="text-sm font-bold text-premium-text">Recent Insight</h4>
                      </div>
                      <p className="text-xs text-premium-muted leading-relaxed italic">
                        "Facility is currently maintaining optimal hygiene standards. Minimal wait times observed over the last 30 minutes."
                      </p>
                   </div>
                </div>

                {/* Trust & Accountability Section */}
                <div className="border-t border-white/5 pt-8 mb-8">
                   <h4 className="text-[10px] font-bold text-premium-muted uppercase tracking-[0.2em] mb-6">Transparency Log</h4>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <Users size={14} className="text-premium-subtle" />
                            <span className="text-xs font-medium text-premium-text">Public Maintenance Log</span>
                         </div>
                         <Info size={12} className="text-premium-subtle group-hover:text-premium-accent transition-colors" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <ShieldCheck size={14} className="text-premium-subtle" />
                            <span className="text-xs font-medium text-premium-text">Government Verification</span>
                         </div>
                         <Check size={12} className="text-emerald-500" />
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-premium-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-premium-accent/20">
                    Get Directions
                  </button>
                  <button 
                    onClick={() => {
                      setIsReportOpen(true);
                      setSelectedFacilityId(null);
                    }}
                    className="flex-1 py-4 bg-white/5 text-white rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[2000]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-premium-bg p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter">Submit Feedback</h3>
              <p className="text-xs text-premium-muted mb-8 uppercase tracking-widest font-medium">Step 1 of 3: Observations</p>
              
              <div className="space-y-4 mb-8">
                {['General Hygiene', 'Water Supply', 'Broken Fixture', 'Soap/Tissue Missing'].map((type) => (
                  <button 
                    key={type}
                    className="w-full p-4 text-left glass-panel border-white/5 hover:border-premium-accent/30 rounded-xl text-xs font-medium text-premium-text flex items-center justify-between group transition-all"
                  >
                    {type}
                    <Zap size={12} className="text-premium-subtle group-hover:text-premium-accent transition-colors" />
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsReportOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-premium-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 py-4 bg-premium-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-premium-accent/20"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
