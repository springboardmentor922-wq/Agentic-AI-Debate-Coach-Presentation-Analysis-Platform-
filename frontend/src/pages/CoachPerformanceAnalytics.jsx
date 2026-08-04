import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachPerformanceAnalytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/coach/performance-analytics").then((res) => setData(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Performance Analytics</h2>
      <p className="text-gray-500 mb-6">Real trends and per-learner comparison across everyone assigned to you.</p>

      {!data ? <p className="text-gray-500">Loading...</p> : (
        <>
          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 mb-6 max-w-4xl">
            <h3 className="font-semibold mb-4">Trend Chart (Group Average)</h3>
            {data.trend.length < 2 ? <p className="text-gray-500 text-sm">Not enough data yet.</p> : (
              <ResponsiveContainer width="100%" height={260}>
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

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-4xl">
            <h3 className="font-semibold mb-4">Compare Learners</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="py-2">Learner</th><th className="py-2">Debates</th><th className="py-2">Communication</th>
                  <th className="py-2">Argument</th><th className="py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.learnerComparison.map((l) => (
                  <tr key={l.name} className="border-b border-white/5">
                    <td className="py-3">{l.name}</td><td className="py-3">{l.debates}</td>
                    <td className="py-3">{l.communication}%</td><td className="py-3">{l.argument}%</td><td className="py-3">{l.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
export default CoachPerformanceAnalytics;
