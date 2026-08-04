import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorRubrics() {
  const [rubrics, setRubrics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [criteriaText, setCriteriaText] = useState("");

  const load = () => api.get("/educator/rubrics").then((res) => setRubrics(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const criteria = criteriaText.split("\n").filter(Boolean).map((line) => {
      const [name, maxScore] = line.split(":").map((s) => s.trim());
      return { name, maxScore: Number(maxScore) || 100 };
    });
    await api.post("/educator/rubrics", { title, criteria }).catch(() => {});
    setTitle(""); setCriteriaText(""); setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/educator/rubrics/${id}`).catch(() => {});
    load();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rubrics & Criteria</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          {showForm ? "Cancel" : "+ New Rubric"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl mb-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rubric title, e.g. Debate Evaluation Rubric"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <textarea value={criteriaText} onChange={(e) => setCriteriaText(e.target.value)}
            placeholder={"One criterion per line, format: Name: MaxScore\ne.g.\nArgument Quality: 30\nEvidence Usage: 20"}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[100px]" />
          <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Save Rubric
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {rubrics.map((r) => (
          <div key={r._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold">{r.title}</p>
              <button onClick={() => handleDelete(r._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
            </div>
            <div className="space-y-1">
              {r.criteria.map((c, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-400">
                  <span>{c.name}</span><span>{c.maxScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rubrics.length === 0 && <p className="text-gray-500">No rubrics yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorRubrics;
