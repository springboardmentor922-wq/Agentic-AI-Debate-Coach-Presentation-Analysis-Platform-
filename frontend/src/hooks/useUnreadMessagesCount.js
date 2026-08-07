import { useEffect, useState } from 'react'
import api from '../api/axios'

// Polls the real unread-count endpoint every 15s so the sidebar "Messages"
// nav item can show an actual badge instead of no indicator at all.
export function useUnreadMessagesCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      api
        .get('/messages/unread-count')
        .then(({ data }) => {
          if (!cancelled) setCount(data.unread_count || 0)
        })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return count
}
