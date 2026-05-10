import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEntry = async (role: 'admin' | 'cleaner', path: string) => {
    setLoading(role);
    setError(null);
    try {
      if (role === 'admin') {
        await login({ 
          role: 'admin', 
          username: 'admin@saaf.local', 
          password: 'Admin@123' 
        });
      } else {
        await login({ 
          role: 'cleaner', 
          cleaner_id: 'CLEANER1', 
          pin: '1234' 
        });
      }
      navigate(path);
    } catch (err: any) {
      console.error('Login failed', err);
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-premium-bg flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-premium-accent/10 border border-premium-accent/20 rounded-full text-premium-accent text-[10px] font-bold uppercase tracking-widest mb-8"
          >
            <Shield size={12} />
            Secure Access
          </motion.div>
          <h1 className="text-6xl font-bold text-premium-text tracking-tighter mb-4">SAAF</h1>
          <p className="text-premium-muted text-xs font-bold uppercase tracking-[0.3em]">Dehradun Sanitation Portal</p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-status-issue/10 border border-status-issue/20 rounded-2xl flex items-center gap-3 text-status-issue text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Official Access */}
          <motion.button
            disabled={!!loading}
            whileHover={loading ? {} : { y: -4 }}
            onClick={() => handleEntry('admin', '/')}
            className={`glass-panel p-10 text-left group relative overflow-hidden ${loading === 'admin' ? 'opacity-80' : 'hover:border-premium-accent/30'}`}
          >
            {loading === 'admin' && (
              <div className="absolute inset-0 bg-premium-accent/5 flex items-center justify-center backdrop-blur-[2px] z-10">
                <Loader2 className="text-premium-accent animate-spin" size={32} />
              </div>
            )}
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-premium-accent group-hover:text-white transition-all">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-bold text-premium-text mb-3">Municipal Official</h2>
            <p className="text-xs text-premium-muted mb-8 leading-relaxed font-medium">
              Access administrative tools, maintenance logs, and verification systems.
            </p>
            <div className="flex items-center gap-2 text-premium-accent text-[10px] font-bold uppercase tracking-widest">
              Enter Portal <ArrowRight size={14} />
            </div>
          </motion.button>

          {/* Associate Access */}
          <motion.button
            disabled={!!loading}
            whileHover={loading ? {} : { y: -4 }}
            onClick={() => handleEntry('cleaner', '/')}
            className={`glass-panel p-10 text-left group relative overflow-hidden ${loading === 'cleaner' ? 'opacity-80' : 'hover:border-status-usable/30'}`}
          >
            {loading === 'cleaner' && (
              <div className="absolute inset-0 bg-status-usable/5 flex items-center justify-center backdrop-blur-[2px] z-10">
                <Loader2 className="text-status-usable animate-spin" size={32} />
              </div>
            )}
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-status-usable group-hover:text-white transition-all">
              <User size={24} />
            </div>
            <h2 className="text-2xl font-bold text-premium-text mb-3">Field Associate</h2>
            <p className="text-xs text-premium-muted mb-8 leading-relaxed font-medium">
              Submit maintenance proof, capture site photos, and update live status.
            </p>
            <div className="flex items-center gap-2 text-status-usable text-[10px] font-bold uppercase tracking-widest">
              Open Service Hub <ArrowRight size={14} />
            </div>
          </motion.button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-16 w-full text-[10px] text-premium-subtle font-bold uppercase tracking-[0.4em] hover:text-premium-text transition-colors"
        >
          Return to map
        </button>
      </div>
    </div>
  );
};

export default LoginPage;


