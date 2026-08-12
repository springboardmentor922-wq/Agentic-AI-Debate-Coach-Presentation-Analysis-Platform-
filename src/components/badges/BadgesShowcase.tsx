import React, { useState } from 'react';
import { Badge } from '../../types';
import { MOCK_BADGES } from '../../data/badgesData';
import { 
  Trophy, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Target, 
  BookOpen, 
  Zap, 
  Crown, 
  Award, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Star,
  ChevronRight,
  Gift
} from 'lucide-react';

interface BadgesShowcaseProps {
  badges?: Badge[];
  compact?: boolean;
  onViewAll?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  Flame,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Zap,
  Crown,
  Award,
  Shield,
};

const LEVEL_COLORS: Record<Badge['level'], { badgeBg: string; text: string; border: string; glow: string }> = {
  Bronze: {
    badgeBg: 'from-amber-900/40 via-amber-800/20 to-slate-900',
    text: 'text-amber-400',
    border: 'border-amber-700/50',
    glow: 'shadow-amber-900/20',
  },
  Silver: {
    badgeBg: 'from-slate-700/40 via-slate-600/20 to-slate-900',
    text: 'text-slate-200',
    border: 'border-slate-500/50',
    glow: 'shadow-slate-500/20',
  },
  Gold: {
    badgeBg: 'from-amber-500/20 via-yellow-600/10 to-slate-900',
    text: 'text-yellow-400',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/20',
  },
  Platinum: {
    badgeBg: 'from-cyan-500/20 via-teal-600/10 to-slate-900',
    text: 'text-cyan-300',
    border: 'border-cyan-500/50',
    glow: 'shadow-cyan-500/20',
  },
  Diamond: {
    badgeBg: 'from-indigo-500/20 via-purple-600/20 to-slate-900',
    text: 'text-indigo-300',
    border: 'border-indigo-400/50',
    glow: 'shadow-indigo-500/30',
  },
};

export const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({
  badges = MOCK_BADGES,
  compact = false,
  onViewAll,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const totalPoints = unlockedBadges.reduce((sum, b) => sum + b.rewardPoints, 0);

  const filteredBadges = badges.filter(b => {
    if (filterCategory === 'unlocked') return b.unlocked;
    if (filterCategory === 'locked') return !b.unlocked;
    if (filterCategory !== 'all') return b.category === filterCategory;
    return true;
  });

  // Calculate user level based on points
  const levelNumber = Math.floor(totalPoints / 400) + 1;
  const currentLevelProgress = ((totalPoints % 400) / 400) * 100;

  if (compact) {
    return (
      <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Achievements & Reward Badges</h3>
              <p className="text-[11px] text-slate-400">{unlockedBadges.length} of {badges.length} unlocked • {totalPoints} XP</p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Compact Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.slice(0, 4).map((badge) => {
            const IconComponent = ICON_MAP[badge.iconName] || Trophy;
            const style = LEVEL_COLORS[badge.level];
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 rounded-xl border bg-gradient-to-b ${style.badgeBg} ${style.border} cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col items-center text-center group`}
              >
                {!badge.unlocked && (
                  <div className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full text-slate-500">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center my-1 ${
                  badge.unlocked ? `${style.text} bg-slate-900/80 ring-2 ring-indigo-500/30` : 'text-slate-600 bg-slate-900/40'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white truncate w-full mt-1">{badge.title}</p>
                <span className={`text-[10px] font-mono font-semibold ${style.text}`}>{badge.level}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Level Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-8 h-8" />
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-indigo-600 text-white font-mono text-[10px] font-bold rounded-full border border-slate-900 shadow">
              Lv. {levelNumber}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Rhetoric Master Rewards</h2>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold rounded-full">
                {totalPoints} XP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Earn reward badges by completing debate practice rounds, identifying fallacies, and maintaining daily streaks!
            </p>

            {/* Level Progress Bar */}
            <div className="w-full max-w-md mt-3 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Level {levelNumber} Orator</span>
                <span>{totalPoints % 400} / 400 XP to Level {levelNumber + 1}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats right */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center shrink-0 z-10">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Unlocked</p>
            <p className="text-lg font-bold text-emerald-400">{unlockedBadges.length} / {badges.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Completion</p>
            <p className="text-lg font-bold text-amber-400">{Math.round((unlockedBadges.length / badges.length) * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'unlocked', label: `Unlocked (${unlockedBadges.length})` },
          { id: 'locked', label: `Locked (${badges.length - unlockedBadges.length})` },
          { id: 'logic', label: 'Logic & Fallacies' },
          { id: 'speech', label: 'Speech & Pace' },
          { id: 'streak', label: 'Streak' },
          { id: 'mastery', label: 'Mastery' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const IconComponent = ICON_MAP[badge.iconName] || Trophy;
          const style = LEVEL_COLORS[badge.level];

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border bg-gradient-to-b ${style.badgeBg} ${style.border} ${style.glow} shadow-lg cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col justify-between group`}
            >
              {/* Badge Top Header */}
              <div className="flex items-start justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                  badge.unlocked ? `${style.text} bg-slate-950/80 border-slate-700` : 'text-slate-500 bg-slate-900 border-slate-800'
                }`}>
                  {badge.level}
                </span>

                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                  +{badge.rewardPoints} XP
                </span>
              </div>

              {/* Icon & Title */}
              <div className="my-3 flex flex-col items-center text-center space-y-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  badge.unlocked
                    ? `${style.text} bg-slate-950/90 ring-2 ring-indigo-500/40 shadow-xl`
                    : 'text-slate-600 bg-slate-900/60 border border-slate-800'
                }`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{badge.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Status */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {badge.unlocked ? (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked {badge.unlockedAt && `• ${badge.unlockedAt}`}
                  </span>
                ) : (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>In Progress</span>
                      <span>{badge.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 text-center">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Big Badge Icon */}
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-slate-950 ring-4 ring-indigo-500/40 shadow-2xl ${
                selectedBadge.unlocked ? LEVEL_COLORS[selectedBadge.level].text : 'text-slate-600'
              }`}>
                {React.createElement(ICON_MAP[selectedBadge.iconName] || Trophy, { className: 'w-10 h-10' })}
              </div>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedBadge.level} Level Badge
              </span>
              <h3 className="text-lg font-extrabold text-white mt-2">{selectedBadge.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedBadge.description}</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Reward Value</span>
              <span className="text-amber-400 font-bold">+{selectedBadge.rewardPoints} XP Points</span>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Close Showcase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
