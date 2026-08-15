import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";

const FORMATS = [
  "One-on-One Debate", "Parliamentary Debate", "Oxford Debate",
  "Policy Debate", "Public Forum Debate", "AI Debate Simulation"
];

function AIDebateSimulation() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [format, setFormat] = useState("One-on-One Debate");
  const [customScenario, setCustomScenario] = useState("");
  const [personaOptions, setPersonaOptions] = useState(null);

  useEffect(() => {
    aiEngine.get("/api/v1/debate/persona-options").then((res) => setPersonaOptions(res.data)).catch(() => {});
  }, []);

  const availablePersonaNames = personaOptions?.formatOptions?.[format] || [];

  const startWithOpponent = (opponentId) => {
    navigate("/debate-room", {
      state: { presetFormat: format, opponentPersona: opponentId, difficulty }
    });
  };

  const startCustom = () => {
    if (!customScenario.trim()) return;
    navigate("/debate-room", {
      state: { presetFormat: format, customScenario, difficulty }
    });
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">AI Debate Simulation</h2>
      <p className="text-gray-500 mb-6">Practice against a real, distinct AI opponent personality — matched to your chosen format.</p>

      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-2">Debate Format</p>
        <select value={format} onChange={(e) => setFormat(e.target.value)}
          className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-2 text-sm">
          {FORMATS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-2">Difficulty</p>
        <div className="flex gap-2">
          {["Beginner", "Intermediate", "Hard"].map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                difficulty === d ? "bg-purple-600 text-white" : "bg-[#1a1a2b] text-gray-400 border border-white/10"
              }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-3xl">
        {availablePersonaNames.map((name) => (
          <div key={name} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <p className="font-semibold mb-2">AI Opponent: {name}</p>
            <p className="text-gray-500 text-sm mb-4">{personaOptions.personas[name]}</p>
            <button onClick={() => startWithOpponent(name)}
              className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Start
            </button>
          </div>
        ))}
        {!personaOptions && <p className="text-gray-500">Loading opponents...</p>}
      </div>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-3xl">
        <p className="font-semibold mb-2">Custom AI Scenario</p>
        <p className="text-gray-500 text-sm mb-4">Describe a specific scenario — the AI opponent will follow it exactly.</p>
        <textarea value={customScenario} onChange={(e) => setCustomScenario(e.target.value)}
          placeholder="e.g. You're debating a hostile city council member skeptical of climate policy..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4 min-h-[100px] text-sm" />
        <button onClick={startCustom}
          className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Create
        </button>
      </div>
    </Layout>
  );
}

export default AIDebateSimulation;
