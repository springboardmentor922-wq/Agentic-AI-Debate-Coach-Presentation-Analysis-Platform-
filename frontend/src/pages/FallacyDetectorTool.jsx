import React, { useState } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";
import api from "../api/axios";

function FallacyDetectorTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDetect = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await aiEngine.post("/api/v1/tools/fallacy-detector", { text });
      setResult(res.data);
      api.post("/learner/tool-usage", { tool: "FallacyDetector" }).catch(() => {});
    } catch (err) {
      console.error(err);
      setError("Could not reach the AI engine. Make sure it's running on localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Fallacy Detector</h2>
      <p className="text-gray-500 mb-6">
        Paste text to check for 8 common logical fallacies: Ad Hominem, Straw Man, False Dilemma,
        Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring.
      </p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-4xl">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4 min-h-[140px]"
        />
        <button
          onClick={handleDetect}
          disabled={loading || !text.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold px-6 py-3 rounded-lg"
        >
          {loading ? "Checking..." : "Detect Fallacies"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {result && (
          <div className="mt-6 bg-[#0f0f1a] rounded-lg p-4 text-sm">
            {result.fallacy_detected ? (
              <>
                <p className="text-red-400 font-semibold mb-2">{result.fallacy_type} detected</p>
                <p className="text-gray-400 mb-1">"{result.offending_text}"</p>
                <p className="text-gray-400 mb-1">{result.explanation}</p>
                <p className="text-purple-300">{result.correction_suggestion}</p>
              </>
            ) : (
              <p className="text-green-400">No logical fallacies detected — solid reasoning.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default FallacyDetectorTool;
