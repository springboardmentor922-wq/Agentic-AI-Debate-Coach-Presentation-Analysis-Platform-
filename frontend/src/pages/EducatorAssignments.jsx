import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const load = () => api.get("/educator/assignments").then((res) => setAssignments(res.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get("/educator/classes").then((res) => setClasses(res.data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!classId || !title.trim() || !dueDate) return;
    await api.post("/educator/assignments", { classId, title, description, dueDate }).catch(() => {});
    setTitle(""); setDescription(""); setDueDate(""); setShowForm(false);
    load();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          {showForm ? "Cancel" : "+ New Assignment"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl mb-6">
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[80px]" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Publish
          </button>
        </div>
      )}

      <div className="space-y-3 max-w-3xl">
        {assignments.map((a) => (
          <div key={a._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">{a.title}</p>
              <span className="text-gray-500 text-xs">Due {new Date(a.dueDate).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{a.classId?.name}</p>
            <p className="text-gray-400 text-sm mb-2">{a.description}</p>
            <p className="text-purple-400 text-sm">{a.submissions.length} submissions</p>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-gray-500">No assignments yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorAssignments;
