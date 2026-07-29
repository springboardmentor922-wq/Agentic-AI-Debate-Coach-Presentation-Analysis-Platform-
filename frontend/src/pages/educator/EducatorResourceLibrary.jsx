import { useEffect, useState } from 'react'
import { Library } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorResourceLibrary() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/learning-materials').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Library size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Resource Library</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">The same real learning materials library learners see — for you to reference or share.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : items.length === 0 ? (
        <EmptyState icon={Library} title="No resources yet" description="Learning materials will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <Badge tone="brand">{item.type}</Badge>
              <p className="mt-2 font-semibold text-ink-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{item.level}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.map((t) => <span key={t} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-ink-900/50 dark:bg-white/10 dark:text-white/50">{t}</span>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
