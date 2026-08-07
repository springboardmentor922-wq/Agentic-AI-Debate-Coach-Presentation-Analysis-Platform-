import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Send, Loader2, Search, X } from 'lucide-react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

// Shared messaging UI for every role. Backed by /api/v1/messages/*, which
// already scopes who can be searched/messaged (ALLOWED_PEERS server-side) —
// this component doesn't need to know the current user's role to enforce
// that; it just reflects whatever the backend allows.
//
// Polling every 5s stands in for real-time push: this repo has no WebSocket
// server for messaging (verified — grep found none), so this is the honest
// "actually works end-to-end" option rather than a fake typing/online
// indicator with nothing behind it. See CHANGELOG for the tradeoff.
const POLL_MS = 5000

export default function MessagesPanel({ title = 'Messages', subtitle = 'Real conversations, end to end.' }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [thread, setThread] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const scrollRef = useRef(null)

  const loadConversations = () => {
    api.get('/messages/conversations').then(({ data }) => setConversations(data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadConversations()
    const id = setInterval(loadConversations, POLL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!active) return
    const load = () => api.get(`/messages/thread/${active.user_id}`).then(({ data }) => setThread(data))
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [active])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [thread])

  useEffect(() => {
    if (!showSearch) return
    setSearching(true)
    const id = setTimeout(() => {
      api.get('/messages/contacts', { params: { q: search } })
        .then(({ data }) => setContacts(data))
        .finally(() => setSearching(false))
    }, 250)
    return () => clearTimeout(id)
  }, [search, showSearch])

  const startConversation = (contact) => {
    setActive(contact)
    setShowSearch(false)
    setSearch('')
  }

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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Search size={15} /> New message
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="sm" className="lg:col-span-1">
          {showSearch && (
            <div className="mb-2 border-b border-black/5 p-2 dark:border-white/10">
              <div className="flex items-center gap-2 rounded-lg bg-black/[0.03] px-2 py-1.5 dark:bg-white/5">
                <Search size={14} className="shrink-0 text-ink-900/40 dark:text-white/40" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search people you can message..."
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button onClick={() => setShowSearch(false)} aria-label="Close search">
                  <X size={14} className="text-ink-900/40 dark:text-white/40" />
                </button>
              </div>
              <div className="mt-1 max-h-56 overflow-y-auto">
                {searching ? (
                  <p className="p-2 text-xs text-ink-900/40 dark:text-white/40">Searching...</p>
                ) : contacts.length === 0 ? (
                  <p className="p-2 text-xs text-ink-900/40 dark:text-white/40">
                    No matching people you're able to message.
                  </p>
                ) : (
                  contacts.map((c) => (
                    <button
                      key={c.user_id}
                      onClick={() => startConversation(c)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/[0.03] dark:hover:bg-white/5"
                    >
                      <span className="truncate font-medium text-ink-900 dark:text-white">{c.name}</span>
                      <span className="ml-2 shrink-0 text-[10px] uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                        {c.role?.replace('_', ' ')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {loading ? (
            <p className="p-3 text-sm text-ink-900/40 dark:text-white/40">Loading...</p>
          ) : conversations.length === 0 && !showSearch ? (
            <p className="p-3 text-sm text-ink-900/40 dark:text-white/40">
              No conversations yet. Tap "New message" to search for someone to message.
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
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose someone from the list, or start a new message." />
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
                <button onClick={send} disabled={sending || !text.trim()} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40">
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
