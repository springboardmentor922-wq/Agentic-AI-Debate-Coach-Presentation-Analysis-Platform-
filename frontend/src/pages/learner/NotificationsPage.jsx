import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLine } from '../../components/ui/Skeleton'
import api from '../../api/axios'

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await api.patch(`/notifications/${id}/read`)
  }

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    await api.patch('/notifications/read-all')
  }

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-3xl page-fade">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Debate reminders, feedback alerts, and platform updates will show up here." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <Card
              key={n.id}
              padding="sm"
              onClick={() => !n.read && markRead(n.id)}
              className={`flex cursor-pointer items-start gap-3 ${!n.read ? 'border-l-4 border-brand-500' : 'opacity-70'}`}
            >
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-brand-500' : 'bg-transparent'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-ink-900/60 dark:text-white/60">{n.message}</p>
                <p className="mt-1 text-[11px] text-ink-900/30 dark:text-white/30">{timeAgo(n.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
