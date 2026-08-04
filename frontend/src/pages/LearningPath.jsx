import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

function LearningPath() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [scheduled, setScheduled] = useState({});

  useEffect(() => {
    api.get("/learner/learning-path").then((res) => setData(res.data)).catch(() => setError("Could not load your learning path."));
  }, []);

  const handleSchedule = async (step) => {
    if (!step.suggestedTopic) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    try {
      await api.post("/learner/scheduled-sessions", {
        topic: step.suggestedTopic.title,
        format: step.suggestedTopic.format,
        scheduledFor: tomorrow.toISOString()
      });
      setScheduled((prev) => ({ ...prev, [step.order]: true }));
    } catch {
      alert("Failed to schedule");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Learning Path</h2>
      <p className="text-gray-500 mb-6">A real, ordered plan built from your actual weakest skills — not generic advice.</p>

      {error && <p className="text-red-400">{error}</p>}

      {data && !data.ready && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
          <p className="text-gray-400">{data.message}</p>
          <Link to="/debate-room" className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-3 inline-block">
            Go to Debate Room →
          </Link>
        </div>
      )}

      {data?.ready && (
        <div className="space-y-4 max-w-2xl">
          {data.steps.map((step) => {
            const pct = Math.min(100, Math.round((step.progress / step.targetCount) * 100));
            return (
              <div key={step.order} className="bg-[#1a1a2b] border border-purple-500/20 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide">{step.stepLabel}</span>
                    <p className="font-semibold text-lg">{step.dimension}</p>
                  </div>
                  <span className="text-gray-500 text-sm">Current: {step.currentScore}%</span>
                </div>

                <p className="text-gray-300 text-sm mb-3">{step.action}</p>

                <div className="w-full bg-[#0f0f1a] rounded-full h-2.5 mb-2">
                  <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-gray-500 text-xs mb-4">{step.progress} / {step.targetCount} completed this week</p>

                <div className="flex items-center gap-4">
                  <Link to={step.route} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Go practice →
                  </Link>
                  {step.suggestedTopic && (
                    scheduled[step.order] ? (
                      <span className="text-green-400 text-sm">✔ Scheduled for tomorrow</span>
                    ) : (
                      <button onClick={() => handleSchedule(step)} className="text-gray-400 hover:text-gray-200 text-sm">
                        📅 Schedule "{step.suggestedTopic.title}" for tomorrow
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
export default LearningPath;
