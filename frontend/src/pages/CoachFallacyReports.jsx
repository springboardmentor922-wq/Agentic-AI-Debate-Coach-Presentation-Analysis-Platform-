import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachFallacyReports() {
  const [reports, setReports] = useState([]);
  useEffect(() => { api.get("/coach/fallacy-reports").then((res) => setReports(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Fallacy Reports</h2>
      <p className="text-gray-500 mb-6">Logical fallacies detected across your assigned learners' voice-mode sessions.</p>

      <div className="space-y-3 max-w-3xl">
        {reports.map((r) => (
          <div key={r._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold">{r.learnerName} — {r.topic}</p>
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">{r.fallacyType}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">"{r.offendingText}"</p>
            <p className="text-gray-500 text-sm">{r.explanation}</p>
            <p className="text-purple-300 text-sm mt-1">{r.correctionSuggestion}</p>
          </div>
        ))}
        {reports.length === 0 && <p className="text-gray-500">No fallacies detected yet — good sign!</p>}
      </div>
    </Layout>
  );
}
export default CoachFallacyReports;
