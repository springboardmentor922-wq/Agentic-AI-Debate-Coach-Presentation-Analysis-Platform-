import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "../../api/axios";
import IconStatCard from "../../components/IconStatCard";
import { getUser } from "../../utils/useAuth";

const BADGE_ICONS = {
  "first-steps": "🎯", "getting-started": "🔥", "debate-veteran": "🏆",
  "on-fire": "⚡", "unstoppable": "🚀", "logic-master": "🧠",
  "format-explorer": "🗺️", "well-rounded": "🌟"
};

const DIMENSION_TIPS = {
  communication: {
    label: "Communication clarity is your lowest score",
    action: "Practice with the Argument Analyzer to see clarity/relevance feedback",
    to: "/tools/argument-analyzer"
  },
  argument: {
    label: "Argument strength is your lowest score",
    action: "Try the Fallacy Detector to catch reasoning gaps before you debate",
    to: "/tools/fallacy-detector"
  },
  confidence: {
    label: "Confidence is your lowest score",
    action: "Record more turns in the Debate Room — confidence score comes from your phrasing",
    to: "/debate-room"
  }
};

const RADAR_AXES = [
  { key: "argumentQuality", label: "Argument Quality" },
  { key: "evidenceUsage", label: "Evidence Usage" },
  { key: "logicalConsistency", label: "Logical Consistency" },
  { key: "rebuttalEffectiveness", label: "Rebuttal Effectiveness" },
  { key: "communicationSkills", label: "Communication Skills" },
  { key: "confidence", label: "Confidence" }
];

