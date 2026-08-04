import React from "react";
import Layout from "../components/Layout";

const FORMATS = [
  { name: "One-on-One Debate", rules: "Single opponent, direct back-and-forth exchange.", timing: "5 min per speaker, no fixed rounds." },
  { name: "Parliamentary Debate", rules: "Government vs. Opposition, formal political terminology, motion-based.", timing: "7 min constructive speeches, 4 min rebuttals." },
  { name: "Oxford Debate", rules: "Strict for/against structure, audience vote before and after.", timing: "5-8 min per side, structured rounds." },
  { name: "Policy Debate", rules: "Argue for or against a specific government policy, evidence-heavy.", timing: "8 min constructive, 5 min rebuttal." },
  { name: "Public Forum Debate", rules: "Accessible, audience-focused, concise arguments.", timing: "4 min constructive, 3 min rebuttal, 2 min summary." },
  { name: "AI Debate Simulation", rules: "Free-form, adapts to a chosen AI opponent persona or custom scenario.", timing: "Flexible, learner-paced." },
];

function DebateFormatsInfo() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Debate Formats</h2>
      <p className="text-gray-500 mb-6">Rules and timing guidelines for each format supported on the platform.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {FORMATS.map((f) => (
          <div key={f.name} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <p className="font-semibold mb-2">{f.name}</p>
            <p className="text-gray-400 text-sm mb-2">{f.rules}</p>
            <p className="text-purple-400 text-xs">⏱ {f.timing}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
export default DebateFormatsInfo;
