import { useEffect, useMemo, useState } from 'react'
import { Download, FileBarChart, Award, Trophy, Loader2 } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Toolbar, { SearchInput, SelectFilter } from '../../components/ui/Toolbar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Reports() {
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState('All Formats')
  const [downloadingId, setDownloadingId] = useState(null)

  const [reports, setReports] = useState([])
  const [achievements, setAchievements] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [reportsRes, achRes, certRes] = await Promise.all([
          api.get('/reports'),
          api.get('/achievements'),
          api.get('/certificates'),
        ])
        if (cancelled) return
        setReports(reportsRes.data.items || [])
        setAchievements(achRes.data || [])
        setCertificates(certRes.data || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Could not load your reports right now.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const formatOptions = useMemo(() => {
    const formats = Array.from(new Set(reports.map((r) => r.debate_format)))
    return ['All Formats', ...formats]
  }, [reports])

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
      const matchesFormat = format === 'All Formats' || r.debate_format === format
      return matchesSearch && matchesFormat
    })
  }, [search, format, reports])

  const [downloadingFormat, setDownloadingFormat] = useState(null)

  const handleDownload = async (id, format = 'pdf') => {
    setDownloadingId(id)
    setDownloadingFormat(format)
    const mimeType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const extension = format === 'pdf' ? 'pdf' : 'xlsx'
    try {
      const res = await api.get(`/reports/${id}/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `debate_report_${id}.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.detail || `Could not download this report as ${extension.toUpperCase()}.`)
    } finally {
      setDownloadingId(null)
      setDownloadingFormat(null)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'Reports' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Reports & Achievements</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Download PDF reports and track your certificates and badges — all generated from your real debates.</p>
      </div>

      {error && (
        <div className="glass-card border border-rose-200 p-4 text-sm text-rose-600 dark:border-rose-500/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
          <FileBarChart size={18} className="text-brand-500" /> Reports
        </h2>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search reports…" />
          <SelectFilter value={format} onChange={setFormat} options={formatOptions.map((t) => ({ value: t, label: t }))} />
        </Toolbar>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileBarChart}
            title={reports.length === 0 ? 'No reports yet' : 'No reports found'}
            description={reports.length === 0
              ? 'Complete a debate and generate a feedback report to see it here.'
              : 'Try a different search or format filter.'}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border border-black/5 p-3.5 dark:border-white/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-brand-200">
                  <FileBarChart size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{r.title}</p>
                  <p className="text-xs text-ink-900/50 dark:text-white/50">{formatDate(r.date)}</p>
                </div>
                {r.overall_score != null && <Badge tone="brand">AI: {r.overall_score}/100</Badge>}
                {r.coach_score != null && <Badge tone="success">Coach: {r.coach_score}/100</Badge>}
                {r.educator_score != null ? (
                  <Badge tone="success">Educator: {r.educator_score}/100</Badge>
                ) : r.review_status === 'reviewed' ? (
                  <Badge tone="warning">Awaiting educator approval</Badge>
                ) : null}
                <Badge tone="neutral">{r.debate_format}</Badge>
                <button
                  onClick={() => handleDownload(r.id, 'pdf')}
                  disabled={downloadingId === r.id}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  {downloadingId === r.id && downloadingFormat === 'pdf' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  {downloadingId === r.id && downloadingFormat === 'pdf' ? 'Preparing…' : 'PDF'}
                </button>
                <button
                  onClick={() => handleDownload(r.id, 'excel')}
                  disabled={downloadingId === r.id}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  {downloadingId === r.id && downloadingFormat === 'excel' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  {downloadingId === r.id && downloadingFormat === 'excel' ? 'Preparing…' : 'Excel'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <Award size={18} className="text-brand-500" /> Certificates
          </h2>
          {loading ? (
            <SkeletonCard />
          ) : certificates.length === 0 ? (
            <EmptyState icon={Award} title="No certificates yet" description="Certificates are awarded automatically once you hit real milestones (e.g. 10 completed debates)." />
          ) : (
            <div className="flex flex-col gap-3">
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-black/5 p-3.5 dark:border-white/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <Award size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{c.title}</p>
                    <p className="text-xs text-ink-900/50 dark:text-white/50">Issued {formatDate(c.issued_at)}</p>
                    <p className="text-xs text-ink-900/40 dark:text-white/40">{c.criteria_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <Trophy size={18} className="text-brand-500" /> Achievements
          </h2>
          {loading ? (
            <SkeletonCard />
          ) : achievements.length === 0 ? (
            <EmptyState icon={Trophy} title="No achievements unlocked yet" description="Achievements unlock automatically as you complete real debates and hit real milestones." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Trophy size={16} />
                  </div>
                  <p className="text-xs font-semibold text-ink-900 dark:text-white">{a.title}</p>
                  <p className="text-[11px] text-ink-900/50 dark:text-white/50">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
