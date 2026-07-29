import React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight,
  Mic,
  AlertTriangle,
  Zap
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
import { MOCK_PERFORMANCE_SCORES, MOCK_SKILL_PROGRESS } from '../../data/mockData';
import { BadgesShowcase } from '../badges/BadgesShowcase';

interface LearnerDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const LearnerDashboardView: React.FC<LearnerDashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">Active Learner Session</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Alex Chen! 👋</h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Keep practicing, keep improving. You're on the path to becoming an elite debater and persuasive speaker!
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ai-simulation')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Zap className="w-4 h-4 text-white" /> Start AI Debate Arena
            </button>
            <button
              onClick={() => onNavigate('presentation-analysis')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Mic className="w-4 h-4 text-indigo-400" /> Practice Speech Quality
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shrink-0 z-10">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-mono">Agentic Pipeline</p>
            <p className="text-xs font-bold text-white">8 Active Agents</p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-mono">Referee Logic</p>
            <p className="text-xs font-bold text-emerald-400">0.0 Temp Strict</p>
          </div>
        </div>
      </div>

      {/* 4 Core Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Debates Completed</p>
            <p className="text-2xl font-bold text-white mt-0.5">24</p>
            <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +20% vs last month
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Average Score</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-white">78.6</span>
              <span className="text-xs text-slate-400 font-medium">/100</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +12% vs last month
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Skills Improved</p>
            <p className="text-2xl font-bold text-white mt-0.5">6</p>
            <p className="text-[11px] font-semibold text-emerald-400 mt-1 font-mono">
              ↑ 2 new this month
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Current Streak</p>
            <p className="text-2xl font-bold text-white mt-0.5">7 Days</p>
            <p className="text-[11px] font-semibold text-amber-400 mt-1 font-mono">
              Keep it up! 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Reward Badges & Achievements Showcase Section */}
      <BadgesShowcase onViewAll={() => onNavigate('settings')} />

      {/* Main Grid: Charts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Performance Progression Trajectory</h3>
              <p className="text-xs text-slate-400">Track score improvement across last 6 debate rounds</p>
            </div>
            <select className="text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-900 font-mono text-slate-300">
              <option>Last 6 Sessions</option>
              <option>Last 12 Sessions</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PERFORMANCE_SCORES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="sessionDate" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overallScore" 
                  name="Average Score"
                  stroke="#818cf8" 
                  strokeWidth={3} 
                  dot={{ fill: '#818cf8', r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Sessions List (1 Col) */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Upcoming Sessions</h3>
            <button onClick={() => onNavigate('my-debates')} className="text-xs font-semibold text-indigo-400 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  In 2 days
                </span>
                <p className="font-bold text-white text-xs mt-1">Policy Debate Practice</p>
                <p className="text-[11px] text-slate-400">Topic: Should social media be regulated?</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" /> 24 May 2025 • 6:00 PM
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-2" />
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                  In 4 days
                </span>
                <p className="font-bold text-white text-xs mt-1">AI Debate Arena</p>
                <p className="text-[11px] text-slate-400">Difficulty: Intermediate</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" /> 26 May 2025 • 7:00 PM
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Skill Progress Radar Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Skill Chart (1 Col) */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Skill Progress Radar</h3>
            <p className="text-xs text-slate-400">6 Dimension Assessment vs Average Learner</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MOCK_SKILL_PROGRESS}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="You" dataKey="userScore" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                <Radar name="Average Learner" dataKey="averageScore" stroke="#475569" fill="#475569" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="font-medium text-slate-200">You (85 Avg)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="font-medium text-slate-400">Average Learner (65 Avg)</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (1 Col) */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Recent Activity</h3>
            <button onClick={() => onNavigate('my-debates')} className="text-xs font-semibold text-indigo-400 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-200">Debate completed: "AI Regulation"</p>
                <p className="text-slate-400 text-[11px]">Score: 82/100 • Evaluated by Agent 1 & Agent 2</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">19 May</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-200">Speech analyzed: "Renewable Energy"</p>
                <p className="text-slate-400 text-[11px]">Score: 76/100 • 142 WPM • 2 Filler words</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">17 May</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-200">Fallacy detected: Straw Man</p>
                <p className="text-slate-400 text-[11px]">Refocus suggestion provided by Referee Agent</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">16 May</span>
            </div>
          </div>
        </div>

        {/* Goals & Recommended For You (1 Col) */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base">Your Goals & Drills</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-300">Improve Argument Quality</span>
                <span className="font-bold text-indigo-400 font-mono">75%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-300">Speak More Confidently</span>
                <span className="font-bold text-indigo-400 font-mono">60%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/80 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-300">Reduce Filler Words</span>
                <span className="font-bold text-indigo-400 font-mono">40%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/80">
            <p className="text-xs font-bold text-slate-200 mb-2">Recommended For You</p>
            <button
              onClick={() => onNavigate('counterargument-gen')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Practice: Counterargument Drills</p>
                <p className="text-[11px] text-slate-400">Sharpen your rebuttal skills with Agent 2</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
