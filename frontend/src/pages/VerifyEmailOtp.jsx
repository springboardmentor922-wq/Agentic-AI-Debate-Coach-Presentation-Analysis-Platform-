import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyEmailOtp, resendEmailOtp } = useAuth()

  const email = location.state?.email
  const initialExpiryMinutes = location.state?.otpExpiresInMinutes || 5

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(initialExpiryMinutes * 60)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [devOtp, setDevOtp] = useState(location.state?.devOtpCode || '')

  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
      setResendCooldown((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-sm text-ink-900/70 dark:text-white/70">
            We couldn't find a pending verification. Please register again.
          </p>
          <Link to="/register" className="mt-4 inline-block font-semibold text-brand-500 hover:text-brand-600">
            Back to Register
          </Link>
        </div>
      </div>
    )
  }

  const formatTime = (total) => {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }
    setVerifying(true)
    try {
      const user = await verifyEmailOtp(email, otp)
      setSuccess('Email verified! Redirecting…')
      setTimeout(() => {
        navigate(user?.role === 'learner' ? '/learner' : '/login')
      }, 800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please check the code and try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)
    try {
      const data = await resendEmailOtp(email)
      setSuccess('A new code has been sent to your email.')
      setSecondsLeft((data.otp_expires_in_minutes || 5) * 60)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      setDevOtp(data.dev_otp_code || '')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const expired = secondsLeft <= 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <div className="glass-card page-fade w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-premium">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">Verify your email</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Enter the 6-digit code we sent to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}
        {devOtp && (
          <div className="mb-4 rounded-xl bg-brand-50 px-4 py-2.5 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            Dev mode (no email provider configured) — your code is <span className="font-mono font-bold">{devOtp}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            placeholder="6-digit code"
            className="input-field text-center text-lg tracking-[0.5em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />

          <p className="text-center text-xs text-ink-900/50 dark:text-white/50">
            {expired ? 'Code expired.' : `Code expires in ${formatTime(secondsLeft)}`}
          </p>

          <button type="submit" disabled={verifying || expired} className="btn-primary w-full">
            {verifying ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || resendCooldown > 0}
          className="mt-4 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-ink-900/70 transition hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white/70"
        >
          {resending
            ? 'Resending…'
            : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend OTP'}
        </button>

        <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-white/60">
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600">
            Start over
          </Link>
        </p>
      </div>
    </div>
  )
}
