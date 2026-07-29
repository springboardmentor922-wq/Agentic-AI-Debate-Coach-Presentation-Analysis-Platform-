import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsIcon, Moon, Sun, KeyRound, LogOut, UserCircle2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function EducatorSettings() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const sendResetEmail = async () => {
    if (!user?.email) return
    setSending(true)
    try {
      await api.post('/auth/password/forgot', { email: user.email })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/educator/login')
  }

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <SettingsIcon size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Settings</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Manage your account, appearance, and security.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Account</p>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <UserCircle2 size={24} />
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">{user?.full_name}</p>
              <p className="text-sm text-ink-900/50 dark:text-white/50">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Appearance</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Theme</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">Switch between light and dark mode</p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Security</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Password</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">
                {sent ? 'Check your email for a reset link.' : 'Send a secure reset link to your email.'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={sendResetEmail} disabled={sending || sent}>
              {sent ? <CheckCircle2 size={14} /> : <KeyRound size={14} />}
              {sent ? 'Sent' : 'Reset Password'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Log out</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">Sign out of your account on this device.</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> Log Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
