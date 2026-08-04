import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachSkillGapAnalysis() {
  const [analysis, setAnalysis] = useState([]);
  useEffect(() => { api.get("/coach/skill-gap-analysis").then((res) => setAnalysis(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Skill Gap Analysis</h2>
      <p className="text-gray-500 mb-6">Each learner's weakest real dimension, with a concrete recommendation.</p>

      <div className="space-y-4 max-w-3xl">
        {analysis.map((a) => (
          <div key={a.learnerName} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">{a.learnerName}</p>
              <span className="text-gray-500 text-xs">{a.debates} debates</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {Object.entries(a.dimensions).map(([k, v]) => (
                <div key={k} className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs">{k}</p>
                  <p className={`font-bold ${a.weakestSkill === k ? "text-red-400" : "text-purple-300"}`}>{v ?? "—"}%</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">💡 {a.recommendation}</p>
          </div>
        ))}
        {analysis.length === 0 && <p className="text-gray-500">No learners assigned yet.</p>}
      </div>
    </Layout>
  );
}
export default CoachSkillGapAnalysis;
