import { useEffect, useState } from 'react'
import { DatabaseBackup, Download, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminBackup() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get('/admin/backup/collections-summary').then(({ data }) => setSummary(data)).finally(() => setLoading(false))
  }, [])

  const runExport = async () => {
    setExporting(true)
    try {
      const { data } = await api.get('/admin/backup/export')
      downloadJson(data, `manual-backup-${new Date().toISOString().slice(0, 10)}.json`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <DatabaseBackup size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Backup & Recovery</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            No automated cloud backup pipeline is part of this build — this is an honest, on-demand manual export
            of core collections (users, debate topics), not a simulated "last backup: 2 hours ago" widget.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(summary || {})
            .filter(([key]) => key !== 'generated_at')
            .map(([key, value]) => (
              <Card key={key}>
                <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-900/50 dark:text-white/50">{key.replace(/_/g, ' ')} records</p>
              </Card>
            ))}
        </div>
      )}

      <Card className="border-l-4 border-brand-500">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">Manual Data Export</p>
            <p className="text-sm text-ink-900/60 dark:text-white/60">Downloads a real JSON snapshot of users and debate topics right now.</p>
          </div>
          <Button onClick={runExport} disabled={exporting}>
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export Now
          </Button>
        </div>
      </Card>
    </div>
  )
}
