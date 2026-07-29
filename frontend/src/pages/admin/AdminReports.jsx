import { useEffect, useState } from 'react'
import { FileBarChart2, Download } from 'lucide-react'
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

export default function AdminReports() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get('/admin/backup/collections-summary').then(({ data }) => setSummary(data)).finally(() => setLoading(false))
  }, [])

  const exportReport = async () => {
    setExporting(true)
    try {
      const { data } = await api.get('/admin/backup/export')
      downloadJson(data, `platform-report-${new Date().toISOString().slice(0, 10)}.json`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <FileBarChart2 size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Reports & Logs</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">Real record counts across the platform, exportable on demand.</p>
          </div>
        </div>
        <Button onClick={exportReport} disabled={exporting} size="sm">
          <Download size={16} /> Export Platform Report
        </Button>
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
                <p className="mt-1 text-xs uppercase tracking-wide text-ink-900/50 dark:text-white/50">{key.replace(/_/g, ' ')}</p>
              </Card>
            ))}
        </div>
      )}
      {summary?.generated_at && (
        <p className="text-xs text-ink-900/40 dark:text-white/40">As of {new Date(summary.generated_at).toLocaleString()}</p>
      )}
    </div>
  )
}
