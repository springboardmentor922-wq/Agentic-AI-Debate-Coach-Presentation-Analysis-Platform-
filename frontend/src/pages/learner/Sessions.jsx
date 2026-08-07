import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  Plus,
  Play,
  Square,
  Users,
  Bot,
  Clock,
  History,
  Loader2,
  PlayCircle,
  UploadCloud,
  Video,
  Download,
  PauseCircle,
} from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Toolbar, {
  SearchInput,
  SelectFilter,
} from "../../components/ui/Toolbar";
import Pagination from "../../components/ui/Pagination";
import AudioRecorder from "../../components/ui/AudioRecorder";
import ProgressBar from "../../components/ui/ProgressBar";
import api from "../../api/axios";

// The approved debate formats — must match backend/app/schemas/debate.py's
// DebateFormat enum exactly (same value keys).
const FORMATS = [
  { value: "oxford", label: "Oxford Debate" },
  { value: "british_parliamentary", label: "British Parliamentary" },
  { value: "asian_parliamentary", label: "Asian Parliamentary" },
  { value: "public_forum", label: "Public Forum" },
  { value: "lincoln_douglas", label: "Lincoln-Douglas" },
  { value: "world_schools", label: "World Schools" },
  { value: "ai_simulation", label: "AI Simulation" },
  { value: "popularity", label: "Popularity Debate" },
  { value: "one_on_one", label: "One-on-One" },
  { value: "group_debate", label: "Group Debate" },
  { value: "parliamentary", label: "Parliamentary" },
  { value: "policy", label: "Policy" },
];

