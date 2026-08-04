import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Debate Preparation");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get("/learner/notes").then((res) => setNotes(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const resetForm = () => { setTitle(""); setContent(""); setEditingId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      if (editingId) {
        await api.put(`/learner/notes/${editingId}`, { title, category, content });
      } else {
        await api.post("/learner/notes", { title, category, content });
      }
      resetForm();
      load();
    } catch { alert("Failed to save note"); }
  };

  const handleEdit = (n) => {
    setTitle(n.title); setCategory(n.category); setContent(n.content);
    setEditingId(n._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/learner/notes/${id}`).catch(() => {});
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Notes</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          + New Note
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3">
            <option>Debate Preparation</option>
            <option>Ideas for Next Debate</option>
            <option>General</option>
          </select>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Note content..."
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 min-h-[100px]" />
          <div className="flex gap-3">
            <button onClick={resetForm} className="text-gray-400 text-sm px-4 py-2">Cancel</button>
            <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
              Save
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {notes.map((n) => (
          <div key={n._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold">{n.title}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(n)} className="text-gray-500 hover:text-purple-400 text-xs">Edit</button>
                <button onClick={() => handleDelete(n._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
            <p className="text-purple-400 text-xs mb-2">{n.category}</p>
            <p className="text-gray-400 text-sm mb-2 line-clamp-3">{n.content}</p>
            <p className="text-gray-600 text-xs">Updated {new Date(n.updatedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
    </Layout>
  );
}

export default MyNotes;
