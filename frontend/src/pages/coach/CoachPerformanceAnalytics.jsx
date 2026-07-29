import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import Card from '../../components/ui/Card'
import LineChart from '../../components/charts/LineChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachPerformanceAnalytics() {
  const [data, setData] = useState(null)
  const [learnerNames, setLearnerNames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/coach/performance-analytics'), api.get('/coach/assigned-learners')])
      .then(([p, l]) => {
        setData(p.data)
        const map = {}
        l.data.forEach((x) => { map[x.learner_id] = x.learner_name })
        setLearnerNames(map)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonCard />
  if (!data) return null

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Performance Analytics</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real score trends across your roster.</p>
        </div>
      </div>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Average Score Trend</p>
        {data.trend.length > 0 ? (
          <LineChart data={data.trend.map((t) => ({ label: t.date.slice(5), value: t.average }))} color="#3FA9F5" />
        ) : (
          <p className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">No scored debates yet.</p>
        )}
      </Card>

      <Card padding="sm">
        <p className="mb-3 px-2 pt-2 font-semibold text-ink-900 dark:text-white">Per-Learner Averages</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                <th className="py-2 pl-2">Learner</th>
                <th className="py-2">Sessions</th>
                <th className="py-2 pr-2">Average Score</th>
              </tr>
            </thead>
            <tbody>
              {data.per_learner.map((row) => (
                <tr key={row.learner_id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                  <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{learnerNames[row.learner_id] || row.learner_id}</td>
                  <td className="py-2.5 text-ink-900/60 dark:text-white/60">{row.session_count}</td>
                  <td className="py-2.5 pr-2 font-data font-bold text-brand-500">{row.average_score}</td>
                </tr>
              ))}
              {data.per_learner.length === 0 && (
                <tr><td colSpan={3} className="py-6 text-center text-sm text-ink-900/40 dark:text-white/40">No data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
