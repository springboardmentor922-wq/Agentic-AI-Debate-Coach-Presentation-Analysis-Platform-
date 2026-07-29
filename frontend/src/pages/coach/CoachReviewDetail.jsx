import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import ComprehensiveReport from '../../components/ui/ComprehensiveReport'
import api from '../../api/axios'

export default function CoachReviewDetail() {
  const { reviewId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ coach_comments: '', coach_score: '', approve_ai_feedback: true })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/coach/review/${reviewId}`)
      setData(data)
      setForm((f) => ({ ...f, coach_comments: data.review.coach_comments || '', coach_score: data.review.coach_score ?? '' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [reviewId])

  const claim = async () => {
    setClaiming(true)
    try {
      await api.post(`/coach/review/${reviewId}/claim`)
      load()
    } finally {
      setClaiming(false)
    }
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      await api.post(`/coach/review/${reviewId}/submit`, {
        coach_comments: form.coach_comments,
        coach_score: form.coach_score === '' ? null : Number(form.coach_score),
        approve_ai_feedback: form.approve_ai_feedback,
        mark_status: 'reviewed',
      })
      load()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <SkeletonCard />
  if (!data) return null
  const { review, transcript, ai_report, fallacies_detected } = data

  return (
    <div className="page-fade flex flex-col gap-5">
      <button onClick={() => navigate(-1)} className="flex w-fit items-center gap-1.5 text-sm text-ink-900/60 hover:text-brand-500 dark:text-white/60">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{review.topic}</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            {review.learner_name} · {review.debate_format?.replace('_', ' ')} · <Badge tone="brand">{review.status}</Badge>
          </p>
        </div>
        {review.status === 'pending' && (
          <Button onClick={claim} disabled={claiming}>
            {claiming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Claim for Review
          </Button>
        )}
      </div>

      <ComprehensiveReport sessionId={review.session_id} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">AI Overall Score</p>
          <p className="font-data text-3xl font-bold text-brand-500">{review.ai_overall_score ?? '—'}/100</p>
        </Card>
        {ai_report && (
          <>
            <Card>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Argument Quality</p>
              <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">{ai_report.argument_quality}/10</p>
            </Card>
            <Card>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Communication Skills</p>
              <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">{ai_report.communication_skills}/10</p>
            </Card>
          </>
        )}
      </div>

      {ai_report && (
        <Card>
          <p className="mb-2 font-semibold text-ink-900 dark:text-white">AI Summary</p>
          <p className="text-sm text-ink-900/70 dark:text-white/70">{ai_report.final_summary}</p>
          {ai_report.strengths?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ai_report.strengths.map((s, i) => <Badge key={i} tone="success">{s}</Badge>)}
            </div>
          )}
        </Card>
      )}

      {fallacies_detected?.length > 0 && (
        <Card className="border-l-4 border-alert-500">
          <p className="mb-2 flex items-center gap-2 font-semibold text-alert-600">
            <AlertTriangle size={16} /> Fallacies Detected ({fallacies_detected.length})
          </p>
          <ul className="flex flex-col gap-2">
            {fallacies_detected.map((f, i) => (
              <li key={i} className="rounded-lg bg-alert-500/5 px-3 py-2 text-sm">
                <span className="font-semibold text-ink-900 dark:text-white">{f.fallacy_type}</span> — {f.explanation}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {transcript?.length > 0 && (
        <Card>
          <p className="mb-2 font-semibold text-ink-900 dark:text-white">Transcript</p>
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {transcript.map((t, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 text-sm ${t.speaker === 'user' ? 'bg-brand-500/10' : 'bg-black/[0.03] dark:bg-white/5'}`}>
                <span className="text-xs font-semibold uppercase text-ink-900/40 dark:text-white/40">{t.speaker}</span>
                <p className="text-ink-900/80 dark:text-white/80">{t.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="border border-brand-500/30">
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Your Coaching Feedback</p>
        <div className="flex flex-col gap-3">
          <textarea
            rows={4}
            value={form.coach_comments}
            onChange={(e) => setForm((f) => ({ ...f, coach_comments: e.target.value }))}
            placeholder="Write your feedback for this learner..."
            className="input-field resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={form.coach_score}
              onChange={(e) => setForm((f) => ({ ...f, coach_score: e.target.value }))}
              placeholder="Your score (0-100)"
              className="input-field w-40"
            />
            <label className="flex items-center gap-2 text-sm text-ink-900/70 dark:text-white/70">
              <input
                type="checkbox"
                checked={form.approve_ai_feedback}
                onChange={(e) => setForm((f) => ({ ...f, approve_ai_feedback: e.target.checked }))}
              />
              I approve the AI-generated feedback as accurate
            </label>
            <Button onClick={submit} disabled={submitting} className="ml-auto">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Submit Review
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
