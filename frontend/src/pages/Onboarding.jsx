import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const FORMATS = [
  "One-on-One Debate", "Parliamentary Debate", "Oxford Debate",
  "Policy Debate", "Public Forum Debate", "AI Debate Simulation"
];

function Onboarding() {
  const navigate = useNavigate();
  const [experience, setExperience] = useState("Beginner");
  const [preferredFormats, setPreferredFormats] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleFormat = (f) => {
    setPreferredFormats((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await api.put("/profile/onboarding", { experience, preferredFormats });
      const stored = JSON.parse(localStorage.getItem("user"));
      stored.onboardingCompleted = true;
      stored.experience = res.data.user.experience;
      localStorage.setItem("user", JSON.stringify(stored));
      navigate("/dashboard");
    } catch {
      alert("Failed to save — try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
      <div className="w-full max-w-lg bg-[#13131f] border border-white/5 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome! Let's set you up.</h2>
        <p className="text-gray-500 text-sm mb-8">A couple of quick questions so your Dashboard has something useful to show right away.</p>

        <p className="text-gray-300 text-sm font-medium mb-3">What's your debate experience?</p>
        <div className="flex gap-2 mb-8">
          {["Beginner", "Intermediate", "Expert"].map((e) => (
            <button key={e} onClick={() => setExperience(e)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                experience === e ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
              }`}>
              {e}
            </button>
          ))}
        </div>

        <p className="text-gray-300 text-sm font-medium mb-3">Which formats are you interested in? (pick any)</p>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {FORMATS.map((f) => (
            <button key={f} onClick={() => toggleFormat(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                preferredFormats.includes(f) ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
              }`}>
              {preferredFormats.includes(f) ? "✓ " : ""}{f}
            </button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition text-white font-semibold py-3 rounded-xl">
          {saving ? "Saving..." : "Get Started"}
        </button>
      </div>
    </div>
  );
}
export default Onboarding;
