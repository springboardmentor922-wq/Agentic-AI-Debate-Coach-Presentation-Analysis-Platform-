import { useEffect, useState } from 'react'
import { FolderKanban, Plus, Trash2, X, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const EMPTY_FORM = { title: '', category: '', difficulty: 'beginner', debate_format: 'one_on_one', popularity: 50 }
const DIFFICULTY_TONE = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }

export default function AdminContent() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/content/topics').then(({ data }) => setTopics(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const create = async () => {
    if (!form.title.trim() || !form.category.trim()) return
    setSaving(true)
    try {
      await api.post('/admin/content/topics', form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await api.delete(`/admin/content/topics/${id}`)
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <FolderKanban size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Content Management</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              Manage the debate topics learners see in Practice Topics & AI Debate Simulation.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} /> New Topic
        </Button>
      </div>

      {showForm && (
        <Card className="border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">New Debate Topic</p>
            <button onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={18} className="text-ink-900/40 dark:text-white/40" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Should social media be regulated?" />
            <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Technology" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Debate Format</label>
              <select value={form.debate_format} onChange={(e) => setForm((f) => ({ ...f, debate_format: e.target.value }))} className="input-field">
                <option value="one_on_one">One-on-One</option>
                <option value="parliamentary">Parliamentary</option>
                <option value="oxford">Oxford</option>
                <option value="policy">Policy</option>
                <option value="public_forum">Public Forum</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={create} disabled={saving || !form.title.trim() || !form.category.trim()}>
              {saving && <Loader2 size={14} className="animate-spin" />} Create Topic
            </Button>
          </div>
        </Card>
      )}

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : topics.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No topics yet" description="Add debate topics for learners to practice with." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Difficulty</th>
                  <th className="py-2">Format</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{t.title}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{t.category}</td>
                    <td className="py-2.5">
                      <Badge tone={DIFFICULTY_TONE[t.difficulty] || 'neutral'}>{t.difficulty}</Badge>
                    </td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{t.debate_format.replace('_', ' ')}</td>
                    <td className="py-2.5 pr-2 text-right">
                      <button onClick={() => remove(t.id)} aria-label={`Delete topic ${t.title}`} className="text-alert-500 hover:text-alert-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
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
