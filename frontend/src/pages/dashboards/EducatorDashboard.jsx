import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import IconStatCard from "../../components/IconStatCard";
import { getUser } from "../../utils/useAuth";

const COLORS = { Excellent: "#22c55e", Good: "#3b82f6", Average: "#f97316", "Needs Improvement": "#ef4444" };

const QUICK_ACTIONS = [
  { to: "/educator/classes", label: "My Classes", icon: "🏫" },
  { to: "/educator/learners", label: "Learners", icon: "👥" },
  { to: "/educator/evaluation-queue", label: "Evaluation Queue", icon: "✅" },
  { to: "/educator/skill-gap-analysis", label: "Skill Gaps", icon: "🧭" },
];

function EducatorDashboard() {
  const user = getUser();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/educator/overview").then((res) => setOverview(res.data)).catch(() => setError("Could not load analytics."));
  }, []);

  const distributionData = overview
    ? Object.entries(overview.distribution).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || "Educator"} 👋</h2>
        <p className="text-gray-400 text-sm">Monitor your learners, review performance, and guide them to excel.</p>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!overview ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <IconStatCard icon="👥" label="Total Learners" value={overview.totalLearners} color="purple" />
            <IconStatCard icon="📝" label="Total Sessions" value={overview.totalSessions} color="blue" />
            <IconStatCard icon="📊" label="Average Score" value={`${overview.averageScore}%`} color="green" />
            <IconStatCard icon="🏆" label="Top Performer" value={overview.topPerformer} color="orange" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to} className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-sm text-gray-300">{a.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Class Performance Trend</h3>
              {overview.performanceTrend.length < 2 ? <p className="text-gray-500 text-sm">Not enough data yet.</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={overview.performanceTrend}>
                    <CartesianGrid stroke="#2e303a" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                    <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">🍩 Performance Distribution</h3>
              {distributionData.length === 0 ? <p className="text-gray-500 text-sm">No scored sessions yet.</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {distributionData.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {overview.recentActivity.length === 0 ? <p className="text-gray-500 text-sm">No activity yet.</p> : (
              <ul className="space-y-2 max-h-[220px] overflow-y-auto">
                {overview.recentActivity.map((a) => (
                  <li key={a._id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                    <span className="font-medium">{a.learnerName}</span> — "{a.topic}" — {a.score}%
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EducatorDashboard;
