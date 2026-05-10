import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-premium-bg text-premium-text selection:bg-premium-accent/30 selection:text-white">
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

export default MainLayout;

