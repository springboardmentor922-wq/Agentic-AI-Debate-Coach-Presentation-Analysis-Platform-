import React, { useState, useEffect } from 'react';
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
  BookOpen,
  MessageSquare,
  Award,
  Clock,
  ShieldCheck,
  UserCheck
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
import { UserProfile, ActiveDebateSession, CoachFeedbackNote } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getCoachFeedbackNotes } from '../../services/feedbackAndNotificationService';
import { getLearnerProfileData } from '../../services/learnerCoachSyncService';

interface LearnerDashboardViewProps {
  onNavigate: (tab: string) => void;
  activeUser?: UserProfile;
  activeDebateTopic?: string;
  activeSession?: ActiveDebateSession;
  onStartNewDebateSession?: (topicTitle?: string) => void;
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
  onStartNewDebateSession,
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

  const [coachNotes, setCoachNotes] = useState<CoachFeedbackNote[]>([]);
  const [learnerStats, setLearnerStats] = useState(() => getLearnerProfileData(userName) || getLearnerProfileData(activeUser?.email || ''));

  useEffect(() => {
    const loadNotesAndStats = () => {
      const all = getCoachFeedbackNotes();
      // Filter for this active learner or show recent cohort feedback if default learner
      const matched = all.filter(n => 
        n.learnerName.toLowerCase() === userName.toLowerCase() || 
        n.learnerEmail === activeUser?.email ||
        !activeUser?.isCustomAccount
      );
      setCoachNotes(matched.length > 0 ? matched : all);

      const record = getLearnerProfileData(userName) || getLearnerProfileData(activeUser?.email || '') || getLearnerProfileData(activeUser?.id || '');
      if (record) {
        setLearnerStats(record);
      }
    };

    loadNotesAndStats();

    const handleUpdate = () => loadNotesAndStats();
    window.addEventListener('debate_coach_feedback_updated', handleUpdate);
    window.addEventListener('debate_learner_registry_updated', handleUpdate);
    return () => {
      window.removeEventListener('debate_coach_feedback_updated', handleUpdate);
      window.removeEventListener('debate_learner_registry_updated', handleUpdate);
    };
  }, [userName, activeUser]);

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

      {/* Active In-Progress Debate Card vs. Start New Debate Card */}
      {activeSession?.status === 'in_progress' && (activeSession.turns?.filter(t => !t.isSample).length || 0) > 0 ? (
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
                  Active Debate In Progress
                </span>
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Phase {Math.min((activeSession.turns?.filter(t => !t.isSample).length || 0) + 1, 5)}/5
                </span>
              </div>
              <h3 className={`text-base font-bold mt-1 ${textPrimary}`}>
                {activeSession.topic}
              </h3>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                Format: {activeSession.format || 'One-on-One'} • Stance: {activeSession.side || 'Proposition'} • {activeSession.turns?.filter(t => !t.isSample).length} Turn(s) Logged
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
      ) : (
        <div className={`p-5 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/20' 
            : 'bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white border-indigo-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                  Arena Ready • Start Turn #1
                </span>
                {activeSession?.status === 'completed' && (
                  <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Previous Debate Archived
                  </span>
                )}
              </div>
              <h3 className={`text-base font-bold mt-1 ${textPrimary}`}>
                Start a Live AI Debate Practice Round
              </h3>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                {activeSession?.status === 'completed' 
                  ? `Last finished: "${activeSession.topic.slice(0, 45)}..." • Select a motion to initiate a fresh Turn #1.`
                  : 'Debate in real-time against Agent 01 (Referee audit) and Agent 02 (Rival rebuttal) with live fallacy scoring.'}
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
              Choose Practice Topic
            </button>
            <button
              onClick={() => {
                if (onStartNewDebateSession) {
                  onStartNewDebateSession();
                } else {
                  onNavigate('ai-simulation');
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" /> Start Debate (Turn #1)
            </button>
          </div>
        </div>
      )}

      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Debates Participated */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Debates Participated</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>
              {learnerStats?.totalDebates || 9}
            </p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Average Score</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>
              {learnerStats?.averageScore || 78}%
            </p>
          </div>
        </div>

        {/* Card 3: Skills Improved */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-colors ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[11px] font-medium ${textMuted}`}>Skills Improved</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${textPrimary}`}>
              {learnerStats?.skills ? Object.keys(learnerStats.skills).length : 5}
            </p>
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

      {/* Coach Feedback & Mentor Reviews Section */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-extrabold text-base tracking-tight ${textPrimary}`}>Coach & Mentor Feedback</h3>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800">
                  {coachNotes.length} Reviews Available
                </span>
              </div>
              <p className={`text-xs ${textMuted}`}>Personalized critiques, turn log annotations, and strategic advice submitted by your debate coach.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('feedback-coaching')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <span>View Complete Coaching Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {coachNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {coachNotes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40' : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 border-b pb-2.5 border-slate-700/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-purple-400/30">
                      {note.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`font-bold text-xs truncate ${textPrimary}`}>{note.coachName}</p>
                        <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">{note.date}</span>
                    </div>
                  </div>

                  {note.grade && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                      Grade: {note.grade} ({note.score}%)
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-purple-400 line-clamp-1">
                    Debate: <span className={isDark ? 'text-slate-300 font-normal' : 'text-slate-700 font-normal'}>{note.topic}</span>
                  </p>
                  {note.focusSkill && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Focus: {note.focusSkill}
                    </span>
                  )}
                </div>

                <div className={`p-3 rounded-lg border text-xs leading-relaxed italic ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  "{note.note}"
                </div>

                {note.recommendation && (
                  <p className="text-[11px] text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1">
                    💡 <span className="font-semibold">Next Step:</span> {note.recommendation}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-slate-400">Target: {note.learnerName}</span>
                  <button
                    onClick={() => onNavigate('feedback-coaching')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open Full Report <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-500'} space-y-2`}>
            <MessageSquare className="w-8 h-8 mx-auto text-purple-400 opacity-50" />
            <p className="font-semibold text-xs text-slate-300">No coach reviews posted yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              When your coach reviews speech logs from the Coach Dashboard and posts feedback, recommendations will appear here automatically.
            </p>
          </div>
        )}
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

