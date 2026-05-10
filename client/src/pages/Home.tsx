import React, { useState, useRef } from 'react';
import SceneCanvas from '../components/Three/SceneCanvas';
import FacilityGrid from '../components/UI/FacilityGrid';
import Footer from '../components/Layout/Footer';
import InteractiveHero from '../components/Three/ScrollChapters';
import DeepDive from '../components/UI/DeepDive';
import { useLiveData } from '../context/LiveDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, ShieldCheck, Zap } from 'lucide-react';
import { API_URL } from '../lib/api';

const HomeContent: React.FC = () => {
  const { 
    facilities, isLive, lastUpdated, globalStats, alerts, 
    govtMode, recommendation, uploadPhoto, submitInspection, budgetSummary 
  } = useLiveData();
  
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'REPORT' | 'INSPECTION'>('REPORT');
  
  const [reportForm, setReportForm] = useState({
    facilityId: '',
    issue: '',
    photo: null as string | null,
    file: null as File | null,
    score: 100,
    checklist: { water: true, lighting: true, smell: 'low', bins: true }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportForm({ ...reportForm, file, photo: URL.createObjectURL(file) });
    }
  };

  const handleReportSubmit = async () => {
    try {
      let photoUrl = '';
      if (reportForm.file) {
        const formData = new FormData();
        formData.append('photo', reportForm.file);
        formData.append('facility_id', reportForm.facilityId);
        const photoRes = await uploadPhoto(formData);
        photoUrl = photoRes.url;
      }

      if (reportType === 'INSPECTION') {
        await submitInspection({
          facility_id: reportForm.facilityId,
          score: reportForm.score,
          checklist: reportForm.checklist,
          notes: reportForm.issue
        });
      } else {
        // Submit feedback
        await fetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facility_id: reportForm.facilityId,
            rating: reportForm.issue.length > 50 ? 1 : 4, // Mock rating based on length
            issue_type: 'Manual Report',
            comment: reportForm.issue,
            photo_url: photoUrl
          })
        });
      }

      setIsReportModalOpen(false);
      setReportForm({ 
        facilityId: '', issue: '', photo: null, file: null, score: 100, 
        checklist: { water: true, lighting: true, smell: 'low', bins: true } 
      });
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  return (
    <main className="relative w-full bg-atmosBg min-h-screen font-inter">
      {/* Report FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setReportType(govtMode ? 'INSPECTION' : 'REPORT');
          setIsReportModalOpen(true);
        }}
        className="fixed bottom-24 right-8 z-[100] w-14 h-14 bg-atmosAccent text-white rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(59,130,246,0.4)] border border-white/20"
      >
        <Plus size={24} />
      </motion.button>

      {/* Unified Report/Inspection Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-atmosBg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-atmosBgAlt/90 border border-white/10 rounded-[2.5rem] p-8 overflow-y-auto max-h-full custom-scrollbar shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                 {reportType === 'INSPECTION' ? <ShieldCheck className="text-atmosAccent" /> : <Camera className="text-atmosAccentSoft" />}
                 <h2 className="text-2xl font-bold text-white tracking-tight">
                   {reportType === 'INSPECTION' ? 'Official Inspection' : 'Submit Evidence'}
                 </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-atmosTextMuted uppercase tracking-widest ml-1">Select Facility</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-atmosAccent transition-all appearance-none"
                    value={reportForm.facilityId}
                    onChange={e => setReportForm({...reportForm, facilityId: e.target.value})}
                  >
                    <option value="" className="bg-atmosBg">Select Target...</option>
                    {facilities.map(f => <option key={f.id} value={f.id} className="bg-atmosBg">{f.name}</option>)}
                  </select>
                </div>

                {reportType === 'INSPECTION' && (
                  <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-atmosTextSubtle uppercase">Compliance Score</span>
                      <span className="text-xl font-bold text-atmosAccent">{reportForm.score}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      className="w-full h-1 bg-white/10 rounded-full appearance-none accent-atmosAccent"
                      value={reportForm.score}
                      onChange={e => setReportForm({...reportForm, score: parseInt(e.target.value)})}
                    />
                    <div className="grid grid-cols-2 gap-4 pt-4">
                       {Object.keys(reportForm.checklist).map((key) => (
                         <label key={key} className="flex items-center gap-3 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             className="w-4 h-4 rounded border-white/10 bg-white/5 text-atmosAccent focus:ring-atmosAccent"
                             checked={(reportForm.checklist as any)[key] === true}
                             onChange={e => setReportForm({
                               ...reportForm, 
                               checklist: { ...reportForm.checklist, [key]: e.target.checked }
                             })}
                           />
                           <span className="text-[10px] font-bold uppercase text-atmosTextMuted group-hover:text-atmosText transition-colors">{key}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-atmosTextMuted uppercase tracking-widest ml-1">Detailed Observation</label>
                  <textarea 
                    placeholder="Provide specific notes or incident details..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-atmosAccent transition-all min-h-[100px] resize-none text-sm"
                    value={reportForm.issue}
                    onChange={e => setReportForm({...reportForm, issue: e.target.value})}
                  />
                </div>
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center gap-2 overflow-hidden ${
                    reportForm.photo ? 'border-atmosAccent/50 bg-atmosAccent/5 text-atmosAccent' : 'border-white/10 text-atmosTextMuted hover:border-atmosAccent hover:text-atmosAccent'
                  }`}
                >
                  {reportForm.photo ? (
                    <div className="flex flex-col items-center gap-2">
                       <img src={reportForm.photo} className="w-16 h-16 object-cover rounded-xl border border-atmosAccent/20" alt="Preview" />
                       <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Geotagged Evidence Captured ✓</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={24} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Capture Photo Evidence</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={handleReportSubmit}
                  disabled={!reportForm.facilityId || !reportForm.issue}
                  className="w-full py-5 bg-atmosAccent text-white rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-atmosAccentSoft transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-atmosAccent/20"
                >
                  Dispatch {reportType === 'INSPECTION' ? 'Verification' : 'Incident'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0">
        <SceneCanvas facilities={facilities} />
      </div>

      <div className="relative z-10 w-full overflow-x-hidden">
        <div id="hero-top">
          <InteractiveHero onOpenDeepDive={() => setIsDeepDiveOpen(true)} />
        </div>

        {/* Impact Analytics Section with Inline Budget */}
        <div id="impact-analytics" className="px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center bg-atmosBg/50 backdrop-blur-sm border-y border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-[1px] w-12 bg-atmosAccent" />
              <span className="text-atmosAccent text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Operational Framework</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold text-atmosText tracking-tighter leading-[0.9] lg:leading-[0.85] mb-8 md:mb-12">
              Dehradun <span className="text-atmosAccentSoft">Live Snapshot.</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mt-12 mb-16">
               <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-3xl font-bold text-atmosText mb-1">₹{(budgetSummary?.total_spent || 0).toLocaleString()}</div>
                  <div className="text-[9px] text-atmosAccent font-bold uppercase tracking-widest">Total Monthly spend</div>
               </div>
               <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-3xl font-bold text-atmosText mb-1">{globalStats?.total_users_last_24h || 0}</div>
                  <div className="text-[9px] text-atmosViolet font-bold uppercase tracking-widest">Citizens served 24h</div>
               </div>
            </div>

            <div className="space-y-6 md:space-y-8 text-atmosTextMuted text-base md:text-lg leading-relaxed max-w-xl font-inter font-light">
              <p>
                SAAF is currently monitoring <span className="text-atmosAccent font-bold">{facilities.length} mission-critical units</span> across Dehradun, maintaining a city-wide uptime of 99.8%.
              </p>
              <p>
                Our neural link tracks every hygiene event, from <span className="text-atmosText font-bold">Old Cantt Market</span> to the <span className="text-atmosText font-bold">ISBT highway corridor</span>, ensuring 100% vendor accountability.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-16">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-atmosText mb-2">
                   {isLive ? '99.8%' : '---'}
                </div>
                <div className="text-[8px] md:text-[10px] text-atmosTextSubtle font-bold uppercase tracking-widest">Uptime Reliability</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-atmosText mb-2">
                   &lt;{globalStats?.avg_response_time_mins_today || 15}m
                </div>
                <div className="text-[8px] md:text-[10px] text-atmosTextSubtle font-bold uppercase tracking-widest">Avg Response Time</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:gap-6">
             {[
               { 
                 title: "Neural Incident Feed", 
                 desc: "Every hygiene event is captured and logged in a real-time tactical stream.",
                 live: alerts.slice(0, 2).map(a => `${a.facility_name}: ${a.task_type}`)
               },
               { 
                 title: "Budget Transparency", 
                 desc: "Automated fiscal tracking for every maintenance task and resource refill.",
                 live: [`Avg Cost: ₹${budgetSummary?.avg_cost_per_task || 0}/task`, `Tasks logged: ${budgetSummary?.total_tasks || 0}`]
               },
               { 
                 title: "Verified Compliance", 
                 desc: "Official government audits and contractor performance scores (SLA monitoring).",
                 live: [`Verified Cleans: 124 today`, `Avg Compliance: 92.4%`]
               }
             ].map((f, i) => (
               <motion.div 
                 key={i} 
                 className="p-6 md:p-8 bg-atmosBgAlt/30 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl group hover:bg-atmosBgAlt/50 transition-all"
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className="text-atmosAccent font-bold text-[10px] uppercase tracking-widest">0{i+1} // Core Layer</div>
                    <div className="px-2 py-0.5 bg-atmosAccent/10 border border-atmosAccent/20 rounded-full text-[7px] text-atmosAccent font-bold uppercase tracking-widest animate-pulse">Active</div>
                 </div>
                 <h4 className="text-xl font-bold text-atmosText mb-2 tracking-tight">{f.title}</h4>
                 <p className="text-atmosTextSubtle text-xs leading-relaxed mb-4">{f.desc}</p>
                 <div className="space-y-1.5 pt-4 border-t border-white/5">
                    {f.live.map((l, idx) => (
                      <div key={idx} className="text-[9px] text-atmosTextMuted uppercase font-bold tracking-wider flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-atmosAccent" />
                        {l}
                      </div>
                    ))}
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
        
        {/* Live Facility Pulse Section */}
        <div id="facility-grid" className="px-4 md:px-12 lg:px-24 max-w-[1440px] mx-auto pb-20 md:pb-32 bg-atmosBg/95 backdrop-blur-3xl border-t border-white/5 pt-20 md:pt-32 shadow-[0_-50px_100px_rgba(0,0,0,0.8)]">
          <div className="mb-10 md:mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-12 bg-atmosAccent" />
              <span className="text-atmosAccent text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Live Infrastructure</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-atmosText tracking-tighter mb-6 md:mb-8 leading-tight">Facility <span className="text-atmosAccentSoft">Pulse</span></h2>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {recommendation.best && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-atmosAccent/10 border border-atmosAccent/20 rounded-full"
                >
                  <Zap size={10} className="text-atmosAccent animate-pulse" />
                  <span className="text-[8px] md:text-[9px] text-atmosAccent font-bold uppercase tracking-widest truncate max-w-[250px] sm:max-w-none">
                    Neural Pick: {recommendation.best.name} is Optimal
                  </span>
                </motion.div>
              )}
              
              <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isLive ? 'bg-atmosSuccess shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'} `} />
                <span className="text-[8px] md:text-[9px] text-atmosTextMuted font-bold uppercase tracking-widest">
                  {isLive ? 'Neural Link Active' : 'Neural Dropout'}
                </span>
              </div>
            </div>
          </div>

          <FacilityGrid facilities={facilities} />
          <Footer onOpenDeepDive={() => setIsDeepDiveOpen(true)} />
        </div>
      </div>

      <DeepDive isOpen={isDeepDiveOpen} onClose={() => setIsDeepDiveOpen(false)} />

      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-atmosBgAlt/80 backdrop-blur-xl border border-white/5 rounded-full pointer-events-none shadow-2xl">
        <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isLive ? 'bg-atmosSuccess shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'} `} />
        <span className="text-[8px] md:text-[9px] text-atmosTextMuted font-bold uppercase tracking-[0.2em]">
          Neural Sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </main>
  );
};

const Home: React.FC = () => <HomeContent />;

export default Home;
