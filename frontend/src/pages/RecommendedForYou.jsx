import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const DIMENSION_INFO = {
  communication: { label: "Communication", tool: "Argument Analyzer", route: "/tools/argument-analyzer", tip: "Practice with the Argument Analyzer to see clarity/relevance feedback" },
  argument: { label: "Argument Strength", tool: "Fallacy Detector", route: "/tools/fallacy-detector", tip: "Try the Fallacy Detector to catch reasoning gaps before you debate" },
  confidence: { label: "Confidence", tool: "Debate Room (voice)", route: "/debate-room", tip: "Record more turns in the Debate Room — confidence score comes from your phrasing" }
};

function RecommendedForYou() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/learner/overview").then((res) => setOverview(res.data)).catch(() => setError("Could not load your recommendations."));
  }, []);

  const ranked = overview
    ? Object.entries(overview.dimensionAverages)
        .filter(([, v]) => v > 0)
        .sort((a, b) => a[1] - b[1])
    : [];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Recommended For You</h2>
      <p className="text-gray-500 mb-6">Personalized suggestions built from your real scores — weakest first.</p>

      {error && <p className="text-red-400">{error}</p>}

      {overview?.starterRecommendation && (
        <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-6 max-w-2xl mb-6">
          <h3 className="text-lg font-semibold mb-2">⭐ Get Started</h3>
          <p className="text-gray-300 text-sm mb-1">
            Based on your onboarding survey, try {overview.starterRecommendation.format}
            {overview.starterRecommendation.topicTitle && <> — "{overview.starterRecommendation.topicTitle}"</>}
          </p>
          <Link to="/debate-room" className="text-purple-400 hover:text-purple-300 text-sm font-medium">Start your first debate →</Link>
        </div>
      )}

      {ranked.length > 0 && (
        <div className="space-y-4 max-w-2xl mb-6">
          {ranked.map(([key, score], i) => {
            const info = DIMENSION_INFO[key];
            return (
              <div key={key} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide">
                    {i === 0 ? "Weakest — Start Here" : `#${i + 1}`}
                  </span>
                  <span className="text-gray-500 text-sm">Current: {score}%</span>
                </div>
                <p className="font-semibold text-lg mb-2">{info.label}</p>
                <p className="text-gray-400 text-sm mb-3">{info.tip}</p>
                <Link to={info.route} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Go to {info.tool} →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {overview && ranked.length === 0 && !overview.starterRecommendation && (
        <p className="text-gray-500">Complete a debate to unlock personalized recommendations.</p>
      )}

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
        <p className="text-gray-400 text-sm mb-2">Want a full, ordered plan instead of a single tip?</p>
        <Link to="/learning-path" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          View your full Learning Path →
        </Link>
      </div>
    </Layout>
  );
}
export default RecommendedForYou;
