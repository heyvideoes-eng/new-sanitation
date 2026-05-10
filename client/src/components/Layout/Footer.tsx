import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  onOpenDeepDive?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenDeepDive }) => {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 px-6 py-32 border-t border-white/5 bg-atmosBgAlt/30 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto text-center mb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-atmosAccent/10 text-atmosAccent text-[10px] font-bold uppercase tracking-widest mb-8 border border-atmosAccent/20">
            System Integration
          </div>
          <h3 className="text-4xl md:text-8xl font-bold text-atmosText mb-8 tracking-tighter leading-[0.85]">
            Secure your <br />
            <span className="text-atmosAccent">Infrastructure.</span>
          </h3>
          <p className="text-atmosTextMuted mb-12 text-xl max-w-2xl mx-auto leading-relaxed font-inter font-light">
            Join the network of smart cities using SAFAI to transform public hygiene 
            into a data-driven utility. Access deep operational insights and real-time telemetry.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="px-12 py-5 bg-atmosAccent hover:bg-atmosAccentSoft text-black font-bold text-[11px] uppercase tracking-widest rounded-full transition-all shadow-[0_20px_50px_rgba(34,197,94,0.3)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.5)] transform hover:-translate-y-1 font-inter"
            >
              Request Admin Access
            </button>
            <button 
              onClick={onOpenDeepDive}
              className="px-12 py-5 bg-white/5 hover:bg-white/10 text-atmosText font-bold text-[11px] uppercase tracking-widest rounded-full border border-white/10 transition-all backdrop-blur-sm font-inter"
            >
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
      
      <div className="max-w-[1440px] mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-atmosTextSubtle text-[10px] font-medium uppercase tracking-[0.1em]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-atmosAccent flex items-center justify-center font-bold text-black text-xs">S</div>
          <div className="font-inter">© 2026 SAFAI / SAAF. Digital Command Center.</div>
        </div>
        <div className="flex items-center gap-10 tracking-[0.2em] font-bold text-[9px] font-inter">
          <a href="#" className="hover:text-atmosAccent transition-colors">Privacy</a>
          <a href="#" className="hover:text-atmosAccent transition-colors">Terms</a>
          <a href="#" className="hover:text-atmosAccent transition-colors">Uptime</a>
          <a href="#" className="hover:text-atmosAccent transition-colors">API</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