// Simplified per spec: every session uses a plain For / Against side,
// regardless of format.
const POSITIONS_BY_FORMAT = Object.fromEntries(
  FORMATS.map((f) => [f.value, ["For", "Against"]]),
);
const RESULT_TONE = {
  Strong: "success",
  Fair: "warning",
  "Needs Work": "danger",
  "Pending Review": "neutral",
};
const PAGE_SIZE = 5;
const PERSONALITIES = [
  { value: "beginner", label: "Beginner — simple logic, light rebuttals" },
  { value: "intermediate", label: "Intermediate — balanced pushback" },
  { value: "advanced", label: "Advanced — strong evidence & attacks" },
  { value: "expert", label: "Expert — cross-examination & fallacy calling" },
];

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function Sessions() {
  const location = useLocation();
  const [tab, setTab] = useState("new");

  // --- New / live session state ---
  const [topic, setTopic] = useState(location.state?.topic || "");
  const [format, setFormat] = useState(
    location.state?.format || FORMATS[0].value,
  );
  const [personality, setPersonality] = useState("intermediate");
  const [position, setPosition] = useState(
    POSITIONS_BY_FORMAT[FORMATS[0].value][0],
  );
  // Custom Debate (per spec): a learner can type their own topic instead of
  // picking from the curated library — same /debate/start pipeline either way.
  const [topicMode, setTopicMode] = useState(
    location.state?.customMode ? "custom" : "curated",
  );
  const [session, setSession] = useState(null); // full DebateSessionOut from backend
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [turns, setTurns] = useState([]); // { speaker, text, fallacy? }
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const timerRef = useRef(null);

  // --- Curated topics (Part 1 requirement: approved categories only) ---
  const [curatedTopics, setCuratedTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTopicsLoading(true);
    api
      .get("/debate/topics", { params: { debate_format: format } })
      .then((res) => {
        if (!cancelled) setCuratedTopics(res.data);
      })
      .catch(() => {
        if (!cancelled) setCuratedTopics([]);
      })
      .finally(() => {
        if (!cancelled) setTopicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [format]);

  // --- Session-linked media upload state (Audio/Video Upload requirement) ---
  const [uploadingMedia, setUploadingMedia] = useState(null); // 'audio' | 'video' | null
  const [mediaResult, setMediaResult] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // --- Report download state ---
  const [downloadingReport, setDownloadingReport] = useState(null);

  // --- Live microphone recording state (Milestone 3, Part 2 + voice-recording spec) ---
  const [submittingRecording, setSubmittingRecording] = useState(false);
  const [lastRecordingNote, setLastRecordingNote] = useState(null);

  const submitTurnRecording = async (blob, durationSeconds) => {
    setSubmittingRecording(true);
    setLastRecordingNote(null);
    const fd = new FormData();
    fd.append("file", blob, "turn.webm");
    try {
      // Fill the turn's text draft immediately (lightweight, transcript-only).
      const draftRes = await api.post("/debate/transcribe", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDraft(draftRes.data.transcript || "");

      // Persist the actual audio + run the full presentation/argument/fallacy
      // pipeline against it, tied to this session — this is what makes the
      // recording (and its transcript) show up later in session history.
      if (session?.id) {
        const fd2 = new FormData();
        fd2.append("file", blob, "turn.webm");
        fd2.append("session_id", session.id);
        fd2.append("duration_seconds", String(durationSeconds || 0));
        // upload-audio now returns 202 + a job id immediately; the full
        // pipeline (transcription, argument/fallacy analysis, scoring) runs
        // in the background and lands in session history a few seconds
        // later rather than blocking this request.
        await api.post("/debate/upload-audio", fd2, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setLastRecordingNote(
          "Recording saved — your full presentation report will appear in session history shortly.",
        );
      }
    } catch (err) {
      setFormError(
        err.response?.data?.detail ||
          "Could not process your recording. You can type your turn instead.",
      );
    } finally {
      setSubmittingRecording(false);
    }
  };

  useEffect(() => {
    if (session && session.status === "active") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [session]);

  const startSession = async (e) => {
    e.preventDefault();
    if (topicMode === "custom" && !topic.trim()) {
      setFormError("Please type your custom debate topic before starting.");
      return;
    }
    setStarting(true);
    setFormError(null);
    try {
      // Milestone 3: /debate/start picks a curated topic from MongoDB when
      // none is supplied, and stores the chosen AI opponent personality.
      const res = await api.post("/debate/start", {
        topic: topic.trim() || undefined,
        debate_format: format,
        ai_personality: personality,
        position,
      });
      setSession(res.data);
      setTopic(res.data.topic);
      setSeconds(0);
      setTurns([]);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Could not start the session.",
      );
    } finally {
      setStarting(false);
    }
  };

  const endSession = async () => {
    if (!session) return;
    setFinishing(true);
    setFormError(null);
    try {
      if (turns.length > 0) {
        // Real content exists — this is the only code path that generates
        // an AI report. Never silently mark a session 'completed' any other way.
        const res = await api.post("/debate/finish", null, {
          params: { session_id: session.id },
        });
        setSession(res.data.session);
      } else {
        // Nothing was ever recorded — be honest about it instead of faking
        // a 'completed' debate with no transcript and no report.
        const res = await api.patch(`/debate/sessions/${session.id}/status`, {
          status: "cancelled",
        });
        setSession(res.data);
        setFormError(
          "No turns were recorded, so this session was cancelled rather than marked completed — there was nothing for the AI to analyze.",
        );
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || "Could not end the session.");
    } finally {
      setFinishing(false);
    }
  };

  const pauseSession = async () => {
    if (!session) return;
    setPausing(true);
    try {
      const res = await api.patch(`/debate/sessions/${session.id}/status`, {
        status: "paused",
      });
      setSession(res.data);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Could not pause the session.",
      );
    } finally {
      setPausing(false);
    }
  };

  const resumeSession = async () => {
    if (!session) return;
    setPausing(true);
    try {
      const res = await api.patch(`/debate/sessions/${session.id}/status`, {
        status: "active",
      });
      setSession(res.data);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Could not resume the session.",
      );
    } finally {
      setPausing(false);
    }
  };

  const [mediaProgress, setMediaProgress] = useState(0);

  const uploadMedia = async (kind, file) => {
    if (!session || !file) return;
    setUploadingMedia(kind);
    setMediaError(null);
    setMediaResult(null);
    setMediaProgress(0);
    try {
      const duration = await new Promise((resolve) => {
        const el = document.createElement(kind === "video" ? "video" : "audio");
        el.preload = "metadata";
        el.onloadedmetadata = () => {
          URL.revokeObjectURL(el.src);
          resolve(Number.isFinite(el.duration) ? el.duration : 30);
        };
        el.onerror = () => resolve(30);
        el.src = URL.createObjectURL(file);
      });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("session_id", session.id);
      fd.append("duration_seconds", String(Math.round(duration)));
      const endpoint =
        kind === "video" ? "/debate/upload-video" : "/debate/upload-audio";
      // Validation errors (bad format/too large) throw synchronously and
      // are caught below. Otherwise we get a job id back immediately and
      // poll for real progress while the pipeline runs in the background.
      const { data: accepted } = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resultDoc = await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const { data: job } = await api.get(`/jobs/${accepted.job_id}`);
            setMediaProgress(job.progress || 0);
            if (job.status === "done") {
              clearInterval(interval);
              resolve(job.result);
            } else if (job.status === "error") {
              clearInterval(interval);
              reject(
                new Error(job.error || job.message || "Processing failed."),
              );
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 1200);
      });
      setMediaResult(resultDoc);
    } catch (err) {
      setMediaError(
        err.response?.data?.detail ||
          err.message ||
          `Could not analyze this ${kind} upload.`,
      );
    } finally {
      setUploadingMedia(null);
    }
  };

  const downloadReport = async (sessionId) => {
    setDownloadingReport(sessionId);
    try {
      const res = await api.get(`/reports/${sessionId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `debate_report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFormError(
        err.response?.data?.detail ||
          "No report is available for this debate yet.",
      );
    } finally {
      setDownloadingReport(null);
    }
  };

  const startNew = () => {
    setSession(null);
    setTurns([]);
    setSeconds(0);
    setTopic("");
    setFormError(null);
    setMediaResult(null);
    setMediaError(null);
  };

  const submitTurn = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !session || sending || session.status === "paused")
      return;
    const userText = draft;
    setDraft("");
    setTurns((prev) => [...prev, { speaker: "user", text: userText }]);
    setSending(true);
    try {
      const res = await api.post("/debate/live", {
        session_id: session.id,
        text: userText,
        ai_personality: personality,
      });
      setTurns((prev) => [
        ...prev,
        {
          speaker: "ai",
          text: res.data.ai_rebuttal,
          fallacy: res.data.fallacy_report?.fallacy_detected
            ? res.data.fallacy_report
            : null,
        },
      ]);
      if (session.status !== "active") {
        setSession((s) => ({ ...s, status: "active" }));
      }
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        {
          speaker: "ai",
          text: `⚠️ ${err.response?.data?.detail || "Analysis failed for that turn."}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // --- History tab state ---
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (tab !== "history") return;
    let cancelled = false;
    setHistoryLoading(true);
    api
      .get("/debate/sessions/history")
      .then((res) => {
        if (!cancelled) setHistory(res.data.items);
      })
      .catch((err) => {
        if (!cancelled)
          setHistoryError(
            err.response?.data?.detail || "Could not load debate history.",
          );
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const formatLabel = (value) =>
    FORMATS.find((f) => f.value === value)?.label || value;

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch = h.topic
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFormat =
        formatFilter === "All Formats" || h.format === formatFilter;
      return matchesSearch && matchesFormat;
    });
  }, [history, search, formatFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const pageItems = filteredHistory.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const live = session && session.status === "active";
  const paused = session && session.status === "paused";
  const ended =
    session &&
    (session.status === "completed" || session.status === "cancelled");

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: "Debate Session" }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Debate Session
        </h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">
          Create a new debate, join a live room, or review your history.
        </p>
      </div>

      <div className="flex gap-2 border-b border-black/5 dark:border-white/10">
        {[
          { key: "new", label: "Create / Join Debate" },
          { key: "history", label: "Debate History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-brand-500 text-brand-600 dark:text-brand-300"
                : "border-transparent text-ink-900/50 dark:text-white/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "new" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Setup panel */}
          <div className="glass-card p-6 lg:col-span-1">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              <Plus size={18} className="text-brand-500" /> New Practice Session
            </h2>
            {formError && (
              <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {formError}
              </p>
            )}
            {!session ? (
              <form onSubmit={startSession} className="flex flex-col gap-3">
                <select
                  className="input-field"
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value);
                    setTopic("");
                    setPosition(POSITIONS_BY_FORMAT[e.target.value][0]);
                  }}
                >
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <select
                  className="input-field"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  {POSITIONS_BY_FORMAT[format].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="flex overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setTopicMode("curated");
                      setTopic("");
                    }}
                    className={`flex-1 py-2 text-xs font-semibold transition ${topicMode === "curated" ? "bg-brand-500 text-white" : "text-ink-900/60 dark:text-white/60"}`}
                  >
                    Practice Topics
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopicMode("custom")}
                    className={`flex-1 py-2 text-xs font-semibold transition ${topicMode === "custom" ? "bg-brand-500 text-white" : "text-ink-900/60 dark:text-white/60"}`}
                  >
                    Custom Debate
                  </button>
                </div>
                {topicMode === "curated" ? (
                  <>
                    <select
                      className="input-field"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={topicsLoading}
                    >
                      <option value="">🎯 Let AI pick a curated topic</option>
                      {curatedTopics.map((t) => (
                        <option key={t.id} value={t.title}>
                          {t.title} — {t.category} ({t.difficulty})
                        </option>
                      ))}
                    </select>
                    {!topicsLoading && curatedTopics.length === 0 && (
                      <p className="text-xs text-ink-900/40 dark:text-white/40">
                        No curated topics for this format yet — a random one
                        will still be assigned.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="input-field"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Type your own debate topic, e.g. 'Should AI replace teachers?'"
                    />
                    <p className="text-xs text-ink-900/40 dark:text-white/40">
                      Your custom topic goes through the exact same AI
                      evaluation pipeline as curated topics.
                    </p>
                  </>
                )}
                <select
                  className="input-field"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                >
                  {PERSONALITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={starting}
                >
                  {starting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Play size={15} />
                  )}{" "}
                  Start Session
                </button>
              </form>
            ) : ended ? (
              <button onClick={startNew} className="btn-primary">
                <Plus size={15} /> Start Another Session
              </button>
            ) : (
              <div className="flex gap-2">
                {paused ? (
                  <button
                    type="button"
                    onClick={resumeSession}
                    disabled={pausing}
                    className="btn-secondary flex-1"
                  >
                    {pausing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <PlayCircle size={15} />
                    )}{" "}
                    Resume
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseSession}
                    disabled={pausing}
                    className="btn-secondary flex-1"
                  >
                    {pausing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <PauseCircle size={15} />
                    )}{" "}
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={endSession}
                  disabled={finishing}
                  className="btn-secondary flex-1 !border-rose-200 !text-rose-600 dark:!text-rose-300"
                >
                  {finishing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Square size={15} />
                  )}
                  {turns.length > 0
                    ? "End & Generate Report"
                    : "End (no turns yet)"}
                </button>
              </div>
            )}

            {session && !ended && (
              <div className="mt-6 rounded-xl border border-black/5 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-900/60 dark:text-white/60">
                    <Clock size={13} /> Debate Timer
                  </span>
                  <span className="font-display text-lg font-bold text-brand-600 dark:text-brand-300">
                    {formatTime(seconds)}
                  </span>
                </div>

                <div className="mb-3">
                  <AudioRecorder
                    onSubmit={submitTurnRecording}
                    submitting={submittingRecording}
                    submitLabel="Use This Recording"
                  />
                  {lastRecordingNote && (
                    <p className="mt-2 text-xs font-medium text-verdict-600">
                      {lastRecordingNote}
                    </p>
                  )}
                </div>

                <p className="mb-3 flex items-center gap-2 text-xs text-ink-900/50 dark:text-white/50">
                  Record your turn or type it directly below — each turn is
                  analyzed for fallacies and argument quality in real time.
                </p>

                <div className="mb-3 flex gap-2">
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => uploadMedia("audio", e.target.files?.[0])}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => uploadMedia("video", e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={!!uploadingMedia}
                    className="btn-secondary flex-1 !py-2 text-xs"
                  >
                    {uploadingMedia === "audio" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <UploadCloud size={13} />
                    )}{" "}
                    Upload Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={!!uploadingMedia}
                    className="btn-secondary flex-1 !py-2 text-xs"
                  >
                    {uploadingMedia === "video" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Video size={13} />
                    )}{" "}
                    Upload Video
                  </button>
                </div>
                {uploadingMedia && (
                  <div className="mb-3">
                    <ProgressBar value={mediaProgress} size="sm" tone="brand" />
                  </div>
                )}
                {mediaError && (
                  <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    {mediaError}
                  </p>
                )}
                {mediaResult && (
                  <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Presentation score:{" "}
                    {mediaResult.presentation_score?.overall_score}/100 — full
                    breakdown on the Presentation Analysis page.
                  </div>
                )}

                <p className="text-center text-[11px] text-ink-900/40 dark:text-white/40">
                  Use the "{turns.length > 0 ? "End & Generate Report" : "End"}"
                  button above to finish this debate.
                </p>
              </div>
            )}

            {session && ended && session.status === "cancelled" && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                This session was cancelled — no turns were recorded, so there
                was nothing for the AI to analyze.
              </div>
            )}

            {ended && session.status === "completed" && (
              <div className="mt-6 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <p>
                  Session ended. Your feedback report has been generated — check
                  the Reports page for your score.
                </p>
                <button
                  type="button"
                  onClick={() => downloadReport(session.id)}
                  disabled={downloadingReport === session.id}
                  className="btn-secondary !py-1.5 text-xs !border-emerald-300 !text-emerald-700 dark:!text-emerald-300"
                >
                  {downloadingReport === session.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}{" "}
                  Download Report (PDF)
                </button>
              </div>
            )}
          </div>

          {/* Live room */}
          <div className="glass-card flex flex-col p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <Bot size={18} className="text-brand-500" /> Live Debate Room
              </h2>
              {session && !ended && (
                <Badge tone={paused ? "warning" : "success"}>
                  ● {paused ? "Paused" : live ? "Live" : "Scheduled"} · AI
                  Opponent
                </Badge>
              )}
              {ended && <Badge tone="neutral">Session {session.status}</Badge>}
            </div>

            {!session ? (
              <EmptyState
                icon={Users}
                title="No active debate"
                description="Set a topic and format, then start a session to enter the live debate room."
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-ink-900/60 dark:text-white/60">
                  Topic:{" "}
                  <span className="font-semibold text-ink-900 dark:text-white">
                    {session.topic}
                  </span>{" "}
                  · {formatLabel(session.debate_format)}
                  {session.position && (
                    <>
                      {" "}
                      · You:{" "}
                      <span className="font-semibold text-ink-900 dark:text-white">
                        {session.position}
                      </span>
                    </>
                  )}
                </p>
                <div className="mb-4 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
                  {turns.length === 0 && (
                    <p className="text-sm text-ink-900/50 dark:text-white/50">
                      Open with your first argument below — each turn is
                      analyzed for fallacies and argument quality in real time.
                    </p>
                  )}
                  {turns.map((t, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          t.speaker === "user"
                            ? "ml-auto rounded-tr-sm bg-brand-500 text-white"
                            : "mr-auto rounded-tl-sm bg-black/5 text-ink-900 dark:bg-white/10 dark:text-white"
                        }`}
                      >
                        {t.text}
                      </div>
                      {t.fallacy && (
                        <div className="ml-1 flex items-center gap-1.5 text-xs text-alert-500">
                          <Badge tone="warning">{t.fallacy.fallacy_type}</Badge>{" "}
                          {t.fallacy.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <p className="text-xs text-ink-900/40 dark:text-white/40">
                      Analyzing your turn…
                    </p>
                  )}
                </div>
                <form onSubmit={submitTurn} className="mt-auto flex gap-2">
                  <input
                    className="input-field"
                    placeholder={
                      paused
                        ? "Session is paused — resume to continue…"
                        : "Type your argument (speech transcript auto-fills when recording)…"
                    }
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={ended || paused || sending}
                  />
                  <button
                    type="submit"
                    className="btn-primary !px-4"
                    disabled={ended || paused || sending}
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="glass-card p-6">
          <Toolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search past debates…"
            />
            <SelectFilter
              value={formatFilter}
              onChange={(v) => {
                setFormatFilter(v);
                setPage(1);
              }}
              options={["All Formats", ...FORMATS.map((f) => f.value)].map(
                (f) => ({
                  value: f,
                  label: f === "All Formats" ? f : formatLabel(f),
                }),
              )}
            />
          </Toolbar>

          {historyError && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {historyError}
            </p>
          )}

          {historyLoading ? (
            <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">
              Loading your debate history…
            </p>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={History}
              title="No debates found"
              description={
                history.length === 0
                  ? "Complete a debate session to see it here."
                  : "Adjust your search or filters."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                    <th className="py-3 pr-4 font-medium">Topic</th>
                    <th className="py-3 pr-4 font-medium">Format</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Duration</th>
                    <th className="py-3 pr-4 font-medium">Score</th>
                    <th className="py-3 pr-4 font-medium">Result</th>
                    <th className="py-3 pr-4 font-medium">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-black/5 last:border-0 dark:border-white/10"
                    >
                      <td className="py-3 pr-4 font-medium text-ink-900 dark:text-white">
                        {h.topic}
                      </td>
                      <td className="py-3 pr-4 text-ink-900/60 dark:text-white/60">
                        {formatLabel(h.format)}
                      </td>
                      <td className="py-3 pr-4 text-ink-900/60 dark:text-white/60">
                        {h.date ? new Date(h.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 pr-4 text-ink-900/60 dark:text-white/60">
                        {formatDuration(h.duration_seconds)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-ink-900 dark:text-white">
                        {h.score != null ? `${h.score}/100` : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={RESULT_TONE[h.result]}>{h.result}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => downloadReport(h.id)}
                          disabled={downloadingReport === h.id}
                          className="btn-secondary !py-1 !px-2.5 text-xs"
                        >
                          {downloadingReport === h.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Download size={12} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalItems={filteredHistory.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        </div>
      )}
    </div>
  );
}
