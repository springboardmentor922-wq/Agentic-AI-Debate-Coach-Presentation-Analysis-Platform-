import { useEffect, useState } from 'react'
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function AdminSecurity() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/security/overview').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Lock size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Security & Compliance</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Real, derivable security posture. Note: JWT auth is stateless, so there's no server-side session store to audit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Email-Verified Users" value={data.email_verified_users} tone="verdict" />
        <StatCard icon={ShieldAlert} label="Unverified Users" value={data.unverified_users} tone="alert" />
        <StatCard icon={Lock} label="Deactivated Accounts" value={data.deactivated_users} tone="warm" />
        <StatCard icon={ShieldCheck} label="Administrator Accounts" value={data.administrator_count} tone="cool" />
      </div>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Password Policy</p>
        <p className="text-sm text-ink-900 dark:text-white">{data.password_policy}</p>
      </Card>
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Authentication Mechanism</p>
        <p className="text-sm text-ink-900 dark:text-white">{data.auth_mechanism}</p>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Recent Security-Relevant Actions</p>
        {data.recent_security_relevant_actions.length === 0 ? (
          <p className="text-sm text-ink-900/50 dark:text-white/50">No recent security-relevant admin actions.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recent_security_relevant_actions.map((log) => (
              <li key={log.id} className="rounded-lg bg-black/[0.03] px-3 py-2 text-sm dark:bg-white/5">
                <span className="font-medium text-ink-900 dark:text-white">{log.action.replace(/_/g, ' ')}</span>{' '}
                <span className="text-ink-900/50 dark:text-white/50">by {log.actor_name} · {new Date(log.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
