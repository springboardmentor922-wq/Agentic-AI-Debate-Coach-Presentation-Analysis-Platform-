import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";

function EducatorKnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState(null);

  const load = () => aiEngine.get("/api/v1/knowledge/documents").then((res) => setDocs(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await aiEngine.post("/api/v1/knowledge/documents", { title, content });
      setTitle(""); setContent(""); setShowForm(false);
      load();
    } catch { alert("Failed to add document — make sure the AI engine is running."); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testQuery.trim()) return;
    const res = await aiEngine.get("/api/v1/knowledge/search", { params: { query: testQuery } }).catch(() => null);
    setTestResults(res?.data || []);
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Knowledge Base (RAG Grounding)</h2>
      <p className="text-gray-500 mb-6 max-w-2xl">
        Real documents you add here get embedded and retrieved by the AI Opponent during debates,
        so evidence-based rebuttals cite something real instead of an invented statistic. The
        Opponent also always searches live Wikipedia — this is a supplement, not a replacement.
      </p>

      <div className="flex justify-between items-center mb-4 max-w-2xl">
        <h3 className="font-semibold">Uploaded Documents</h3>
        <button onClick={() => setShowForm((s) => !s)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg">
          {showForm ? "Cancel" : "+ Add Document"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste the real reference text here..."
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[160px]" />
          <button onClick={handleAdd} disabled={saving} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            {saving ? "Embedding..." : "Add to Knowledge Base"}
          </button>
        </div>
      )}

      <div className="space-y-2 max-w-2xl mb-8">
        {docs.map((d) => (
          <div key={d.doc_id} className="bg-[#1a1a2b] border border-white/5 rounded-xl p-4">
            <p className="font-medium text-sm">{d.title}</p>
            <p className="text-gray-500 text-xs mt-1">{d.content_preview}...</p>
          </div>
        ))}
        {docs.length === 0 && <p className="text-gray-500 text-sm">No documents uploaded yet — the AI still uses live Wikipedia in the meantime.</p>}
      </div>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
        <h3 className="font-semibold mb-3">Test Retrieval</h3>
        <p className="text-gray-500 text-xs mb-3">See exactly what the AI Opponent would retrieve for a given topic — real results, live.</p>
        <div className="flex gap-2 mb-4">
          <input value={testQuery} onChange={(e) => setTestQuery(e.target.value)} placeholder="e.g. climate change carbon tax"
            className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleTest} className="bg-[#0f0f1a] border border-white/10 hover:border-purple-500 transition text-gray-300 text-sm px-4 py-2 rounded-lg">
            Search
          </button>
        </div>
        {testResults && (
          <div className="space-y-2">
            {testResults.map((r, i) => (
              <div key={i} className="bg-[#0f0f1a] rounded-lg p-3 text-sm">
                <p className="text-purple-400 text-xs mb-1">{r.source} — {r.title}</p>
                <p className="text-gray-400 text-xs">{r.snippet}</p>
              </div>
            ))}
            {testResults.length === 0 && <p className="text-gray-500 text-xs">No results found for this query.</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
export default EducatorKnowledgeBase;
