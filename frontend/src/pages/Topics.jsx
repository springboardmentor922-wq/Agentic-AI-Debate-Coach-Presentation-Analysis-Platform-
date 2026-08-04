import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

const FORMATS = [
  "One-on-One Debate", "Parliamentary Debate", "Oxford Debate",
  "Policy Debate", "Public Forum Debate", "AI Debate Simulation"
];
const DIFFICULTIES = ["Beginner", "Intermediate", "Hard"];

function Topics() {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role?.toLowerCase();
  const canCreate = role === "educator" || role === "debate coach" || role === "admin";

  const [topics, setTopics] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [formatFilter, setFormatFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFormat, setNewFormat] = useState(FORMATS[0]);
  const [newDifficulty, setNewDifficulty] = useState(DIFFICULTIES[0]);

  const loadTopics = () => {
    const params = {};
    if (formatFilter) params.format = formatFilter;
    if (difficultyFilter) params.difficulty = difficultyFilter;
    api.get("/topics", { params }).then((res) => setTopics(res.data)).catch(() => setError("Could not load topics."));
  };

  useEffect(() => { loadTopics(); }, [formatFilter, difficultyFilter]);

  useEffect(() => {
    if (role === "learner") {
      api.get("/learner/assigned-topics").then((res) => setAssigned(res.data)).catch(() => {});
    }
  }, [role]);

  const handlePractice = (topic) => {
    navigate("/debate-room", { state: { presetTopic: topic.title, presetFormat: topic.format } });
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post("/topics", { title: newTitle, format: newFormat, difficulty: newDifficulty });
      setNewTitle(""); setShowForm(false);
      loadTopics();
    } catch { alert("Failed to create topic"); }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Practice Topics</h2>
        {canCreate && (
          <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
            {showForm ? "Cancel" : "+ Create Topic"}
          </button>
        )}
      </div>
      <p className="text-gray-500 mb-6">Explore debate topics across formats and difficulty levels.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl mb-6">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Topic title"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Create
          </button>
        </div>
      )}

      {/* ✅ REAL — topics an educator actually assigned to a class this learner is in */}
      {role === "learner" && assigned.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">📌 Assigned to You</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assigned.map((a) => (
              <div key={a.topicId} className="bg-[#1a1a2b] border border-purple-500/30 rounded-xl p-4">
                <p className="font-medium mb-1">{a.title}</p>
                <p className="text-gray-500 text-xs mb-3">
                  {a.format} · {a.difficulty} · assigned by {a.educatorName} for {a.className} · {new Date(a.assignedAt).toLocaleDateString()}
                </p>
                <button onClick={() => handlePractice(a)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Practice →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-2 text-sm">
          <option value="">All Formats</option>
          {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-2 text-sm">
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div key={t._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <p className="font-medium mb-1">{t.title}</p>
            <p className="text-gray-500 text-xs mb-3">{t.format} · {t.difficulty}</p>
            {role === "learner" && (
              <button onClick={() => handlePractice(t)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Practice →
              </button>
            )}
          </div>
        ))}
        {topics.length === 0 && <p className="text-gray-500">No topics match these filters.</p>}
      </div>
    </Layout>
  );
}
export default Topics;
