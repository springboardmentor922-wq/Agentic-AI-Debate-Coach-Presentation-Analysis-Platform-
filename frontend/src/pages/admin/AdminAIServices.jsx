import { useEffect, useState } from 'react'
import { Cpu, CheckCircle2, XCircle } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function AdminAIServices() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/ai-services').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Cpu size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">AI Models & Services</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Real configuration status for every AI provider in the pipeline — no simulated uptime percentages.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Card key={item.provider} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{item.provider}</p>
                  <Badge tone={item.role === 'primary' ? 'brand' : 'neutral'} className="mt-1">
                    {item.role}
                  </Badge>
                </div>
                {item.configured ? (
                  <span className="flex items-center gap-1 rounded-full bg-verdict-50 px-2.5 py-1 text-xs font-semibold text-verdict-700 dark:bg-verdict-400/15 dark:text-verdict-300">
                    <CheckCircle2 size={13} /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-ink-900/50 dark:bg-white/10 dark:text-white/50">
                    <XCircle size={13} /> No API key set
                  </span>
                )}
              </Card>
            ))}
      </div>

      <Card className="border-l-4 border-brand-500">
        <p className="text-sm text-ink-900/70 dark:text-white/70">
          Every AI feature on the platform (argument analysis, fallacy detection, coaching, the chatbot) tries the
          primary provider first, falls back to the secondary provider if it fails, and falls back to a
          deterministic rule-based engine if both are unavailable — so the platform never returns an empty result.
        </p>
      </Card>
    </div>
  )
}
