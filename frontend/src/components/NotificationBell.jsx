import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const loadUnread = () => {
    if (!user) return
    api
      .get('/notifications/unread-count')
      .then((res) => setUnread(res.data.unread_count))
      .catch(() => {})
  }

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      api
        .get('/notifications', { params: { limit: 15 } })
        .then((res) => setItems(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch {
      /* no-op */
    }
  }

  const markOneRead = async (n) => {
    if (n.read) return
    try {
      await api.patch(`/notifications/${n.id}/read`)
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, read: true } : it)))
      setUnread((u) => Math.max(0, u - 1))
    } catch {
      /* no-op */
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative rounded-full p-2 text-ink-900 transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-black/5 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-ink-900">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-ink-900 dark:text-white">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-2 py-6 text-center text-xs text-ink-900/50 dark:text-white/50">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-ink-900/50 dark:text-white/50">You're all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n)}
                  className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
                    n.read ? 'opacity-60' : 'bg-brand-50/60 dark:bg-white/5'
                  } hover:bg-black/5 dark:hover:bg-white/10`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-900 dark:text-white">{n.title}</span>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <span className="text-xs text-ink-900/60 dark:text-white/60">{n.message}</span>
                  <span className="text-[10px] text-ink-900/35 dark:text-white/35">{timeAgo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
