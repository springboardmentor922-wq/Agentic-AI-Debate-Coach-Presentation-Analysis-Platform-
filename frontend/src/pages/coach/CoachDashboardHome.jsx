import { useEffect, useState } from 'react'
import { Users, Inbox, TrendingUp, Trophy } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import LineChart from '../../components/charts/LineChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachDashboardHome() {
  const [learners, setLearners] = useState([])
  const [queue, setQueue] = useState([])
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/coach/assigned-learners'),
      api.get('/coach/review-queue', { params: { status: 'pending' } }),
      api.get('/coach/performance-analytics'),
    ])
      .then(([l, q, p]) => {
        setLearners(l.data)
        setQueue(q.data)
        setPerf(p.data)
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

  const topPerformer = [...learners].sort((a, b) => (b.average_score || 0) - (a.average_score || 0))[0]

  return (
    <div className="page-fade flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Coach Dashboard</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Empower learners. Evaluate performance. Build champions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active Learners" value={learners.length} tone="cool" />
        <StatCard icon={Inbox} label="Pending Evaluations" value={queue.length} tone="warm" />
        <StatCard icon={TrendingUp} label="Avg. Score" value={perf?.average_score ?? '—'} tone="verdict" />
        <StatCard icon={Trophy} label="Top Performer" value={topPerformer?.learner_name || '—'} tone="alert" />
      </div>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Roster Performance Trend</p>
        {perf?.trend?.length > 0 ? (
          <LineChart data={perf.trend.map((t) => ({ label: t.date.slice(5), value: t.average }))} color="#3FA9F5" />
        ) : (
          <p className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">No scored debates yet from your roster.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">Recent Learner Activity</p>
          {learners.slice(0, 5).map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-black/5 py-2 text-sm last:border-0 dark:border-white/5">
              <span className="font-medium text-ink-900 dark:text-white">{l.learner_name}</span>
              <span className="text-ink-900/50 dark:text-white/50">{l.sessions_completed} sessions · avg {l.average_score ?? '—'}</span>
            </div>
          ))}
          {learners.length === 0 && <p className="text-sm text-ink-900/40 dark:text-white/40">No learners assigned yet.</p>}
        </Card>
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">Evaluation Queue Preview</p>
          {queue.slice(0, 5).map((q) => (
            <div key={q.id} className="flex items-center justify-between border-b border-black/5 py-2 text-sm last:border-0 dark:border-white/5">
              <span className="font-medium text-ink-900 dark:text-white">{q.learner_name}</span>
              <span className="text-ink-900/50 dark:text-white/50">{q.topic}</span>
            </div>
          ))}
          {queue.length === 0 && <p className="text-sm text-ink-900/40 dark:text-white/40">Queue is empty — nothing pending review.</p>}
        </Card>
      </div>
    </div>
  )
}
