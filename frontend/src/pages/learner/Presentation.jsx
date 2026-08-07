import { useEffect, useRef, useState } from "react";
import {
  Presentation as PresentationIcon,
  Gauge,
  MessageSquareWarning,
  TrendingUp,
  UploadCloud,
  Mic,
  Video,
  Loader2,
  FileAudio,
  FileVideo,
  Download,
} from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import api, { mediaAudioUrl } from "../../api/axios";

const AUDIO_EXT = [".mp3", ".wav", ".m4a"];
const VIDEO_EXT = [".mp4", ".mov", ".avi"];

function ScoreDial({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-black/5 p-3 dark:border-white/10">
      <span className="font-display text-2xl font-bold text-ink-900 dark:text-white">
        {Math.round(value)}
      </span>
      <span className="text-center text-[11px] leading-tight text-ink-900/50 dark:text-white/50">
        {label}
      </span>
    </div>
  );
}

export default function Presentation() {
  const [tab, setTab] = useState("audio"); // audio | video | history
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  useEffect(() => {
    if (tab !== "history") return;
    setHistoryLoading(true);
    setHistoryError(null);
    api
      .get("/debate/presentation-analysis", { params: { limit: 10 } })
      .then((res) => setHistory(res.data))
      .catch((err) =>
        setHistoryError(
          err.response?.data?.detail || "Could not load your analysis history.",
        ),
      )
      .finally(() => setHistoryLoading(false));
  }, [tab]);

  const allowedExt = tab === "video" ? VIDEO_EXT : AUDIO_EXT;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setError(null);
    setResult(null);
    if (!f) {
      setFile(null);
      return;
    }
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!allowedExt.includes(ext)) {
      setError(
        `Unsupported format "${ext}". Allowed: ${allowedExt.join(", ")}`,
      );
      setFile(null);
      return;
    }
    setFile(f);
  };

  const getMediaDuration = (f) =>
    new Promise((resolve) => {
      const el = document.createElement(tab === "video" ? "video" : "audio");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(el.src);
        resolve(Number.isFinite(el.duration) ? el.duration : 30);
      };
      el.onerror = () => resolve(30);
      el.src = URL.createObjectURL(f);
    });

  const pollJob = (jobId) =>
    new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const { data: job } = await api.get(`/jobs/${jobId}`);
          setProgressStage(job.message || job.status);
          setProgressPercent(job.progress || 0);
          if (job.status === "done") {
            clearInterval(interval);
            resolve(job.result);
          } else if (job.status === "error") {
            clearInterval(interval);
            reject(new Error(job.error || job.message || "Processing failed."));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 1200);
    });

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    setFallbackNotice(null);
    setProgressPercent(0);
    try {
      setProgressStage("Uploading…");
      const duration = await getMediaDuration(file);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("duration_seconds", String(Math.round(duration)));

      const endpoint =
        tab === "video" ? "/debate/upload-video" : "/debate/upload-audio";
      const { data: accepted } = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resultDoc = await pollJob(accepted.job_id);

      if (resultDoc?.transcription_engine === "local") {
        setFallbackNotice(
          resultDoc.transcription_fallback_reason ||
            "Local transcription was used successfully.",
        );
      }
      setResult(resultDoc);
      setProgressStage("Completed");
      setProgressPercent(100);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      setTimeout(() => {
        setProgressStage("");
        setProgressPercent(0);
      }, 600);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: "Presentation Analysis" }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Presentation Analysis
        </h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">
          Upload an audio or video recording — real speech-to-text, pacing,
          filler-word, and delivery scoring, powered by Whisper + GPT.
        </p>
      </div>

      <div className="flex gap-2 border-b border-black/5 dark:border-white/10">
        {[
          { key: "audio", label: "Upload Audio", icon: Mic },
          { key: "video", label: "Upload Video", icon: Video },
          { key: "history", label: "Past Reports", icon: FileAudio },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              reset();
            }}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-brand-500 text-brand-600 dark:text-brand-300"
                : "border-transparent text-ink-900/50 dark:text-white/50"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {(tab === "audio" || tab === "video") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="glass-card p-6 lg:col-span-1">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              <UploadCloud size={18} className="text-brand-500" />
              {tab === "video" ? "Upload Video" : "Upload Audio"}
            </h2>

            {error && (
              <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            )}

            {fallbackNotice && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {fallbackNotice}
              </p>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 p-6 text-center text-xs text-ink-900/50 transition hover:border-brand-400 dark:border-white/10 dark:text-white/50">
              {tab === "video" ? (
                <FileVideo size={22} />
              ) : (
                <FileAudio size={22} />
              )}
              {file
                ? file.name
                : `Click to choose a ${tab === "video" ? "video" : "audio"} file`}
              <span className="text-[10px] text-ink-900/35 dark:text-white/35">
                Allowed: {allowedExt.join(", ")}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedExt.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <button
              onClick={upload}
              disabled={!file || uploading}
              className="btn-primary mt-4 w-full"
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UploadCloud size={15} />
              )}
              {uploading ? progressStage || "Analyzing…" : "Analyze Recording"}
            </button>

            {uploading && (
              <div className="mt-3">
                <ProgressBar
                  value={progressPercent}
                  tone="brand"
                  size="sm"
                  showValue
                />
              </div>
            )}

            <p className="mt-4 text-xs text-ink-900/40 dark:text-white/40">
              Pipeline: Upload → {tab === "video" ? "Extract audio → " : ""}
              Whisper transcription → Argument analysis → Fallacy detection →
              Counterarguments → Delivery score → saved to your history.
            </p>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            {!result ? (
              <EmptyState
                icon={PresentationIcon}
                title="No analysis yet"
                description={`Upload a ${tab} recording to get a real, AI-generated presentation report.`}
              />
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <ScoreDial
                    label="Overall"
                    value={result.presentation_score.overall_score}
                  />
                  <ScoreDial
                    label="Confidence"
                    value={result.presentation_score.confidence_score}
                  />
                  <ScoreDial
                    label="Clarity"
                    value={result.presentation_score.clarity_score}
                  />
                  <ScoreDial
                    label="Engagement"
                    value={result.presentation_score.engagement_score}
                  />
                  <ScoreDial
                    label="Pacing"
                    value={result.presentation_score.pacing_score}
                  />
                  <ScoreDial
                    label="Fluency"
                    value={result.presentation_score.fluency_score}
                  />
                  <ScoreDial
                    label="Pronunciation"
                    value={result.presentation_score.pronunciation_score}
                  />
                  <ScoreDial
                    label="Grammar"
                    value={result.presentation_score.grammar_score}
                  />
                  <ScoreDial
                    label="Persuasion"
                    value={result.presentation_score.persuasion_score}
                  />
                </div>

                {result.audio_filename && (
                  <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      Your Recording
                    </p>
                    <audio
                      controls
                      src={mediaAudioUrl(result.id)}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="rounded-xl border border-black/5 p-4 text-sm text-ink-900/70 dark:border-white/10 dark:text-white/70">
                  <p className="mb-1 flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                    <Gauge size={15} className="text-brand-500" /> Coach
                    Feedback
                  </p>
                  {result.presentation_score.feedback}
                </div>

                {(result.presentation_score.strengths?.length > 0 ||
                  result.presentation_score.weaknesses?.length > 0) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {result.presentation_score.strengths?.length > 0 && (
                      <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-verdict-600">
                          Strengths
                        </p>
                        <ul className="flex flex-col gap-1">
                          {result.presentation_score.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-ink-900/70 dark:text-white/70"
                            >
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.presentation_score.weaknesses?.length > 0 && (
                      <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-alert-500">
                          Weaknesses
                        </p>
                        <ul className="flex flex-col gap-1">
                          {result.presentation_score.weaknesses.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-ink-900/70 dark:text-white/70"
                            >
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.presentation_score.improvement_suggestions?.length >
                  0 && (
                  <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                      Improvement Suggestions
                    </p>
                    <ul className="flex flex-col gap-1">
                      {result.presentation_score.improvement_suggestions.map(
                        (s, i) => (
                          <li
                            key={i}
                            className="text-sm text-ink-900/80 dark:text-white/80"
                          >
                            • {s}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      Speech Metrics
                    </p>
                    <p className="text-sm text-ink-900 dark:text-white">
                      {result.speech_metrics.words_per_minute} words/min
                    </p>
                    <p className="text-xs text-ink-900/50 dark:text-white/50">
                      {result.speech_metrics.word_count} words ·{" "}
                      {Math.round(result.speech_metrics.duration_seconds)}s
                      duration
                    </p>
                  </div>
                  <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      <MessageSquareWarning size={13} /> Filler Words (
                      {result.speech_metrics.filler_word_count})
                    </p>
                    {Object.keys(result.speech_metrics.filler_words).length ===
                    0 ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-300">
                        None detected — clean delivery.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(result.speech_metrics.filler_words).map(
                          ([w, c]) => (
                            <Badge key={w} tone="warning">
                              "{w}" ×{c}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                    Transcript
                  </p>
                  <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-ink-900/70 dark:text-white/70">
                    {result.transcript}
                  </p>
                </div>

                {result.fallacy_report?.fallacy_detected && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                    <Badge tone="warning">
                      {result.fallacy_report.fallacy_type}
                    </Badge>
                    <p className="mt-1.5 text-xs text-amber-800 dark:text-amber-200">
                      {result.fallacy_report.explanation}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      Counterarguments
                    </p>
                    <ul className="space-y-1 text-xs text-ink-900/70 dark:text-white/70">
                      {result.counterarguments.counterarguments
                        .slice(0, 3)
                        .map((c, i) => (
                          <li key={i}>— {c}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      Missing Evidence
                    </p>
                    <ul className="space-y-1 text-xs text-ink-900/70 dark:text-white/70">
                      {result.counterarguments.missing_evidence
                        .slice(0, 3)
                        .map((c, i) => (
                          <li key={i}>— {c}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-white/50">
                      Improvement Suggestions
                    </p>
                    <ul className="space-y-1 text-xs text-ink-900/70 dark:text-white/70">
                      {result.counterarguments.improvement_suggestions
                        .slice(0, 3)
                        .map((c, i) => (
                          <li key={i}>— {c}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="glass-card p-6">
          {historyError && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {historyError}
            </p>
          )}
          {historyLoading ? (
            <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">
              Loading your reports…
            </p>
          ) : history.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No reports yet"
              description="Upload an audio or video recording to build your presentation history."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-black/5 p-4 dark:border-white/10"
                >
                  <button
                    onClick={() =>
                      setExpandedHistoryId((cur) =>
                        cur === h.id ? null : h.id,
                      )
                    }
                    className="flex w-full items-center justify-between"
                  >
                    <div className="min-w-0 text-left">
                      <p className="flex items-center gap-2 text-sm font-medium text-ink-900 dark:text-white">
                        {h.media_type === "video" ? (
                          <FileVideo size={14} />
                        ) : (
                          <FileAudio size={14} />
                        )}
                        {h.topic
                          ? h.topic
                          : (h.media_type === "video" ? "Video" : "Audio") +
                            " analysis"}
                      </p>
                      <p className="truncate text-xs text-ink-900/50 dark:text-white/50">
                        {new Date(h.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold text-brand-600 dark:text-brand-300">
                      {Math.round(h.presentation_score.overall_score)}
                    </span>
                  </button>

                  {expandedHistoryId === h.id && (
                    <div className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-3 dark:border-white/10">
                      {h.audio_filename && (
                        <audio
                          controls
                          src={mediaAudioUrl(h.id)}
                          className="w-full"
                        />
                      )}
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                          Transcript
                        </p>
                        <p className="rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-ink-900/80 dark:bg-white/5 dark:text-white/80">
                          {h.transcript}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {[
                          "confidence_score",
                          "clarity_score",
                          "fluency_score",
                          "grammar_score",
                          "persuasion_score",
                        ].map((k) => (
                          <div
                            key={k}
                            className="rounded-lg bg-black/[0.03] px-2 py-2 text-center dark:bg-white/5"
                          >
                            <p className="font-data text-sm font-bold text-ink-900 dark:text-white">
                              {h.presentation_score[k]}
                            </p>
                            <p className="text-[9px] uppercase text-ink-900/40 dark:text-white/40">
                              {k.replace("_score", "")}
                            </p>
                          </div>
                        ))}
                      </div>
                      <a
                        href={mediaAudioUrl(h.id)}
                        download
                        className="btn-secondary w-fit !py-2 text-xs"
                      >
                        <Download size={13} /> Download Recording
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
