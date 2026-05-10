import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'GREEN' | 'AMBER' | 'RED';
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colors = {
    GREEN: 'bg-[#22c55e] shadow-[0_0_12px_#22c55e]',
    AMBER: 'bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]',
    RED: 'bg-[#ef4444] shadow-[0_0_12px_#ef4444]',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl`}>
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${colors[status]}`}
      />
      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${status === 'RED' ? 'text-red-400' : status === 'AMBER' ? 'text-amber-400' : 'text-green-400'}`}>
        {label}
      </span>
    </div>
  );
};

export default StatusBadge;
