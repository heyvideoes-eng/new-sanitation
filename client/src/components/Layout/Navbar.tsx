import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Activity, Shield, PieChart, IndianRupee, User, Menu } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();

  const navItems = [
    { path: '/analytics', icon: PieChart, label: 'Insights' },
    { path: '/budget', icon: IndianRupee, label: 'Transparency' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl pointer-events-auto shadow-2xl border-white/10">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-premium-accent rounded-lg flex items-center justify-center shadow-lg shadow-premium-accent/20 group-hover:scale-105 transition-transform">
               <Activity size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-premium-text font-bold text-lg tracking-tighter leading-none">SAAF</span>
              <span className="text-[8px] font-bold text-premium-muted uppercase tracking-widest mt-0.5">Sanitrax</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 transition-all group ${location.pathname === item.path ? 'text-premium-accent' : 'text-premium-muted hover:text-premium-text'}`}
              >
                <item.icon size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-sm mx-12 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-subtle group-focus-within:text-premium-accent transition-colors" size={12} />
            <input 
              type="text" 
              placeholder="Search units..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-11 pr-4 text-[11px] text-white outline-none focus:border-premium-accent/30 focus:bg-white/10 transition-all placeholder:text-premium-subtle"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">Live Sync</span>
          </div>
          
          <div className="w-[1px] h-6 bg-white/10 hidden sm:block" />

          <button 
            onClick={() => navigate('/admin')}
            className="p-2.5 rounded-full text-premium-muted hover:text-premium-accent hover:bg-white/5 transition-all"
            title="Operational Dashboard"
          >
            <Shield size={18} />
          </button>
          <button 
            onClick={() => navigate('/cleaner')}
            className="p-2.5 rounded-full text-premium-muted hover:text-premium-accent hover:bg-white/5 transition-all"
            title="Service Portal"
          >
            <User size={18} />
          </button>
          
          <button className="md:hidden p-2 text-premium-muted">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
