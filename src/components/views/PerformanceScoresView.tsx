import React from 'react';
import { BarChart3, Download, TrendingUp, Brain, Zap, Sparkles, ShieldCheck, Activity, Scale, Award } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MOCK_PERFORMANCE_SCORES, MOCK_SKILL_PROGRESS } from '../../data/mockData';
import { PDFReportService } from '../../services/PDFReportService';

export const PerformanceScoresView: React.FC = () => {
  // Extract last 5 sessions for the mini sparkline charts
  const last5Sessions = MOCK_PERFORMANCE_SCORES.slice(-5);
  const latestSession = MOCK_PERFORMANCE_SCORES[MOCK_PERFORMANCE_SCORES.length - 1];

  const currentLogicScore = last5Sessions[last5Sessions.length - 1]?.logicalConsistency || 86;
  const initialLogicScore = last5Sessions[0]?.logicalConsistency || 65;
  const logicDiff = currentLogicScore - initialLogicScore;

  const currentRhetoricScore = last5Sessions[last5Sessions.length - 1]?.communicationSkills || 89;
  const initialRhetoricScore = last5Sessions[0]?.communicationSkills || 70;
  const rhetoricDiff = currentRhetoricScore - initialRhetoricScore;

  // 5-Point Radar Data for Latest Session based on Official Formula:
  // 30% Argument Quality, 20% Evidence Usage, 20% Logical Consistency, 15% Rebuttal Effectiveness, 15% Communication Skills
  const radarData = [
    { subject: 'Argument Quality (30%)', score: latestSession?.argumentQuality || 88, fullMark: 100 },
    { subject: 'Evidence Usage (20%)', score: latestSession?.evidenceUsage || 82, fullMark: 100 },
    { subject: 'Logical Consistency (20%)', score: latestSession?.logicalConsistency || 86, fullMark: 100 },
    { subject: 'Rebuttal Effectiveness (15%)', score: latestSession?.rebuttalEffectiveness || 84, fullMark: 100 },
    { subject: 'Communication Skills (15%)', score: latestSession?.communicationSkills || 89, fullMark: 100 },
  ];

  const calculatedWeightedScore = Math.round(
    (radarData[0].score * 0.3) +
    (radarData[1].score * 0.2) +
    (radarData[2].score * 0.2) +
    (radarData[3].score * 0.15) +
    (radarData[4].score * 0.15)
  );

  const handleExportPerformanceReport = () => {
    PDFReportService.exportDebateSessionPDF({
      id: 'DEB-ANALYTICS',
      topic: latestSession?.sessionName || 'Universal Basic Income and Innovation Economy',
      format: 'Oxford / Policy Debate',
      stance: 'AFFIRMATIVE',
      score: calculatedWeightedScore,
      date: latestSession?.sessionDate || new Date().toLocaleDateString(),
      aggregateBreakdown: {
        argumentQuality: radarData[0].score,
        evidenceUsage: radarData[1].score,
        logicalConsistency: radarData[2].score,
        rebuttalEffectiveness: radarData[3].score,
        communicationSkills: radarData[4].score
      },
      turns: [
        {
          id: 'turn_perf_01',
          turnNumber: 1,
          speaker: 'user',
          userSpeech: 'Universal basic income establishes an uncompromised floor that unlocks high-risk entrepreneurship and long-term innovation.',
          aiRebuttal: 'Capital transfer mechanisms risk distorting labor elasticity and accelerating localized inflation without productivity parity.',
          scores: {
            argumentQuality: radarData[0].score,
            evidenceUsage: radarData[1].score,
            logicalConsistency: radarData[2].score,
            rebuttalEffectiveness: radarData[3].score,
            communicationSkills: radarData[4].score,
            weightedTotal: calculatedWeightedScore
          }
        }
      ]
    }, {
      coachNotes: 'Demonstrated superior logical cohesion and structured rebuttal agility across rolling 5-session telemetry.'
    });
  };

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
              <p className="text-xs text-slate-400">Evaluated by Performance Analytics Agent using the Official Weighted Scoring Formula</p>
            </div>
          </div>

          <button
            onClick={handleExportPerformanceReport}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Performance Report
          </button>
        </div>

        {/* Official Weighted Formula Banner */}
        <div className="bg-indigo-950/60 border border-indigo-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              Official Performance Score Formula:
            </span>
            <p className="font-mono text-slate-200 text-[11px] leading-relaxed">
              Score = <span className="text-emerald-400 font-bold">(30% × Argument Quality)</span> + <span className="text-cyan-400 font-bold">(20% × Evidence Usage)</span> + <span className="text-amber-400 font-bold">(20% × Logical Consistency)</span> + <span className="text-purple-400 font-bold">(15% × Rebuttal Effectiveness)</span> + <span className="text-pink-400 font-bold">(15% × Communication Skills)</span>
            </p>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-indigo-400/30 text-center shrink-0">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Weighted Score</span>
            <span className="text-2xl font-black text-indigo-300 font-mono">{calculatedWeightedScore}/100</span>
          </div>
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
                    labelFormatter={(label: any, items: readonly any[]) => items[0]?.payload?.sessionName || label}
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
                    labelFormatter={(label: any, items: readonly any[]) => items[0]?.payload?.sessionName || label}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5-Point Skill Radar Chart */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              5-Point Skill Radar Breakdown
            </h3>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              Latest Session
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-dimensional evaluation across the 5 core debate performance metrics
          </p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Performance" dataKey="score" stroke="#818cf8" fill="#6366f1" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trajectory Line Chart */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base">Score Progression Trajectory</h3>
          <p className="text-xs text-slate-400">Historical performance trends over past practice sessions</p>
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
          <p className="text-xs text-slate-400">Benchmarking user skills against average debater peer cohort</p>
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

