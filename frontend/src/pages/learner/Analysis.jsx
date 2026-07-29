import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, ArrowRight } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const RESULT_TONE = { Strong: 'success', Fair: 'warning', 'Needs Work': 'danger', 'Pending Review': 'neutral' }

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Analysis() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/debate/sessions/history')
        if (!cancelled) setItems(res.data.items || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Could not load your debate history right now.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'AI Analysis' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">AI Analysis</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Every completed debate, with a full AI-generated breakdown.</p>
      </div>

      {error && (
        <div className="glass-card border border-rose-200 p-4 text-sm text-rose-600 dark:border-rose-500/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No completed debates yet"
          description="Finish a debate session to see its AI analysis here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <Link
              key={d.id}
              to={`/learner/analysis/${d.id}`}
              className="glass-card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-glass"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-brand-200">
                  <BrainCircuit size={16} />
                </div>
                <Badge tone={RESULT_TONE[d.result] || 'neutral'}>{d.result}</Badge>
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-ink-900 dark:text-white">{d.topic}</p>
              <div className="flex items-center justify-between text-xs text-ink-900/50 dark:text-white/50">
                <span>{d.format}</span>
                <span>{formatDate(d.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-data text-lg font-bold text-ink-900 dark:text-white">
                  {d.score != null ? `${d.score}/100` : '—'}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-500">
                  View analysis <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
