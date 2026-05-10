import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Users, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

const WelfarePortal: React.FC = () => {
  const moneyFlow = [
    { from: 'Central Govt (SBM 2.0)', to: 'State Urban Dept', amount: '₹14.5Cr', status: 'RELEASED' },
    { from: 'State Urban Dept', to: 'Dehradun Nagar Nigam', amount: '₹8.2Cr', status: 'TRANSFERRED' },
    { from: 'Nagar Nigam', to: 'Ward 18 - Maintenance', amount: '₹42L', status: 'ALLOCATED' },
    { from: 'Ward 18', to: 'Daily Cleaning Staff', amount: '₹12L', status: 'IN_FLOW' },
  ];

  return (
    <div className="min-h-screen bg-atmosBg pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-atmosSuccess/10 border border-atmosSuccess/20 rounded-full text-atmosSuccess text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Public Transparency Protocol v2.0
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-atmosText tracking-tighter mb-4">
            Welfare <span className="text-atmosAccent">Money Flow</span>
          </h1>
          <p className="text-atmosTextMuted text-lg max-w-2xl mx-auto">
            Real-time audit of every rupee allocated for public sanitation and health welfare in Dehradun.
          </p>
        </header>

        {/* Live Flow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          {moneyFlow.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-atmosBgAlt/60 border border-white/5 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IndianRupee size={48} />
                </div>
                <div className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest mb-4">{step.from}</div>
                <div className="text-2xl font-bold text-atmosAccent mb-2">{step.amount}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${step.status === 'RELEASED' ? 'bg-atmosSuccess' : 'bg-atmosAccent'} animate-pulse`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-atmosTextSubtle">{step.status}</span>
                </div>
              </motion.div>
              {i < moneyFlow.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-atmosTextMuted/20">
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Detailed Breakdown */}
          <div className="bg-atmosBgAlt/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
            <h3 className="text-xl font-bold text-atmosText mb-8 flex items-center gap-3">
              <TrendingUp className="text-atmosSuccess" size={24} />
              Monthly Utilization
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Staff Salaries', amount: '₹22,40,000', pct: 65, color: 'bg-atmosAccent' },
                { label: 'Chemicals & Supplies', amount: '₹5,20,000', pct: 15, color: 'bg-atmosSuccess' },
                { label: 'Facility Infrastructure', amount: '₹3,80,000', pct: 10, color: 'bg-atmosWarning' },
                { label: 'Water & Electricity', amount: '₹2,60,000', pct: 10, color: 'bg-atmosError' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-atmosTextSubtle uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-atmosText">{item.amount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Impact */}
          <div className="bg-atmosBgAlt/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-atmosText mb-8 flex items-center gap-3">
                <HeartPulse className="text-atmosError" size={24} />
                Welfare Impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-3xl">
                  <div className="text-2xl font-bold text-atmosText mb-1">2,450+</div>
                  <div className="text-[9px] text-atmosTextMuted font-bold uppercase tracking-widest">Lives Impacted Daily</div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl">
                  <div className="text-2xl font-bold text-atmosSuccess mb-1">92%</div>
                  <div className="text-[9px] text-atmosTextMuted font-bold uppercase tracking-widest">Health Safety Score</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-atmosAccent/10 border border-atmosAccent/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-2 text-atmosAccent">
                <Users size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Employee Welfare</span>
              </div>
              <p className="text-xs text-atmosTextSubtle leading-relaxed">
                All sanitation staff in Ward 18 are covered under ESIC/PF health schemes. Money flow ensures direct bank transfers by 5th of every month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelfarePortal;
