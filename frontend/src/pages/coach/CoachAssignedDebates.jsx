import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const STATUS_TONE = { completed: 'success', in_progress: 'brand', pending: 'warning' }

export default function CoachAssignedDebates() {
  const [debates, setDebates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/coach/assigned-debates').then(({ data }) => setDebates(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Assigned Debates</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Every debate session from learners on your roster.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : debates.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No debates yet" description="Debates from your assigned learners will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Topic</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 pr-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {debates.map((d) => (
                  <tr key={d.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{d.topic || 'Untitled'}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{(d.debate_format || '').replace('_', ' ')}</td>
                    <td className="py-2.5"><Badge tone={STATUS_TONE[d.status] || 'neutral'}>{d.status}</Badge></td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
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
