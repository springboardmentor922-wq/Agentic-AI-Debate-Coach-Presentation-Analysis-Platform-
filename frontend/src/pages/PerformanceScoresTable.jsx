import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function PerformanceScoresTable() {
  const user = getUser();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get(`/session/${user.id}`).then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Performance Scores</h2>
      <p className="text-gray-500 mb-6">Debate Score / Presentation Score / Overall — every session, real numbers.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 w-full max-w-4xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="py-2">Date</th>
              <th className="py-2">Debate Score</th>
              <th className="py-2">Presentation Score</th>
              <th className="py-2">Overall Score</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const debateScore = s.argumentScore;
              const presentationScore = Math.round((s.communicationScore + s.confidenceScore) / 2);
              const overall = Math.round((debateScore + presentationScore) / 2);
              return (
                <tr key={s._id} className="border-b border-white/5">
                  <td className="py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">{debateScore}%</td>
                  <td className="py-3">{presentationScore}%</td>
                  <td className="py-3 text-purple-400 font-semibold">{overall}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sessions.length === 0 && <p className="text-gray-500 mt-4">No sessions yet.</p>}
      </div>
    </Layout>
  );
}

export default PerformanceScoresTable;
