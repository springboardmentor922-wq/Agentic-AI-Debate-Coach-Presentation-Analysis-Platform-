import { useEffect, useState } from 'react'
import { ClipboardCheck, Plus, Trash2, X, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorRubrics() {
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [criteriaText, setCriteriaText] = useState('')
  const [format, setFormat] = useState('one_on_one')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/educator/rubrics').then(({ data }) => setRubrics(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const create = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await api.post('/educator/rubrics', {
        title,
        criteria: criteriaText.split('\n').map((c) => c.trim()).filter(Boolean),
        debate_format: format,
      })
      setTitle('')
      setCriteriaText('')
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await api.delete(`/educator/rubrics/${id}`)
    setRubrics((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Rubrics & Criteria</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">Real, persisted grading rubrics you create and reuse.</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm"><Plus size={16} /> New Rubric</Button>
      </div>

      {showForm && (
        <Card className="border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">New Rubric</p>
            <button onClick={() => setShowForm(false)} aria-label="Close form"><X size={18} className="text-ink-900/40 dark:text-white/40" /></button>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Oxford Debate Rubric" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Criteria (one per line)</label>
              <textarea rows={4} value={criteriaText} onChange={(e) => setCriteriaText(e.target.value)} className="input-field resize-none" placeholder={'Clarity of argument\nUse of evidence\nRebuttal strength'} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Debate Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field">
                <option value="one_on_one">One-on-One</option>
                <option value="parliamentary">Parliamentary</option>
                <option value="oxford">Oxford</option>
                <option value="policy">Policy</option>
                <option value="public_forum">Public Forum</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={create} disabled={saving || !title.trim()}>{saving && <Loader2 size={14} className="animate-spin" />} Save Rubric</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <SkeletonCard />
      ) : rubrics.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No rubrics yet" description="Create a rubric to standardize how you grade debates." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rubrics.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink-900 dark:text-white">{r.title}</p>
                <button onClick={() => remove(r.id)} aria-label={`Delete rubric ${r.title}`} className="text-alert-500 hover:text-alert-600"><Trash2 size={15} /></button>
              </div>
              <p className="mb-2 text-xs text-ink-900/40 dark:text-white/40">{r.debate_format.replace('_', ' ')}</p>
              <ul className="flex flex-col gap-1">
                {r.criteria.map((c, i) => <li key={i} className="text-sm text-ink-900/70 dark:text-white/70">• {c}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
