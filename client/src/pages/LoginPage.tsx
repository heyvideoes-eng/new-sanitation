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
      setError(err.message || 'Connection failed. Is the server running?');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030407] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-atmosAccent/10 border border-atmosAccent/20 rounded-full text-atmosAccent text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            <Shield size={14} />
            Secure Access Gateway
          </motion.div>
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-2">SANi<span className="text-atmosAccent">TRAX</span></h1>
          <p className="text-atmosTextMuted text-sm font-medium uppercase tracking-widest">Smart City Command Network</p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin / Official Access */}
          <motion.button
            disabled={!!loading}
            whileHover={loading ? {} : { y: -8, scale: 1.02 }}
            onClick={() => handleEntry('admin', '/admin')}
            className={`p-10 bg-white/5 border border-white/5 rounded-[3rem] transition-all text-left group relative overflow-hidden ${loading === 'admin' ? 'opacity-80' : 'hover:border-atmosAccent/30'}`}
          >
            {loading === 'admin' && (
              <div className="absolute inset-0 bg-atmosAccent/5 flex items-center justify-center backdrop-blur-[2px]">
                <Loader2 className="text-atmosAccent animate-spin" size={32} />
              </div>
            )}
            <div className="w-16 h-16 bg-atmosAccent/10 rounded-2xl flex items-center justify-center mb-8 border border-atmosAccent/20 group-hover:bg-atmosAccent group-hover:text-white transition-all">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Municipal <span className="text-atmosAccent">Official</span></h2>
            <p className="text-sm text-atmosTextMuted mb-8 leading-relaxed">
              Access city-wide dashboards, ward mapping, financial audit logs, and strategic command tools.
            </p>
            <div className="flex items-center gap-2 text-atmosAccent text-xs font-bold uppercase tracking-widest">
              Enter Command Center <ArrowRight size={16} />
            </div>
          </motion.button>

          {/* Staff / Cleaner Access */}
          <motion.button
            disabled={!!loading}
            whileHover={loading ? {} : { y: -8, scale: 1.02 }}
            onClick={() => handleEntry('cleaner', '/cleaner')}
            className={`p-10 bg-white/5 border border-white/5 rounded-[3rem] transition-all text-left group relative overflow-hidden ${loading === 'cleaner' ? 'opacity-80' : 'hover:border-atmosSuccess/30'}`}
          >
            {loading === 'cleaner' && (
              <div className="absolute inset-0 bg-atmosSuccess/5 flex items-center justify-center backdrop-blur-[2px]">
                <Loader2 className="text-atmosSuccess animate-spin" size={32} />
              </div>
            )}
            <div className="w-16 h-16 bg-atmosSuccess/10 rounded-2xl flex items-center justify-center mb-8 border border-atmosSuccess/20 group-hover:bg-atmosSuccess group-hover:text-white transition-all">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Field <span className="text-atmosSuccess">Associate</span></h2>
            <p className="text-sm text-atmosTextMuted mb-8 leading-relaxed">
              Real-time service hub for cleaners. Update facility status, log supplies, and capture audit evidence.
            </p>
            <div className="flex items-center gap-2 text-atmosSuccess text-xs font-bold uppercase tracking-widest">
              Open Service Hub <ArrowRight size={16} />
            </div>
          </motion.button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-12 w-full text-[10px] text-atmosTextMuted font-bold uppercase tracking-[0.4em] hover:text-white transition-colors"
        >
          Return to Surface
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

