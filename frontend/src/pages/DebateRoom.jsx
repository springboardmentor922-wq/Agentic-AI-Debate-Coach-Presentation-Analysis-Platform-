import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import VoiceRecorder from "../components/VoiceRecorder";
import ReportCard from "../components/ReportCard";
import { getUser } from "../utils/useAuth";

const FORMATS = [
  "One-on-One Debate",
  "Parliamentary Debate",
  "Oxford Debate",
  "Policy Debate",
  "Public Forum Debate",
  "AI Debate Simulation"
];

function DebateRoom() {
  const user = getUser();
  const role = user?.role?.toLowerCase();
  const location = useLocation();
  const preset = location.state || {};

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(preset.presetTopic || "");
  const [stance, setStance] = useState("");
  const [debateFormat, setDebateFormat] = useState(preset.presetFormat || "One-on-One Debate");
  const [inputMode, setInputMode] = useState(preset.presetTopic ? "record" : "type");

  const [argument, setArgument] = useState(preset.draftArgument || "");
  const [draftId, setDraftId] = useState(preset.draftId || null);
  const [savingDraft, setSavingDraft] = useState(false);

  const opponentPersona = preset.opponentPersona || null;
  const customScenario = preset.customScenario || null;
  const difficulty = preset.difficulty || null;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // shared by BOTH type and record modes now
  const [streamingReply, setStreamingReply] = useState(""); // real live text as the Opponent generates it
  const [history, setHistory] = useState([]);
  const [sessionId] = useState(() => `${user?.id || "guest"}-${Date.now()}`);

  useEffect(() => {
    api.get("/topics").then((res) => setTopics(res.data)).catch(() => {});
  }, []);

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await api.post("/learner/drafts", { topic: selectedTopic, format: debateFormat, stance, argument });
      if (draftId) await api.delete(`/learner/drafts/${draftId}`).catch(() => {});
      alert("Draft saved — find it under My Debates → Drafts.");
    } catch {
      alert("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  // Persists the full report (either mode) into the Node Session collection
  // so it shows up identically in My Debates / the Dashboard later.
  const logFullReport = async (turnResult) => {
    try {
      await api.post("/session/log", {
        topic: selectedTopic || "Freeform practice",
        format: debateFormat,
        stance: stance || "Not selected",
        argument: turnResult.user_transcript,
        feedback: turnResult.ai_rebuttal,
        communicationScore: turnResult.delivery_metrics.clarity_score,
        confidenceScore: turnResult.delivery_metrics.confidence_score,
        engagementScore: turnResult.delivery_metrics.engagement_score,
        argumentScore: turnResult.argument_analysis.logical_consistency_score,
        fallacyDetected: turnResult.fallacy_metrics.fallacy_detected,
        presentationMetrics: {
          wordsPerMinute: turnResult.presentation_metrics.words_per_minute,
          paceStatus: turnResult.presentation_metrics.pace_status,
          fillerWordCount: turnResult.presentation_metrics.filler_word_count
        },
        argumentAnalysis: {
          clarityScore: turnResult.argument_analysis.clarity_score,
          relevanceScore: turnResult.argument_analysis.relevance_score,
          evidenceStrengthScore: turnResult.argument_analysis.evidence_strength_score,
          logicalConsistencyScore: turnResult.argument_analysis.logical_consistency_score,
          persuasivenessScore: turnResult.argument_analysis.persuasiveness_score,
          strengths: turnResult.argument_analysis.strengths,
          weaknesses: turnResult.argument_analysis.weaknesses.map((w) => ({
            issue: w.issue,
            strongerVersion: w.stronger_version
          }))
        },
        fallacyDetails: {
          fallacyType: turnResult.fallacy_metrics.fallacy_type,
          offendingText: turnResult.fallacy_metrics.offending_text,
          explanation: turnResult.fallacy_metrics.explanation,
          correctionSuggestion: turnResult.fallacy_metrics.correction_suggestion
        },
        grammarIssues: turnResult.delivery_metrics.grammar_issues.map((g) => ({
          originalText: g.original_text,
          correctedText: g.corrected_text,
          explanation: g.explanation
        })),
        deliveryOverallFeedback: turnResult.delivery_metrics.overall_feedback
      });
    } catch (logErr) {
      console.error("Could not log session to dashboard:", logErr);
    }
  };

  // ==============================
  // Shared SSE consumer — reads real Server-Sent Events off the response
  // body as they arrive. onChunk fires for each real text delta from the
  // Opponent as it's generated; onDone fires once with the full structured
  // result after all 4 agents have finished.
  // ==============================
  const consumeStream = async (response, onChunk, onDone) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop(); // last (possibly incomplete) chunk stays in buffer

      for (const raw of events) {
        if (!raw.trim()) continue;
        const eventMatch = raw.match(/^event: (\w+)/m);
        const dataMatch = raw.match(/^data: (.+)$/m);
        if (!dataMatch) continue;
        const eventType = eventMatch ? eventMatch[1] : "message";
        const data = JSON.parse(dataMatch[1]);
        if (eventType === "chunk") onChunk(data.text);
        else if (eventType === "done") onDone(data);
      }
    }
  };

  // ==============================
  // TYPE MODE — streams the AI's rebuttal word-by-word in real time as
  // it's generated, then fills in the full Report Card once the 3
  // analysis agents finish alongside it.
  // ==============================
  const handleGenerate = async () => {
    if (!selectedTopic || !argument.trim()) {
      alert("Please select a topic and write your argument");
      return;
    }
    setLoading(true);
    setStreamingReply("");
    try {
      const response = await fetch("http://localhost:8000/api/v1/debate/turn-text-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId, debate_format: debateFormat, argument, history,
          opponent_persona: opponentPersona, custom_scenario: customScenario, difficulty
        })
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);

      await consumeStream(
        response,
        (delta) => setStreamingReply((prev) => prev + delta),
        async (turnResult) => {
          setResult(turnResult);
          setStreamingReply("");
          setHistory((prev) => [
            ...prev,
            { role: "user", content: turnResult.user_transcript },
            { role: "assistant", content: turnResult.ai_rebuttal }
          ]);
          await logFullReport(turnResult);
          setArgument("");
        }
      );

    } catch (error) {
      console.error(error);
      alert("Could not reach the AI engine. Make sure the Python service is running on localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // RECORD MODE — same real streaming, on the voice endpoint
  // ==============================
  const handleConfirmedTranscript = async (transcriptText, durationSec) => {
    setLoading(true);
    setStreamingReply("");
    try {
      const form = new FormData();
      form.append("session_id", sessionId);
      form.append("debate_format", debateFormat);
      form.append("duration_seconds", durationSec);
      form.append("transcript", transcriptText);
      form.append("history", JSON.stringify(history));
      if (opponentPersona) form.append("opponent_persona", opponentPersona);
      if (customScenario) form.append("custom_scenario", customScenario);
      if (difficulty) form.append("difficulty", difficulty);

      const response = await fetch("http://localhost:8000/api/v1/debate/turn-stream", {
        method: "POST",
        body: form
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);

      await consumeStream(
        response,
        (delta) => setStreamingReply((prev) => prev + delta),
        async (turnResult) => {
          setResult(turnResult);
          setStreamingReply("");
          setHistory((prev) => [
            ...prev,
            { role: "user", content: turnResult.user_transcript },
            { role: "assistant", content: turnResult.ai_rebuttal }
          ]);
          await logFullReport(turnResult);
        }
      );

    } catch (error) {
      console.error(error);
      alert("Could not reach the AI engine. Make sure the Python service is running on localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "learner") {
    return (
      <Layout>
        <h2 className="text-2xl font-bold mb-4">Debate Room</h2>
        <p className="text-gray-500">
          The Debate Room is where Learners practice live. As a {user?.role}, you can review
          learner sessions from your dashboard.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Debate Room</h2>

      {(opponentPersona || customScenario || difficulty) && (
        <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl px-4 py-3 mb-4 text-sm text-purple-300 max-w-2xl">
          🤖 {opponentPersona ? `Opponent: ${opponentPersona}` : customScenario ? `Custom Scenario: "${customScenario}"` : "AI Debate Simulation"}
          {difficulty && <span className="ml-2 text-gray-400">· Difficulty: {difficulty}</span>}
        </div>
      )}

      <div className={`grid gap-6 w-full ${(result || loading) ? "lg:grid-cols-[420px_1fr]" : ""}`}>

        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 h-fit">

          <h3 className="font-semibold text-lg mb-2">Step 1: Select Topic</h3>
          <select
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">Select a topic</option>
            {topics.map((t) => (
              <option key={t._id} value={t.title}>{t.title}</option>
            ))}
          </select>

          <h3 className="font-semibold text-lg mb-2">Debate Format</h3>
          <select
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4"
            value={debateFormat}
            onChange={(e) => setDebateFormat(e.target.value)}
          >
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>

          <h3 className="font-semibold text-lg mb-2">Step 2: Choose Stance</h3>
          <select
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4"
            value={stance}
            onChange={(e) => setStance(e.target.value)}
          >
            <option value="">Select stance</option>
            <option value="For">For</option>
            <option value="Against">Against</option>
          </select>

          <h3 className="font-semibold text-lg mb-2">Step 3: Give Your Argument</h3>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setInputMode("type")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                inputMode === "type" ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
              }`}
            >
              ⌨️ Type
            </button>
            <button
              type="button"
              onClick={() => setInputMode("record")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                inputMode === "record" ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
              }`}
            >
              🎙️ Record
            </button>
          </div>

          {inputMode === "type" && (
            <>
              <textarea
                placeholder="Write your argument..."
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4 min-h-[120px]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold py-3 rounded-lg"
                >
                  {loading ? "Analyzing..." : "Get AI Feedback"}
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft || !argument.trim()}
                  className="bg-[#0f0f1a] border border-white/10 hover:border-purple-500 disabled:opacity-50 transition text-gray-300 font-medium px-4 py-3 rounded-lg text-sm"
                >
                  {savingDraft ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </>
          )}

          {inputMode === "record" && (
            <>
              <VoiceRecorder disabled={loading} onConfirmed={handleConfirmedTranscript} />
              {loading && <p className="text-gray-400 text-sm">Analyzing your argument...</p>}
            </>
          )}
        </div>

        {(streamingReply || result) && (
          <div>
            {streamingReply && !result && (
              <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
                <p className="text-gray-500 text-xs mb-3">AI Opponent is responding...</p>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {streamingReply}
                  <span className="inline-block w-2 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
                </p>
                <p className="text-gray-500 text-xs mt-4">Scoring your argument in the background — full report appears once the AI finishes speaking.</p>
              </div>
            )}
            {result && <ReportCard result={result} />}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DebateRoom;
