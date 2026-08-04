import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorClasses() {
  const [classes, setClasses] = useState([]);
  const [learners, setLearners] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [addLearnerId, setAddLearnerId] = useState({});
  const [assignTopicId, setAssignTopicId] = useState({});

  const load = () => api.get("/educator/classes").then((res) => setClasses(res.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get("/educator/overview").then((res) => setLearners(res.data.learners)).catch(() => {});
    api.get("/topics").then((res) => setTopics(res.data)).catch(() => {});
  }, []);

  const [justAssigned, setJustAssigned] = useState(null);

  const handleAssignTopic = async (classId) => {
    const topicId = assignTopicId[classId];
    if (!topicId) return;
    try {
      await api.put(`/educator/classes/${classId}/assign-topic`, { topicId });
      await load();
      setJustAssigned(classId);
      setTimeout(() => setJustAssigned(null), 2500);
    } catch {
      alert("Failed to assign topic — try again.");
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await api.post("/educator/classes", { name }).catch(() => {});
    setName(""); setShowForm(false);
    load();
  };

  const handleAddLearner = async (classId) => {
    const learnerId = addLearnerId[classId];
    if (!learnerId) return;
    await api.put(`/educator/classes/${classId}/add-learner`, { learnerId }).catch(() => {});
    load();
  };

  const handleRemoveLearner = async (classId, learnerId) => {
    await api.put(`/educator/classes/${classId}/remove-learner`, { learnerId }).catch(() => {});
    load();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Classes</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          {showForm ? "Cancel" : "+ Create Class"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-md mb-6">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name, e.g. B.Tech 3rd Year"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Create
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {classes.map((c) => (
          <div key={c._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{c.name}</p>
              <span className="text-purple-400 text-sm font-medium">{c.avgScore}% avg</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{c.learnerIds.length} learners · {c.sessionCount} sessions</p>
            <button onClick={() => setExpanded(expanded === c._id ? null : c._id)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              {expanded === c._id ? "Hide roster" : "Manage roster"}
            </button>

            {expanded === c._id && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="flex gap-2 mb-3">
                  <select value={addLearnerId[c._id] || ""} onChange={(e) => setAddLearnerId({ ...addLearnerId, [c._id]: e.target.value })}
                    className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
                    <option value="">Add a learner...</option>
                    {learners.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                  <button onClick={() => handleAddLearner(c._id)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm px-3 py-2 rounded-lg">
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {c.learnerIds.map((l) => (
                    <div key={l._id} className="flex justify-between items-center text-sm bg-[#0f0f1a] rounded-lg px-3 py-2">
                      <span>{l.name}</span>
                      <button onClick={() => handleRemoveLearner(c._id, l._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                  {c.learnerIds.length === 0 && <p className="text-gray-500 text-xs">No learners in this class yet.</p>}
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-gray-500 text-xs mb-2">Assign a practice topic</p>
                  <div className="flex gap-2 mb-2">
                    <select value={assignTopicId[c._id] || ""} onChange={(e) => setAssignTopicId({ ...assignTopicId, [c._id]: e.target.value })}
                      className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select topic...</option>
                      {topics.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
                    </select>
                    <button onClick={() => handleAssignTopic(c._id)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm px-3 py-2 rounded-lg">
                      Assign
                    </button>
                  </div>

                  {justAssigned === c._id && (
                    <p className="text-green-400 text-xs mb-2">✔ Topic assigned</p>
                  )}

                  {c.assignedTopics?.length > 0 ? (
                    <div className="space-y-1">
                      {c.assignedTopics.filter((a) => a.topicId).map((a) => (
                        <div key={a.topicId._id} className="bg-[#0f0f1a] rounded-lg px-3 py-2 text-sm text-gray-300 flex justify-between">
                          <span>{a.topicId.title} <span className="text-gray-500 text-xs">· {a.topicId.format}</span></span>
                          <span className="text-gray-500 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">No topics assigned to this class yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && <p className="text-gray-500">No classes created yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorClasses;
