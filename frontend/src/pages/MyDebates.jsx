import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ReportCard from "../components/ReportCard";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function sessionToReportCardResult(s) {
  return {
    user_transcript: s.argument,
    ai_rebuttal: s.feedback,
    presentation_metrics: {
      words_per_minute: s.presentationMetrics?.wordsPerMinute ?? null,
      pace_status: s.presentationMetrics?.paceStatus ?? "N/A (typed)",
      filler_word_count: s.presentationMetrics?.fillerWordCount ?? 0
    },
    argument_analysis: {
      clarity_score: s.argumentAnalysis?.clarityScore ?? 0,
      relevance_score: s.argumentAnalysis?.relevanceScore ?? 0,
      evidence_strength_score: s.argumentAnalysis?.evidenceStrengthScore ?? 0,
      logical_consistency_score: s.argumentAnalysis?.logicalConsistencyScore ?? 0,
      persuasiveness_score: s.argumentAnalysis?.persuasivenessScore ?? 0,
      strengths: s.argumentAnalysis?.strengths ?? [],
      weaknesses: (s.argumentAnalysis?.weaknesses ?? []).map((w) => ({
        issue: w.issue, stronger_version: w.strongerVersion
      }))
    },
    fallacy_metrics: {
      fallacy_detected: !!s.fallacyDetected,
      fallacy_type: s.fallacyDetails?.fallacyType ?? "None",
      offending_text: s.fallacyDetails?.offendingText ?? "",
      explanation: s.fallacyDetails?.explanation ?? "",
      correction_suggestion: s.fallacyDetails?.correctionSuggestion ?? ""
    },
    delivery_metrics: {
      confidence_score: s.confidenceScore,
      clarity_score: s.communicationScore,
      engagement_score: s.engagementScore ?? s.confidenceScore,
      grammar_issues: (s.grammarIssues ?? []).map((g) => ({
        original_text: g.originalText, corrected_text: g.correctedText, explanation: g.explanation
      })),
      overall_feedback: s.deliveryOverallFeedback ?? ""
    }
  };
}

function hasFullReport(s) {
  return s.argumentAnalysis?.clarityScore !== null && s.argumentAnalysis?.clarityScore !== undefined;
}

const TABS = ["All", "Completed", "Scheduled", "Drafts"];

function MyDebates() {
  const user = getUser();
  const [tab, setTab] = useState("All");
  const [sessions, setSessions] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/session/${user.id}`).then((res) => setSessions(res.data)).catch(() => setError("Could not load your debate history."));
    api.get("/learner/scheduled-sessions").then((res) => setScheduled(res.data)).catch(() => {});
    api.get("/learner/drafts").then((res) => setDrafts(res.data)).catch(() => {});
  }, []);

  const handleCancelScheduled = async (id) => {
    await api.delete(`/learner/scheduled-sessions/${id}`).catch(() => {});
    setScheduled((prev) => prev.filter((s) => s._id !== id));
  };

  const handleDeleteDraft = async (id) => {
    await api.delete(`/learner/drafts/${id}`).catch(() => {});
    setDrafts((prev) => prev.filter((d) => d._id !== id));
  };

  const showCompleted = tab === "All" || tab === "Completed";
  const showScheduled = tab === "All" || tab === "Scheduled";
  const showDrafts = tab === "Drafts";

  return (
    <Layout>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">My Debates</h2>
        <Link
          to="/debate-room"
          className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          + New Debate
        </Link>
      </div>
      <p className="text-gray-500 mb-6">Every practice session you've completed, with its full report.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? "bg-purple-600 text-white" : "bg-[#1a1a2b] text-gray-400 border border-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3 w-full max-w-5xl">

        {/* ---- SCHEDULED ---- */}
        {showScheduled && scheduled.map((s) => (
          <div key={s._id} className="bg-[#1a1a2b] border border-purple-500/20 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{s.topic}</p>
              <p className="text-gray-500 text-sm">
                {s.format} · <span className="text-purple-400">Scheduled</span> ·{" "}
                {new Date(s.scheduledFor).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button onClick={() => handleCancelScheduled(s._id)} className="text-gray-500 hover:text-red-400 text-sm">
              Cancel
            </button>
          </div>
        ))}

        {/* ---- COMPLETED ---- */}
        {showCompleted && sessions.length === 0 && tab !== "Scheduled" && (
          <p className="text-gray-500">No completed debates yet — head to the Debate Room to start your first one.</p>
        )}

        {showCompleted && sessions.map((s) => {
          const isOpen = expandedId === s._id;
          const fullReport = hasFullReport(s);
          return (
            <div key={s._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : s._id)}
                className="w-full text-left px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{s.topic}</p>
                  <p className="text-gray-500 text-sm">
                    {s.format || "One-on-One Debate"} · <span className="text-green-400">Completed</span> ·{" "}
                    {s.stance} · {new Date(s.createdAt).toLocaleDateString()}
                    {fullReport && <span className="text-purple-400"> · Full Report</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-purple-400 font-semibold text-sm">
                    {s.overallScore}%
                  </span>
                  <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4">
                  {fullReport ? (
                    <ReportCard result={sessionToReportCardResult(s)} />
                  ) : (
                    <div className="text-sm space-y-3">
                      <div>
                        <p className="text-gray-500 mb-1">Your Argument</p>
                        <p className="text-gray-300">{s.argument}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">AI Feedback</p>
                        <p className="text-gray-300">{s.feedback}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                          <p className="text-gray-500 text-xs">Communication</p>
                          <p className="font-bold text-purple-300">{s.communicationScore}%</p>
                        </div>
                        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                          <p className="text-gray-500 text-xs">Argument</p>
                          <p className="font-bold text-purple-300">{s.argumentScore}%</p>
                        </div>
                        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                          <p className="text-gray-500 text-xs">Confidence</p>
                          <p className="font-bold text-purple-300">{s.confidenceScore}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(s.coachFeedback || s.educatorFeedback) && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm">
                      {s.coachFeedback && (
                        <div className="bg-[#0f0f1a] rounded-lg p-3">
                          <p className="text-purple-400 text-xs font-semibold mb-1">FEEDBACK FROM YOUR COACH</p>
                          <p className="text-gray-300">{s.coachFeedback}</p>
                        </div>
                      )}
                      {s.educatorFeedback && (
                        <div className="bg-[#0f0f1a] rounded-lg p-3">
                          <p className="text-blue-400 text-xs font-semibold mb-1">FEEDBACK FROM YOUR EDUCATOR</p>
                          <p className="text-gray-300">{s.educatorFeedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {tab === "Scheduled" && scheduled.length === 0 && (
          <p className="text-gray-500">No scheduled sessions — add one from the Dashboard's Upcoming Sessions card.</p>
        )}

        {/* ---- DRAFTS ---- */}
        {showDrafts && drafts.map((d) => (
          <div key={d._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{d.topic || "Untitled draft"}</p>
              <p className="text-gray-500 text-sm">{d.format} · Saved {new Date(d.updatedAt).toLocaleDateString()}</p>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{d.argument}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Link to="/debate-room" state={{ presetTopic: d.topic, presetFormat: d.format, draftArgument: d.argument, draftId: d._id }}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium">Continue</Link>
              <button onClick={() => handleDeleteDraft(d._id)} className="text-gray-500 hover:text-red-400 text-sm">✕</button>
            </div>
          </div>
        ))}
        {showDrafts && drafts.length === 0 && <p className="text-gray-500">No drafts saved.</p>}
      </div>
    </Layout>
  );
}

export default MyDebates;
