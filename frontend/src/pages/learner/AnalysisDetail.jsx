import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BrainCircuit, CheckCircle2, AlertTriangle, Lightbulb, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import ComprehensiveReport from '../../components/ui/ComprehensiveReport'
import api from '../../api/axios'

const SEVERITY_TONE = { low: 'warning', medium: 'warning', high: 'danger' }

export default function AnalysisDetail() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [report, setReport] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [fallacies, setFallacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [sessionRes, transcriptRes, fallaciesRes] = await Promise.all([
          api.get(`/debate/sessions/${sessionId}`),
          api.get(`/debate/sessions/${sessionId}/transcript`),
          api.get(`/analysis/session/${sessionId}/fallacies`),
        ])
        if (cancelled) return
        setSession(sessionRes.data)
        setTranscript(transcriptRes.data.turns || [])
        setFallacies(fallaciesRes.data.items || [])

        try {
          const reportRes = await api.get(`/analysis/debate/${sessionId}/report`)
          if (!cancelled) setReport(reportRes.data)
        } catch {
          if (!cancelled) setReport(null) // no report generated yet for this session — show honestly, don't fake one
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Could not load this debate analysis.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  if (loading) {
    return (
      <div className="page-fade flex flex-col gap-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-fade flex flex-col gap-6">
        <div className="glass-card border border-rose-200 p-4 text-sm text-rose-600 dark:border-rose-500/30 dark:text-rose-300">
          {error}
        </div>
        <Link to="/learner/analysis" className="flex items-center gap-1 text-sm font-semibold text-brand-500">
          <ArrowLeft size={14} /> Back to AI Analysis
        </Link>
      </div>
    )
  }

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'AI Analysis', to: '/learner/analysis' }, { label: session?.topic || 'Debate' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{session?.topic}</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">
          {session?.debate_format} · {session?.status}
        </p>
      </div>

      {!report ? (
        <EmptyState
          icon={BrainCircuit}
          title="No AI report generated yet"
          description="This debate hasn't produced a feedback report yet — finish the debate to generate one."
        />
      ) : (
        <>
          <div className="mb-6">
            <ComprehensiveReport sessionId={sessionId} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="glass-card flex flex-col items-center justify-center p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">Overall Rating</p>
              <p className="font-display text-5xl font-bold text-brand-600 dark:text-brand-300">{report.overall_rating}</p>
              <p className="text-xs text-ink-900/40 dark:text-white/40">out of 10</p>
            </div>
            <div className="glass-card p-6 lg:col-span-2">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <BrainCircuit size={18} className="text-brand-500" /> AI Feedback Summary
              </h2>
              <p className="text-sm leading-relaxed text-ink-900/70 dark:text-white/70">{report.final_summary}</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Score Breakdown</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'Argument Quality', value: report.argument_quality },
                { label: 'Evidence Usage', value: report.evidence_usage },
                { label: 'Logical Consistency', value: report.logical_consistency },
                { label: 'Rebuttal Effectiveness', value: report.rebuttal_effectiveness },
                { label: 'Communication Skills', value: report.communication_skills },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-black/5 p-3.5 text-center dark:border-white/10">
                  <p className="font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value ?? '—'}</p>
                  <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <ThumbsUp size={18} className="text-emerald-500" /> Strengths
              </h2>
              {report.strengths.length === 0 ? (
                <p className="text-sm text-ink-900/50 dark:text-white/50">Not enough data yet.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-900/70 dark:text-white/70">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <ThumbsDown size={18} className="text-rose-500" /> Weaknesses
              </h2>
              {report.weaknesses.length === 0 ? (
                <p className="text-sm text-ink-900/50 dark:text-white/50">Not enough data yet.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-900/70 dark:text-white/70">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-500" /> {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              <AlertTriangle size={18} className="text-amber-500" /> Logical Fallacies Detected
            </h2>
            {fallacies.length === 0 ? (
              <p className="text-sm text-ink-900/50 dark:text-white/50">No logical fallacies were detected in this debate.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                      <th className="py-2.5 pr-4 font-medium">Type</th>
                      <th className="py-2.5 pr-4 font-medium">Severity</th>
                      <th className="py-2.5 pr-4 font-medium">Explanation</th>
                      <th className="py-2.5 pr-4 font-medium">Credibility Impact</th>
                      <th className="py-2.5 pr-4 font-medium">Better Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallacies.map((f, i) => (
                      <tr key={i} className="border-b border-black/5 last:border-0 dark:border-white/10">
                        <td className="py-2.5 pr-4 font-medium text-ink-900 dark:text-white">{f.fallacy_type}</td>
                        <td className="py-2.5 pr-4"><Badge tone={SEVERITY_TONE[f.severity] || 'neutral'}>{f.severity}</Badge></td>
                        <td className="py-2.5 pr-4 text-ink-900/60 dark:text-white/60">{f.explanation}</td>
                        <td className="py-2.5 pr-4 text-ink-900/60 dark:text-white/60">{f.credibility_assessment || '—'}</td>
                        <td className="py-2.5 pr-4 text-ink-900/60 dark:text-white/60">{f.better_version || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <Lightbulb size={18} className="text-brand-500" /> Recommended Improvements
              </h2>
              {report.recommended_improvements.length === 0 ? (
                <p className="text-sm text-ink-900/50 dark:text-white/50">Not enough data yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {report.recommended_improvements.map((c, i) => (
                    <li key={i} className="rounded-xl border border-black/5 p-3.5 text-sm text-ink-900/70 dark:border-white/10 dark:text-white/70">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                <AlertTriangle size={18} className="text-amber-500" /> Missing Evidence
              </h2>
              {report.missing_evidence.length === 0 ? (
                <p className="text-sm text-ink-900/50 dark:text-white/50">No missing evidence flagged.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {report.missing_evidence.map((m, i) => (
                    <li key={i} className="text-sm text-ink-900/70 dark:text-white/70">• {m}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              <BrainCircuit size={18} className="text-brand-500" /> Learning Recommendations
            </h2>
            {!report.learning_recommendations || report.learning_recommendations.length === 0 ? (
              <p className="text-sm text-ink-900/50 dark:text-white/50">No learning recommendations yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {report.learning_recommendations.map((l, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-900/70 dark:text-white/70">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand-500" /> {l}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Transcript</h2>
        {transcript.length === 0 ? (
          <p className="text-sm text-ink-900/50 dark:text-white/50">No transcript recorded for this debate.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {transcript.map((turn, i) => (
              <div key={i} className="rounded-xl border border-black/5 p-3.5 dark:border-white/10">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                  Turn {i + 1} — You
                </p>
                <p className="mb-2 text-sm text-ink-900/80 dark:text-white/80">{turn.user_text}</p>
                {turn.ai_rebuttal && (
                  <>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                      AI Opponent
                    </p>
                    <p className="text-sm text-ink-900/70 dark:text-white/70">{turn.ai_rebuttal}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
