import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import api from '../api/axios'

const ROLES = [
  { value: 'learner', label: 'Learner' },
  { value: 'debate_coach', label: 'Debate Coach' },
  { value: 'educator', label: 'Educator' },
  { value: 'administrator', label: 'Administrator' },
]

export default function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'debate_coach' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await api.post('/admin/users', form)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create the account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
              <UserPlus size={16} />
            </span>
            Add User
          </h2>
          <button onClick={onClose} className="text-ink-900/40 hover:text-ink-900 dark:text-white/40 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-xs text-ink-900/50 dark:text-white/50">
          Debate Coach, Educator, and Administrator accounts can only be created here by an
          administrator. Each account then signs in only through its own dedicated login portal.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-alert-50 px-4 py-2.5 text-sm text-alert-600 dark:bg-alert-400/10 dark:text-alert-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Full Name</label>
            <input
              required
              className="input-field"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Temporary Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Role</label>
            <select
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
