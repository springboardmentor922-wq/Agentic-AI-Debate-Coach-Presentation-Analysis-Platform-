import { useEffect, useState } from 'react'
import { School } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorClasses() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/educator/classroom-analytics').then(({ data }) => setClassrooms(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <School size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">My Classes</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Grouped by institution / department, computed live from real learner records.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState icon={School} title="No classes yet" description="Classes are derived from learners' institution/department fields on their profile." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classrooms.map((c) => (
            <Card key={c.classroom}>
              <p className="font-semibold text-ink-900 dark:text-white">{c.classroom}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-data text-xl font-bold text-ink-900 dark:text-white">{c.learner_count}</p>
                  <p className="text-[10px] uppercase text-ink-900/40 dark:text-white/40">Learners</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-ink-900 dark:text-white">{c.total_sessions_completed}</p>
                  <p className="text-[10px] uppercase text-ink-900/40 dark:text-white/40">Sessions</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-brand-500">{c.average_score ?? '—'}</p>
                  <p className="text-[10px] uppercase text-ink-900/40 dark:text-white/40">Avg Score</p>
                </div>
              </div>
              {c.top_performers?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-verdict-600">Top Performers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.top_performers.map((p) => <Badge key={p.id} tone="success">{p.full_name}</Badge>)}
                  </div>
                </div>
              )}
              {c.needs_attention?.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-alert-500">Needs Attention</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.needs_attention.map((p) => <Badge key={p.id} tone="danger">{p.full_name}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
