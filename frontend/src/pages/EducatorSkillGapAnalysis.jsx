import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorSkillGapAnalysis() {
  const [gaps, setGaps] = useState([]);
  useEffect(() => { api.get("/educator/skill-gap-analysis").then((res) => setGaps(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Skill Gap Analysis</h2>
      <p className="text-gray-500 mb-6">Class-wide weak points, ranked lowest first — real averages across all learners.</p>

      <div className="space-y-4 max-w-2xl">
        {gaps.map((g) => (
          <div key={g.skill} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{g.skill}</p>
              <span className={`font-bold ${g.average != null && g.average < 60 ? "text-red-400" : "text-purple-300"}`}>
                {g.average != null ? `${g.average}%` : "No data"}
              </span>
            </div>
            <div className="w-full bg-[#0f0f1a] rounded-full h-2.5">
              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${g.average || 0}%` }} />
            </div>
            <p className="text-gray-500 text-xs mt-2">Based on {g.sampleSize} sessions</p>
          </div>
        ))}
        {gaps.length === 0 && <p className="text-gray-500">No data yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorSkillGapAnalysis;
