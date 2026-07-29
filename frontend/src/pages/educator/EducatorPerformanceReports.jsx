import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'

export default function EducatorPerformanceReports() {
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const { data } = await api.get('/educator/reports/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `classroom-performance-report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Performance Reports</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Export a real CSV of every learner's performance data.</p>
        </div>
      </div>

      <Card className="border-l-4 border-brand-500">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">Classroom Performance Report</p>
            <p className="text-sm text-ink-900/60 dark:text-white/60">CSV of learner names, sessions completed, and average scores.</p>
          </div>
          <Button onClick={download} disabled={downloading}>
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export CSV
          </Button>
        </div>
      </Card>
    </div>
  )
}
