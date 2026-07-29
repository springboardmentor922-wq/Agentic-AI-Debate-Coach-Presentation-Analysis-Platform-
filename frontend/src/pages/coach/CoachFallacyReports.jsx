import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const SEVERITY_TONE = { low: 'warning', medium: 'warning', high: 'danger' }

export default function CoachFallacyReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/coach/fallacy-reports').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alert-500/10 text-alert-500">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Fallacy Reports</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real logical fallacies detected across your roster.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No fallacies detected" description="Your roster's reasoning has stayed clean — no fallacies found yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Fallacy Type</th>
                  <th className="py-2">Severity</th>
                  <th className="py-2">Explanation</th>
                  <th className="py-2 pr-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{f.fallacy_type}</td>
                    <td className="py-2.5"><Badge tone={SEVERITY_TONE[f.severity] || 'warning'}>{f.severity}</Badge></td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{f.explanation}</td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{new Date(f.created_at).toLocaleDateString()}</td>
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
