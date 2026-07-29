import { useEffect, useState } from 'react'
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const PLAN_META = {
  free: { label: 'Free', desc: 'Core debate practice and AI feedback.' },
  pro: { label: 'Pro', desc: 'Adds presentation analytics and priority coaching.' },
  enterprise: { label: 'Enterprise', desc: 'For institutions — bulk seats, class analytics, dedicated support.' },
}

export default function AdminBilling() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('pro')
  const [status, setStatus] = useState(null)
  const [working, setWorking] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/plans/summary').then(({ data }) => setSummary(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const assignPlan = async () => {
    if (!email.trim()) return
    setWorking(true)
    setStatus(null)
    try {
      const { data: users } = await api.get('/admin/users', { params: { search: email } })
      const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!match) {
        setStatus({ ok: false, msg: 'No user found with that exact email.' })
        return
      }
      await api.patch(`/admin/users/${match.id}/plan`, { plan })
      setStatus({ ok: true, msg: `${match.full_name} moved to the ${PLAN_META[plan].label} plan.` })
      load()
    } catch (e) {
      setStatus({ ok: false, msg: e?.response?.data?.detail || 'Could not update plan.' })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <CreditCard size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Subscriptions & Billing</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            No payment processor is connected in this build — this shows real plan-tier assignments only, not fabricated revenue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          : Object.entries(PLAN_META).map(([key, meta]) => (
              <Card key={key}>
                <p className="font-semibold text-ink-900 dark:text-white">{meta.label} Plan</p>
                <p className="mt-2 font-data text-3xl font-bold text-brand-500">{summary?.[key] ?? 0}</p>
                <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{meta.desc}</p>
              </Card>
            ))}
      </div>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Assign a Plan</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-ink-900/70 dark:text-white/70">User email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-900/70 dark:text-white/70">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="input-field">
              {Object.entries(PLAN_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={assignPlan} disabled={working || !email.trim()}>
            {working ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Assign Plan
          </Button>
        </div>
        {status && <p className={`mt-3 text-sm font-medium ${status.ok ? 'text-verdict-600' : 'text-alert-500'}`}>{status.msg}</p>}
      </Card>
    </div>
  )
}
