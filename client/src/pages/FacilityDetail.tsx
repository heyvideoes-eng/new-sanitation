import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import SensorGauge from '../components/UI/SensorGauge';

const DetailContent: React.FC = () => {
  const { id } = useParams();
  const { facilities, isLive } = useLiveData();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const facility = useMemo(() => 
    facilities.find(f => f.id === Number(id)), 
  [facilities, id]);

  useEffect(() => {
    const hostname = window.location.hostname;
    const API_URL = import.meta.env.VITE_API_URL || (hostname === 'localhost' || hostname === '127.0.0.1' ? `http://${hostname}:4000` : window.location.origin);
    fetch(`${API_URL}/api/facilities/${id}/history?hours=24`)
      .then(res => res.json());
  }, [id]);

  if (!facility) return (
    <div className="min-h-screen bg-atmosBg flex items-center justify-center">
       <div className="text-[10px] text-atmosAccent font-bold uppercase tracking-[0.5em] animate-pulse">Syncing with Infrastructure...</div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'GREEN': return '#22c55e';
      case 'AMBER': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const submitFeedback = () => {
    const hostname = window.location.hostname;
    const API_URL = import.meta.env.VITE_API_URL || (hostname === 'localhost' || hostname === '127.0.0.1' ? `http://${hostname}:4000` : window.location.origin);
    fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facility_id: id, rating, issue_type: feedback })
    }).then(() => alert('Feedback received. Thank you!'));
  };

  return (
    <div className="min-h-screen bg-atmosBg pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mb-12 hover:text-atmosAccent transition-colors">
        <ChevronLeft size={14} /> Back to Pulse
      </Link>

      <header className="mb-16">
        <div className="flex items-center gap-4 mb-4">
           <div className="text-atmosAccent text-[10px] font-bold uppercase tracking-[0.3em]">Infrastructure Intelligence</div>
           <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all`} style={{ color: getStatusColor(facility.current_status || 'GREEN'), borderColor: `${getStatusColor(facility.current_status || 'GREEN')}33`, backgroundColor: `${getStatusColor(facility.current_status || 'GREEN')}11` }}>
             {facility.current_status} Operations
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-atmosText tracking-tighter mb-4">{facility.name}</h1>
        <div className="flex items-center gap-2 text-atmosTextMuted">
          <MapPin size={16} className="text-atmosAccent" />
          <span className="text-sm font-medium">{facility.location}</span>
        </div>
      </header>

      <AnimatePresence>
        {facility.current_status === 'RED' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
          >
             <AlertTriangle className="text-red-500" size={20} />
             <div className="text-xs text-red-500 font-bold uppercase tracking-wider">Critical Alert: High Ammonia Levels Detected. Maintenance Dispatched.</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sensor Matrix */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mb-8">Real-time Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <SensorGauge label="Ammonia Level" value={facility.health?.ammonia || 0} unit="ppm" max={50} color="#f59e0b" />
               <SensorGauge label="Ambient Humidity" value={facility.health?.humidity || 0} unit="%" max={100} color="#3b82f6" />
               <SensorGauge label="Wait Time Est." value={facility.wait_time || 0} unit="min" max={30} color="#a855f7" />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mb-8">Cubicle Neural Grid</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
               {Array.from({ length: facility.total_stalls || 12 }).map((_, i) => (
                 <motion.div 
                  key={i} 
                  layout
                  className={`h-12 rounded-lg border flex flex-col items-center justify-center transition-all ${i % 3 === 0 ? 'bg-atmosAccent/10 border-atmosAccent/30 text-atmosAccent' : 'bg-white/5 border-white/5 text-atmosTextMuted opacity-50'}`}
                 >
                   <span className="text-[10px] font-bold">{i + 1}</span>
                   <div className={`w-1 h-1 rounded-full mt-1 ${i % 3 === 0 ? 'bg-atmosAccent animate-pulse' : 'bg-transparent'}`} />
                 </motion.div>
               ))}
            </div>
          </section>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-8">
           <div className="p-8 bg-atmosBgAlt/50 border border-white/5 rounded-[40px] backdrop-blur-2xl relative overflow-hidden">
             <h4 className="text-lg font-bold text-atmosText mb-6 relative z-10">Facility Feedback</h4>
             <div className="flex gap-2 mb-6 relative z-10">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className={`p-2 transition-colors ${rating >= s ? 'text-atmosAccent' : 'text-white/10'}`}>
                    <Star fill={rating >= s ? 'currentColor' : 'none'} size={24} />
                  </button>
                ))}
             </div>
             <textarea 
               className="w-full h-32 bg-black/20 border border-white/5 rounded-2xl p-4 text-sm text-atmosText placeholder:text-atmosTextSubtle mb-6 focus:outline-none focus:border-atmosAccent/30 relative z-10"
               placeholder="Report hygiene or infrastructure issues..."
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
             />
             <button 
               onClick={submitFeedback}
               className="w-full py-4 bg-atmosAccent text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-atmosAccentSoft transition-colors relative z-10"
             >
               Broadcast Report
             </button>
             
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={120} />
             </div>
           </div>

           <div className="p-8 bg-atmosBgAlt/30 border border-white/5 rounded-[40px]">
              <h4 className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mb-4">Neural Link Status</h4>
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-atmosSuccess shadow-[0_0_8px_green]' : 'bg-red-500'}`} />
                 <span className="text-xs text-atmosText font-medium">{isLive ? 'Active Heartbeat' : 'Link Interrupted'}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const FacilityDetail: React.FC = () => (
  
    <DetailContent />
  
);

export default FacilityDetail;
