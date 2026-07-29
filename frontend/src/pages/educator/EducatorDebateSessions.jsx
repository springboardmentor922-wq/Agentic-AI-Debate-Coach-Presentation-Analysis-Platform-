import { useEffect, useState } from 'react'
import { Swords } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const STATUS_TONE = { completed: 'success', in_progress: 'brand', pending: 'warning' }

export default function EducatorDebateSessions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/educator/debate-sessions').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Swords size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Debate Sessions</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Every debate session across all learners.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Swords} title="No sessions yet" description="Debate sessions will appear here as learners practice." />
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
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{s.topic || 'Untitled'}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{(s.debate_format || '').replace('_', ' ')}</td>
                    <td className="py-2.5"><Badge tone={STATUS_TONE[s.status] || 'neutral'}>{s.status}</Badge></td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
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
