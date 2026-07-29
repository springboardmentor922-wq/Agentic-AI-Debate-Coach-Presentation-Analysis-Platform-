import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-center dark:bg-ink-950">
      <ShieldAlert size={40} className="text-brand-500" />
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Access Denied</h1>
      <p className="text-sm text-ink-900/60 dark:text-white/60">
        You don't have permission to view this page.
      </p>
      <Link to="/login" className="btn-primary mt-2">
        Back to Login
      </Link>
    </div>
  )
}
