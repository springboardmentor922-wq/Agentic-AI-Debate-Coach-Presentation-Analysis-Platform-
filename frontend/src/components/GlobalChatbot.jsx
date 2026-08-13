import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeExternalLinks from 'rehype-external-links'
import {
  MessageSquareText,
  X,
  Send,
  Plus,
  History,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import coachChatApi from '../api/coachChat'
import { resolvePageContext, AGENT_LABELS } from '../utils/chatPageContext'

// Full Markdown rendering (GFM tables, fenced code blocks, bold/italic,
// lists, links opened safely in a new tab with rel=noopener) rather than
// the previous bold+bullets-only regex renderer — the chatbot's replies
// can include tables (e.g. score breakdowns) and code-like quoted text, and
// links must never inherit the current session/auth context.
function Markdownish({ text }) {
  return (
    <div className="chat-markdown space-y-1.5 text-[13px] leading-snug [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_a]:text-brand-600 [&_a]:underline dark:[&_a]:text-brand-300 [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[12px] [&_th]:border [&_th]:border-black/10 [&_th]:bg-black/5 [&_th]:px-1.5 [&_th]:py-1 [&_td]:border [&_td]:border-black/10 [&_td]:px-1.5 [&_td]:py-1 dark:[&_th]:border-white/15 dark:[&_th]:bg-white/10 dark:[&_td]:border-white/15 [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] dark:[&_code]:bg-white/10 [&_pre]:my-1.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-ink-900 [&_pre]:p-2.5 [&_pre]:text-white [&_pre_code]:bg-transparent [&_pre_code]:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]]}
      >
        {text || ''}
      </ReactMarkdown>
    </div>
  )
}

export default function GlobalChatbot() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const abortControllerRef = useRef(null)

  const pageContext = resolvePageContext(location.pathname)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending, open])

  // This component is remounted (via `key={user?.id}` in App.jsx) every time
  // a login happens or the logged-in user changes, which resets all local
  // state below for free. On top of that reset, proactively create a brand
  // new server-side chat session right away — per spec, every login starts
  // a fresh conversation rather than silently resuming the learner's last
  // one. Prior sessions are untouched in the database and remain browsable
  // via the History panel.
  useEffect(() => {
    if (!user || initializedRef.current) return
    initializedRef.current = true
    ;(async () => {
      try {
        const s = await coachChatApi.createSession(pageContext.key, null)
        setSessions((prev) => [s, ...prev])
        setSessionId(s.id)
      } catch {
        // Non-fatal — ensureSession() below will retry lazily on first send.
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (!user) return null // only shown to authenticated users, any of the 4 roles

  const loadSessions = async () => {
    try {
      const data = await coachChatApi.listSessions()
      setSessions(data)
      return data
    } catch {
      return []
    }
  }

  const openSession = async (id) => {
    setSessionId(id)
    setShowHistory(false)
    try {
      const msgs = await coachChatApi.getMessages(id)
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }

  const startNewChat = async () => {
    const s = await coachChatApi.createSession(pageContext.key, null)
    setSessions((prev) => [s, ...prev])
    setSessionId(s.id)
    setMessages([])
    setShowHistory(false)
  }

  const deleteSession = async (id, e) => {
    e.stopPropagation()
    await coachChatApi.deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (sessionId === id) {
      setSessionId(null)
      setMessages([])
    }
  }

  const toggleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next && sessions.length === 0) {
      // Just populate the History panel's list — the session created on
      // login (or ensureSession()'s lazy fallback) stays the active one.
      await loadSessions()
    }
  }

  const ensureSession = async () => {
    if (sessionId) return sessionId
    const s = await coachChatApi.createSession(pageContext.key, null)
    setSessions((prev) => [s, ...prev])
    setSessionId(s.id)
    return s.id
  }

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || sending) return
    setInput('')
    setSending(true)

    const placeholderId = `tmp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'user', text, agents_used: [], suggested_questions: [], created_at: new Date().toISOString() },
    ])

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const sid = await ensureSession()
      const streamId = `stream-${Date.now()}`
      let streamedText = ''
      setMessages((prev) => [
        ...prev,
        { id: streamId, role: 'assistant', text: '', agents_used: [], suggested_questions: [], streaming: true },
      ])

      await coachChatApi.streamMessage(sid, text, pageContext.key, null, {
        signal: controller.signal,
        onUserMessage: (realUserMsg) => {
          setMessages((prev) => prev.map((m) => (m.id === placeholderId ? realUserMsg : m)))
        },
        onChunk: (chunk) => {
          streamedText += chunk
          setMessages((prev) => prev.map((m) => (m.id === streamId ? { ...m, text: streamedText } : m)))
        },
        onDone: (finalAssistantMsg) => {
          setMessages((prev) => prev.map((m) => (m.id === streamId ? finalAssistantMsg : m)))
        },
      })
      loadSessions()
    } catch (err) {
      if (err?.name === 'AbortError') {
        // User clicked Stop — keep whatever text streamed in so far as the
        // final message rather than discarding it or falling back to a
        // fresh (non-streaming) request that would ignore the cancellation.
        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false, stopped: true } : m))
        )
        return
      }
      // Streaming failed (e.g. proxy buffering, network hiccup) — fall back
      // to the plain request/response endpoint so the user still gets a real answer.
      try {
        const sid = sessionId || (await ensureSession())
        const result = await coachChatApi.sendMessage(sid, text, pageContext.key)
        setMessages((prev) => {
          const withoutPlaceholders = prev.filter((m) => !m.id?.startsWith('tmp-') && !m.id?.startsWith('stream-'))
          return [...withoutPlaceholders, result.user_message, result.assistant_message]
        })
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: "I couldn't reach the server just now — please try again in a moment.",
            agents_used: [],
            suggested_questions: [],
            created_at: new Date().toISOString(),
          },
        ])
      }
    } finally {
      abortControllerRef.current = null
      setSending(false)
    }
  }

  const stopGenerating = () => {
    abortControllerRef.current?.abort()
  }

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) send(lastUser.text)
  }

  const setFeedback = async (msg, liked) => {
    if (!sessionId || msg.id?.startsWith('tmp-')) return
    const newLiked = msg.liked === liked ? null : liked
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, liked: newLiked } : m)))
    try {
      await coachChatApi.setFeedback(sessionId, msg.id, newLiked)
    } catch {
      /* non-critical */
    }
  }

  const copyText = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  return (
    <>
      {/* Floating button — fixed bottom-right on every page */}
      <button
        onClick={toggleOpen}
        aria-label="Open AI Debate Coach"
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageSquareText size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[60] flex h-[600px] w-[380px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">AI Debate Coach</p>
                <p className="flex items-center gap-1 text-[11px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · {pageContext.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory((s) => !s)}
                title="Chat history"
                className="rounded-md p-1.5 hover:bg-white/15"
              >
                <History size={16} />
              </button>
              <button onClick={startNewChat} title="New chat" className="rounded-md p-1.5 hover:bg-white/15">
                <Plus size={16} />
              </button>
              <button onClick={() => setOpen(false)} title="Close" className="rounded-md p-1.5 hover:bg-white/15">
                <X size={16} />
              </button>
            </div>
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.length === 0 && (
                <p className="p-3 text-xs text-ink-900/50 dark:text-white/50">No previous chats yet.</p>
              )}
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openSession(s.id)}
                  className={`mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-brand-50 dark:hover:bg-white/5 ${
                    sessionId === s.id ? 'bg-brand-50 dark:bg-white/10' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="block truncate font-medium text-ink-900 dark:text-white">{s.title}</span>
                    <span className="block truncate text-ink-900/50 dark:text-white/50">
                      {s.last_message_preview || 'No messages yet'}
                    </span>
                  </span>
                  <Trash2
                    size={13}
                    className="shrink-0 text-ink-900/30 hover:text-alert-500"
                    onClick={(e) => deleteSession(s.id, e)}
                  />
                </button>
              ))}
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
                {messages.length === 0 && (
                  <div className="rounded-xl bg-brand-50/60 p-3 text-xs text-ink-900/70 dark:bg-white/5 dark:text-white/70">
                    Hi{user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! I'm your AI Debate Coach. I
                    already know I'm on <strong>{pageContext.label}</strong>, so I'll bring in the right
                    specialist agents automatically. Ask me anything, or paste an argument to analyze.
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                        m.role === 'user'
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 text-ink-900 dark:bg-white/10 dark:text-white'
                      }`}
                    >
                      {m.streaming && !m.text ? (
                        <div className="flex items-center gap-1 py-0.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/40 dark:bg-white/40 [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/40 dark:bg-white/40" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/40 dark:bg-white/40 [animation-delay:0.2s]" />
                        </div>
                      ) : (
                        <>
                          <Markdownish text={m.text} />
                          {m.stopped && (
                            <p className="mt-1 text-[10px] italic text-ink-900/40 dark:text-white/40">Generation stopped</p>
                          )}
                        </>
                      )}
                      {m.created_at && (
                        <p
                          className={`mt-1 text-[10px] ${
                            m.role === 'user' ? 'text-white/60' : 'text-ink-900/40 dark:text-white/40'
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {m.role === 'assistant' && m.agents_used?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {m.agents_used.map((a) => (
                            <span
                              key={a}
                              className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:text-brand-300"
                            >
                              {AGENT_LABELS[a] || a}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.role === 'assistant' && !m.id?.startsWith('err-') && !m.streaming && (
                        <div className="mt-1.5 flex items-center gap-2 text-ink-900/40 dark:text-white/40">
                          <button onClick={() => copyText(m.text)} title="Copy">
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => setFeedback(m, true)}
                            title="Like"
                            className={m.liked === true ? 'text-verdict-500' : ''}
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => setFeedback(m, false)}
                            title="Dislike"
                            className={m.liked === false ? 'text-alert-500' : ''}
                          >
                            <ThumbsDown size={12} />
                          </button>
                          {m === messages[messages.length - 1] && (
                            <button onClick={regenerate} title="Regenerate">
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-1.5">
                  {[
                    { label: 'Analyze Argument', prompt: 'Please analyze the strength of my argument.' },
                    { label: 'Fallacy Check', prompt: 'Check my last argument for logical fallacies.' },
                    { label: 'Counterarguments', prompt: 'Give me strong counterarguments to consider.' },
                    { label: 'Presentation Tips', prompt: 'How can I improve my presentation delivery?' },
                  ].map((tool) => (
                    <button
                      key={tool.label}
                      onClick={() => send(tool.prompt)}
                      className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-600 hover:bg-brand-500/20 dark:text-brand-300"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              )}

              {messages.length > 0 && messages[messages.length - 1]?.suggested_questions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-1.5">
                  {messages[messages.length - 1].suggested_questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-brand-200 px-2.5 py-1 text-[11px] text-brand-600 hover:bg-brand-50 dark:border-white/15 dark:text-brand-300 dark:hover:bg-white/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2 border-t border-black/5 p-2.5 dark:border-white/10"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-black/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:border-brand-400 dark:border-white/15 dark:text-white"
                />
                <button
                  type="submit"
                  onClick={sending ? (e) => { e.preventDefault(); stopGenerating() } : undefined}
                  disabled={!sending && !input.trim()}
                  title={sending ? 'Stop generating' : 'Send'}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40"
                >
                  {sending ? <Square size={13} fill="currentColor" /> : <Send size={15} />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
