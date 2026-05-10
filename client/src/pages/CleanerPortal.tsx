import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ArrowRight, Camera, CheckCircle2, Package, PlayCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLiveData } from '../context/LiveDataContext';
import { useNavigate } from 'react-router-dom';

const CleanerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { facilities } = useLiveData();
  const navigate = useNavigate();
  
  const [activeTask, setActiveTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<'IDLE' | 'IN_PROGRESS' | 'RESTOCKING' | 'VERIFYING'>('IDLE');

  const handleStartCleaning = (task: any) => {
    setActiveTask(task);
    setTaskStatus('IN_PROGRESS');
    showToast('Cleaning Cycle Initialized', 'info');
  };

  const handleRestock = () => {
    setTaskStatus('RESTOCKING');
    showToast('Supply Inventory Logged', 'success');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaskStatus('VERIFYING');
        setActiveTask({ ...activeTask, photo: reader.result as string });
        showToast('Real Evidence Captured', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = () => {
    fileInputRef.current?.click();
  };

  const handleComplete = async () => {
    if (!activeTask) return;
    showToast('Finalizing Field Report...', 'info');
    
    try {
      const hostname = window.location.hostname;
      const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:4000`;
      
      const res = await fetch(`${API_URL}/api/maintenance/${activeTask.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
          coords: { lat: 30.2684, lng: 78.0068 },
          supplies_used: ['Soap', 'Bleach', 'Paper Towels']
        })
      });

      if (res.ok) {
        setActiveTask(null);
        setTaskStatus('IDLE');
        showToast('Facility Marked as CLEAN & Verified', 'success');
      }
    } catch (err) {
      showToast('Backend Sync Failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#030407] pt-24 px-4 pb-12">
      <div className="max-w-md mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-atmosAccent/10 rounded-2xl flex items-center justify-center border border-atmosAccent/20">
              <User className="text-atmosAccent" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Staff <span className="text-atmosAccent">Service Hub</span></h1>
              <p className="text-[8px] text-atmosTextMuted font-bold uppercase tracking-[0.2em]">{user?.name || 'Field Associate'}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="p-3 bg-white/5 rounded-2xl text-atmosTextMuted hover:text-atmosError transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTask ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8"
            >
              <div className="mb-8 border-b border-white/5 pb-6">
                <div className="text-atmosAccent text-[10px] font-bold uppercase tracking-widest mb-1">Active Assignment</div>
                <h2 className="text-xl font-bold text-white mb-2">{activeTask.facility_name}</h2>
                <div className="flex items-center gap-2 text-atmosTextMuted">
                  <MapPin size={14} />
                  <span className="text-xs">{activeTask.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${taskStatus !== 'IDLE' ? 'bg-atmosSuccess/10 border-atmosSuccess/30 text-atmosSuccess' : 'bg-white/5 border-white/5 text-atmosTextMuted'}`}>
                  <div className="flex items-center gap-3">
                    <PlayCircle size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Initialization</span>
                  </div>
                  <CheckCircle2 size={18} />
                </div>

                <button 
                  onClick={handleRestock}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${taskStatus === 'RESTOCKING' || taskStatus === 'VERIFYING' ? 'bg-atmosSuccess/10 border-atmosSuccess/30 text-atmosSuccess' : 'bg-white/5 border-white/5 text-atmosText hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Restock Supplies</span>
                  </div>
                  {(taskStatus === 'RESTOCKING' || taskStatus === 'VERIFYING') && <CheckCircle2 size={18} />}
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <button 
                  onClick={handleVerify}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${taskStatus === 'VERIFYING' ? 'bg-atmosAccent/10 border-atmosAccent/30 text-atmosAccent' : 'bg-white/5 border-white/5 text-atmosText hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Camera size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{activeTask.photo ? 'Photo Attached ✓' : 'Evidence Photo'}</span>
                  </div>
                  {taskStatus === 'VERIFYING' && <CheckCircle2 size={18} />}
                </button>

                <button 
                  onClick={handleComplete}
                  disabled={taskStatus !== 'VERIFYING'}
                  className="w-full py-6 bg-atmosSuccess text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-[0_8px_32px_rgba(16,185,129,0.3)] disabled:opacity-50 mt-6"
                >
                  Complete Service
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
              <h3 className="text-atmosTextSubtle text-[10px] font-bold uppercase tracking-[0.2em] mb-4 px-4">Pending Requests</h3>
              <div className="grid gap-3">
                {facilities.slice(0, 3).map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleStartCleaning({ id: f.id, facility_name: f.name, location: f.location })}
                    className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-atmosAccent/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-lg font-bold text-white group-hover:text-atmosAccent transition-colors">{f.name}</div>
                      <div className="text-[10px] text-atmosTextMuted font-bold uppercase mt-1">{f.location}</div>
                    </div>
                    <ArrowRight className="text-atmosTextMuted group-hover:text-atmosAccent" size={20} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CleanerPortal;
