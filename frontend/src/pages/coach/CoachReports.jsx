import { useEffect, useState } from 'react'
import { FileBarChart2, Download, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    api.get('/coach/reports').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  const downloadPdf = async (sessionId) => {
    setDownloadingId(sessionId)
    try {
      const res = await api.get(`/reports/${sessionId}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `debate_report_${sessionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <FileBarChart2 size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Reports</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real debate feedback reports generated for your roster.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState icon={FileBarChart2} title="No reports yet" description="Reports appear the moment a learner on your roster finishes a debate." />
        ) : (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {items.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-ink-900 dark:text-white">{r.final_summary}</p>
                  <p className="text-xs text-ink-900/50 dark:text-white/50">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <p className="font-data text-lg font-bold text-brand-500">{r.overall_rating}/10</p>
                <button
                  onClick={() => downloadPdf(r.session_id)}
                  disabled={downloadingId === r.session_id}
                  className="rounded p-1.5 text-ink-900/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
                  title="Download PDF report"
                >
                  {downloadingId === r.session_id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
