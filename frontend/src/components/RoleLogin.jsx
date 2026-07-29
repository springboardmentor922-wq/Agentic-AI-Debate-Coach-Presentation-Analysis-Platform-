import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from './GoogleSignInButton'

/**
 * Shared UI for every role-specific login portal. Each role only ever
 * authenticates through its own route (/learner/login, /coach/login,
 * /educator/login, /admin/login); role matching is enforced by the backend
 * via `expected_role`, so an account can never sign in through the wrong
 * portal even if someone guesses the URL.
 */
export default function RoleLogin({ role, roleLabel, icon: Icon, homePath, registerPath, otherPortals = [] }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password, role)
      navigate(homePath)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <div className="glass-card page-fade w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-premium">
            <Icon size={22} />
          </div>
          <span className="font-display text-lg font-black tracking-tight text-ink-900 dark:text-white">
            AI Debate <span className="text-brand-500">Coach</span>
          </span>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">{roleLabel} Sign In</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Access your {roleLabel.toLowerCase()} dashboard</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
            <input
              type="email"
              required
              placeholder="Email address"
              className="input-field pl-10"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
            <input
              type="password"
              required
              placeholder="Password"
              className="input-field pl-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-ink-900/60 dark:text-white/60">
              <input type="checkbox" className="rounded border-black/20 dark:border-white/20" /> Remember me
            </label>
            <a href="#" className="font-semibold text-brand-500 hover:text-brand-600">
              Forgot password?
            </a>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {role === 'learner' && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                OR
              </span>
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>
            <GoogleSignInButton onError={setError} />
          </>
        )}

        {registerPath && (
          <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-white/60">
            New here?{' '}
            <Link to={registerPath} className="font-semibold text-brand-500 hover:text-brand-600">
              Create an account
            </Link>
          </p>
        )}

        {otherPortals.length > 0 && (
          <p className="mt-6 text-center text-xs text-ink-900/40 dark:text-white/40">
            Not a {roleLabel.toLowerCase()}?{' '}
            <Link to={otherPortals[0].to} className="font-semibold text-brand-500 hover:text-brand-600">
              Choose another role
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