function LearnerDashboard() {
  const user = getUser();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTopic, setScheduleTopic] = useState("");
  const [scheduleFormat, setScheduleFormat] = useState("One-on-One Debate");
  const [scheduleDate, setScheduleDate] = useState("");

  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalLabel, setGoalLabel] = useState("");
  const [goalDimension, setGoalDimension] = useState("argumentScore");
  const [goalTarget, setGoalTarget] = useState(80);

  const loadOverview = () => {
    api.get("/learner/overview")
      .then((res) => setOverview(res.data))
      .catch(() => setError("Could not load your dashboard data."));
  };

  const loadScheduledSessions = () => {
    api.get("/learner/scheduled-sessions").then((res) => setScheduledSessions(res.data)).catch(() => {});
  };

  const loadGoals = () => {
    api.get("/learner/goals").then((res) => setGoals(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadOverview();
    loadScheduledSessions();
    loadGoals();
    api.get("/topics").then((res) => setTopics(res.data)).catch(() => {});
  }, []);

  const handleSchedule = async () => {
    if (!scheduleTopic || !scheduleDate) return;
    try {
      await api.post("/learner/scheduled-sessions", {
        topic: scheduleTopic, format: scheduleFormat, scheduledFor: scheduleDate
      });
      setScheduleTopic(""); setScheduleDate(""); setShowScheduleForm(false);
      loadScheduledSessions();
    } catch {
      alert("Failed to schedule session");
    }
  };

  const handleDeleteScheduled = async (id) => {
    await api.delete(`/learner/scheduled-sessions/${id}`).catch(() => {});
    loadScheduledSessions();
  };

  const handleAddGoal = async () => {
    if (!goalLabel || !goalTarget) return;
    try {
      await api.post("/learner/goals", { label: goalLabel, dimension: goalDimension, targetValue: Number(goalTarget) });
      setGoalLabel(""); setShowGoalForm(false);
      loadGoals();
    } catch {
      alert("Failed to add goal");
    }
  };

  const handleDeleteGoal = async (id) => {
    await api.delete(`/learner/goals/${id}`).catch(() => {});
    loadGoals();
  };

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  const weakestDimension = () => {
    if (!overview?.dimensionAverages) return null;
    const entries = Object.entries(overview.dimensionAverages);
    if (entries.every(([, v]) => v === 0)) return null;
    return entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  };
  const tipKey = weakestDimension();

  const radarData = overview?.skillRadar
    ? RADAR_AXES.map((a) => ({
        axis: a.label,
        You: overview.skillRadar.you[a.key],
        "Average Learner": overview.skillRadar.average[a.key]
      }))
    : [];

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || "Learner"} 👋</h2>
        <p className="text-gray-400 text-sm">Keep practicing, keep improving.</p>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!overview ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <IconStatCard icon="🏆" label="Debates Participated" value={overview.debates} color="purple" />
            <IconStatCard icon="📈" label="Average Score" value={`${overview.score}%`} color="blue" />
            <IconStatCard icon="⭐" label="Skills Improved" value={overview.skillsImproved} sublabel="vs your last 5 sessions" color="green" />
            <IconStatCard icon="🔥" label="Current Streak" value={`${overview.streak} Days`} color="orange" />
          </div>

          {/* ---- PERFORMANCE OVERVIEW + UPCOMING SESSIONS + SKILL PROGRESS ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Performance Overview</h3>
              {overview.scoreTrend.length < 2 ? (
                <p className="text-gray-500 text-sm">Complete a few more debates to see your trend line.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={overview.scoreTrend}>
                    <CartesianGrid stroke="#2e303a" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                    <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ---- UPCOMING SESSIONS (real, user-scheduled) ---- */}
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">📅 Upcoming Sessions</h3>
                <button onClick={() => setShowScheduleForm((s) => !s)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  {showScheduleForm ? "Cancel" : "+ Schedule"}
                </button>
              </div>

              {showScheduleForm && (
                <div className="mb-4 space-y-2">
                  <select value={scheduleTopic} onChange={(e) => setScheduleTopic(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select topic</option>
                    {topics.map((t) => <option key={t._id} value={t.title}>{t.title}</option>)}
                  </select>
                  <select value={scheduleFormat} onChange={(e) => setScheduleFormat(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
                    <option>One-on-One Debate</option><option>Parliamentary Debate</option>
                    <option>Oxford Debate</option><option>Policy Debate</option>
                    <option>Public Forum Debate</option><option>AI Debate Simulation</option>
                  </select>
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm" />
                  <button onClick={handleSchedule} className="w-full bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold py-2 rounded-lg">
                    Schedule
                  </button>
                </div>
              )}

              {scheduledSessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions.map((s) => (
                    <div key={s._id} className="bg-[#0f0f1a] rounded-lg p-3 flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{s.topic}</p>
                        <p className="text-gray-500 text-xs">{s.format} · {new Date(s.scheduledFor).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">{daysUntil(s.scheduledFor)}</span>
                        <button onClick={() => handleDeleteScheduled(s._id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">🧭 Skill Progress</h3>
              {!overview.skillRadar ? (
                <p className="text-gray-500 text-sm">
                  Record at least one voice-mode debate to unlock your Skill Progress radar —
                  it needs the fallacy/argument analysis that only Record mode runs.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2e303a" />
                    <PolarAngleAxis dataKey="axis" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="You" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                    <Radar name="Average Learner" dataKey="Average Learner" stroke="#6b7280" fill="none" strokeDasharray="4 4" />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {tipKey ? (
            <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">⭐ Recommended For You</h3>
              <p className="text-gray-300 text-sm mb-1">{DIMENSION_TIPS[tipKey].label}</p>
              <Link to={DIMENSION_TIPS[tipKey].to} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                {DIMENSION_TIPS[tipKey].action} →
              </Link>
            </div>
          ) : overview.starterRecommendation ? (
            <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">⭐ Get Started</h3>
              <p className="text-gray-300 text-sm mb-1">
                Based on your onboarding survey, try {overview.starterRecommendation.format}
                {overview.starterRecommendation.topicTitle && <> — "{overview.starterRecommendation.topicTitle}"</>}
              </p>
              <Link to="/debate-room" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Start your first debate →
              </Link>
            </div>
          ) : null}

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">🏅 Badges</h3>
            {overview.badges.length === 0 ? (
              <p className="text-gray-500 text-sm">Complete your first debate to start earning badges.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {overview.badges.map((b) => (
                  <div key={b.id} className="bg-[#0f0f1a] border border-purple-500/20 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{BADGE_ICONS[b.id] || "🏅"}</div>
                    <p className="font-semibold text-sm">{b.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{b.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">📈 Topics Completed by Format</h3>
            <div className="space-y-4">
              {overview.topicsCompletedByFormat.map((f) => {
                const pct = Math.min(100, Math.round((f.completed / f.total) * 100));
                return (
                  <div key={f.format}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{f.format}</span>
                      <span className="text-gray-500">{f.completed} / {f.total}</span>
                    </div>
                    <div className="w-full bg-[#0f0f1a] rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Link to="/my-debates" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All →</Link>
              </div>
              {overview.recentActivity.length === 0 ? (
                <p className="text-gray-500">Continue practicing your debate sessions.</p>
              ) : (
                <ul className="space-y-3">
                  {overview.recentActivity.map((s) => (
                    <li key={s._id} className="border-b border-white/5 pb-3 last:border-0">
                      <p className="font-medium">{s.topic} <span className="text-gray-500 font-normal">({s.stance})</span></p>
                      <p className="text-sm text-gray-500">
                        {new Date(s.createdAt).toLocaleDateString()} · {s.format} ·
                        {" "}Comm {s.communicationScore}% · Arg {s.argumentScore}% · Conf {s.confidenceScore}%
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ---- YOUR GOALS (real, user-created + real progress) ---- */}
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">🎯 Your Goals</h3>
                <button onClick={() => setShowGoalForm((s) => !s)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  {showGoalForm ? "Cancel" : "Edit Goals"}
                </button>
              </div>

              {showGoalForm && (
                <div className="mb-4 space-y-2">
                  <input value={goalLabel} onChange={(e) => setGoalLabel(e.target.value)} placeholder="Goal label, e.g. Improve Argument Quality"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm" />
                  <select value={goalDimension} onChange={(e) => setGoalDimension(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
                    <option value="argumentScore">Argument Score</option>
                    <option value="communicationScore">Communication Score</option>
                    <option value="confidenceScore">Confidence Score</option>
                    <option value="fillerWordCount">Filler Words (lower is better)</option>
                  </select>
                  <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="Target value"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm" />
                  <button onClick={handleAddGoal} className="w-full bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold py-2 rounded-lg">
                    Add Goal
                  </button>
                </div>
              )}

              {goals.length === 0 ? (
                <p className="text-gray-500 text-sm">No goals set yet — add one to track real progress toward it.</p>
              ) : (
                <div className="space-y-4">
                  {goals.map((g) => (
                    <div key={g._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{g.label}</span>
                        <span className="text-gray-500 flex items-center gap-2">
                          {g.progress}%
                          <button onClick={() => handleDeleteGoal(g._id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                        </span>
                      </div>
                      <div className="w-full bg-[#0f0f1a] rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LearnerDashboard;
