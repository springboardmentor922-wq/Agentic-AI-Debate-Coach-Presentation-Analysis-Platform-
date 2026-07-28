import { useState } from "react";
import axios from "axios";

export default function AnalyzeDebate() {
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
      const response = await axios.post(
        "http://127.0.0.1:8000/analysis/analyze",
        {
          text: argument,
        }
      );

      setResult(response.data);
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
          AI Debate Coach
        </h1>

        <p className="text-center text-gray-600 mt-2 mb-8">
          Analyze your debate argument using Artificial Intelligence
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
                "Analyze"
              )}
            </button>

          </div>

        </div>

        {/* Results */}

        {result && (

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