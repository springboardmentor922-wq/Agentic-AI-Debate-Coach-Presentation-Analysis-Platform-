import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import ReportCard from "../components/ReportCard";
import { getUser } from "../utils/useAuth";

const FORMATS = [
  "One-on-One Debate", "Parliamentary Debate", "Oxford Debate",
  "Policy Debate", "Public Forum Debate", "AI Debate Simulation"
];

function PhasedDebateRoom() {
  const user = getUser();
  const location = useLocation();
  const preset = location.state || {};

  // ---- Setup form ----
  const [topic, setTopic] = useState(preset.presetTopic || "");
  const [format, setFormat] = useState(preset.presetFormat || FORMATS[0]);
  const [stance, setStance] = useState("For");
  const [difficulty, setDifficulty] = useState(preset.difficulty || "Intermediate");
  const opponentPersona = preset.opponentPersona || null;
  const customScenario = preset.customScenario || null;

  const [sessionId] = useState(() => `${user?.id || "guest"}-phased-${Date.now()}`);
  const [status, setStatus] = useState("setup"); // setup | in_progress | continue_check | completed
  const [transcript, setTranscript] = useState([]);
  const [waiting, setWaiting] = useState(null); // current interrupt payload
  const [finalReport, setFinalReport] = useState(null);

  const [content, setContent] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamingReply, setStreamingReply] = useState(""); // ✅ NEW — Phase D: real live AI text as it's generated

  const timerRef = useRef(null);
  const contentRef = useRef(""); // always-current ref so the timer callback sees the latest text

  useEffect(() => { contentRef.current = content; }, [content]);

  // ---- Timer: starts whenever a new user phase_turn is waiting ----
  useEffect(() => {
    clearInterval(timerRef.current);
    if (status === "in_progress" && waiting?.type === "phase_turn") {
      setRemaining(waiting.time_limit_seconds);
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitPhase(contentRef.current, true); // hard cutoff — auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting]);

  const handleApiResult = (data) => {
    setTranscript(data.transcript || []);
    setStreamingReply("");
    if (data.status === "completed") {
      setStatus("completed");
      setFinalReport(data.final_report);
      setWaiting(null);
    } else if (data.waiting_for?.type === "continue_check") {
      setStatus("continue_check");
      setWaiting(data.waiting_for);
    } else {
      setStatus("in_progress");
      setWaiting(data.waiting_for);
    }
  };

  // ✅ NEW — Phase D: real SSE consumer, same pattern as DebateRoom.jsx —
  // reads chunk/done events off the raw stream as they arrive.
  const consumeStream = async (response, onChunk, onDone) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop();
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

  const handleStart = async () => {
    if (!topic.trim()) { alert("Enter a topic first"); return; }
    setLoading(true); setError(""); setStreamingReply("");
    try {
      const response = await fetch("http://localhost:8000/api/v1/debate/session/start-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId, debate_format: format, topic, stance,
          difficulty, opponent_persona: opponentPersona, custom_scenario: customScenario
        })
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);
      await consumeStream(response, (delta) => setStreamingReply((prev) => prev + delta), handleApiResult);
    } catch (err) {
      setError("Could not start the session. Make sure the AI engine is running.");
    } finally { setLoading(false); }
  };

  const submitPhase = async (text, timedOut) => {
    clearInterval(timerRef.current);
    setLoading(true); setError(""); setStreamingReply("");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/debate/session/${sessionId}/submit-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debate_format: format, content: text, timed_out: timedOut })
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);
      setContent("");
      await consumeStream(response, (delta) => setStreamingReply((prev) => prev + delta), handleApiResult);
    } catch (err) {
      setError("Could not submit your speech.");
    } finally { setLoading(false); }
  };

  const respondContinue = async (action) => {
    setLoading(true); setError(""); setStreamingReply("");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/debate/session/${sessionId}/continue-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debate_format: format, action })
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);
      await consumeStream(response, (delta) => setStreamingReply((prev) => prev + delta), handleApiResult);
    } catch (err) {
      setError("Could not respond.");
    } finally { setLoading(false); }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Phased Debate</h2>
      <p className="text-gray-500 mb-6">
        Format-accurate rounds with real speech types, real time limits, and hard cutoffs — matches how {format} is actually structured.
        Typed only for now, voice isn't wired into phased mode yet.
      </p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {status === "setup" && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl">
          <h3 className="font-semibold text-lg mb-2">Topic</h3>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Should social media be regulated?"
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4" />

          <h3 className="font-semibold text-lg mb-2">Format</h3>
          <select value={format} onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4">
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>

          <h3 className="font-semibold text-lg mb-2">Your Stance</h3>
          <select value={stance} onChange={(e) => setStance(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4">
            <option value="For">For</option>
            <option value="Against">Against</option>
          </select>

          <h3 className="font-semibold text-lg mb-2">Difficulty</h3>
          <div className="flex gap-2 mb-4">
            {["Beginner", "Intermediate", "Hard"].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  difficulty === d ? "bg-purple-600 text-white" : "bg-[#0f0f1a] text-gray-400 border border-white/10"
                }`}>{d}</button>
            ))}
          </div>

          <button onClick={handleStart} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold py-3 rounded-lg">
            {loading ? "Starting..." : "Start Phased Debate"}
          </button>
        </div>
      )}

      {(status === "in_progress" || status === "continue_check") && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Transcript */}
          <div className="space-y-3">
            {transcript.map((t, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${t.speaker === "user" ? "bg-purple-600/10 border-purple-500/30" : "bg-[#1a1a2b] border-white/5"}`}>
                <p className="text-xs text-gray-500 mb-1">
                  {t.speaker === "user" ? "You" : "AI Opponent"} — {t.speech_type}
                  {t.timed_out && <span className="text-orange-400 ml-2">(time expired)</span>}
                </p>
                <p className="text-gray-200 whitespace-pre-wrap">{t.content || "(no response submitted)"}</p>
              </div>
            ))}
          </div>

          {/* Current phase panel */}
          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5 h-fit sticky top-6">
            {status === "continue_check" ? (
              <>
                <h3 className="font-semibold mb-3">Continue or End?</h3>
                <p className="text-gray-400 text-sm mb-4">{waiting?.message}</p>
                <div className="flex gap-2">
                  <button onClick={() => respondContinue("continue")} disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-sm font-semibold py-2 rounded-lg">
                    Continue (extra round)
                  </button>
                  <button onClick={() => respondContinue("end")} disabled={loading}
                    className="flex-1 bg-[#0f0f1a] border border-white/10 hover:border-red-500 transition text-gray-300 text-sm font-semibold py-2 rounded-lg">
                    End Debate
                  </button>
                </div>
              </>
            ) : waiting?.type === "phase_turn" ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide">{waiting.speech_type}</span>
                  <span className={`text-sm font-mono font-bold ${remaining <= 10 ? "text-red-400 animate-pulse" : "text-gray-300"}`}>
                    {fmtTime(remaining)}
                  </span>
                </div>
                {waiting.rules?.length > 0 && (
                  <ul className="text-gray-500 text-xs mb-3 list-disc list-inside">
                    {waiting.rules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your speech..." disabled={loading}
                  className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 mb-3 text-sm min-h-[160px]" />
                <button onClick={() => submitPhase(content, false)} disabled={loading || !content.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white text-sm font-semibold py-2.5 rounded-lg">
                  {loading ? "Submitting..." : "Submit Speech"}
                </button>
                {remaining <= 10 && remaining > 0 && (
                  <p className="text-red-400 text-xs mt-2 text-center">Time's almost up — whatever's typed will auto-submit at 0.</p>
                )}
              </>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-2">AI is speaking...</p>
                {streamingReply && (
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {streamingReply}
                    <span className="inline-block w-2 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {status === "completed" && finalReport && (
        <div>
          <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-lg mb-1">Debate Complete</h3>
            <p className="text-gray-400 text-sm">Final report aggregated from every one of your speeches in this debate.</p>
          </div>
          <ReportCard result={finalReport} />
        </div>
      )}
    </Layout>
  );
}

export default PhasedDebateRoom;
