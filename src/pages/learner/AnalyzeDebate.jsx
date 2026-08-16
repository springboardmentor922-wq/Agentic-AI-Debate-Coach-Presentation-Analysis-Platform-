import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function AnalyzeDebate() {
  const [searchParams] = useSearchParams();
  const tool = searchParams.get("tool") || "analysis";
  const toolCopy = { analysis: ["Argument Analyzer", "Get a complete AI review of your reasoning."], fallacy: ["Fallacy Detector", "Identify logical fallacies and learn how to correct them."], counterargument: ["Counterargument Generator", "Generate a strong opposing perspective for your argument."], feedback: ["Presentation Analysis", "Receive clarity, logic, persuasiveness, and grammar feedback."], resources: ["Learning Resources", "Start with an argument and explore personalised learning guidance."] }[tool] || ["Argument Analyzer", "Get a complete AI review of your reasoning."];
  const [argument, setArgument] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function analyze() {
    if (!argument.trim()) {
      alert("Please enter an argument.");
      return;
    }

    setLoading(true);

    try {
      // Fallacy reports use the complete analysis pipeline so every argument
      // receives a score, detailed fallacy explanation, and saved report.
      const endpoint = tool === "counterargument" ? "/analysis/counterargument" : tool === "feedback" ? "/analysis/feedback" : "/analysis/analyze";
      const response = await api.post(endpoint, { text: argument });

      // The specialised endpoints return their result at the top level;
      // normalise them so the report cards render consistently.
      if (tool === "counterargument") setResult({ counter_argument: response.data });
      else if (tool === "feedback") setResult({ feedback: response.data });
      else setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze argument.");
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setArgument("");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-green-700">
          {toolCopy[0]}
        </h1>

        <p className="text-center text-gray-600 mt-2 mb-8">
          {toolCopy[1]}
        </p>

        {/* Input Box */}

        <div className="bg-white rounded-xl shadow-lg p-6">

          <textarea
            className="w-full h-48 border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Enter your argument here..."
            value={argument}
            disabled={loading}
            onChange={(e) => setArgument(e.target.value)}
          />

          <div className="flex justify-center mt-6">

            <button
              onClick={analyze}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Analyzing your argument...
                </span>
              ) : (
                tool === "fallacy" ? "Detect fallacy" : tool === "counterargument" ? "Generate counterargument" : tool === "feedback" ? "Get feedback" : "Analyze"
              )}
            </button>

          </div>

        </div>

        {/* Results */}

        {result && tool === "counterargument" && (
          <div className="mt-10 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-violet-700">Counterargument report</h2>
            <p className="mt-4 leading-7 text-slate-700">{result.counter_argument?.counterargument || "No counterargument was generated."}</p>
            <h3 className="mt-6 font-bold text-slate-800">Supporting points</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">{(result.counter_argument?.supporting_points || []).map((point, index) => <li key={index}>{point}</li>)}</ul>
          </div>
        )}

        {result && tool !== "counterargument" && (

          <div className="mt-10 space-y-6">

            {/* Overall Score */}

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">

              <h2 className="text-2xl font-bold text-green-700">
                ⭐ Overall Score
              </h2>

              <p
                className={`text-5xl font-bold mt-4 ${
                  result.overall_score >= 8
                    ? "text-green-600"
                    : result.overall_score >= 5
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {Number(result.overall_score).toFixed(1)}/10
              </p>

            </div>

            {/* Logical Fallacy */}

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">

              <h2 className="text-2xl font-bold text-red-600">
                ⚠ Logical Fallacy
              </h2>

              <p className="text-lg font-semibold mt-3">
                {result.fallacy_analysis?.fallacy_type || "None"}
              </p>

              <p className="mt-3 text-gray-700">
                {result.fallacy_analysis?.explanation ||
                  "No logical fallacy detected."}
              </p>

              {tool === "fallacy" && (
                <div className="mt-5 grid gap-3 rounded-lg bg-violet-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div><p className="font-bold text-violet-700">Flagged wording</p><p className="mt-1">{result.fallacy_analysis?.offending_text || "No specific wording was flagged."}</p></div>
                  <div><p className="font-bold text-violet-700">How to improve it</p><p className="mt-1">{result.fallacy_analysis?.correction_suggestion || "Strengthen the claim with evidence and a clear logical link."}</p></div>
                </div>
              )}

            </div>

            {/* Counter Argument */}

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">

              <h2 className="text-2xl font-bold text-blue-600">
                💬 Counter Argument
              </h2>

              <p className="mt-3 text-gray-700">
                {result.counter_argument?.counterargument ||
                  "No counter argument generated."}
              </p>

              <h3 className="font-semibold mt-6">
                Supporting Points
              </h3>

              {result.counter_argument?.supporting_points?.length > 0 ? (

                <ul className="list-disc ml-6 mt-3 space-y-2">

                  {result.counter_argument.supporting_points.map(
                    (point, index) => (
                      <li key={index}>{point}</li>
                    )
                  )}

                </ul>

              ) : (

                <p className="text-gray-500 mt-2">
                  No supporting points available.
                </p>

              )}

            </div>

            {/* Feedback */}

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">

              <h2 className="text-2xl font-bold text-purple-600">
                📋 Feedback
              </h2>

              <div className="grid grid-cols-2 gap-4 mt-5">

                <div>
                  <strong>Clarity:</strong>{" "}
                  {result.feedback?.clarity_score ?? "-"}
                </div>

                <div>
                  <strong>Logic:</strong>{" "}
                  {result.feedback?.logic_score ?? "-"}
                </div>

                <div>
                  <strong>Persuasiveness:</strong>{" "}
                  {result.feedback?.persuasiveness_score ?? "-"}
                </div>

                <div>
                  <strong>Grammar:</strong>{" "}
                  {result.feedback?.grammar_score ?? "-"}
                </div>

              </div>

              <h3 className="font-semibold mt-6">
                Suggestions
              </h3>

              {result.feedback?.feedback?.length > 0 ? (

                <ul className="list-disc ml-6 mt-3 space-y-2">

                  {result.feedback.feedback.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}

                </ul>

              ) : (

                <p className="text-gray-500 mt-2">
                  No suggestions available.
                </p>

              )}

            </div>

            {/* Analyze Again */}

            <div className="text-center">

              <button
                onClick={resetAnalysis}
                className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition"
              >
                Analyze Another Argument
              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}
