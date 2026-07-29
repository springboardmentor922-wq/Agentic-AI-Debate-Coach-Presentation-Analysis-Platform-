import { useEffect, useState } from 'react'
import { Gauge, Clock, Eye } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import { SkeletonCard } from './Skeleton'
import api from '../../api/axios'

const DEBATE_LABELS = {
  argument_quality: 'Argument Quality',
  logical_reasoning: 'Logical Reasoning',
  evidence_usage: 'Evidence Usage',
  rebuttal_quality: 'Rebuttal Quality',
  communication_skills: 'Communication Skills',
}

const PRESENTATION_LABELS = {
  confidence: 'Confidence',
  fluency: 'Fluency',
  pronunciation: 'Pronunciation',
  grammar: 'Grammar',
  speaking_pace: 'Speaking Pace',
  persuasiveness: 'Persuasiveness',
  clarity: 'Clarity',
  engagement: 'Engagement',
}

/**
 * Shows the exact same merged report to Learner, Coach, Educator, and Admin
 * for a given session — role only changes whether the fetch succeeds (403
 * otherwise), never which fields render. This is what makes the platform's
 * scoring consistent across every dashboard instead of each role computing
 * or displaying its own version of "the score".
 */
export default function ComprehensiveReport({ sessionId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    api
      .get(`/debate/sessions/${sessionId}/comprehensive-report`)
      .then(({ data }) => setData(data))
      .catch((e) => setError(e?.response?.data?.detail || 'Could not load the comprehensive report.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return <SkeletonCard />
  if (error) return <p className="text-sm font-medium text-alert-500">{error}</p>
  if (!data) return null

  const { debate_scores, presentation_scores, time_management, body_language, overall_performance, fallacies_detected_count } = data

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
          <Gauge size={18} className="text-brand-500" /> Comprehensive Scoring Report
        </p>
        {overall_performance != null && (
          <span className="font-data text-2xl font-bold text-brand-500">{overall_performance}/100</span>
        )}
      </div>

      {!data.has_debate_analysis && !data.has_presentation_analysis && (
        <p className="text-sm text-ink-900/50 dark:text-white/50">
          No analysis has been generated for this session yet.
        </p>
      )}

      {debate_scores && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
            Debate Scores (0-10)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Object.entries(DEBATE_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-lg bg-black/[0.03] px-2 py-2.5 text-center dark:bg-white/5">
                <p className="font-data text-lg font-bold text-ink-900 dark:text-white">{debate_scores[key] ?? '—'}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-900/40 dark:text-white/40">{label}</p>
              </div>
            ))}
          </div>
          {fallacies_detected_count > 0 && (
            <p className="mt-2 text-xs text-alert-500">{fallacies_detected_count} logical fallacy(ies) detected across this session.</p>
          )}
        </div>
      )}

      {presentation_scores && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
            Presentation Scores (0-100)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(PRESENTATION_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-lg bg-black/[0.03] px-2 py-2.5 text-center dark:bg-white/5">
                <p className="font-data text-lg font-bold text-ink-900 dark:text-white">{presentation_scores[key] ?? '—'}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-900/40 dark:text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg bg-black/[0.03] px-3 py-2.5 dark:bg-white/5">
          <Clock size={15} className="shrink-0 text-brand-500" />
          <div>
            <p className="text-xs font-semibold text-ink-900 dark:text-white">Time Management</p>
            <p className="text-xs text-ink-900/50 dark:text-white/50">
              {time_management ? `${Math.round(time_management.duration_seconds / 60)} min ${Math.round(time_management.duration_seconds % 60)}s` : 'Not available until the session is completed'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-black/[0.03] px-3 py-2.5 dark:bg-white/5">
          <Eye size={15} className="shrink-0 text-ink-900/40 dark:text-white/40" />
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-900 dark:text-white">
              Body Language <Badge tone="neutral">Not Available</Badge>
            </p>
            <p className="text-xs text-ink-900/50 dark:text-white/50">{body_language.note}</p>
          </div>
        </div>
      </div>

      {debate_scores?.final_summary && (
        <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-2.5 text-sm text-ink-900/80 dark:text-white/80">
          {debate_scores.final_summary}
        </div>
      )}
    </Card>
  )
}
