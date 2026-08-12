import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  Flame, 
  Calendar, 
  Plus,
  ArrowRight,
  Bot,
  Play,
  CheckCircle2,
  Circle,
  Target,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { UserProfile, ActiveDebateSession } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface LearnerDashboardViewProps {
  onNavigate: (tab: string) => void;
  activeUser?: UserProfile;
  activeDebateTopic?: string;
  activeSession?: ActiveDebateSession;
  onCompleteSession?: () => void;
}

// Data matching the performance overview chart in project spec
const PERFORMANCE_DATA = [
  { date: 'Jul 23', score: 20 },
  { date: 'Jul 24', score: 92 },
  { date: 'Jul 24', score: 93 },
  { date: 'Jul 25', score: 68 },
  { date: 'Jul 26', score: 67 },
  { date: 'Jul 27', score: 45 },
  { date: 'Aug 3', score: 52 },
];

// Radar chart skill progress data (You vs. Platform Average)
const SKILL_PROGRESS_DATA = [
  { dimension: 'Argument Quality', userScore: 82, averageScore: 65 },
  { dimension: 'Evidence Usage', userScore: 68, averageScore: 60 },
  { dimension: 'Logical Consistency', userScore: 75, averageScore: 70 },
  { dimension: 'Rebuttal Effectiveness', userScore: 60, averageScore: 62 },
  { dimension: 'Communication Skills', userScore: 88, averageScore: 68 },
  { dimension: 'Confidence', userScore: 80, averageScore: 65 },
];

