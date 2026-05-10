import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, FileText, Download, Filter, Calendar, Search, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const BudgetPortal: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading] = useState(false);

  // Simulated Budget Data
  const data = useMemo(() => ({
    summary: {
      total_spend: '42,500',
      tasks_completed: 124,
      avg_response: 12
    },
    logs: [
      { id: 1, logged_at: new Date().toISOString(), facility_name: 'ISBT Toilet – ISBT Flyover', issue: 'Sensor array calibration & supply restock', total_cost: '1,250' },
      { id: 2, logged_at: new Date(Date.now() - 86400000).toISOString(), facility_name: 'SBM Toilet – Old Cantt Market', issue: 'Scheduled plumbing maintenance', total_cost: '3,400' },
      { id: 3, logged_at: new Date(Date.now() - 172800000).toISOString(), facility_name: 'SBM Toilet – Quarter Deck Market', issue: 'Emergency fixture repair', total_cost: '850' },
    ]
  }), []);

  return (
    <div className="min-h-screen bg-premium-bg pt-24 pb-12 px-6 overflow-x-hidden">
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
              Back to overview
            </button>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-[1px] bg-premium-accent" />
               <span className="text-premium-accent text-[10px] font-bold uppercase tracking-[0.3em]">Accountability</span>
            </div>
            <h1 className="text-5xl font-bold text-premium-text tracking-tighter">Public <span className="text-premium-subtle">Expenditure</span></h1>
          </div>
          
          <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-xl">
             <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
                <Calendar size={14} className="text-premium-accent" />
                <span className="text-[10px] text-premium-subtle font-bold uppercase tracking-widest">Last 30 Days</span>
             </div>
             <button className="p-2.5 text-premium-muted hover:text-premium-text transition-all">
               <Filter size={16} />
             </button>
             <button className="p-2.5 text-premium-muted hover:text-premium-text transition-all">
               <Search size={16} />
             </button>
          </div>
        </header>

        {/* Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Total Expenditure', value: `₹${data.summary.total_spend}`, icon: IndianRupee, color: 'text-violet-400' },
            { label: 'Completed Services', value: data.summary.tasks_completed, icon: FileText, color: 'text-premium-accent' },
            { label: 'Avg Efficiency', value: `${data.summary.avg_response}m`, icon: ShieldCheck, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 group hover:border-premium-accent/30 transition-all"
            >
              <stat.icon className={`mb-6 ${stat.color}`} size={24} />
              <div className="text-3xl font-bold text-premium-text mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-premium-muted font-bold uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="glass-panel overflow-hidden border-white/5">
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h3 className="text-lg font-bold text-premium-text tracking-tight mb-1">Service Expenditure Log</h3>
               <p className="text-[10px] text-premium-muted font-bold uppercase tracking-widest">Verified and audited in real-time</p>
             </div>
             <button 
               onClick={() => showToast('Exporting audit trail...', 'info')}
               className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
             >
               <Download size={14} /> Export Report
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2">
                  <th className="p-6 text-[10px] text-premium-muted font-bold uppercase tracking-widest border-b border-white/5">Date</th>
                  <th className="p-6 text-[10px] text-premium-muted font-bold uppercase tracking-widest border-b border-white/5">Facility</th>
                  <th className="p-6 text-[10px] text-premium-muted font-bold uppercase tracking-widest border-b border-white/5">Description</th>
                  <th className="p-6 text-[10px] text-premium-muted font-bold uppercase tracking-widest border-b border-white/5">Amount</th>
                  <th className="p-6 text-[10px] text-premium-muted font-bold uppercase tracking-widest border-b border-white/5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.logs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 text-[11px] text-premium-subtle font-medium">{new Date(log.logged_at).toLocaleDateString()}</td>
                    <td className="p-6 text-sm text-premium-text font-bold group-hover:text-premium-accent transition-colors">{log.facility_name}</td>
                    <td className="p-6 text-xs text-premium-muted leading-relaxed max-w-xs">{log.issue}</td>
                    <td className="p-6 text-sm text-premium-text font-bold tracking-tight">₹{log.total_cost}</td>
                    <td className="p-6 text-right">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                         <ShieldCheck size={10} /> Verified
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] text-premium-subtle font-bold uppercase tracking-[0.2em]">
             End of current audit period
           </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPortal;
