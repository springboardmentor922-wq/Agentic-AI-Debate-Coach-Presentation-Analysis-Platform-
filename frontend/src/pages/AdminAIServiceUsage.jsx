import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function Bar({ label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{label}</span><span className="text-gray-500">{value} sessions ({pct}%)</span></div>
      <div className="w-full bg-[#0f0f1a] rounded-full h-2.5"><div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function AdminAIServiceUsage() {
  const [data, setData] = useState(null);
  const [perf, setPerf] = useState(null);
  const [perfError, setPerfError] = useState("");

  useEffect(() => {
    api.get("/admin/ai-service-usage").then((res) => setData(res.data)).catch(() => {});
    api.get("/admin/agent-performance")
      .then((res) => setPerf(res.data))
      .catch(() => setPerfError("Could not reach the AI engine for performance stats — it may be offline."));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">AI Models & Services</h2>
      <p className="text-gray-500 mb-6">Real usage counts of each AI engine. Model switching isn't available — nothing wires model choice to the database yet, it's set in the Python engine's .env.</p>

      {data && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
          <Bar label="Argument Analysis" value={data.argumentAnalysis} total={data.totalSessions} />
          <Bar label="Fallacy Detection" value={data.fallacyDetection} total={data.totalSessions} />
          <Bar label="Speech Analysis" value={data.speechAnalysis} total={data.totalSessions} />
          <Bar label="Presentation Scoring" value={data.presentationScoring} total={data.totalSessions} />
          <p className="text-gray-500 text-xs mt-4">{data.note}</p>
        </div>
      )}

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
        <h3 className="font-semibold mb-4">Real Latency & Token Usage (per agent call)</h3>
        {perfError && <p className="text-red-400 text-sm">{perfError}</p>}
        {perf && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="py-2">Agent</th><th className="py-2">Calls</th><th className="py-2">Avg Latency</th><th className="py-2">Avg Tokens</th>
              </tr>
            </thead>
            <tbody>
              {perf.map((p) => (
                <tr key={p.agent} className="border-b border-white/5">
                  <td className="py-3">{p.agent}</td>
                  <td className="py-3">{p.callCount}</td>
                  <td className="py-3">{p.avgLatencyMs} ms</td>
                  <td className="py-3">{p.avgTotalTokens ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {perf && perf.length === 0 && <p className="text-gray-500 text-sm">No agent calls logged yet.</p>}
        <p className="text-gray-500 text-xs mt-3">"N/A" tokens means the model didn't report usage for that call — never a fabricated number.</p>
      </div>
    </Layout>
  );
}
export default AdminAIServiceUsage;
