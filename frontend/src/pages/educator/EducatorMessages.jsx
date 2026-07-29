import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function EducatorMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [thread, setThread] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  const loadConversations = () => {
    setLoading(true)
    api.get('/messages/conversations').then(({ data }) => setConversations(data)).finally(() => setLoading(false))
  }

  useEffect(loadConversations, [])

  useEffect(() => {
    if (!active) return
    api.get(`/messages/thread/${active.user_id}`).then(({ data }) => setThread(data))
  }, [active])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [thread])

  const send = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    try {
      const { data } = await api.post('/messages', { recipient_id: active.user_id, text })
      setThread((prev) => [...prev, data])
      setText('')
      loadConversations()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <MessageSquare size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Messages</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real conversations with your learners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="sm" className="lg:col-span-1">
          {loading ? (
            <p className="p-3 text-sm text-ink-900/40 dark:text-white/40">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-3 text-sm text-ink-900/40 dark:text-white/40">
              No conversations yet. Message a learner from the Learners page to start one — or wait for them to message you.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                onClick={() => setActive(c)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                  active?.user_id === c.user_id ? 'bg-brand-500/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/5'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900 dark:text-white">{c.name}</p>
                  <p className="truncate text-xs text-ink-900/50 dark:text-white/50">{c.last_message}</p>
                </div>
                {c.unread_count > 0 && (
                  <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </Card>

        <Card padding="sm" className="flex flex-col lg:col-span-2">
          {!active ? (
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a learner from the list to see your message history." />
          ) : (
            <>
              <div ref={scrollRef} className="flex max-h-96 flex-col gap-2 overflow-y-auto p-2">
                {thread.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === user.id ? 'bg-brand-600 text-white' : 'bg-black/[0.04] text-ink-900 dark:bg-white/10 dark:text-white'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 border-t border-black/5 pt-2 dark:border-white/10">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder={`Message ${active.name}...`}
                  className="input-field flex-1"
                />
                <button onClick={send} disabled={sending || !text.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