export const LearnerDashboardView: React.FC<LearnerDashboardViewProps> = ({ 
  onNavigate, 
  activeUser, 
  activeDebateTopic,
  activeSession,
  onCompleteSession
}) => {
  const { isDark } = useTheme();
  const userName = activeUser?.name || 'learner1';

  // Interactive student goals state
  const [goals, setGoals] = useState([
    { id: '1', title: 'Complete 5 Debate Sessions this week', completed: true, category: 'Practice' },
    { id: '2', title: 'Reduce filler words below 3% in speech analysis', completed: false, category: 'Delivery' },
    { id: '3', title: 'Detect 10 logical fallacies using Fallacy Detector tool', completed: true, category: 'Rebuttal' },
    { id: '4', title: 'Master Parliamentary style rebuttal structure', completed: false, category: 'Strategy' },
  ]);

  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals([
      ...goals,
      { id: Date.now().toString(), title: newGoalText.trim(), completed: false, category: 'Personal' }
    ]);
    setNewGoalText('');
    setShowAddGoal(false);
  };

  const completedGoalsCount = goals.filter(g => g.completed).length;

  const cardBgClass = isDark
    ? 'bg-[#1E1B2B]/90 border-slate-800 text-white shadow-xl'
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className={`rounded-2xl p-6 shadow-xl space-y-1 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-[#1E1B2E] border-slate-800 text-white' 
          : 'bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white border-transparent'
      }`}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Welcome back, {userName}! 👋
          </h2>
          <p className={isDark ? 'text-slate-400 text-xs font-medium' : 'text-purple-100 text-xs font-medium'}>
            Track your debate progression, complete practice rounds, and work toward your active learning goals.
          </p>
        </div>
        <button
          onClick={() => onNavigate('ai-simulation')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 shadow-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-purple-700" /> Start Debate Phase
        </button>
      </div>

      {/* Active Debate Phase Quick Launch Card */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        isDark 
          ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-purple-500/30' 
          : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-purple-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 uppercase tracking-wide">
                Active Debate Session
              </span>
              {activeSession?.status === 'in_progress' ? (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Phase {Math.min((activeSession.turns?.length || 0) + 1, 5)}/5 (In Progress)
                </span>
              ) : (
                <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Completed
                </span>
              )}
            </div>
            <h3 className={`text-base font-bold mt-1 ${textPrimary}`}>
              {activeSession?.topic || activeDebateTopic || 'Universal Basic Income creates a safety net for economic innovation.'}
            </h3>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              Format: {activeSession?.format || 'One-on-One'} • Stance: {activeSession?.side || 'Proposition'} • Turns: {activeSession?.turns?.length || 1} Logged
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('practice-topics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            Practice Topics
          </button>
          <button
            onClick={() => onNavigate('ai-simulation')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> Resume Debate Round
          </button>
        </div>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Debates Participated */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Debates Participated</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>9</p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Average Score</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>46%</p>
          </div>
        </div>

        {/* Card 3: Skills Improved */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Skills Improved</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>2</p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>vs platform baseline</p>
          </div>
        </div>

        {/* Card 4: Current Streak */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Current Streak</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>1 Day</p>
          </div>
        </div>
      </div>

      {/* Performance & Skill Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview (Line Chart) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className={`font-bold text-sm ${textPrimary}`}>Performance Overview</h3>
            </div>
            <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Last 7 Debate Sessions
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="2 2" stroke={isDark ? '#2d3748' : '#e2e8f0'} />
                <XAxis dataKey="date" stroke={isDark ? '#64748b' : '#64748b'} fontSize={10} />
                <YAxis domain={[0, 100]} stroke={isDark ? '#64748b' : '#64748b'} fontSize={10} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip 
                  contentStyle={
                    isDark
                      ? { backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }
                      : { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '11px' }
                  }
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a855f7" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#a855f7', r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Progress (Radar Chart) */}
        <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${cardBgClass}`}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className={`font-bold text-sm ${textPrimary}`}>Skill Progress Radar</h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_PROGRESS_DATA}>
                <PolarGrid stroke={isDark ? '#2d3748' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="dimension" stroke={isDark ? '#94a3b8' : '#475569'} fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#475569' : '#cbd5e1'} fontSize={8} />
                <Radar name="Average Learner" dataKey="averageScore" stroke={isDark ? '#475569' : '#94a3b8'} fill={isDark ? '#475569' : '#94a3b8'} fillOpacity={0.3} />
                <Radar name="You" dataKey="userScore" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-xs ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
              <span className={textMuted}>Platform Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
              <span className="text-purple-600 dark:text-purple-300 font-semibold">Your Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Upcoming Sessions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Learning Goals (Interactive Checklist) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <h3 className={`font-bold text-sm ${textPrimary}`}>Personal Learning Goals</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {completedGoalsCount} of {goals.length} Completed
              </span>
              <button
                onClick={() => setShowAddGoal(!showAddGoal)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>
          </div>

          {showAddGoal && (
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Enter a new debate skill goal..."
                className={`flex-1 p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Save
              </button>
            </form>
          )}

          <div className="space-y-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  goal.completed
                    ? isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400 line-through' : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
                    : isDark ? 'bg-slate-900 border-slate-700 hover:border-purple-500/50' : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {goal.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-medium">{goal.title}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' : 'bg-purple-100 text-purple-700'
                }`}>
                  {goal.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Scheduled Sessions */}
        <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h3 className={`font-bold text-sm ${textPrimary}`}>Upcoming Sessions</h3>
              </div>
              <button 
                onClick={() => onNavigate('my-debates')}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule
              </button>
            </div>

            <div className={`mt-6 text-center py-6 text-xs font-medium rounded-xl border border-dashed ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <Calendar className="w-6 h-6 mx-auto mb-2 opacity-40 text-indigo-400" />
              No upcoming sessions scheduled.
              <button
                onClick={() => onNavigate('my-debates')}
                className="block mx-auto mt-2 text-xs text-indigo-500 font-bold hover:underline cursor-pointer"
              >
                Schedule a Debate Round →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Practice Tools Quick Launch (Phase 8 Spec) */}
      <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className={`font-bold text-sm ${textPrimary}`}>Learner Standalone Practice Tools</h3>
          </div>
          <span className={`text-xs ${textMuted}`}>Direct access to specialized Gemini micro-agents</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => onNavigate('argument-analyzer')}
            className={`p-3.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 hover:border-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between text-purple-600 dark:text-purple-400">
              Argument Analyzer <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className={`text-[11px] ${textMuted}`}>Evaluate evidence strength & logical consistency.</p>
          </button>

          <button
            onClick={() => onNavigate('fallacy-detector')}
            className={`p-3.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 hover:border-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between text-amber-600 dark:text-amber-400">
              Fallacy Detector <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className={`text-[11px] ${textMuted}`}>Scan speech text for 8 common logical fallacies.</p>
          </button>

          <button
            onClick={() => onNavigate('counterargument-gen')}
            className={`p-3.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 hover:border-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              Counterargument Generator <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className={`text-[11px] ${textMuted}`}>Generate multi-perspective opponent rebuttals.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

