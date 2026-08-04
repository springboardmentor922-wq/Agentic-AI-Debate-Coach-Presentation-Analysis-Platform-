import React from "react";
import Layout from "../components/Layout";

const RESOURCES = [
  {
    title: "List of Logical Fallacies",
    description: "A comprehensive reference of formal and informal fallacies, with examples.",
    url: "https://en.wikipedia.org/wiki/List_of_fallacies"
  },
  {
    title: "Debate — Formats & History",
    description: "Overview of competitive debate formats, including Oxford and Parliamentary style.",
    url: "https://en.wikipedia.org/wiki/Debate"
  },
  {
    title: "Public Speaking Fundamentals",
    description: "Core techniques for clarity, pacing, and audience engagement.",
    url: "https://en.wikipedia.org/wiki/Public_speaking"
  },
  {
    title: "Rhetoric & Persuasion",
    description: "The classical foundations of persuasive argument — ethos, pathos, logos.",
    url: "https://en.wikipedia.org/wiki/Rhetoric"
  }
];

function LearningResources() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Learning Resources</h2>
      <p className="text-gray-500 mb-6">Reference material to deepen your understanding of argumentation and delivery.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {RESOURCES.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1a1a2b] border border-white/5 hover:border-purple-500 transition rounded-2xl p-5 block"
          >
            <p className="font-semibold mb-1">{r.title}</p>
            <p className="text-gray-500 text-sm">{r.description}</p>
          </a>
        ))}
      </div>
    </Layout>
  );
}

export default LearningResources;
