import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachEvaluationQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('/coach/review-queue', { params: { status: 'pending' } }).then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const claim = async (id) => {
    setClaimingId(id)
    try {
      await api.post(`/coach/review/${id}/claim`)
      navigate(`/coach/review/${id}`)
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Inbox size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">AI Evaluation Queue</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">{items.length} debate(s) waiting for coach review.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Queue is empty" description="Nothing is waiting for review right now — nice work staying on top of it." />
        ) : (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-ink-900 dark:text-white">{item.learner_name}</p>
                  <p className="text-sm text-ink-900/50 dark:text-white/50">{item.topic} · AI score {item.ai_overall_score ?? '—'}</p>
                </div>
                <Button size="sm" onClick={() => claim(item.id)} disabled={claimingId === item.id}>
                  {claimingId === item.id ? <Loader2 size={14} className="animate-spin" /> : null} Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
