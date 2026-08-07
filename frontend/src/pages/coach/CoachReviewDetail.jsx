import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";
import ComprehensiveReport from "../../components/ui/ComprehensiveReport";
import api from "../../api/axios";

export default function CoachReviewDetail() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    coach_comments: "",
    coach_score: "",
    approve_ai_feedback: true,
  });

  const load = async () => {
    setLoading(true);

    try {
      const { data } = await api.get(`/coach/review/${reviewId}`);

      setData(data);

      setForm((prev) => ({
        ...prev,
        coach_comments: data.review.coach_comments || "",
        coach_score: data.review.coach_score ?? "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [reviewId]);

  const claim = async () => {
    setClaiming(true);

    try {
      await api.post(`/coach/review/${reviewId}/claim`);
      load();
    } finally {
      setClaiming(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);

    try {
      await api.post(`/coach/review/${reviewId}/submit`, {
        coach_comments: form.coach_comments,
        coach_score: form.coach_score === "" ? null : Number(form.coach_score),
        approve_ai_feedback: form.approve_ai_feedback,
        mark_status: "reviewed",
      });

      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonCard />;
  if (!data) return null;

  const { review, transcript, ai_report, fallacies_detected } = data;
  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Back Button */}

      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand-500 dark:text-white/60"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            {review.topic}
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            {review.learner_name} · {review.debate_format?.replace("_", " ")} ·{" "}
            <Badge tone="brand">{review.status}</Badge>
          </p>
        </div>

        {review.status === "pending" && (
          <Button onClick={claim} disabled={claiming}>
            {claiming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Claim for Review
          </Button>
        )}
      </div>

      <ComprehensiveReport sessionId={review.session_id} />

      {/* Score Cards */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
            AI Overall Score
          </p>

          <p className="font-data text-3xl font-bold text-brand-500">
            {review.ai_overall_score ?? "—"}/100
          </p>
        </Card>

        {ai_report && (
          <>
            <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
                Argument Quality
              </p>

              <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">
                {ai_report.argument_quality}/10
              </p>
            </Card>

            <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
                Communication Skills
              </p>

              <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">
                {ai_report.communication_skills}/10
              </p>
            </Card>
          </>
        )}
      </div>

      {/* AI Summary */}

      {ai_report && (
        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-3 text-lg font-semibold text-ink-900 dark:text-white">
            AI Summary
          </p>

          <p className="text-sm leading-7 text-gray-600 dark:text-white/70">
            {ai_report.final_summary}
          </p>

          {ai_report.strengths?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ai_report.strengths.map((s, i) => (
                <Badge key={i} tone="success">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Fallacies */}

      {fallacies_detected?.length > 0 && (
        <Card className="border-l-4 border-alert-500 border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-3 flex items-center gap-2 font-semibold text-alert-600">
            <AlertTriangle size={16} />
            Fallacies Detected ({fallacies_detected.length})
          </p>

          <ul className="flex flex-col gap-3">
            {fallacies_detected.map((f, i) => (
              <li
                key={i}
                className="rounded-xl border border-alert-500/20 bg-red-50 px-4 py-3 text-sm dark:bg-alert-500/10"
              >
                <span className="font-semibold text-ink-900 dark:text-white">
                  {f.fallacy_type}
                </span>{" "}
                — {f.explanation}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Transcript */}

      {transcript?.length > 0 && (
        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-3 text-lg font-semibold text-ink-900 dark:text-white">
            Transcript
          </p>

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {transcript.map((t, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-3 text-sm ${
                  t.speaker === "user"
                    ? "bg-brand-100 text-ink-900 dark:bg-brand-500/20 dark:text-white"
                    : "bg-gray-100 text-ink-900 dark:bg-white/5 dark:text-white"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                  {t.speaker}
                </span>

                <p className="mt-1 text-gray-700 dark:text-white/80">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Coaching Feedback */}

      <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-4 text-lg font-semibold text-ink-900 dark:text-white">
          Your Coaching Feedback
        </p>

        <div className="flex flex-col gap-4">
          <textarea
            rows={4}
            value={form.coach_comments}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                coach_comments: e.target.value,
              }))
            }
            placeholder="Write your feedback for this learner..."
            className="input-field resize-none"
          />

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="number"
              min={0}
              max={100}
              value={form.coach_score}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coach_score: e.target.value,
                }))
              }
              placeholder="Your score (0-100)"
              className="input-field w-40"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/70">
              <input
                type="checkbox"
                checked={form.approve_ai_feedback}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    approve_ai_feedback: e.target.checked,
                  }))
                }
              />
              I approve the AI-generated feedback as accurate
            </label>

            <Button onClick={submit} disabled={submitting} className="ml-auto">
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Submit Review
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
