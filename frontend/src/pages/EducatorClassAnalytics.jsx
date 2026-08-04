import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorClassAnalytics() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/educator/classes").then((res) => setClasses(res.data)).catch(() => {}); }, []);

  const loadAnalytics = async (id) => {
    setClassId(id);
    if (!id) { setData(null); return; }
    const res = await api.get(`/educator/class-analytics/${id}`).catch(() => null);
    setData(res?.data || null);
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Class Analytics</h2>
      <p className="text-gray-500 mb-6">Real performance trends and metrics for a selected class.</p>

      <select value={classId} onChange={(e) => loadAnalytics(e.target.value)} className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-3 mb-6">
        <option value="">Select a class</option>
        {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      {data && (
        <>
          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 mb-6 max-w-4xl">
            <h3 className="font-semibold mb-4">Trend ({data.sessionCount} sessions)</h3>
            {data.trend.length < 2 ? <p className="text-gray-500 text-sm">Not enough data yet.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.trend}>
                  <CartesianGrid stroke="#2e303a" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #2e303a" }} />
                  <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-4xl">
            {Object.entries(data.metrics).map(([k, v]) => (
              <div key={k} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-xs mb-1">{k}</p>
                <p className="text-2xl font-bold text-purple-300">{v}%</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
export default EducatorClassAnalytics;
