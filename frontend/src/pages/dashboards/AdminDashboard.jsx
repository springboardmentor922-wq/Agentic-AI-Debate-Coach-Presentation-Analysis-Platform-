import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import IconStatCard from "../../components/IconStatCard";
import { getUser } from "../../utils/useAuth";

const ROLE_COLORS = { Learners: "#a855f7", Coaches: "#22c55e", Educators: "#f97316", Admins: "#3b82f6" };

function AdminDashboard() {
  const user = getUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/overview").then((res) => setData(res.data)).catch(() => setError("Could not load admin data."));
  }, []);

  const roleDistribution = data ? [
    { name: "Learners", value: data.counts.learners },
    { name: "Coaches", value: data.counts.coaches },
    { name: "Educators", value: data.counts.educators },
    { name: "Admins", value: data.counts.admins }
  ].filter((d) => d.value > 0) : [];

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-700/30 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || "Admin"} 👋</h2>
        <p className="text-gray-400 text-sm">Monitor and manage the platform.</p>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!data ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <IconStatCard icon="👥" label="Total Users" value={data.counts.totalUsers} color="purple" />
            <IconStatCard icon="🎓" label="Learners" value={data.counts.learners} color="blue" />
            <IconStatCard icon="🧑‍🏫" label="Coaches" value={data.counts.coaches} color="green" />
            <IconStatCard icon="🏫" label="Educators" value={data.counts.educators} color="orange" />
            <IconStatCard icon="📝" label="Debates Conducted" value={data.totalDebates} color="teal" />
            <IconStatCard icon="📊" label="Avg Platform Score" value={`${data.avgPlatformScore}%`} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📈 User Growth</h3>
              {data.userGrowth.length < 2 ? <p className="text-gray-500 text-sm">Not enough signup history yet.</p> : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid stroke="#2e303a" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {Object.entries(ROLE_COLORS).map(([key, color]) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">🍩 User Role Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={roleDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                    {roleDistribution.map((d) => <Cell key={d.name} fill={ROLE_COLORS[d.name]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-500">Pending Evaluations</p><p className="text-xl font-bold text-orange-400">{data.pendingEvaluations}</p></div>
              <div><p className="text-gray-500">AI Analyses Completed</p><p className="text-xl font-bold text-green-400">{data.aiAnalysesCompleted}</p></div>
              <div><p className="text-gray-500">Total Sessions</p><p className="text-xl font-bold text-purple-400">{data.totalDebates}</p></div>
              <div><p className="text-gray-500">Total Users</p><p className="text-xl font-bold text-blue-400">{data.counts.totalUsers}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Link to="/admin/users" className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center"><div className="text-2xl mb-1">👥</div><p className="text-sm text-gray-300">User Management</p></Link>
            <Link to="/admin/content-management" className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center"><div className="text-2xl mb-1">🗂️</div><p className="text-sm text-gray-300">Content Management</p></Link>
            <Link to="/admin/support-tickets" className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center"><div className="text-2xl mb-1">🎫</div><p className="text-sm text-gray-300">Support Tickets</p></Link>
            <Link to="/admin/audit-logs" className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-xl p-4 text-center"><div className="text-2xl mb-1">📜</div><p className="text-sm text-gray-300">Audit Logs</p></Link>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
