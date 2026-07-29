import { useEffect, useState } from 'react'
import { Presentation } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api, { mediaAudioUrl } from '../../api/axios'

export default function CoachPresentationReviews() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/coach/presentation-reviews').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Presentation size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Presentation Reviews</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real presentation analyses from your roster.</p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState icon={Presentation} title="No presentations analyzed yet" description="Presentation recordings from your roster will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Topic</th>
                  <th className="py-2">Overall Score</th>
                  <th className="py-2">Recording</th>
                  <th className="py-2 pr-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 text-ink-900 dark:text-white">{p.topic || '—'}</td>
                    <td className="py-2.5 font-data font-bold text-brand-500">{p.presentation_score?.overall_score ?? '—'}/100</td>
                    <td className="py-2.5">
                      {p.audio_filename ? (
                        <audio controls src={mediaAudioUrl(p.id)} className="h-8 max-w-[220px]" />
                      ) : (
                        <span className="text-xs text-ink-900/40 dark:text-white/40">No audio retained</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
