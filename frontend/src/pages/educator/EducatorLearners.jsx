import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorLearners() {
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState({}) // learner_id -> latest coaching plan

  useEffect(() => {
    api
      .get('/educator/learners')
      .then(({ data }) => {
        setLearners(data)
        // Best-effort: pull each learner's latest coaching plan for the new
        // column below. Failures per-learner are silently skipped so one
        // bad lookup doesn't block the whole roster from rendering.
        data.forEach((l) => {
          api
            .get('/coaching-plans', { params: { learner_id: l.id } })
            .then(({ data: list }) => {
              if (list?.[0]) setPlans((prev) => ({ ...prev, [l.id]: list[0] }))
            })
            .catch(() => {})
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Users size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Learners</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">{learners.length} learner(s) on the platform</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : learners.length === 0 ? (
          <EmptyState icon={Users} title="No learners yet" description="Learners will appear here as they join the platform." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Name</th>
                  <th className="py-2">Institution</th>
                  <th className="py-2">Sessions</th>
                  <th className="py-2">Avg Score</th>
                  <th className="py-2">Coaching Plan</th>
                  <th className="py-2 pr-2">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((l) => (
                  <tr key={l.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{l.full_name}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{l.institution || '—'}{l.department ? ` · ${l.department}` : ''}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{l.sessions_completed}</td>
                    <td className="py-2.5 font-data text-ink-900 dark:text-white">{l.average_score ?? '—'}</td>
                    <td className="py-2.5 min-w-[140px]">
                      {plans[l.id] ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20"><ProgressBar value={plans[l.id].completion_percent} size="sm" showValue={false} /></div>
                          <Badge tone={plans[l.id].status === 'completed' ? 'success' : 'brand'}>
                            {Math.round(plans[l.id].completion_percent)}%
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-ink-900/30 dark:text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{l.last_activity_at ? new Date(l.last_activity_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
