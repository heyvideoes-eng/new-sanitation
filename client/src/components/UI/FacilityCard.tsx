import React from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Clock, Accessibility, MapPin, Zap, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import QueueBar from './QueueBar';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../../context/LiveDataContext';

export interface FacilityData {
  id: number;
  name: string;
  location: string;
  address?: string;
  current_status: 'GREEN' | 'AMBER' | 'RED';
  health: {
    ammonia: number;
    humidity: number;
    last_reading?: string;
  };
  occupancy: number;
  wait_time: number;
  type: string;
  total_stalls: number;
  lat?: number;
  lng?: number;
  rating?: number | null;
  review_count?: number;
  status?: string;
  hours?: string;
  source_tag?: string;
  aiRecommendation?: string;
  rushPrediction?: string;
  ward_number?: string;
  owning_agency?: string;
  contractor_name?: string;
  contract_type?: string;
  compliance_score?: number;
}

const FacilityCard: React.FC<{ facility: FacilityData }> = ({ facility }) => {
  const navigate = useNavigate();
  const { govtMode } = useLiveData();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const getCleanlinessScore = () => {
    const base = 100 - (facility.health?.ammonia * 1.5 || 0);
    return Math.max(Math.min(base, 100), 0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -12, scale: 1.02 }}
      onClick={() => navigate(`/facility/${facility.id}`)}
      className="group relative bg-atmosBgAlt/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/5 hover:border-atmosAccent/30 transition-all duration-500 cursor-pointer h-full flex flex-col shadow-2xl"
    >
      {/* Top Status Strip */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${
        facility.current_status === 'GREEN' ? 'bg-atmosSuccess' : 
        facility.current_status === 'AMBER' ? 'bg-atmosWarning' : 'bg-atmosError'
      }`} />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-1 mb-2">
            {facility.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-[8px] font-bold text-atmosTextMuted uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              {facility.source_tag || 'SBM'}
            </span>
            {govtMode && (
              <span className="text-[8px] font-bold text-atmosAccentSoft uppercase tracking-widest bg-atmosAccent/10 px-2 py-0.5 rounded border border-atmosAccent/20">
                {facility.ward_number || 'WARD 18'}
              </span>
            )}
          </div>
        </div>
        <StatusBadge 
          status={facility.status === 'CLOSED' ? 'RED' : facility.current_status} 
          label={facility.status === 'CLOSED' ? 'CLOSED' : 'ONLINE'} 
        />
      </div>

      {/* Info Section */}
      <div className="space-y-4 mb-8 flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-atmosTextSubtle">
            <MapPin size={12} className="text-atmosAccent" />
            <span className="text-[10px] uppercase font-bold tracking-wider line-clamp-1">{facility.location}</span>
          </div>
          <div className="pl-5 text-[8px] text-atmosTextMuted font-bold uppercase tracking-[0.2em]">
            {facility.owning_agency || 'Nagar Nigam Dehradun'}
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-atmosWarning text-xs">★</span>
            <span className="text-[10px] text-white font-bold">{facility.rating || 'NEW'}</span>
            <span className="text-[8px] text-atmosTextMuted font-bold uppercase ml-1">({facility.review_count || 0})</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[9px] text-atmosTextSubtle font-bold uppercase tracking-widest">{facility.hours || '24/7'}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-atmosTextMuted">
              <span>Hygiene Index</span>
              <span className="text-atmosAccent">{getCleanlinessScore().toFixed(0)}%</span>
            </div>
            <QueueBar value={getCleanlinessScore()} color="accent" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-atmosTextMuted">
              <span>Crowd Pressure</span>
              <span className="text-atmosTextSubtle">{facility.occupancy || 0} Users</span>
            </div>
            <QueueBar value={(facility.occupancy / (facility.total_stalls || 10)) * 100} color="subtle" />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-atmosAccent" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-atmosTextSubtle">
            Wait: <span className="text-white">{facility.wait_time || 0}m</span>
          </span>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-xl">
          <span className="text-[8px] font-bold text-atmosTextMuted uppercase tracking-widest">
            {facility.contractor_name || 'ULB Direct'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {(facility.aiRecommendation || (govtMode && facility.compliance_score)) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-atmosAccent/5 border border-atmosAccent/10 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {govtMode ? <ShieldCheck className="text-atmosAccent Soft w-3 h-3" /> : <Zap className="text-atmosAccentSoft w-3 h-3" />}
                <span className="text-[8px] font-bold text-atmosAccentSoft uppercase tracking-widest">
                  {govtMode ? 'Verified Compliance' : 'NIM Insight'}
                </span>
              </div>
              {govtMode && (
                <span className="text-[10px] font-bold text-atmosAccent">{facility.compliance_score}%</span>
              )}
            </div>
            <p className="text-[9px] text-atmosTextSubtle italic leading-tight line-clamp-2">
              {govtMode 
                ? `Contractor: ${facility.contractor_name || 'ULB'} · ${facility.contract_type || 'Direct'}` 
                : `"${facility.aiRecommendation || 'Facility is currently maintaining optimal hygiene standards.'}"`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacilityCard;
