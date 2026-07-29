import { useEffect, useState } from 'react'
import { Inbox, CheckCircle2, Loader2, X } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorEvaluationQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)
  const [form, setForm] = useState({ educator_score: '', educator_comments: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/educator/review-queue', { params: { status: 'reviewed' } }).then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const approve = async (id) => {
    if (form.educator_score === '') return
    setSubmitting(true)
    try {
      await api.post(`/educator/review/${id}/approve`, {
        educator_score: Number(form.educator_score),
        educator_comments: form.educator_comments || null,
      })
      setApproving(null)
      setForm({ educator_score: '', educator_comments: '' })
      load()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Inbox size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Evaluation Queue</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">{items.length} debate(s) coach-reviewed, waiting for your final approval.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Nothing pending" description="Debates reviewed by a coach will appear here for final grading." />
        ) : (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-white">{item.learner_name}</p>
                    <p className="text-sm text-ink-900/50 dark:text-white/50">
                      {item.topic} · AI {item.ai_overall_score ?? '—'} · Coach {item.coach_score ?? '—'}
                    </p>
                  </div>
                  {approving === item.id ? (
                    <button onClick={() => setApproving(null)} aria-label="Cancel"><X size={16} className="text-ink-900/40" /></button>
                  ) : (
                    <Button size="sm" onClick={() => setApproving(item.id)}>Grade & Approve</Button>
                  )}
                </div>
                {approving === item.id && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl bg-black/[0.03] p-3 dark:bg-white/5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number" min={0} max={100}
                        value={form.educator_score}
                        onChange={(e) => setForm((f) => ({ ...f, educator_score: e.target.value }))}
                        placeholder="Final score (0-100)"
                        className="input-field w-44"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={form.educator_comments}
                      onChange={(e) => setForm((f) => ({ ...f, educator_comments: e.target.value }))}
                      placeholder="Final comments for the learner..."
                      className="input-field resize-none"
                    />
                    <Button size="sm" className="self-end" onClick={() => approve(item.id)} disabled={submitting || form.educator_score === ''}>
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Publish Final Report
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
