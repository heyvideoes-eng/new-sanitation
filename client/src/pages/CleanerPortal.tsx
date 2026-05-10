import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, ArrowRight, Camera, CheckCircle, 
  Package, Play, LogOut, Shield, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLiveData } from '../context/LiveDataContext';
import { API_URL } from '../lib/api';
import { RefreshCw } from 'lucide-react';
import FacilityMap from '../components/Map/FacilityMap';

const CleanerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { facilities, alerts, uploadPhoto, fetchInitial } = useLiveData();
  
  const [activeTask, setActiveTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<'IDLE' | 'IN_PROGRESS' | 'RESTOCKING' | 'VERIFYING'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationPhoto, setVerificationPhoto] = useState<File | null>(null);

  const handleStartTask = async (task: any) => {
    try {
      setActiveTask(task);
      setTaskStatus('IN_PROGRESS');
      
      const res = await fetch(`${API_URL}/api/maintenance/${task.id}/accept`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        showToast('Service window started', 'info');
      }
    } catch (err) {
      console.error('Failed to start task:', err);
      showToast('Offline mode active', 'info');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationPhoto(e.target.files[0]);
      setTaskStatus('VERIFYING');
      showToast('Photo evidence attached', 'success');
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    showToast('Submitting service report...', 'info');
    
    try {
      let photoUrl = '';
      if (verificationPhoto) {
        const formData = new FormData();
        formData.append('photo', verificationPhoto);
        formData.append('task_id', activeTask.id.toString());
        formData.append('facility_id', activeTask.facility_id.toString());
        
        const uploadRes = await uploadPhoto(formData);
        photoUrl = uploadRes.url;
      }

      const res = await fetch(`${API_URL}/api/maintenance/${activeTask.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: photoUrl,
          cost_inr: 500,
          notes: 'Maintenance completed via staff portal',
          coords: { lat: 30.27, lng: 78.00 } // Simulated GPS
        })
      });

      if (res.ok) {
        setActiveTask(null);
        setTaskStatus('IDLE');
        setVerificationPhoto(null);
        showToast('Service completed & verified', 'success');
        fetchInitial();
      } else {
        throw new Error('Failed to complete task');
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
      showToast('Submission failed. Check connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter alerts for pending tasks
  const pendingTasks = alerts.filter(a => a.status === 'PENDING');

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
                  <span className="text-xs font-medium">{activeTask.description || 'Routine Service'}</span>
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

                <label className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${taskStatus === 'VERIFYING' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-premium-text hover:bg-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <Camera size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verification Photo</span>
                  </div>
                  {taskStatus === 'VERIFYING' ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                </label>

                <button 
                  onClick={handleComplete}
                  disabled={taskStatus !== 'VERIFYING' || isSubmitting}
                  className="w-full py-6 bg-premium-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-premium-accent/20 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : null}
                  {isSubmitting ? 'Verifying...' : 'Complete & Verify'}
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
                {pendingTasks.length > 0 ? pendingTasks.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleStartTask(a)}
                    className="w-full p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-premium-accent/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="max-w-[70%]">
                      <div className="text-lg font-bold text-premium-text group-hover:text-premium-accent transition-colors truncate">{a.facility_name}</div>
                      <div className="text-[9px] text-premium-muted font-bold uppercase tracking-widest mt-1 truncate">{a.description}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-premium-accent/10 transition-all">
                       <ArrowRight className="text-premium-muted group-hover:text-premium-accent" size={16} />
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-12 glass-panel">
                    <CheckCircle className="text-emerald-500/20 mx-auto mb-4" size={48} />
                    <p className="text-[10px] text-premium-muted uppercase tracking-widest font-bold">No active maintenance tickets</p>
                  </div>
                )}
                
                {/* Fallback to facilities if no alerts, to ensure staff can always work */}
                {pendingTasks.length === 0 && facilities.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[8px] text-premium-muted uppercase tracking-[0.2em] font-bold mb-4 px-4">Manual Service Check</p>
                    {facilities.slice(0, 2).map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleStartTask({ id: `manual-${f.id}`, facility_id: f.id, facility_name: f.name, description: 'Routine Check' })}
                        className="w-full p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-premium-accent/30 transition-all text-left flex items-center justify-between group mb-4"
                      >
                        <div>
                          <div className="text-lg font-bold text-premium-text group-hover:text-premium-accent transition-colors">{f.name}</div>
                          <div className="text-[9px] text-premium-muted font-bold uppercase tracking-widest mt-1">Manual Verification</div>
                        </div>
                        <ArrowRight className="text-premium-muted group-hover:text-premium-accent" size={16} />
                      </button>
                    ))}
                  </div>
                )}
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
