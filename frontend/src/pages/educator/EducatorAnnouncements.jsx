import { useEffect, useState } from 'react'
import { Megaphone, Send, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function EducatorAnnouncements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/educator/announcements').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const send = async () => {
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const { data } = await api.post('/educator/announcements', { title, message })
      setResult({ ok: true, msg: `Sent to ${data.recipient_count} learner(s).` })
      setTitle('')
      setMessage('')
      load()
    } catch (e) {
      setResult({ ok: false, msg: e?.response?.data?.detail || 'Could not send announcement.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Megaphone size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real class-wide announcements, delivered to every learner's notification bell.</p>
        </div>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New Debate Topic Added" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Message</label>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="input-field resize-none" placeholder="Should social media be regulated? is now available to practice." />
          </div>
          <Button onClick={send} disabled={sending || !title.trim() || !message.trim()} className="self-end">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Announcement
          </Button>
          {result && <p className={`text-sm font-medium ${result.ok ? 'text-verdict-600' : 'text-alert-500'}`}>{result.ok && <CheckCircle2 size={14} className="mr-1 inline" />}{result.msg}</p>}
        </div>
      </Card>

      {loading ? (
        <SkeletonCard />
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements sent yet" description="Announcements you send will be listed here." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((a) => (
            <Card key={a.id} padding="sm">
              <p className="font-semibold text-ink-900 dark:text-white">{a.title}</p>
              <p className="text-sm text-ink-900/60 dark:text-white/60">{a.message}</p>
              <p className="mt-1 text-xs text-ink-900/40 dark:text-white/40">Sent to {a.recipient_count} learner(s) · {new Date(a.created_at).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
