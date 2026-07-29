import React from 'react';
import { BarChart3, Download, TrendingUp, Brain, Zap, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area } from 'recharts';
import { MOCK_PERFORMANCE_SCORES, MOCK_SKILL_PROGRESS } from '../../data/mockData';

export const PerformanceScoresView: React.FC = () => {
  // Extract last 5 sessions for the mini sparkline charts
  const last5Sessions = MOCK_PERFORMANCE_SCORES.slice(-5);

  const currentLogicScore = last5Sessions[last5Sessions.length - 1]?.logicalConsistency || 86;
  const initialLogicScore = last5Sessions[0]?.logicalConsistency || 65;
  const logicDiff = currentLogicScore - initialLogicScore;

  const currentRhetoricScore = last5Sessions[last5Sessions.length - 1]?.communicationSkills || 89;
  const initialRhetoricScore = last5Sessions[0]?.communicationSkills || 70;
  const rhetoricDiff = currentRhetoricScore - initialRhetoricScore;

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Performance Scores & Analytics</h2>
              <p className="text-xs text-slate-400">Evaluated by Performance Analytics Agent (Trajectory, Skill gaps, Telemetry)</p>
            </div>
          </div>

          <button
            onClick={() => alert("Exporting Performance Analytics PDF Report...")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start"
          >
            <Download className="w-4 h-4" /> Export Performance Report
          </button>
        </div>
      </div>

      {/* Mini Sparklines Section: Last 5 Sessions Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Last 5 Sessions Progress Sparklines</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">5-Session Rolling Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sparkline 1: Logic & Consistency Progress */}
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>Logic & Consistency Progress</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{currentLogicScore}</span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{logicDiff} pts (Last 5)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700">
                STRICT REFEREE AGENT
              </span>
            </div>

            {/* Recharts Mini Sparkline Chart for Logic */}
            <div className="h-24 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last5Sessions} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="logicGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}/100`, 'Logic Score']}
                    labelFormatter={(label: any, items: any[]) => items[0]?.payload?.sessionName || label}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="logicalConsistency" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#logicGradient)" 
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span>{last5Sessions[0]?.sessionName} ({last5Sessions[0]?.sessionDate})</span>
              <span>Latest: {last5Sessions[last5Sessions.length - 1]?.sessionName}</span>
            </div>
          </div>

          {/* Sparkline 2: Rhetorical & Persuasive Strength */}
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Rhetorical & Persuasive Strength</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{currentRhetoricScore}</span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{rhetoricDiff} pts (Last 5)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700">
                RIVAL AGENT SYNTHESIS
              </span>
            </div>

            {/* Recharts Mini Sparkline Chart for Rhetoric */}
            <div className="h-24 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last5Sessions} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="rhetoricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}/100`, 'Rhetoric Score']}
                    labelFormatter={(label: any, items: any[]) => items[0]?.payload?.sessionName || label}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="communicationSkills" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#rhetoricGradient)" 
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span>{last5Sessions[0]?.sessionName} ({last5Sessions[0]?.sessionDate})</span>
              <span>Latest: {last5Sessions[last5Sessions.length - 1]?.sessionName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trajectory Line Chart */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base">Score Progression Trajectory</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PERFORMANCE_SCORES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="sessionDate" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="overallScore" stroke="#818cf8" strokeWidth={3} name="Overall Score" dot={{ fill: '#818cf8', r: 4 }} />
                <Line type="monotone" dataKey="argumentQuality" stroke="#34d399" strokeWidth={2} name="Argument Logic" dot={{ fill: '#34d399', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Dimensions Bar Chart */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base">Skill Dimension Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SKILL_PROGRESS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="dimension" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="userScore" fill="#818cf8" radius={[6, 6, 0, 0]} name="Your Score" />
                <Bar dataKey="averageScore" fill="#475569" radius={[6, 6, 0, 0]} name="Avg Learner" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Sessions Table */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
          <span>Debate Sessions Score Log</span>
          <span className="text-xs font-normal text-slate-400">Showing all evaluated sessions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Session Name</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Overall Score</th>
                <th className="p-3.5">Argument Quality</th>
                <th className="p-3.5">Evidence Usage</th>
                <th className="p-3.5">Logical Consistency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_PERFORMANCE_SCORES.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-300">{s.sessionName}</td>
                  <td className="p-3.5 text-slate-400 font-mono">{s.sessionDate}</td>
                  <td className="p-3.5 font-extrabold text-white font-mono">{s.overallScore}/100</td>
                  <td className="p-3.5 text-emerald-400 font-semibold font-mono">{s.argumentQuality}</td>
                  <td className="p-3.5 text-slate-300 font-semibold font-mono">{s.evidenceUsage}</td>
                  <td className="p-3.5 text-cyan-400 font-semibold font-mono">{s.logicalConsistency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

