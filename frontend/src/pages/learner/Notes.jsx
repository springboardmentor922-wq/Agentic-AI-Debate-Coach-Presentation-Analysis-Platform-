import { useEffect, useState } from 'react'
import { NotebookPen, Plus, Trash2, Loader2, X } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLine } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const EMPTY_FORM = { title: '', content: '', tag: '' }

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, 'new' = creating, or a note object
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notes')
      setNotes(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditing('new')
  }

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content, tag: note.tag || '' })
    setEditing(note)
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editing === 'new') {
        const { data } = await api.post('/notes', form)
        setNotes((prev) => [data, ...prev])
      } else {
        const { data } = await api.patch(`/notes/${editing.id}`, form)
        setNotes((prev) => prev.map((n) => (n.id === data.id ? data : n)))
      }
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await api.delete(`/notes/${id}`)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl page-fade">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <NotebookPen size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">My Notes</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              Create, organize, and revisit your personal notes for debates and presentations.
            </p>
          </div>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus size={16} /> New Note
        </Button>
      </div>

      {editing && (
        <Card className="mb-5 border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">
              {editing === 'new' ? 'New Note' : 'Edit Note'}
            </p>
            <button onClick={() => setEditing(null)} aria-label="Close form" className="text-ink-900/40 hover:text-ink-900 dark:text-white/40 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Key Points for Policy Debate"
            />
            <Input
              label="Tag (optional)"
              value={form.tag}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              placeholder="e.g. Debate Prep"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Content</label>
              <textarea
                rows={5}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="input-field resize-none"
                placeholder="Write your note..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="tertiary" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          <SkeletonLine className="h-20 w-full" />
          <SkeletonLine className="h-20 w-full" />
        </div>
      ) : notes.length === 0 && !editing ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Jot down key points, ideas, or things to remember before your next debate."
          action={
            <Button onClick={openNew} size="sm">
              <Plus size={16} /> Create your first note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openEdit(note)} className="text-left">
                  <p className="font-semibold text-ink-900 hover:text-brand-500 dark:text-white">{note.title}</p>
                </button>
                <button
                  onClick={() => remove(note.id)}
                  aria-label={`Delete note ${note.title}`}
                  className="shrink-0 text-ink-900/30 hover:text-alert-500 dark:text-white/30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {note.tag && (
                <span className="w-fit rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  {note.tag}
                </span>
              )}
              <p className="line-clamp-3 text-sm text-ink-900/60 dark:text-white/60">{note.content || 'No content yet.'}</p>
              <p className="mt-1 text-[11px] text-ink-900/30 dark:text-white/30">
                Updated {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
