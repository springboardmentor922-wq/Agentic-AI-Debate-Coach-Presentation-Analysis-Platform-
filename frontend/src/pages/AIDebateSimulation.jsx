import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const OPPONENTS = [
  { id: "LogicBot", name: "AI Opponent: LogicBot", trait: "Cold, precise, purely analytical — attacks with formal logic and statistics, no emotional appeals." },
  { id: "PersuadeBot", name: "AI Opponent: PersuadeBot", trait: "Warm and rhetorical — uses stories, analogies, and emotional appeals while staying intellectually honest." }
];

function AIDebateSimulation() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [customScenario, setCustomScenario] = useState("");

  const startWithOpponent = (opponentId) => {
    navigate("/debate-room", {
      state: { presetFormat: "AI Debate Simulation", opponentPersona: opponentId, difficulty }
    });
  };

  const startCustom = () => {
    if (!customScenario.trim()) return;
    navigate("/debate-room", {
      state: { presetFormat: "AI Debate Simulation", customScenario, difficulty }
    });
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">AI Debate Simulation</h2>
      <p className="text-gray-500 mb-6">Practice against a real, distinct AI opponent personality.</p>

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
        {OPPONENTS.map((o) => (
          <div key={o.id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <p className="font-semibold mb-2">{o.name}</p>
            <p className="text-gray-500 text-sm mb-4">{o.trait}</p>
            <button onClick={() => startWithOpponent(o.id)}
              className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Start
            </button>
          </div>
        ))}
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
