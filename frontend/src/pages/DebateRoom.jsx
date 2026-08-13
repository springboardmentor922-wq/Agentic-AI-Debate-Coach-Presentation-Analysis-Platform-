import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Square, Info, Send, Settings2 } from "lucide-react";
import AppShell from "../components/AppShell";
import TimerRing from "../components/TimerRing";
import { sessionApi, topicApi, debateApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import ArgumentAnalysisCard from "../components/ArgumentAnalysisCard";
import CounterargumentCard from "../components/CounterargumentCard";
import FallacyAnalysisPanel from "../components/FallacyAnalysisPanel";

const LEVELS = ["low", "medium", "high"];

export default function DebateRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [persona, setPersona] = useState({ aggressiveness: "medium", sophistication: "medium", fallacy_rate: 0.2 });
  const transcriptEndRef = useRef(null);

  // --- Audio recording state ---
  const [recording, setRecording] = useState(false);
  const [nudge, setNudge] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadError(null);
      try {
        const { data } = await sessionApi.get(sessionId);
        if (cancelled) return;
        setSession(data);
        setRemaining(data.duration_minutes * 60);
        const { data: topics } = await topicApi.list();
        if (cancelled) return;
        setTopic(topics.find((t) => t.id === data.topic_id));
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404) {
          setLoadError("This debate session doesn't exist, or you don't have access to it.");
        } else {
          setLoadError("Something went wrong loading this session. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [sessionId]);

  useEffect(() => {
    if (session?.status === "in_progress") {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            handleEnd();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleStart = async () => {
    const { data } = await sessionApi.update(sessionId, { status: "in_progress" });
    setSession(data);
  };

  const handleEnd = async () => {

    clearInterval(intervalRef.current);

    try {

        // Complete session
        const { data } = await sessionApi.update(
            sessionId,
            {
                status: "completed",
            }
        );

        setSession(data);

        // Show loading message
        setSending(true);

        // Generate AI Judge Report
        await debateApi.generateJudgeReport(sessionId);

        // Navigate to report page
        navigate(`/judge/${sessionId}`);

    } catch (err) {

        console.error(err);

        alert("Unable to generate AI Judge report.");

    } finally {

        setSending(false);

    }

};

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const { data } = await debateApi.sendMessage(sessionId, { text, persona });
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          fallacy: data.user_fallacy_check,
          score: data.user_score,
          argumentAnalysis: data.argument_analysis,
          counterarguments: data.counterarguments,
          challengeQuestions: data.challenge_questions,
        };
        return [...updated, { role: "ai", text: data.ai_message }];
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "(The opponent couldn't respond just now — try again.)" },
      ]);
    } finally {
      setSending(false);
    }
  };

  // --- Audio recording handlers ---

  const handleMicToggle = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      handleSendAudio(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const handleSendAudio = async (blob) => {
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", text: "🎤 (voice turn — transcribing…)" }]);

    const formData = new FormData();
    formData.append("audio", blob, "turn.webm");
    formData.append("persona", JSON.stringify(persona));

    try {
      const { data } = await debateApi.sendAudioMessage(sessionId, formData);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "user",
          text: data.presentation_metrics.transcript,
          fallacy: data.user_fallacy_check,
          score: data.user_score,
          metrics: data.presentation_metrics,
          argumentAnalysis: data.argument_analysis,
          counterarguments: data.counterarguments,
          challengeQuestions: data.challenge_questions,
        };
        return [...updated, { role: "ai", text: data.ai_message }];
      });
      checkForNudge();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "(The opponent couldn't respond just now — try again.)" },
      ]);
    } finally {
      setSending(false);
    }
  };

  const checkForNudge = async () => {
    try {
      const { data } = await debateApi.getNudges(sessionId);
      if (data.length > 0) {
        setNudge(data[0].text);
        setTimeout(() => setNudge(null), 6000);
      }
    } catch {
      // silent — nudges are a nice-to-have, never block the debate flow
    }
  };

  if (loadError) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-8 py-16 text-center">
          <p className="text-fog text-sm mb-6">{loadError}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Back to dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  if (!session || !topic) {
    return (
      <AppShell>
        <div className="p-10 text-slate-muted text-sm">Loading debate room…</div>
      </AppShell>
    );
  }

  const canChat = session.status === "in_progress";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">
          Session #{String(session.id).padStart(4, "0")} · {topic.category}
        </p>
        <h1 className="font-display text-2xl mb-8 leading-snug">&ldquo;{topic.title}&rdquo;</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Chat transcript — main content */}
          <div className="md:col-span-2 card flex flex-col h-[560px]">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold">Debate transcript</span>
              <button
                onClick={() => setShowSettings((s) => !s)}
                className="text-xs text-slate-muted hover:text-fog flex items-center gap-1"
              >
                <Settings2 size={14} /> Opponent settings
              </button>
            </div>

            {showSettings && (
              <div className="px-5 py-4 border-b border-white/5 bg-white/5 grid grid-cols-3 gap-3">
                <div>
                  <label className="label-eyebrow block mb-1 text-[10px]">Aggressiveness</label>
                  <select
                    className="input-field py-1.5 text-xs capitalize"
                    value={persona.aggressiveness}
                    onChange={(e) => setPersona({ ...persona, aggressiveness: e.target.value })}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-eyebrow block mb-1 text-[10px]">Sophistication</label>
                  <select
                    className="input-field py-1.5 text-xs capitalize"
                    value={persona.sophistication}
                    onChange={(e) => setPersona({ ...persona, sophistication: e.target.value })}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-eyebrow block mb-1 text-[10px]">Fallacy rate</label>
                  <select
                    className="input-field py-1.5 text-xs"
                    value={persona.fallacy_rate}
                    onChange={(e) => setPersona({ ...persona, fallacy_rate: Number(e.target.value) })}
                  >
                    <option value={0}>0% (clean arguments)</option>
                    <option value={0.2}>20%</option>
                    <option value={0.3}>30%</option>
                    <option value={0.5}>50%</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-slate-muted text-sm text-center mt-10">
                  {canChat
                    ? "Type your opening argument below to begin the exchange."
                    : "Click \"Start speaking\" to begin the debate."}
                </p>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-motion-teal text-ink-900 rounded-br-sm"
                        : "bg-ink-600 text-fog border border-white/10 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.role === "user" && m.fallacy && <FallacyAnalysisPanel fallacyResult={m.fallacy} />}

                  {m.role === "user" && m.score && (
                    <span className="mt-1 text-[10px] text-slate-muted font-mono">
                      Clarity {m.score.clarity} · Evidence {m.score.evidence_strength} · Rebuttal{" "}
                      {m.score.rebuttal_quality} · Logic {m.score.logical_consistency}
                    </span>
                  )}

                 {m.role === "user" && m.metrics && (
                    <span className="mt-1 text-[10px] text-slate-muted font-mono">
                      {m.metrics.wpm} wpm · {m.metrics.filler_count} filler words
                    </span>
                  )}

                  {m.role === "user" && (
                    <div className="mt-2 w-full max-w-[75%]">
                      <ArgumentAnalysisCard argumentAnalysis={m.argumentAnalysis} />
                    </div>
                  )}

                  {m.role === "user" && (
                    <div className="mt-2 w-full max-w-[75%]">
                      <CounterargumentCard
                        counterarguments={m.counterarguments}
                        challengeQuestions={m.challengeQuestions}
                      />
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-ink-600 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-muted">
                    Opponent is thinking…
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
              <input
                className="input-field flex-1"
                placeholder={canChat ? "Type your argument…" : "Start the session to chat"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!canChat || sending || recording}
              />
              <button
                type="button"
                onClick={handleMicToggle}
                disabled={!canChat || sending}
                className={recording ? "btn-danger px-4" : "btn-secondary px-4"}
                title={recording ? "Stop recording" : "Record your argument"}
              >
                {recording ? "⏹" : "🎤"}
              </button>
              <button type="submit" disabled={!canChat || sending || recording} className="btn-primary px-4">
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Sidebar — timer + session info */}
          <div className="space-y-6">
            <div className="card p-6 flex flex-col items-center justify-center">
              <TimerRing totalSeconds={session.duration_minutes * 60} remainingSeconds={remaining} />
              <div className="mt-6 flex gap-3">
                {session.status !== "in_progress" && session.status !== "completed" && (
                  <button onClick={handleStart} className="btn-primary">
                    <Play size={16} /> Start speaking
                  </button>
                )}
                {session.status === "in_progress" && (
                  <button onClick={handleEnd} className="btn-danger">
                    <Square size={16} /> End session
                  </button>
                )}
              </div>
            </div>

            <div className="card p-6">
              <p className="label-eyebrow mb-3">Your stance</p>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold capitalize ${
                  session.stance === "for" ? "bg-motion-teal/15 text-motion-teal" : "bg-rebuttal-coral/15 text-rebuttal-coral"
                }`}
              >
                Arguing {session.stance}
              </span>

              <p className="label-eyebrow mt-6 mb-2">Session status</p>
              <p className="capitalize text-fog">{session.status.replace("_", " ")}</p>

              <p className="label-eyebrow mt-6 mb-2">Duration</p>
              <p className="text-fog">{session.duration_minutes} minutes</p>
            </div>

            <div className="card p-5 flex gap-3 items-start bg-signal-amber/5 border-signal-amber/20">
              <Info size={18} className="text-signal-amber shrink-0 mt-0.5" />
              <p className="text-xs text-slate-muted">
                The AI opponent argues the opposite side of your stance and may occasionally use a
                deliberate logical fallacy for practice. Each of your turns is scored on clarity,
                evidence, rebuttal quality, and logical consistency, with fallacies flagged inline.
                You can type your argument or record it with the mic button.
              </p>
            </div>
          </div>
        </div>

        {session.status === "completed" && (

    <div className="mt-6 flex justify-end gap-4">

        <button
            onClick={() => navigate(`/judge/${sessionId}`)}
            className="btn-primary"
        >
            🏆 View AI Judge Report
        </button>

        <button
            onClick={() => navigate("/reports")}
            className="btn-secondary"
        >
            View Previous Reports
        </button>

    </div>

)}
      </div>

      {nudge && (
        <div className="fixed bottom-6 right-6 card px-4 py-3 bg-signal-amber/10 border-signal-amber/30 text-sm max-w-xs shadow-lg z-50">
          💡 {nudge}
        </div>
      )}
    </AppShell>
  );
}