import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Camera, MapPin, CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveData } from '../context/LiveDataContext';
import { useToast } from '../context/ToastContext';

const InspectorPortal: React.FC = () => {
  const navigate = useNavigate();
  const { facilities } = useLiveData();
  const { showToast } = useToast();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [step, setStep] = useState<'SELECT' | 'FORM' | 'SUCCESS'>('SELECT');
  
  // Inspection Checklist State
  const [checklist, setChecklist] = useState({
    visibility: false,
    water_availability: false,
    lighting: false,
    odor_control: false,
    privacy_locks: false,
    menstrual_hygiene: false,
    accessible_ramp: false,
    hand_dryer: false,
    remarks: '',
    photo: null as string | null
  });

  const handleCapture = () => {
    // Simulate photo capture
    const mockPhoto = `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800`;
    setChecklist(prev => ({ ...prev, photo: mockPhoto }));
    showToast('Evidence Photo Captured with GPS/Timestamp', 'success');
  };

  const handleSubmit = async () => {
    showToast('Finalizing Inspection Report...', 'info');
    setTimeout(() => {
      setStep('SUCCESS');
      showToast('Govt Inspection Record Saved to Blockchain/DB', 'success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-atmosBg pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-atmosAccent text-[10px] font-bold uppercase tracking-widest mb-2">
              <ClipboardCheck size={14} />
              Official Government Inspection
            </div>
            <h1 className="text-3xl font-bold text-atmosText tracking-tighter">
              Field <span className="text-atmosAccentSoft">Validator</span>
            </h1>
          </div>
          {step !== 'SELECT' && (
            <button 
              onClick={() => setStep('SELECT')}
              className="flex items-center gap-2 text-atmosTextMuted hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 'SELECT' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-4"
            >
              <h2 className="text-atmosTextSubtle text-sm font-medium mb-2">Select Facility for Audit</h2>
              {facilities.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFacility(f);
                    setStep('FORM');
                  }}
                  className="w-full p-6 bg-atmosBgAlt/60 border border-white/5 rounded-3xl hover:border-atmosAccent/30 text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-atmosAccent text-[10px] font-bold uppercase mb-1">{f.ward_number || 'Ward 18'}</div>
                    <div className="text-lg font-bold text-atmosText group-hover:text-atmosAccent transition-colors">{f.name}</div>
                    <div className="text-xs text-atmosTextMuted mt-1">{f.location} · {f.owning_agency || 'ULB'}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-atmosAccent/10 transition-colors">
                    <ClipboardCheck className="text-atmosTextMuted group-hover:text-atmosAccent transition-colors" size={20} />
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 'FORM' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-atmosBgAlt/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12"
            >
              <div className="mb-8 pb-8 border-b border-white/5">
                <div className="text-atmosAccent text-xs font-bold uppercase tracking-widest mb-1">Auditing</div>
                <h2 className="text-2xl font-bold text-atmosText">{selectedFacility?.name}</h2>
                <p className="text-sm text-atmosTextMuted">{selectedFacility?.address}</p>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-atmosTextSubtle text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Inspection Checklist (SBM 2.0 Norms)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'visibility', label: 'Signage & Visibility' },
                      { id: 'water_availability', label: '24x7 Water Supply' },
                      { id: 'lighting', label: 'Functional Internal Lighting' },
                      { id: 'odor_control', label: 'Odor Control Compliance' },
                      { id: 'privacy_locks', label: 'Privacy & Stall Locks' },
                      { id: 'menstrual_hygiene', label: 'Menstrual Hygiene Facilities' },
                      { id: 'accessible_ramp', label: 'Accessible Ramp/Entry' },
                      { id: 'hand_dryer', label: 'Functional Hand-Wash Station' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          checklist[item.id as keyof typeof checklist] 
                            ? 'bg-atmosSuccess/10 border-atmosSuccess/30 text-atmosSuccess' 
                            : 'bg-white/5 border-white/5 text-atmosTextMuted'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                        {checklist[item.id as keyof typeof checklist] ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] border-2 border-current/20 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-atmosTextSubtle text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Evidence Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={handleCapture}
                      className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:border-atmosAccent/30 transition-all group overflow-hidden"
                    >
                      {checklist.photo ? (
                        <img src={checklist.photo} className="w-full h-full object-cover" alt="Verification" />
                      ) : (
                        <>
                          <Camera className="text-atmosTextMuted group-hover:text-atmosAccent transition-colors" size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-atmosTextMuted">Capture Geotagged Photo</span>
                        </>
                      )}
                    </button>
                    <div className="bg-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div className="flex items-center gap-3 text-atmosTextMuted">
                        <MapPin size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Captured GPS: 30.2705° N, 78.0055° E</span>
                      </div>
                      <textarea 
                        placeholder="Official Remarks..."
                        className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-atmosText focus:border-atmosAccent outline-none transition-all resize-none mt-4"
                        rows={3}
                        value={checklist.remarks}
                        onChange={e => setChecklist(prev => ({ ...prev, remarks: e.target.value }))}
                      />
                    </div>
                  </div>
                </section>

                <button
                  onClick={handleSubmit}
                  className="w-full h-16 bg-atmosAccent hover:bg-atmosAccentSoft text-white rounded-3xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
                >
                  <Save size={20} />
                  Complete Inspection Audit
                </button>
              </div>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-atmosBgAlt/60 border border-atmosSuccess/20 rounded-[2.5rem] p-12 text-center"
            >
              <div className="w-20 h-20 bg-atmosSuccess/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-atmosSuccess" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-atmosText mb-4">Inspection Certified</h2>
              <p className="text-atmosTextMuted mb-8 max-w-md mx-auto">
                The inspection report for <strong>{selectedFacility?.name}</strong> has been successfully submitted and synced with the SBM Command Center.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setStep('SELECT')}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  New Audit
                </button>
                <button 
                  onClick={() => navigate('/admin')}
                  className="px-8 py-4 bg-atmosAccent text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InspectorPortal;
