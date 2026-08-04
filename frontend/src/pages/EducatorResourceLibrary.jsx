import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Article");
  const [url, setUrl] = useState("");

  const load = () => api.get("/resources").then((res) => setResources(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    await api.post("/resources", { title, type, url }).catch(() => {});
    setTitle(""); setUrl(""); setShowForm(false);
    load();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resource Library</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          {showForm ? "Cancel" : "+ Add Resource"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl mb-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
            <option>Article</option><option>Video</option><option>PDF</option><option>Other</option>
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Add
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {resources.map((r) => (
          <a key={r._id} href={r.url} target="_blank" rel="noopener noreferrer"
            className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-2xl p-5 block">
            <span className="text-purple-400 text-xs">{r.type}</span>
            <p className="font-semibold mt-1">{r.title}</p>
          </a>
        ))}
        {resources.length === 0 && <p className="text-gray-500">No resources yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorResourceLibrary;
