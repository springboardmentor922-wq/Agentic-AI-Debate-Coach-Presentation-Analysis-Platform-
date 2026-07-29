import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'
import NotificationBell from './NotificationBell'

const ROLE_LABELS = {
  learner: 'Learner',
  debate_coach: 'Debate Coach',
  educator: 'Educator',
  administrator: 'Administrator',
}

export default function TopNav() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-lg dark:border-white/10 dark:bg-ink-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-display text-base font-black tracking-tight text-ink-900 dark:text-white sm:text-lg">
            AI Debate <span className="text-brand-500">Coach</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {user && (
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-white/10 dark:text-brand-200 md:inline-block">
              {ROLE_LABELS[user.role]}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-ink-900 transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <NotificationBell />
              <button onClick={handleLogout} className="btn-secondary !px-2.5 !py-2 text-xs sm:!px-3">
                <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-2.5 !py-2 text-xs sm:!px-4 sm:text-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary !px-2.5 !py-2 text-xs sm:!px-4 sm:text-sm">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
