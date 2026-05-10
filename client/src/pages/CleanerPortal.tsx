import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, ArrowRight, Camera, CheckCircle, 
  Package, Play, LogOut, Shield, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLiveData } from '../context/LiveDataContext';

const CleanerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { facilities } = useLiveData();
  
  const [activeTask, setActiveTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<'IDLE' | 'IN_PROGRESS' | 'RESTOCKING' | 'VERIFYING'>('IDLE');

  const handleStartTask = (task: any) => {
    setActiveTask(task);
    setTaskStatus('IN_PROGRESS');
    showToast('Service window started', 'info');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleComplete = async () => {
    showToast('Submitting service report...', 'info');
    setTimeout(() => {
      setActiveTask(null);
      setTaskStatus('IDLE');
      showToast('Service completed & verified', 'success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-premium-bg pt-24 px-6 pb-12 overflow-x-hidden">
      <div className="max-w-md mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-premium-accent/10 rounded-2xl flex items-center justify-center border border-premium-accent/20">
              <User className="text-premium-accent" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-premium-text tracking-tight">Staff <span className="text-premium-accent">Portal</span></h1>
              <p className="text-[10px] text-premium-muted font-bold uppercase tracking-widest">{user?.name || 'Service Associate'}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="p-3 bg-white/5 rounded-2xl text-premium-muted hover:text-status-issue transition-colors">
            <LogOut size={18} />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTask ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8"
            >
              <div className="mb-8 border-b border-white/5 pb-6">
                <div className="text-premium-accent text-[10px] font-bold uppercase tracking-widest mb-1">Active Task</div>
                <h2 className="text-2xl font-bold text-premium-text mb-2 tracking-tight">{activeTask.facility_name}</h2>
                <div className="flex items-center gap-2 text-premium-muted">
                  <MapPin size={12} className="text-premium-accent" />
                  <span className="text-xs font-medium">{activeTask.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${taskStatus !== 'IDLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-premium-muted'}`}>
                  <div className="flex items-center gap-3">
                    <Play size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Initialization</span>
                  </div>
                  <CheckCircle size={16} />
                </div>

                <button 
                  onClick={() => {
                    setTaskStatus('RESTOCKING');
                    showToast('Supplies verified', 'success');
                  }}
                  className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between ${taskStatus === 'RESTOCKING' || taskStatus === 'VERIFYING' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-premium-text hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verify Supplies</span>
                  </div>
                  {(taskStatus === 'RESTOCKING' || taskStatus === 'VERIFYING') && <CheckCircle size={16} />}
                </button>

                <button 
                  onClick={() => {
                    setTaskStatus('VERIFYING');
                    showToast('Photo evidence attached', 'success');
                  }}
                  className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between ${taskStatus === 'VERIFYING' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-premium-text hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Camera size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verification Photo</span>
                  </div>
                  {taskStatus === 'VERIFYING' && <CheckCircle size={16} />}
                </button>

                <button 
                  onClick={handleComplete}
                  disabled={taskStatus !== 'VERIFYING'}
                  className="w-full py-6 bg-premium-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-premium-accent/20 disabled:opacity-50 mt-6"
                >
                  Complete & Verify
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6 px-4">
                 <Shield size={14} className="text-premium-accent" />
                 <h3 className="text-premium-muted text-[10px] font-bold uppercase tracking-widest">Pending Assignments</h3>
              </div>
              <div className="space-y-4">
                {facilities.slice(0, 4).map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleStartTask({ id: f.id, facility_name: f.name, location: f.location })}
                    className="w-full p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-premium-accent/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-lg font-bold text-premium-text group-hover:text-premium-accent transition-colors">{f.name}</div>
                      <div className="text-[9px] text-premium-muted font-bold uppercase tracking-widest mt-1">{f.location}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-premium-accent/10 transition-all">
                       <ArrowRight className="text-premium-muted group-hover:text-premium-accent" size={16} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                 <Info size={16} className="text-premium-accent mt-1" />
                 <p className="text-[10px] text-premium-muted leading-relaxed uppercase tracking-widest font-bold">
                   Assignments are prioritized based on live sensor data and citizen feedback.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CleanerPortal;
