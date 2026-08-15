import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function MyPresentations() {
  const [sessions, setSessions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/learner/presentation-sessions").then((res) => setSessions(res.data)).catch(() => setError("Could not load your presentation history."));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">My Presentations</h2>
      <p className="text-gray-500 mb-6">Every presentation you've analyzed, with the full combined report.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="space-y-3 max-w-3xl">
        {sessions.map((s) => {
          const isOpen = expandedId === s._id;
          const overall = Math.round(
            (s.deliveryMetrics.clarityScore + s.deliveryMetrics.confidenceScore + s.deliveryMetrics.engagementScore +
             s.contentReview.structureScore + s.contentReview.clarityScore + s.contentReview.claimSupportScore + s.contentReview.flowScore) / 7
          );
          return (
            <div key={s._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => setExpandedId(isOpen ? null : s._id)} className="w-full text-left px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.filename}</p>
                  <p className="text-gray-500 text-sm">{s.slideCount} slides/pages · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-purple-400 font-semibold text-sm">{overall}%</span>
                  <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4 text-sm space-y-4">
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">Delivery</p>
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Clarity</p><p className="font-bold text-purple-300">{s.deliveryMetrics.clarityScore}%</p></div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Confidence</p><p className="font-bold text-purple-300">{s.deliveryMetrics.confidenceScore}%</p></div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Engagement</p><p className="font-bold text-purple-300">{s.deliveryMetrics.engagementScore}%</p></div>
                    </div>
                    <p className="text-gray-400 italic">"{s.deliveryMetrics.overallFeedback}"</p>
                  </div>

                  <div>
                    <p className="text-purple-400 font-semibold mb-2">Content</p>
                    <div className="grid grid-cols-4 gap-3 mb-2">
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Structure</p><p className="font-bold text-purple-300">{s.contentReview.structureScore}%</p></div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Clarity</p><p className="font-bold text-purple-300">{s.contentReview.clarityScore}%</p></div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Claim Support</p><p className="font-bold text-purple-300">{s.contentReview.claimSupportScore}%</p></div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center"><p className="text-gray-500 text-xs">Flow</p><p className="font-bold text-purple-300">{s.contentReview.flowScore}%</p></div>
                    </div>
                    <p className="text-gray-400">{s.contentReview.overallContentFeedback}</p>
                  </div>

                  {s.contentReview.slideFeedback.length > 0 && (
                    <div className="space-y-1">
                      {s.contentReview.slideFeedback.map((sf, i) => (
                        <div key={i} className="bg-[#0f0f1a] rounded-lg p-2 text-xs">
                          <span className="text-purple-400">Slide {sf.slideNumber}:</span> <span className="text-gray-400">{sf.feedback}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {sessions.length === 0 && <p className="text-gray-500">No presentations analyzed yet.</p>}
      </div>
    </Layout>
  );
}
export default MyPresentations;
