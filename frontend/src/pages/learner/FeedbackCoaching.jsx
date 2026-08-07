import { useEffect, useState } from 'react'
import { Sparkles, Loader2, RefreshCcw, CheckCircle2, Circle, CalendarClock, Target, NotebookPen } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import api from '../../api/axios'

const SOURCE_LABELS = {
  ai_analysis: 'AI Analysis',
  coach_review: 'Coach Review',
  educator_review: 'Educator Review',
  combined: 'Coach + Educator',
}

export default function FeedbackCoaching() {
  // AI coaching feedback (Module 10) — unchanged from before.
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Coaching Plan (Milestone 4) — new: a real trackable plan combining AI
  // evidence with coach/educator review notes, with deadlines and progress.
  const [plan, setPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [planGenerating, setPlanGenerating] = useState(false)
  const [planError, setPlanError] = useState(null)

  const loadLatest = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/coaching/latest')
      setFeedback(data)
    } catch {
      setFeedback(null)
    } finally {
      setLoading(false)
    }
  }

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const { data } = await api.post('/coaching/generate', {})
      setFeedback(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not generate coaching feedback right now.')
    } finally {
      setGenerating(false)
    }
  }

  const loadPlan = async () => {
    setPlanLoading(true)
    try {
      const { data } = await api.get('/coaching-plans/latest')
      setPlan(data)
    } catch {
      setPlan(null)
    } finally {
      setPlanLoading(false)
    }
  }

  const generatePlan = async () => {
    setPlanGenerating(true)
    setPlanError(null)
    try {
      const { data } = await api.post('/coaching-plans/generate', {})
      setPlan(data)
    } catch (e) {
      setPlanError(e?.response?.data?.detail || 'Could not generate a coaching plan right now.')
    } finally {
      setPlanGenerating(false)
    }
  }

  const toggleExercise = async (week, index, completed) => {
    if (!plan) return
    const exerciseKey = `${week}:${index}`
    setPlan((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) =>
        w.week === week
          ? { ...w, exercises: w.exercises.map((ex, i) => (i === index ? { ...ex, completed } : ex)) }
          : w
      ),
    }))
    try {
      const { data } = await api.patch(`/coaching-plans/${plan.id}/progress`, { exercise_key: exerciseKey, completed })
      setPlan(data)
    } catch {
      loadPlan() // revert to server truth if the update failed
    }
  }

  useEffect(() => {
    loadLatest()
    loadPlan()
  }, [])

  return (
    <div className="mx-auto max-w-3xl page-fade">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Feedback & Coaching</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              Personalized coaching grounded in your real debate and presentation history.
            </p>
          </div>
        </div>
        <Button onClick={generate} disabled={generating} size="sm" variant="secondary">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          {feedback ? 'Refresh' : 'Generate'}
        </Button>
      </div>

      {error && <p className="mb-4 text-sm font-medium text-alert-500">{error}</p>}

      {loading ? (
        <SkeletonCard />
      ) : !feedback ? (
        <EmptyState
          icon={Sparkles}
          title="No coaching feedback yet"
          description="Generate personalized coaching based on your recent debates and presentations."
          action={
            <Button onClick={generate} disabled={generating}>
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate My Coaching Feedback
            </Button>
          }
        />
      ) : (
        <div className="mb-8 flex flex-col gap-4">
          <Card className="border-l-4 border-brand-500">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Priority Focus</p>
            <p className="text-lg font-semibold text-ink-900 dark:text-white">{feedback.feedback.priority_focus}</p>
          </Card>

          {feedback.feedback.strengths?.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-verdict-600">Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.feedback.strengths.map((s, i) => (
                  <Badge key={i} tone="success">{s}</Badge>
                ))}
              </div>
            </Card>
          )}

          {feedback.feedback.observations?.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                Coach Observations
              </p>
              <ul className="flex flex-col gap-2">
                {feedback.feedback.observations.map((o, i) => (
                  <li key={i} className="rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-ink-900 dark:bg-white/5 dark:text-white">
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-right text-xs text-ink-900/40 dark:text-white/40">
            Generated {new Date(feedback.created_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Coaching Plan — trackable weekly exercises with deadlines,     */}
      {/* combining AI evidence with any coach/educator review notes.    */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-verdict-500/10 text-verdict-600">
            <NotebookPen size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Your Coaching Plan</h2>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              A 4-week plan with deadlines, built from your evidence and any coach or educator notes.
            </p>
          </div>
        </div>
        <Button onClick={generatePlan} disabled={planGenerating} size="sm" variant="secondary">
          {planGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          {plan ? 'Refresh' : 'Generate'}
        </Button>
      </div>

      {planError && <p className="mb-4 text-sm font-medium text-alert-500">{planError}</p>}

      {planLoading ? (
        <SkeletonCard />
      ) : !plan ? (
        <EmptyState
          icon={NotebookPen}
          title="No coaching plan yet"
          description="Generate a trackable weekly plan based on your recent debates, presentations, and any coach/educator review."
          action={
            <Button onClick={generatePlan} disabled={planGenerating}>
              {planGenerating ? <Loader2 size={16} className="animate-spin" /> : <NotebookPen size={16} />}
              Generate My Coaching Plan
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Badge tone={plan.status === 'completed' ? 'success' : 'brand'}>
                {plan.status === 'completed' ? 'Completed' : 'In progress'}
              </Badge>
              <Badge tone="neutral">Source: {SOURCE_LABELS[plan.source] || plan.source}</Badge>
            </div>
            <ProgressBar value={plan.completion_percent} label="Overall completion" tone={plan.status === 'completed' ? 'success' : 'brand'} />
            <p className="mt-3 text-sm text-ink-900/70 dark:text-white/70">{plan.summary}</p>
            {plan.objectives?.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {plan.objectives.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-ink-900/80 dark:text-white/80">
                    <Target size={14} className="mt-0.5 shrink-0 text-verdict-500" />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {plan.weeks.map((week) => (
            <Card key={week.week}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Week {week.week} — {week.focus}</p>
              </div>
              <p className="mb-3 text-sm font-medium text-ink-900 dark:text-white">{week.objective}</p>
              <div className="flex flex-col gap-2">
                {week.exercises.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => toggleExercise(week.week, i, !ex.completed)}
                    className="flex items-start gap-2.5 rounded-lg bg-black/[0.03] px-3 py-2.5 text-left transition hover:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    {ex.completed ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-verdict-500" />
                    ) : (
                      <Circle size={18} className="mt-0.5 shrink-0 text-ink-900/30 dark:text-white/30" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${ex.completed ? 'text-ink-900/50 line-through dark:text-white/40' : 'text-ink-900 dark:text-white'}`}>
                        {ex.title}
                      </p>
                      {ex.description && <p className="text-xs text-ink-900/50 dark:text-white/50">{ex.description}</p>}
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-900/40 dark:text-white/40">
                        <CalendarClock size={11} /> Due {new Date(ex.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          ))}

          <p className="text-right text-xs text-ink-900/40 dark:text-white/40">
            Generated {new Date(plan.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
