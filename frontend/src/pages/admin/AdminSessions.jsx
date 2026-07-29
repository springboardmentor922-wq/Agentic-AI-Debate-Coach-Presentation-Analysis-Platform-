import { useEffect, useState } from 'react'
import { Swords } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const STATUS_TONE = { completed: 'success', in_progress: 'brand', pending: 'warning', abandoned: 'danger' }

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get('/admin/debate-sessions', { params: { status_filter: statusFilter || undefined } })
      .then(({ data }) => setSessions(data))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Swords size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Debate Sessions</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">{sessions.length} session(s) shown</p>
          </div>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : sessions.length === 0 ? (
          <EmptyState icon={Swords} title="No debate sessions found" description="Sessions will appear here as learners debate on the platform." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Topic</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 pr-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{s.topic || 'Untitled'}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{(s.debate_format || '').replace('_', ' ')}</td>
                    <td className="py-2.5">
                      <Badge tone={STATUS_TONE[s.status] || 'neutral'}>{s.status || 'unknown'}</Badge>
                    </td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </td>
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
