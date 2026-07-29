import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ListTree, Users, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Toolbar, { SearchInput, SelectFilter } from '../../components/ui/Toolbar'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import api from '../../api/axios'

const FORMAT_LABELS = {
  one_on_one: 'One-on-One',
  parliamentary: 'Parliamentary',
  british_parliamentary: 'British Parliamentary',
  asian_parliamentary: 'Asian Parliamentary',
  oxford: 'Oxford',
  policy: 'Policy',
  public_forum: 'Public Forum',
  lincoln_douglas: 'Lincoln-Douglas',
  world_schools: 'World Schools',
  ai_simulation: 'AI Simulation',
  popularity: 'Popularity Debate',
  group_debate: 'Group Debate',
}
const DIFFICULTIES = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const PAGE_SIZE = 6
const DIFFICULTY_TONE = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' }

export default function Topics() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [difficulty, setDifficulty] = useState('All Levels')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Milestone 3: topics come from MongoDB (app.services.topics_service),
    // never a hardcoded frontend array.
    api
      .get('/debate/topics')
      .then((res) => setTopics(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load debate topics.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All Categories', ...new Set(topics.map((t) => t.category))], [topics])

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All Categories' || t.category === category
      const matchesDifficulty = difficulty === 'All Levels' || t.difficulty === difficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [topics, search, category, difficulty])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (setter) => (val) => {
    setter(val)
    setPage(1)
  }

  const formatLabel = (value) => FORMAT_LABELS[value] || value

  const goPractice = (t) => navigate('/learner/sessions', { state: { topic: t.title, format: t.debate_format } })

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'Debate Topics' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Browse Debate Topics</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Curated per debate format, pulled live from the platform's topic library.</p>
      </div>

      <button
        onClick={() => navigate('/learner/sessions', { state: { customMode: true } })}
        className="glass-card flex w-full items-center justify-between gap-4 border border-brand-500/30 p-5 text-left transition hover:border-brand-500 hover:shadow-premium"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900 dark:text-white">Start a Custom Debate</p>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              Type your own topic, pick any format, choose For or Against — goes through the same full AI evaluation.
            </p>
          </div>
        </div>
        <ArrowRight size={18} className="shrink-0 text-brand-500" />
      </button>

      <Toolbar>
        <SearchInput value={search} onChange={handleFilterChange(setSearch)} placeholder="Search topics…" />
        <SelectFilter value={category} onChange={handleFilterChange(setCategory)} options={categories.map((c) => ({ value: c, label: c }))} />
        <SelectFilter value={difficulty} onChange={handleFilterChange(setDifficulty)} options={DIFFICULTIES.map((d) => ({ value: d, label: d }))} />
      </Toolbar>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-900/50 dark:text-white/50">
          <Loader2 size={16} className="animate-spin" /> Loading topics…
        </div>
      ) : pageItems.length === 0 ? (
        <EmptyState
          icon={ListTree}
          title="No topics match your filters"
          description="Try clearing a filter or searching a different keyword."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((t) => (
            <div key={t.id} className="glass-card flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <Badge tone="neutral">{t.category}</Badge>
                <Badge tone={DIFFICULTY_TONE[t.difficulty] || 'neutral'}>{t.difficulty}</Badge>
              </div>
              <h3 className="font-display font-semibold leading-snug text-ink-900 dark:text-white">{t.title}</h3>
              <div className="flex items-center gap-3 text-xs text-ink-900/50 dark:text-white/50">
                <span className="flex items-center gap-1"><Flame size={13} /> {t.popularity}% popularity</span>
                <span className="flex items-center gap-1"><Users size={13} /> {formatLabel(t.debate_format)}</span>
              </div>
              <div className="mt-1 flex gap-2">
                <button onClick={() => setSelected(t)} className="btn-secondary flex-1 !py-2 text-xs">
                  Details
                </button>
                <button onClick={() => goPractice(t)} className="btn-primary flex-1 !py-2 text-xs">
                  Select Topic
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Topic Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{selected.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">{selected.category}</Badge>
              <Badge tone={DIFFICULTY_TONE[selected.difficulty] || 'neutral'}>{selected.difficulty}</Badge>
              <Badge tone="brand">{formatLabel(selected.debate_format)}</Badge>
            </div>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              This topic covers {selected.category.toLowerCase()} arguments and is rated {selected.popularity}% popular among
              learners recently. Recommended for {selected.difficulty.toLowerCase()}-level debaters practicing{' '}
              {formatLabel(selected.debate_format)} format.
            </p>
            <button
              onClick={() => {
                setSelected(null)
                goPractice(selected)
              }}
              className="btn-primary w-fit"
            >
              Select This Topic
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
