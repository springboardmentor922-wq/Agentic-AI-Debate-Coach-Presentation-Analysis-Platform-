import { useEffect, useState } from 'react'
import { Presentation, Download, Loader2, ChevronDown } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api, { mediaAudioUrl } from '../../api/axios'

export default function EducatorPresentationReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    api.get('/educator/presentation-reports').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  const downloadPdf = async (sessionId) => {
    if (!sessionId) return
    setDownloadingId(sessionId)
    try {
      const res = await api.get(`/reports/${sessionId}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `debate_report_${sessionId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // A session with no debate feedback report yet (e.g. a standalone
      // audio upload not tied to a debate session) has nothing to export —
      // fail quietly rather than blocking the rest of the table.
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Presentation size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Presentation Reports</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real presentation analyses across all learners.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState icon={Presentation} title="No presentations analyzed yet" description="Presentation recordings will appear here once learners submit them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Learner</th>
                  <th className="py-2">Topic</th>
                  <th className="py-2">Overall Score</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Recording</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <>
                    <tr key={p.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                      <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{p.learner_name || '—'}</td>
                      <td className="py-2.5 text-ink-900 dark:text-white">{p.topic || '—'}</td>
                      <td className="py-2.5 font-data font-bold text-brand-500">{p.presentation_score?.overall_score ?? '—'}/100</td>
                      <td className="py-2.5 text-ink-900/60 dark:text-white/60">
                        {p.speech_metrics?.duration_seconds ? `${Math.round(p.speech_metrics.duration_seconds)}s` : '—'}
                      </td>
                      <td className="py-2.5">
                        {p.audio_filename ? (
                          <audio controls src={mediaAudioUrl(p.id)} className="h-8 max-w-[200px]" />
                        ) : (
                          <span className="text-xs text-ink-900/40 dark:text-white/40">No audio retained</span>
                        )}
                      </td>
                      <td className="py-2.5 text-ink-900/50 dark:text-white/50">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-1">
                          {p.transcript && (
                            <button
                              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                              className="rounded p-1 text-ink-900/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
                              title="View transcript"
                            >
                              <ChevronDown size={14} className={`transition ${expanded === p.id ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                          {p.session_id && (
                            <button
                              onClick={() => downloadPdf(p.session_id)}
                              disabled={downloadingId === p.session_id}
                              className="rounded p-1 text-ink-900/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
                              title="Download PDF report"
                            >
                              {downloadingId === p.session_id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === p.id && p.transcript && (
                      <tr className="border-b border-black/5 dark:border-white/5">
                        <td colSpan={7} className="bg-black/[0.02] px-4 py-3 text-xs text-ink-900/70 dark:bg-white/5 dark:text-white/70">
                          {p.transcript}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
