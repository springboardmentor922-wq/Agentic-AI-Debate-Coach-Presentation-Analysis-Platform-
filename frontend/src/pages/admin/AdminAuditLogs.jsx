import { useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get('/admin/audit-logs', { params: { action: actionFilter || undefined } })
      .then(({ data }) => setLogs(data))
      .finally(() => setLoading(false))
  }, [actionFilter])

  const actions = ['create_user', 'update_role', 'update_plan', 'create_topic', 'update_topic', 'delete_topic', 'broadcast_notification', 'update_platform_settings', 'export_core_data']

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <ScrollText size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Audit Logs</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">Every sensitive admin action, logged automatically — never edited after the fact.</p>
          </div>
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={8} cols={4} />
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit entries yet" description="Actions like creating users, changing roles, or broadcasting notifications will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Action</th>
                  <th className="py-2">By</th>
                  <th className="py-2">Details</th>
                  <th className="py-2 pr-2">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{log.action.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{log.actor_name}</td>
                    <td className="py-2.5 text-ink-900/50 dark:text-white/50">
                      {log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{new Date(log.created_at).toLocaleString()}</td>
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
