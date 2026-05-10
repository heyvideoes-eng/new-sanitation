import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Clock, MapPin, Star, Shield, Users } from 'lucide-react';

export interface FacilityData {
  id: number;
  name: string;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  type?: string;
  current_status: 'GREEN' | 'AMBER' | 'RED';
  health: {
    verification_photo?: string;
    last_cleaned_at?: string;
    cleanliness_score?: number;
    ammonia?: number;
    humidity?: number;
    last_reading?: string;
  };
  wait_time?: number;
  rating?: number | null;
  status?: string;
  hours?: string;
  owning_agency?: string;
  total_stalls?: number;
  occupancy?: number;
}

const FacilityCard: React.FC<{ facility: FacilityData; onClick?: () => void }> = ({ facility, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

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

  const waitTimeText = facility.wait_time !== undefined ? `${facility.wait_time}m wait` : 'Wait time unavailable';

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="glass-panel p-6 cursor-pointer group hover:border-premium-accent/30 flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-premium-text line-clamp-1 group-hover:text-premium-accent transition-colors">
            {facility.name}
          </h3>
          <div className="flex items-center gap-2 text-premium-muted mt-1">
            <MapPin size={10} className="text-premium-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{facility.location}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${
          facility.status === 'CLOSED' ? 'bg-status-issue/10 text-status-issue border border-status-issue/20' : 'bg-status-usable/10 text-status-usable border border-status-usable/20'
        }`}>
          {facility.status === 'CLOSED' ? 'Closed' : 'Open'}
        </div>
      </div>

      <div className="flex items-center gap-4 py-3 border-y border-white/5 relative z-10">
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-status-attention fill-status-attention" />
          <span className="text-[10px] text-premium-text font-bold">{facility.rating || 'New'}</span>
        </div>
        <div className="w-[1px] h-3 bg-white/10" />
        <div className="flex items-center gap-1.5 text-premium-muted">
          <Clock size={12} />
          <span className="text-[10px] font-bold">{waitTimeText}</span>
        </div>
        {facility.occupancy !== undefined && (
          <>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-premium-muted">
              <Users size={12} />
              <span className="text-[10px] font-bold">{facility.occupancy} active</span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto relative z-10">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-premium-accent/10 transition-colors">
             <Shield size={10} className="text-premium-muted group-hover:text-premium-accent transition-colors" />
           </div>
           <span className="text-[8px] font-bold text-premium-muted uppercase tracking-widest">
             {facility.owning_agency || 'Nagar Nigam'}
           </span>
        </div>
        <span className="text-[8px] font-bold text-premium-subtle uppercase tracking-widest">
          {facility.hours || '24/7'}
        </span>
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-premium-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

export default FacilityCard;


