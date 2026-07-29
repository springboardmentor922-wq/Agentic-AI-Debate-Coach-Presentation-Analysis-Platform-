import { useState } from 'react'
import { BellRing, Send, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../api/axios'

export default function AdminNotificationCenter() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const send = async () => {
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const { data } = await api.post('/admin/notifications/broadcast', {
        title,
        message,
        target_role: targetRole || null,
      })
      setResult({ ok: true, msg: data.message })
      setTitle('')
      setMessage('')
    } catch (e) {
      setResult({ ok: false, msg: e?.response?.data?.detail || 'Could not send notification.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BellRing size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Notification Center</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Broadcasts a real notification into every recipient's bell icon — same system every dashboard reads from.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Platform Update" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We've launched new AI coaching features..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Send to</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="input-field">
              <option value="">Everyone</option>
              <option value="learner">Learners only</option>
              <option value="debate_coach">Debate Coaches only</option>
              <option value="educator">Educators only</option>
              <option value="administrator">Administrators only</option>
            </select>
          </div>
          <Button onClick={send} disabled={sending || !title.trim() || !message.trim()} className="self-end">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send Notification
          </Button>
          {result && (
            <p className={`text-sm font-medium ${result.ok ? 'text-verdict-600' : 'text-alert-500'}`}>
              {result.ok && <CheckCircle2 size={14} className="mr-1 inline" />}
              {result.msg}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
