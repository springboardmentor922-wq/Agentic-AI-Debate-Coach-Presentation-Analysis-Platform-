import { useEffect, useState } from 'react'
import { Users, Search, UserPlus, Ban, CheckCircle2, X, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const ROLE_TONE = { learner: 'brand', debate_coach: 'warm', educator: 'success', administrator: 'danger' }
const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'debate_coach' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { role: roleFilter || undefined, search: search || undefined } })
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search, roleFilter])

  const toggleActive = async (u) => {
    const endpoint = u.is_active ? 'deactivate' : 'activate'
    await api.patch(`/users/${u.id}/${endpoint}`)
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !u.is_active } : x)))
  }

  const createUser = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.post('/admin/users', form)
      setShowCreate(false)
      setForm(EMPTY_FORM)
      load()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not create user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Users size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">User Management</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">{users.length} user(s) shown</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <UserPlus size={16} /> Create Account
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-9"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="debate_coach">Debate Coach</option>
          <option value="educator">Educator</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>

      {showCreate && (
        <Card className="border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">Create Coach / Educator / Admin Account</p>
            <button onClick={() => setShowCreate(false)} aria-label="Close form">
              <X size={18} className="text-ink-900/40 dark:text-white/40" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Full Name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-900/70 dark:text-white/70">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="input-field">
                <option value="debate_coach">Debate Coach</option>
                <option value="educator">Educator</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-alert-500">{error}</p>}
          <div className="mt-4 flex justify-end">
            <Button onClick={createUser} disabled={saving || !form.full_name || !form.email || form.password.length < 6}>
              {saving && <Loader2 size={14} className="animate-spin" />} Create Account
            </Button>
          </div>
        </Card>
      )}

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{u.full_name}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{u.email}</td>
                    <td className="py-2.5">
                      <Badge tone={ROLE_TONE[u.role] || 'neutral'}>{u.role.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Deactivated'}</Badge>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          u.is_active ? 'text-alert-500' : 'text-verdict-600'
                        }`}
                      >
                        {u.is_active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">
                      No users match this search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
