import { useEffect, useState } from 'react'
import { NotebookPen, CalendarClock } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const SOURCE_LABELS = {
  ai_analysis: 'AI Analysis',
  coach_review: 'Coach Review',
  educator_review: 'Educator Review',
  combined: 'Coach + Educator',
}

export default function CoachCoachingPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: roster } = await api.get('/coach/assigned-learners')
        const results = await Promise.all(
          roster.map(async (learner) => {
            try {
              const { data } = await api.get('/coaching-plans', { params: { learner_id: learner.learner_id } })
              const latest = data?.[0]
              return latest ? { ...latest, learner_name: learner.learner_name } : null
            } catch {
              return null
            }
          })
        )
        setPlans(results.filter(Boolean))
      } catch {
        setPlans([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <NotebookPen size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Coaching Plans</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Real, trackable plans generated from AI analysis and your reviews — weekly exercises, deadlines, and live completion status.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No coaching plans yet"
          description="Plans generate automatically once a learner has AI analysis, or the moment you submit a review — they'll appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const nextDue = plan.weeks
              ?.flatMap((w) => w.exercises.filter((e) => !e.completed))
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]
            return (
              <Card key={plan.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900 dark:text-white">{plan.learner_name}</p>
                  <Badge tone={plan.status === 'completed' ? 'success' : 'brand'}>
                    {plan.status === 'completed' ? 'Completed' : 'In progress'}
                  </Badge>
                </div>
                <p className="mb-2 text-xs text-ink-900/50 dark:text-white/50">
                  Source: {SOURCE_LABELS[plan.source] || plan.source}
                </p>
                <ProgressBar value={plan.completion_percent} size="sm" label="Completion" />
                <p className="mt-3 text-sm text-ink-900/70 dark:text-white/70">{plan.summary}</p>
                {nextDue && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-ink-900/50 dark:text-white/50">
                    <CalendarClock size={12} /> Next due: {nextDue.title} — {new Date(nextDue.deadline).toLocaleDateString()}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
