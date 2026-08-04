import React, { useState } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";
import api from "../api/axios";

function ArgumentAnalyzerTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await aiEngine.post("/api/v1/tools/argument-analyzer", { text });
      setResult(res.data);
      api.post("/learner/tool-usage", { tool: "ArgumentAnalyzer" }).catch(() => {});
    } catch (err) {
      setError("Could not reach the AI engine. Make sure it's running on localhost:8000.");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Argument Analyzer</h2>
      <p className="text-gray-500 mb-6">Paste any argument to extract its claims, evidence, and reasoning quality.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-4xl">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste an argument here..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4 min-h-[140px]" />
        <button onClick={handleAnalyze} disabled={loading || !text.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold px-6 py-3 rounded-lg">
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0f0f1a] rounded-lg p-4">
                <p className="text-gray-500 text-xs mb-2">Claims Found</p>
                <p className="text-2xl font-bold text-purple-300 mb-2">{result.claims_found.length}</p>
                <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                  {result.claims_found.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-4">
                <p className="text-gray-500 text-xs mb-2">Evidence Found</p>
                <p className="text-2xl font-bold text-blue-300 mb-2">{result.evidence_found.length}</p>
                <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                  {result.evidence_found.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-4">
                <p className="text-gray-500 text-xs mb-2">Reasoning Quality</p>
                <p className="text-2xl font-bold text-green-300">{result.logical_consistency_score}%</p>
                <p className="text-gray-500 text-xs mt-1">Logical consistency</p>
              </div>
            </div>

            <div>
              {[
                ["Clarity", result.clarity_score], ["Relevance", result.relevance_score],
                ["Evidence Strength", result.evidence_strength_score], ["Persuasiveness", result.persuasiveness_score]
              ].map(([label, value]) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{label}</span><span className="text-gray-500">{value}%</span></div>
                  <div className="w-full bg-[#0f0f1a] rounded-full h-2.5"><div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-green-400">💪 Strengths</p>
                <ul className="list-disc list-inside text-gray-400 space-y-1">{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-yellow-400">🎯 Weaknesses</p>
                <div className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <div key={i}>
                      <p className="text-gray-400">• {w.issue}</p>
                      <p className="text-green-300 text-xs mt-1 pl-3 border-l-2 border-green-500/30">Fix: "{w.stronger_version}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ArgumentAnalyzerTool;
