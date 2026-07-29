import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = form.confirm_password.length > 0 && form.password === form.confirm_password
  const passwordsMismatch = form.confirm_password.length > 0 && form.password !== form.confirm_password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // Registration always creates a Learner account. Debate Coach, Educator,
      // and Administrator accounts are provisioned separately and sign in
      // through their own dedicated portals — role is never chosen here.
      // The account starts unverified: the backend emails a 6-digit OTP and
      // the user must confirm it before they can log in.
      const data = await register({ ...form, role: 'learner' })
      navigate('/verify-email', {
        state: {
          email: data.email,
          otpExpiresInMinutes: data.otp_expires_in_minutes,
          devOtpCode: data.dev_otp_code,
        },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 py-10 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <div className="glass-card page-fade w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="font-display text-2xl font-black tracking-tight text-ink-900 dark:text-white">
            AI Debate <span className="text-brand-500">Coach</span>
          </span>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Join as a learner and start your debate journey</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
            <input
              required
              placeholder="Full name"
              className="input-field pl-10"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
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
              minLength={6}
              placeholder="Password (min 6 characters)"
              className="input-field pl-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm password"
              className={`input-field pl-10 pr-10 ${passwordsMismatch ? '!border-red-400' : passwordsMatch ? '!border-emerald-400' : ''}`}
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />
            {passwordsMatch && (
              <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
            )}
            {passwordsMismatch && (
              <XCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
            )}
          </div>
          {passwordsMismatch && (
            <p className="-mt-2 text-xs font-medium text-red-500">Passwords do not match.</p>
          )}

          <button type="submit" disabled={loading || passwordsMismatch} className="btn-primary mt-2 w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-wide text-ink-900/40 dark:text-white/40">OR</span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>
        <GoogleSignInButton onError={setError} />

        <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-white/60">
          Already have an account?{' '}
          <Link to="/learner/login" className="font-semibold text-brand-500 hover:text-brand-600">
            Sign in
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-ink-900/40 dark:text-white/40">
          Debate Coach, Educator, or Administrator?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600">
            Go to role sign-in
          </Link>
        </p>
      </div>
    </div>
  )
}
