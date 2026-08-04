import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import IconStatCard from "../../components/IconStatCard";
import { getUser } from "../../utils/useAuth";

const QUICK_ACTIONS = [
  { to: "/coach/learners", label: "View Learners", icon: "👥" },
  { to: "/reports", label: "Review Sessions", icon: "📝" },
  { to: "/coach/fallacy-reports", label: "Fallacy Reports", icon: "⚠️" },
  { to: "/coach/skill-gap-analysis", label: "Skill Gaps", icon: "🧭" },
];

function CoachDashboard() {
  const user = getUser();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/coach/overview").then((res) => setOverview(res.data)).catch(() => setError("Could not load your dashboard data."));
  }, []);

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || "Coach"} 👋</h2>
        <p className="text-gray-400 text-sm">Empower learners. Evaluate performance. Build champions.</p>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!overview ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <IconStatCard icon="👥" label="Assigned Students" value={overview.assignedStudents} color="purple" />
            <IconStatCard icon="✅" label="Sessions Reviewed" value={overview.sessionsReviewed} color="green" />
            <IconStatCard icon="⏳" label="Pending Feedback" value={overview.pendingFeedback} color="orange" />
          </div>

          {/* ---- QUICK ACTIONS ---- */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to} className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-sm text-gray-300">{a.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* ---- PERFORMANCE TRENDS ---- */}
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Performance Trends (All Learners)</h3>
              {overview.performanceTrend.length < 2 ? (
                <p className="text-gray-500 text-sm">Not enough data yet across your learners.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={overview.performanceTrend}>
                    <CartesianGrid stroke="#2e303a" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                    <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ---- RECENT ACTIVITY ---- */}
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {overview.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity from your learners yet.</p>
              ) : (
                <ul className="space-y-3 max-h-[220px] overflow-y-auto">
                  {overview.recentActivity.map((a) => (
                    <li key={a._id} className="border-b border-white/5 pb-2 last:border-0 text-sm">
                      <span className="font-medium">{a.learnerName}</span> submitted "{a.topic}" — {a.score}%
                      {!a.reviewedByCoach && <span className="text-orange-400 ml-2">Needs review</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assigned Learners</h3>
              <Link to="/coach/learners" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All →</Link>
            </div>
            {overview.learners.length === 0 ? (
              <p className="text-gray-500">No learners assigned yet — learners can select you from their Profile page.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Experience</th><th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {overview.learners.slice(0, 5).map((l) => (
                    <tr key={l._id} className="border-b border-white/5">
                      <td className="py-3">{l.name}</td>
                      <td className="py-3 text-gray-400">{l.email}</td>
                      <td className="py-3">{l.experience}</td>
                      <td className="py-3 text-right">
                        <Link to={`/reports?learner=${l._id}`} className="text-purple-400 hover:text-purple-300 font-medium">Review sessions →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CoachDashboard;
