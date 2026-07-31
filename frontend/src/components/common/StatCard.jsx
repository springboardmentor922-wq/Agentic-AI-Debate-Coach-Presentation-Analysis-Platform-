import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', onClick, subtitle, badgeText }) => {
  const getColorGradient = () => {
    switch (color) {
      case 'emerald': return 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400 glow-emerald';
      case 'amber': return 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400 glow-amber';
      case 'rose': return 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-400';
      case 'cyan': return 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400';
      case 'violet': return 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-400';
      default: return 'from-indigo-500/20 to-violet-500/10 border-indigo-500/40 text-indigo-400 glow-indigo';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 relative overflow-hidden group transition-all duration-300 ${
        onClick ? 'glass-card-interactive cursor-pointer' : ''
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{title}</span>
            {badgeText && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {badgeText}
              </span>
            )}
          </div>
          <h3 className="font-display text-4xl font-black text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${getColorGradient()} border shadow-inner transition-transform group-hover:scale-110 duration-300`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};
