import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import Card from '../../components/ui/Card'
import BarChart from '../../components/charts/BarChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorClassAnalytics() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/educator/classroom-analytics').then(({ data }) => setClassrooms(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonCard />

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Class Analytics</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real average scores per class, computed live.</p>
        </div>
      </div>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Average Score by Class</p>
        {classrooms.length > 0 ? (
          <BarChart data={classrooms.map((c) => ({ label: c.classroom, value: c.average_score || 0 }))} color="#3FA9F5" />
        ) : (
          <p className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">No class data yet.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {classrooms.map((c) => (
          <Card key={c.classroom}>
            <p className="font-semibold text-ink-900 dark:text-white">{c.classroom}</p>
            <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
              {c.learner_count} learners · {c.total_sessions_completed} sessions ·{' '}
              {c.average_improvement_pct != null ? `${c.average_improvement_pct > 0 ? '+' : ''}${c.average_improvement_pct}% improvement` : 'no trend data yet'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
