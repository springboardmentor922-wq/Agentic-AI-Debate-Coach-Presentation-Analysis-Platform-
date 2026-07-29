import { useEffect, useState } from 'react'
import { Users, School, Swords, TrendingUp } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorDashboardHome() {
  const [learners, setLearners] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/educator/learners'), api.get('/educator/classroom-analytics')])
      .then(([l, c]) => {
        setLearners(l.data)
        setClassrooms(c.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const totalSessions = classrooms.reduce((s, c) => s + c.total_sessions_completed, 0)
  const avgScore = classrooms.length
    ? Math.round((classrooms.reduce((s, c) => s + (c.average_score || 0), 0) / classrooms.length) * 10) / 10
    : null

  return (
    <div className="page-fade flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Educator Dashboard</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Monitor your learners, review performance, and guide them to excel.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Learners" value={learners.length} tone="cool" />
        <StatCard icon={School} label="Classes" value={classrooms.length} tone="warm" />
        <StatCard icon={Swords} label="Debates Conducted" value={totalSessions} tone="verdict" />
        <StatCard icon={TrendingUp} label="Avg. Class Score" value={avgScore ?? '—'} tone="alert" />
      </div>

      <Card>
        <p className="mb-4 font-semibold text-ink-900 dark:text-white">Classes Overview</p>
        <div className="flex flex-col gap-3">
          {classrooms.map((c) => (
            <div key={c.classroom} className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-3 dark:bg-white/5">
              <div>
                <p className="font-medium text-ink-900 dark:text-white">{c.classroom}</p>
                <p className="text-xs text-ink-900/50 dark:text-white/50">{c.learner_count} learners · {c.total_sessions_completed} sessions</p>
              </div>
              <p className="font-data text-lg font-bold text-brand-500">{c.average_score ?? '—'}</p>
            </div>
          ))}
          {classrooms.length === 0 && <p className="text-sm text-ink-900/40 dark:text-white/40">No classes yet.</p>}
        </div>
      </Card>
    </div>
  )
}
