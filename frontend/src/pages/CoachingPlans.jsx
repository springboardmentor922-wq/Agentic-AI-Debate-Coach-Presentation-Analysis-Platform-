import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachingPlans() {
  const [plans, setPlans] = useState([]);
  const [learners, setLearners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [learnerId, setLearnerId] = useState("");
  const [title, setTitle] = useState("");
  const [milestonesText, setMilestonesText] = useState("");

  const load = () => api.get("/coach/coaching-plans").then((res) => setPlans(res.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get("/coach/learners").then((res) => setLearners(res.data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!learnerId || !title.trim()) return;
    const milestones = milestonesText.split("\n").map((m) => m.trim()).filter(Boolean);
    await api.post("/coach/coaching-plans", { learnerId, title, milestones }).catch(() => {});
    setTitle(""); setMilestonesText(""); setShowForm(false);
    load();
  };

  const toggleMilestone = async (planId, idx) => {
    await api.put(`/coach/coaching-plans/${planId}/milestone/${idx}`).catch(() => {});
    load();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coaching Plans</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          {showForm ? "Cancel" : "+ New Plan"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl mb-6">
          <select value={learnerId} onChange={(e) => setLearnerId(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
            <option value="">Select learner</option>
            {learners.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plan title, e.g. Rebuttal Mastery"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <textarea value={milestonesText} onChange={(e) => setMilestonesText(e.target.value)}
            placeholder="One milestone per line" className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[100px]" />
          <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Create Plan
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {plans.map((p) => {
          const done = p.milestones.filter((m) => m.completed).length;
          const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0;
          return (
            <div key={p._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
              <p className="font-semibold mb-1">{p.title}</p>
              <p className="text-gray-500 text-sm mb-3">{p.learnerId?.name}</p>
              <div className="w-full bg-[#0f0f1a] rounded-full h-2 mb-3">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="space-y-1">
                {p.milestones.map((m, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(p._id, i)} />
                    <span className={m.completed ? "line-through text-gray-500" : ""}>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        {plans.length === 0 && <p className="text-gray-500">No coaching plans yet.</p>}
      </div>
    </Layout>
  );
}
export default CoachingPlans;
