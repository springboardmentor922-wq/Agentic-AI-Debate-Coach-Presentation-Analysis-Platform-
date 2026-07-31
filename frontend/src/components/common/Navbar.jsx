import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mic, LogOut, ChevronDown, Sparkles, Shield, Activity } from 'lucide-react';

export const Navbar = ({ activeTabTitle }) => {
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Learner': return 'badge-pill-indigo';
      case 'Debate Coach': return 'badge-pill-amber';
      case 'Educator': return 'badge-pill-emerald';
      case 'Admin': return 'badge-pill-rose';
      default: return 'badge-pill-indigo';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-2xl">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
          <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-lg">
            <Mic className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-xl tracking-tight text-white uppercase">
              {user?.role ? `${user.role} Panel` : 'Panel'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
            <span className="text-indigo-400 font-semibold">{activeTabTitle}</span>
          </div>
        </div>
      </div>

      {/* System Status & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Server Indicator */}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-full bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-indigo-300">
                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 glass-card p-4 shadow-2xl z-50 animate-fadeIn border-indigo-500/30">
              <div className="pb-3 mb-3 border-b border-slate-800">
                <p className="text-sm font-bold text-slate-100">{user?.fullname}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                  <span>Username:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{user?.username}</span>
                </div>
              </div>

              <button
                onClick={logoutUser}
                className="w-full btn-danger text-xs py-2 justify-center"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
