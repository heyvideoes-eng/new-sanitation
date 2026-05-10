import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, LogOut, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLiveData } from '../../context/LiveDataContext';

const Navbar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isHighContrast, setIsHighContrast] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { govtMode, setGovtMode, isLive } = useLiveData();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleContrast = () => {
    const newVal = !isHighContrast;
    setIsHighContrast(newVal);
    if (newVal) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-atmosBg/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-atmosAccent font-bold text-2xl tracking-tighter">SANiTRAX</span>
          <span className="text-[10px] bg-atmosAccent/20 text-atmosAccent px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">GOVT</span>
        </Link>
        {/* Govt Mode Toggle */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <span className={`text-[8px] font-bold uppercase tracking-widest ${!govtMode ? 'text-atmosAccent' : 'text-atmosTextMuted'}`}>Citizen</span>
          <button 
            onClick={() => {
              setGovtMode(!govtMode);
              navigate(govtMode ? '/' : '/admin');
            }}
            className="w-8 h-4 bg-white/10 rounded-full relative p-0.5"
          >
            <motion.div 
              animate={{ x: govtMode ? 16 : 0 }}
              className={`w-3 h-3 rounded-full ${govtMode ? 'bg-atmosAccent' : 'bg-atmosTextMuted'}`}
            />
          </button>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${govtMode ? 'text-atmosAccent' : 'text-atmosTextMuted'}`}>Govt Mode</span>
        </div>

        <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-8">
          <span className="text-atmosTextMuted text-sm font-medium">
            Smart Access & Facility Monitor
          </span>
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isLive ? 'text-atmosSuccess' : 'text-atmosError'}`}>
            <motion.div 
              animate={isLive ? { opacity: [1, 0.4, 1] } : { scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-2 h-2 rounded-full bg-current ${isLive ? 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
            />
            <span>{isLive ? `Data Live: ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Signal Lost – Reconnecting'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Navigation Links based on role */}
        <div className="hidden xl:flex items-center gap-6 mr-6 border-r border-white/10 pr-8">
           <Link to="/" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Pulse</Link>
           <Link to="/welfare" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Welfare</Link>
           {user?.role === 'admin' && (
             <>
                <Link to="/admin" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Admin</Link>
                <Link to="/inspector" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Audit</Link>
                <Link to="/budget" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Budget</Link>
                <Link to="/analytics" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Analytics</Link>
             </>
           )}
           {(user?.role === 'cleaner' || user?.role === 'admin') && (
             <Link to="/cleaner" className="text-[10px] text-atmosTextMuted font-bold uppercase tracking-widest hover:text-atmosAccent transition-colors">Staff</Link>
           )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={toggleContrast}
            className={`p-2 rounded-full border transition-all ${isHighContrast ? 'bg-atmosAccent text-white border-atmosAccent' : 'text-atmosTextMuted border-white/10 hover:text-atmosText'}`}
            title="Toggle High Contrast"
          >
            <Globe size={16} />
          </button>
        </div>

        {isAuthenticated || true ? ( // Always true for open access
          <div className="flex items-center gap-3 bg-atmosBgAlt border border-white/5 rounded-full pl-4 pr-1 py-1">
             <div className="flex flex-col items-end pr-2">
                <span className="text-[10px] text-atmosText font-bold uppercase leading-none mb-1">{user?.name || 'Guest Admin'}</span>
                <span className="text-[8px] text-atmosAccent font-bold uppercase tracking-widest leading-none">{user?.role || 'admin'}</span>
             </div>
             <button 
               onClick={() => navigate('/admin')}
               className="p-2 bg-atmosAccent/10 text-atmosAccent rounded-full hover:bg-atmosAccent/20 transition-all"
               title="Go to Dashboard"
             >
               <Activity size={16} />
             </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-2 px-5 py-2 bg-atmosAccent text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-atmosAccentSoft transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <User size={14} /> Command Center
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
