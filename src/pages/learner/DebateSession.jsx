import { useState } from "react";
import api from "../../services/api";

export default function DebateSession() {
  const [argument, setArgument] = useState("");
  const [loading, setLoading] = useState(false);

  const [aiReply, setAiReply] = useState("");

  const [analysis, setAnalysis] = useState({
    grammar: "--",
    logic: "--",
    clarity: "--",
    persuasiveness: "--",
    fallacy: "--",
    explanation: "",
    feedback: [],
  });

  const topic = "Should AI Replace Teachers?";
  const difficulty = "Medium";

  const handleSend = async () => {
    if (!argument.trim()) return;

    setLoading(true);

    try {
      const response = await api.post("/debate/chat", {
        topic,
        difficulty,
        message: argument,
      });

      setAiReply(response.data.ai_reply);

      setAnalysis({
        grammar: response.data.scores.grammar,
        logic: response.data.scores.logic,
        clarity: response.data.scores.clarity,
        persuasiveness: response.data.scores.persuasiveness,
        fallacy: response.data.fallacy.type,
        explanation: response.data.fallacy.explanation,
        feedback: response.data.feedback,
      });

      setArgument("");
    } catch (err) {
      console.error(err);
      alert("Failed to get AI response.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Debate Session
        </h1>

        <p className="mb-6">
          <b>Topic:</b> {topic}
        </p>

        {/* AI */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <h2 className="font-bold text-lg mb-3">
            🤖 AI Opponent
          </h2>

          <p>
            {aiReply ||
              "Welcome! Present your opening argument."}
          </p>

        </div>

        {/* User */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <h2 className="font-bold text-lg mb-3">
            🧑 Your Argument
          </h2>

          <textarea
            rows="7"
            value={argument}
            onChange={(e) => setArgument(e.target.value)}
            placeholder="Type your argument here..."
            className="w-full border rounded-lg p-3"
          />

          <div className="flex gap-4 mt-4">

            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              🎤 Voice
            </button>

            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Thinking..." : "Send"}
            </button>

          </div>

        </div>

        {/* Analysis */}

        <div className="bg-white rounded-xl shadow p-5">

          <h2 className="font-bold text-xl mb-5">
            📊 AI Analysis
          </h2>

          <div className="grid grid-cols-2 gap-5">

            <div>
              <b>Grammar</b>
              <p>{analysis.grammar}</p>
            </div>

            <div>
              <b>Logic</b>
              <p>{analysis.logic}</p>
            </div>

            <div>
              <b>Clarity</b>
              <p>{analysis.clarity}</p>
            </div>

            <div>
              <b>Persuasiveness</b>
              <p>{analysis.persuasiveness}</p>
            </div>

          </div>

          <hr className="my-5"/>

          <h3 className="font-bold">
            Fallacy
          </h3>

          <p>{analysis.fallacy}</p>

          <p className="mt-2">
            {analysis.explanation}
          </p>

          <hr className="my-5"/>

          <h3 className="font-bold">
            Suggestions
          </h3>

          <ul className="list-disc pl-6">

            {analysis.feedback.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}

          </ul>

        </div>

      </div>

    </div>
  );
}