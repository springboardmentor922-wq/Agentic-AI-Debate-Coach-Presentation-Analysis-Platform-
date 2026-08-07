import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTree,
  Swords,
  Bot,
  BrainCircuit,
  AlertTriangle,
  Presentation,
  BarChart3,
  Sparkles,
  Star,
  GraduationCap,
  NotebookPen,
  MessageSquare,
  Bell,
  Settings as SettingsIcon,
  LifeBuoy,
  Moon,
  Sun,
  LogOut,
  Menu,
  Search,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessagesCount } from '../hooks/useUnreadMessagesCount'

// Grouped exactly like the mentor's Learner Dashboard sidebar reference:
// LEARN / ANALYZE / IMPROVE / RESOURCES / OTHER.
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/learner', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Learn',
    items: [
      { to: '/learner/analysis', label: 'My Debates', icon: ListTree },
      { to: '/learner/sessions', label: 'AI Debate Simulation', icon: Bot },
      { to: '/learner/topics', label: 'Practice Topics', icon: Swords },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { to: '/learner/tools/argument-analyzer', label: 'Argument Analyzer', icon: BrainCircuit },
      { to: '/learner/tools/fallacy-detector', label: 'Fallacy Detector', icon: AlertTriangle },
      { to: '/learner/tools/counterargument-generator', label: 'Counterargument Generator', icon: Swords },
      { to: '/learner/presentation', label: 'Presentation Analysis', icon: Presentation },
      { to: '/learner/reports', label: 'Performance Scores', icon: BarChart3 },
    ],
  },
  {
    label: 'Improve',
    items: [
      { to: '/learner/feedback-coaching', label: 'Feedback & Coaching', icon: Sparkles },
      { to: '/learner/learning', label: 'Recommended For You', icon: Star },
    ],
  },
  {
    label: 'Resources',
    items: [
      { to: '/learner/learning', label: 'Learning Resources', icon: GraduationCap },
      { to: '/learner/notes', label: 'My Notes', icon: NotebookPen },
    ],
  },
  {
    label: 'Other',
    items: [
      { to: '/learner/messages', label: 'Messages', icon: MessageSquare },
      { to: '/learner/notifications', label: 'Notifications', icon: Bell },
      { to: '/learner/settings', label: 'Settings', icon: SettingsIcon },
      { to: '/learner/help', label: 'Help & Support', icon: LifeBuoy },
    ],
  },
]

export default function LearnerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const unreadMessages = useUnreadMessagesCount()
  const navigate = useNavigate()

  const displayName = user?.full_name || 'Account'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'

  const handleLogout = () => {
    logout()
    navigate('/learner/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7fb] dark:bg-ink-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-black/5 bg-white transition-all duration-300 dark:border-white/10 dark:bg-ink-900 ${
          collapsed ? 'w-[76px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-black/5 px-4 dark:border-white/10">
          {collapsed ? (
            <span className="font-display text-lg font-black tracking-tight text-brand-500">AI</span>
          ) : (
            <span className="font-display text-lg font-black tracking-tight text-ink-900 dark:text-white">
              AI Debate <span className="text-brand-500">Coach</span>
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p
                className={`mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-ink-900/30 dark:text-white/30 ${
                  collapsed ? 'text-center' : ''
                }`}
              >
                {collapsed ? '•' : group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-premium'
                            : 'text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'
                        }`
                      }
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {item.to.endsWith('/messages') && unreadMessages > 0 && (
                        <span className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white ${collapsed ? 'absolute right-1 top-1' : ''}`}>
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-black/5 p-3 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main column */}
      <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${collapsed ? 'md:ml-[76px]' : 'md:ml-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur-lg dark:border-white/10 dark:bg-ink-900/80 sm:px-6">
          <button
            className="rounded-lg p-2 text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu size={18} />
          </button>
          <button
            className="hidden rounded-lg p-2 text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10 md:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
            <input className="input-field pl-9" placeholder="Search topics, sessions, reports…" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-ink-900/70 transition hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/learner/notifications')}
              className="relative rounded-full p-2 text-ink-900/70 transition hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <button
              onClick={() => navigate('/learner/profile')}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm font-medium text-ink-900 dark:text-white sm:inline">
                {displayName.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="hidden text-ink-900/40 dark:text-white/40 sm:inline" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
