import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorPresentationReports() {
  const [reports, setReports] = useState([]);
  useEffect(() => { api.get("/educator/presentation-reports").then((res) => setReports(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Presentation Reports</h2>
      <p className="text-gray-500 mb-6">Real delivery metrics from every voice-mode session across all learners.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-4xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="py-2">Learner</th><th className="py-2">Topic</th><th className="py-2">Clarity</th>
              <th className="py-2">Confidence</th><th className="py-2">Engagement</th><th className="py-2">Pace</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id} className="border-b border-white/5">
                <td className="py-3">{r.learnerName}</td>
                <td className="py-3 text-gray-400">{r.topic}</td>
                <td className="py-3">{r.clarity}%</td>
                <td className="py-3">{r.confidence}%</td>
                <td className="py-3">{r.engagement ?? "N/A"}%</td>
                <td className="py-3">{r.pace ? `${r.pace} WPM` : "N/A"} ({r.paceStatus})</td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <p className="text-gray-500 mt-4">No voice-mode sessions yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorPresentationReports;
