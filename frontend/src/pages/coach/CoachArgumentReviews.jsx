import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachArgumentReviews() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/coach/review-queue').then(({ data }) => setItems(data.filter((r) => r.ai_overall_score != null))).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Argument Reviews</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">AI-scored arguments from your roster, ready for your review.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState icon={BrainCircuit} title="No scored arguments yet" description="AI-scored debates from your roster will appear here." />
        ) : (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/coach/review/${item.id}`)}
                className="flex cursor-pointer items-center justify-between gap-3 py-3 hover:bg-black/[0.02] dark:hover:bg-white/5"
              >
                <div>
                  <p className="font-medium text-ink-900 dark:text-white">{item.learner_name}</p>
                  <p className="text-sm text-ink-900/50 dark:text-white/50">{item.topic}</p>
                </div>
                <p className="font-data text-lg font-bold text-brand-500">{item.ai_overall_score}/100</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
