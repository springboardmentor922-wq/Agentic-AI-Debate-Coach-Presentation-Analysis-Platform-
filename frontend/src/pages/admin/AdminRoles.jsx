import { useEffect, useState } from 'react'
import { ShieldCheck, GraduationCap, Users, School, Crown, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const ROLE_META = {
  learner: { label: 'Learner', icon: GraduationCap, toneClass: 'bg-brand-50 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300', desc: 'Practices debates, gets AI feedback, tracks personal progress.' },
  debate_coach: { label: 'Debate Coach', icon: Users, toneClass: 'bg-accent-50 text-accent-600 dark:bg-accent-400/15 dark:text-accent-300', desc: 'Reviews learner debates, gives coaching, tracks skill gaps.' },
  educator: { label: 'Educator', icon: School, toneClass: 'bg-verdict-50 text-verdict-600 dark:bg-verdict-400/15 dark:text-verdict-300', desc: 'Manages classes, assigns topics, reviews class-wide analytics.' },
  administrator: { label: 'Administrator', icon: Crown, toneClass: 'bg-alert-50 text-alert-600 dark:bg-alert-400/15 dark:text-alert-300', desc: 'Full platform access: users, content, system settings, security.' },
}

export default function AdminRoles() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailToChange, setEmailToChange] = useState('')
  const [newRole, setNewRole] = useState('debate_coach')
  const [status, setStatus] = useState(null)
  const [working, setWorking] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/roles/summary').then(({ data }) => setSummary(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const changeRole = async () => {
    if (!emailToChange.trim()) return
    setWorking(true)
    setStatus(null)
    try {
      const { data: users } = await api.get('/admin/users', { params: { search: emailToChange } })
      const match = users.find((u) => u.email.toLowerCase() === emailToChange.trim().toLowerCase())
      if (!match) {
        setStatus({ ok: false, msg: 'No user found with that exact email.' })
        return
      }
      await api.patch(`/admin/users/${match.id}/role`, { role: newRole })
      setStatus({ ok: true, msg: `${match.full_name}'s role updated to ${ROLE_META[newRole].label}.` })
      load()
    } catch (e) {
      setStatus({ ok: false, msg: e?.response?.data?.detail || 'Could not update role.' })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Role & Permissions</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real per-role headcounts and role reassignment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : Object.entries(ROLE_META).map(([role, meta]) => (
              <Card key={role}>
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.toneClass}`}>
                    <meta.icon size={18} />
                  </div>
                  <p className="font-semibold text-ink-900 dark:text-white">{meta.label}</p>
                </div>
                <p className="mt-3 font-data text-3xl font-bold text-ink-900 dark:text-white">{summary?.[role] ?? 0}</p>
                <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{meta.desc}</p>
              </Card>
            ))}
      </div>

      <Card>
        <p className="mb-3 font-semibold text-ink-900 dark:text-white">Change a User's Role</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-ink-900/70 dark:text-white/70">User email</label>
            <input
              value={emailToChange}
              onChange={(e) => setEmailToChange(e.target.value)}
              placeholder="user@example.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-900/70 dark:text-white/70">New role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field">
              {Object.entries(ROLE_META).map(([role, meta]) => (
                <option key={role} value={role}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={changeRole} disabled={working || !emailToChange.trim()}>
            {working ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Update Role
          </Button>
        </div>
        {status && (
          <p className={`mt-3 text-sm font-medium ${status.ok ? 'text-verdict-600' : 'text-alert-500'}`}>{status.msg}</p>
        )}
      </Card>
    </div>
  )
}
