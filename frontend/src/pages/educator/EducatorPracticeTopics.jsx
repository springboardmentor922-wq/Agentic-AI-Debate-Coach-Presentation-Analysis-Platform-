import { useEffect, useState } from 'react'
import { ListTree } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const DIFFICULTY_TONE = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }

export default function EducatorPracticeTopics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/educator/topics').then(({ data }) => setTopics(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <ListTree size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Practice Topics</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Browse the same real topic library learners practice with — assign one from the Assignments page.
          </p>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : topics.length === 0 ? (
          <EmptyState icon={ListTree} title="No topics yet" description="Ask an administrator to add debate topics in Content Management." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 pr-2">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{t.title}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{t.category}</td>
                    <td className="py-2.5 pr-2"><Badge tone={DIFFICULTY_TONE[t.difficulty] || 'neutral'}>{t.difficulty}</Badge></td>
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
