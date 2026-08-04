import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorEvaluationQueue() {
  const [queue, setQueue] = useState([]);
  const [drafts, setDrafts] = useState({});

  const load = () => api.get("/educator/evaluation-queue").then((res) => setQueue(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (sessionId) => {
    await api.put(`/educator/evaluate/${sessionId}`, { educatorFeedback: drafts[sessionId] || "" }).catch(() => {});
    load();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Evaluation Queue</h2>
      <p className="text-gray-500 mb-6">Sessions across all learners waiting for your review.</p>

      <div className="space-y-4 max-w-3xl">
        {queue.map((s) => (
          <div key={s._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold">{s.learnerName} — {s.topic}</p>
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">{s.argument}</p>
            <p className="text-sm text-gray-500 mb-3">
              Comm {s.communicationScore}% · Arg {s.argumentScore}% · Conf {s.confidenceScore}%
            </p>
            <textarea placeholder="Write your evaluation feedback..." className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm"
              value={drafts[s._id] || ""} onChange={(e) => setDrafts({ ...drafts, [s._id]: e.target.value })} />
            <button onClick={() => submit(s._id)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
              Mark Reviewed
            </button>
          </div>
        ))}
        {queue.length === 0 && <p className="text-gray-500">Queue is empty — nice work!</p>}
      </div>
    </Layout>
  );
}
export default EducatorEvaluationQueue;
