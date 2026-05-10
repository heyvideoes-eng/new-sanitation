import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Camera, MapPin, CheckCircle2, Save, ArrowLeft, RefreshCw, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../context/LiveDataContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../lib/api';

const InspectorPortal: React.FC = () => {
  const navigate = useNavigate();
  const { facilities, uploadPhoto, fetchInitial } = useLiveData();
  const { showToast } = useToast();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [step, setStep] = useState<'SELECT' | 'FORM' | 'SUCCESS'>('SELECT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checklist, setChecklist] = useState({
    visibility: false,
    water_availability: false,
    lighting: false,
    cleaning_kit_present: false,
    remarks: '',
    photoFile: null as File | null,
    photoUrl: null as string | null
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChecklist(prev => ({ 
        ...prev, 
        photoFile: file,
        photoUrl: URL.createObjectURL(file) 
      }));
      showToast('Evidence Photo Attached', 'success');
    }
  };

  const calculateScore = () => {
    const items = [checklist.visibility, checklist.water_availability, checklist.lighting, checklist.cleaning_kit_present];
    const passed = items.filter(Boolean).length;
    return Math.round((passed / items.length) * 100);
  };

  const handleSubmit = async () => {
    if (!selectedFacility) return;
    
    setIsSubmitting(true);
    showToast('Uploading audit evidence...', 'info');
    
    try {
      let uploadedUrl = '';
      if (checklist.photoFile) {
        const formData = new FormData();
        formData.append('photo', checklist.photoFile);
        formData.append('facility_id', selectedFacility.id.toString());
        const uploadRes = await uploadPhoto(formData);
        uploadedUrl = uploadRes.url;
      }

      const score = calculateScore();
      const res = await fetch(`${API_URL}/api/inspections/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: selectedFacility.id,
          score,
          checklist: {
            visibility: checklist.visibility,
            water: checklist.water_availability,
            lighting: checklist.lighting,
            kit: checklist.cleaning_kit_present,
            photo_url: uploadedUrl
          },
          notes: checklist.remarks
        })
      });

      if (res.ok) {
        setStep('SUCCESS');
        showToast(`Audit certified: ${score}% Compliance`, 'success');
        fetchInitial();
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save audit record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-bg pt-24 pb-12 px-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-[1px] bg-premium-accent" />
               <span className="text-premium-accent text-[10px] font-bold uppercase tracking-[0.3em]">Official Audit</span>
            </div>
            <h1 className="text-5xl font-bold text-premium-text tracking-tighter">
              Field <span className="text-premium-subtle">Validator</span>
            </h1>
          </div>
          {step !== 'SELECT' && (
            <button 
              onClick={() => setStep('SELECT')} 
              className="group flex items-center gap-2 text-[10px] text-premium-muted font-bold uppercase tracking-widest hover:text-premium-text transition-all"
            >
              <div className="p-2 rounded-full border border-white/5 group-hover:bg-white/5 transition-all">
                <ArrowLeft size={14} />
              </div>
              Back to selection
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 'SELECT' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              <div className="flex items-center gap-3 mb-2 px-4">
                 <ClipboardCheck size={14} className="text-premium-accent" />
                 <h3 className="text-premium-muted text-[10px] font-bold uppercase tracking-widest">Select Facility for Audit</h3>
              </div>
              {facilities.map((f, i) => (
                <motion.button
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelectedFacility(f); setStep('FORM'); }}
                  className="w-full p-8 glass-panel hover:border-premium-accent/30 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xl font-bold text-premium-text group-hover:text-premium-accent transition-colors">{f.name}</div>
                    <div className="text-[10px] text-premium-muted font-bold uppercase tracking-widest mt-2">{f.location}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-premium-accent/10 transition-all">
                    <Star className="text-premium-muted group-hover:text-premium-accent" size={20} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === 'FORM' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <ClipboardCheck size={120} className="text-premium-accent" />
              </div>

              <div className="mb-12 border-b border-white/5 pb-8">
                <span className="text-premium-accent text-[10px] font-bold uppercase tracking-widest mb-1">Active Audit</span>
                <h2 className="text-3xl font-bold text-premium-text tracking-tight">{selectedFacility?.name}</h2>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {([
                    { id: 'visibility', label: 'Signage Visibility' },
                    { id: 'water_availability', label: 'Water Supply' },
                    { id: 'lighting', label: 'Electrical / Lighting' },
                    { id: 'cleaning_kit_present', label: 'Sanitation Kit' }
                  ] as const).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={`flex items-center justify-between p-6 rounded-[1.5rem] border transition-all ${checklist[item.id] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/5 text-premium-muted hover:bg-white/10'}`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                      {checklist[item.id] ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 border-2 border-current/20 rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden cursor-pointer hover:border-premium-accent/40 transition-all group relative">
                    {checklist.photoUrl ? (
                      <img src={checklist.photoUrl} className="w-full h-full object-cover" alt="Verification" />
                    ) : (
                      <>
                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-premium-accent/10 transition-all">
                          <Camera className="text-premium-muted group-hover:text-premium-accent" size={32} />
                        </div>
                        <span className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">Attach Proof</span>
                      </>
                    )}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                  </label>

                  <div className="bg-white/5 rounded-[2rem] p-8 flex flex-col">
                    <div className="flex items-center gap-3 text-premium-muted mb-6">
                      <MapPin size={16} className="text-premium-accent" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">GPS: {selectedFacility?.lat?.toFixed(4)}, {selectedFacility?.lng?.toFixed(4)}</span>
                    </div>
                    <textarea 
                      placeholder="Enter detailed audit remarks..." 
                      className="w-full flex-1 bg-transparent border-b border-white/5 py-4 text-sm text-premium-text focus:border-premium-accent outline-none transition-all resize-none"
                      value={checklist.remarks}
                      onChange={e => setChecklist(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-premium-muted font-bold uppercase tracking-widest mb-1">Calculated Compliance</span>
                      <div className="text-2xl font-bold text-premium-text">{calculateScore()}%</div>
                   </div>
                   <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateScore()}%` }}
                        className="h-full bg-premium-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                   </div>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full h-20 bg-premium-accent text-white rounded-[1.5rem] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-premium-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
                  {isSubmitting ? 'Recording Audit...' : 'Certify Inspection'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-16 text-center border-emerald-500/20"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <CheckCircle2 className="text-emerald-500" size={48} />
              </div>
              <h2 className="text-4xl font-bold text-premium-text mb-4 tracking-tighter">Audit Certified</h2>
              <p className="text-premium-muted text-sm mb-12 uppercase tracking-widest font-bold">Records synchronized with Municipal HQ</p>
              <button 
                onClick={() => navigate('/admin')} 
                className="px-12 py-5 bg-premium-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-premium-accent/20 hover:scale-105 active:scale-95 transition-all"
              >
                Return to Command Center
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InspectorPortal;
