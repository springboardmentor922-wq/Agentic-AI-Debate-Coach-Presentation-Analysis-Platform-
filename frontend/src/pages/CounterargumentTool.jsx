import React, { useState } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";
import api from "../api/axios";

const FILTERS = ["All", "Logical Rebuttal", "Evidence-Based Rebuttal", "Ethical Counterargument", "Practical Counterargument", "Policy Counterargument"];

function CounterargumentTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await aiEngine.post("/api/v1/tools/counterargument-generator", { text });
      setResult(res.data);
      setFilter("All");
      api.post("/learner/tool-usage", { tool: "CounterargumentGenerator" }).catch(() => {});
    } catch { setError("Could not reach the AI engine. Make sure it's running on localhost:8000."); }
    finally { setLoading(false); }
  };

  const visible = result ? result.counterarguments.filter((c) => filter === "All" || c.type === filter) : [];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Counterargument Generator</h2>
      <p className="text-gray-500 mb-6">Paste a topic or argument to get rebuttals from multiple angles.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-4xl">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Should social media be regulated?"
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4 min-h-[100px]" />
        <button onClick={handleGenerate} disabled={loading || !text.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold px-6 py-3 rounded-lg">
          {loading ? "Generating..." : "Generate Counterarguments"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {result && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visible.map((c, i) => (
                <div key={i} className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
                  <p className="text-purple-400 font-semibold mb-1">{c.type}</p>
                  <p className="text-gray-300">{c.content}</p>
                </div>
              ))}
              {visible.length === 0 && <p className="text-gray-500 text-sm">No counterarguments of this type were generated.</p>}
            </div>

            <button onClick={handleGenerate} className="mt-4 mb-6 text-purple-400 hover:text-purple-300 text-sm font-medium">
              Generate More
            </button>

            {result.challenge_questions.length > 0 && (
              <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm mb-4">
                <p className="font-semibold mb-2 text-orange-400">❓ Challenge Questions</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.challenge_questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}

            {result.debate_strategy.length > 0 && (
              <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-blue-400">🎯 Debate Strategy</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.debate_strategy.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CounterargumentTool;
