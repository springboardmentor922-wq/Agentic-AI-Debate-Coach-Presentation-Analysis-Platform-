import { Link } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, ShieldCheck } from 'lucide-react'
import MotionIn from '../components/ui/MotionIn'

const PORTALS = [
  { to: '/learner/login', label: 'Learner', desc: 'Practice, get AI feedback, and track your progress', icon: GraduationCap },
  { to: '/coach/login', label: 'Debate Coach', desc: 'Review sessions and guide your learners', icon: Users },
  { to: '/educator/login', label: 'Educator', desc: 'Manage classes and monitor cohort progress', icon: BookOpen },
  { to: '/admin/login', label: 'Administrator', desc: 'Manage the platform and its users', icon: ShieldCheck },
]

// Pure role picker — no credentials are collected here. Each role
// authenticates only through its own dedicated portal below; the backend
// enforces that an account can never sign in through another role's portal.
export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <div className="glass-card page-fade w-full max-w-lg p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="font-display text-lg font-black tracking-tight text-ink-900 dark:text-white">
            AI Debate <span className="text-brand-500">Coach</span>
          </span>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Choose your role to sign in</p>
        </div>

        <div className="flex flex-col gap-3">
          {PORTALS.map((p, i) => (
            <MotionIn key={p.to} delay={i * 0.06}>
              <Link
                to={p.to}
                className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white/60 p-4 transition hover:border-brand-500 hover:shadow-premium dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <p.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{p.label}</p>
                  <p className="text-xs text-ink-900/50 dark:text-white/50">{p.desc}</p>
                </div>
              </Link>
            </MotionIn>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-white/60">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600">
            Create a learner account
          </Link>
        </p>
      </div>
    </div>
  )
}
