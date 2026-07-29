import { useEffect, useState } from 'react'
import { Plug, CheckCircle2, XCircle } from 'lucide-react'
import Card from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function AdminIntegrations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/integrations').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Plug size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real status read from server configuration — not a marketplace of fake connectors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Card key={item.name} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">{item.category}</p>
                  <p className="mt-0.5 font-semibold text-ink-900 dark:text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{item.description}</p>
                </div>
                {item.configured ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-verdict-50 px-2.5 py-1 text-xs font-semibold text-verdict-700 dark:bg-verdict-400/15 dark:text-verdict-300">
                    <CheckCircle2 size={13} /> Configured
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-ink-900/50 dark:bg-white/10 dark:text-white/50">
                    <XCircle size={13} /> Not set up
                  </span>
                )}
              </Card>
            ))}
      </div>
    </div>
  )
}
