import { useEffect, useState } from 'react'
import { ClipboardList, Plus, X, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorAssignments() {
  const [assignments, setAssignments] = useState([])
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ learner_id: '', topic: '', debate_format: 'one_on_one', note: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/educator/assignments').then(({ data }) => setAssignments(data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/educator/learners').then(({ data }) => setLearners(data))
  }, [])

  const create = async () => {
    if (!form.learner_id || !form.topic.trim()) return
    setSaving(true)
    try {
      await api.post('/educator/assign-topic', form)
      setForm({ learner_id: '', topic: '', debate_format: 'one_on_one', note: '' })
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Assignments</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">{assignments.length} assignment(s)</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm"><Plus size={16} /> New Assignment</Button>
      </div>

      {showForm && (
        <Card className="border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">Assign a Debate Topic</p>
            <button onClick={() => setShowForm(false)} aria-label="Close form"><X size={18} className="text-ink-900/40 dark:text-white/40" /></button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Learner</label>
              <select value={form.learner_id} onChange={(e) => setForm((f) => ({ ...f, learner_id: e.target.value }))} className="input-field">
                <option value="">Select a learner...</option>
                {learners.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
            </div>
            <Input label="Topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="Should social media be regulated?" />
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
            <Input label="Note (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={create} disabled={saving || !form.learner_id || !form.topic.trim()}>
              {saving && <Loader2 size={14} className="animate-spin" />} Assign
            </Button>
          </div>
        </Card>
      )}

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" description="Assign a debate topic to a learner to get started." />
        ) : (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {assignments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-ink-900 dark:text-white">{a.learner_name}</p>
                  <p className="text-sm text-ink-900/50 dark:text-white/50">{a.topic} · {a.debate_format.replace('_', ' ')}</p>
                </div>
                <Badge tone={a.completed ? 'success' : 'warning'}>{a.completed ? 'Completed' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
