import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  Swords,
  Cpu,
  FolderKanban,
  FileBarChart2,
  BellRing,
  MessageSquare,
  Settings as SettingsIcon,
  Lock,
  Plug,
  DatabaseBackup,
  LifeBuoy,
  Moon,
  Sun,
  LogOut,
  Menu,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessagesCount } from '../hooks/useUnreadMessagesCount'

const NAV_GROUPS = [
  { label: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    label: 'Platform',
    items: [
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/roles', label: 'Role & Permissions', icon: ShieldCheck },
      { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
      { to: '/admin/debate-sessions', label: 'Debate Sessions', icon: Swords },
      { to: '/admin/ai-services', label: 'AI Models & Services', icon: Cpu },
      { to: '/admin/content', label: 'Content Management', icon: FolderKanban },
      { to: '/admin/reports', label: 'Reports & Logs', icon: FileBarChart2 },
      { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
      { to: '/admin/notification-center', label: 'Notification Center', icon: BellRing },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'System Settings', icon: SettingsIcon },
      { to: '/admin/security', label: 'Security & Compliance', icon: Lock },
      { to: '/admin/integrations', label: 'Integrations', icon: Plug },
      { to: '/admin/backup', label: 'Backup & Recovery', icon: DatabaseBackup },
    ],
  },
  {
    label: 'Other',
    items: [
      { to: '/admin/help', label: 'Help & Support', icon: LifeBuoy },
    ],
  },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const unreadMessages = useUnreadMessagesCount()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-ink-50/40 dark:bg-ink-950">
      <aside
        className={`fixed z-40 flex h-screen flex-col border-r border-black/5 bg-ink-950 text-white transition-all dark:border-white/5 lg:sticky lg:top-0 ${
          collapsed ? 'w-[76px]' : 'w-64'
        } ${mobileOpen ? 'left-0' : '-left-64 lg:left-0'}`}
      >
        <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 font-display font-bold">
            AI
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold">Debate Coach</p>
              <p className="truncate text-[11px] text-white/40">Admin Console</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className={`mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 ${collapsed ? 'text-center' : ''}`}>
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
                          isActive ? 'bg-brand-500 text-white shadow-premium' : 'text-white/60 hover:bg-white/10'
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

        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/5 dark:bg-ink-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => (window.innerWidth < 1024 ? setMobileOpen((o) => !o) : setCollapsed((c) => !c))}
              className="rounded-lg p-2 text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <Menu size={18} />
            </button>
            <h2 className="hidden font-display text-lg font-bold text-ink-900 dark:text-white sm:block">
              Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-ink-900/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/admin/notification-center')}
              className="relative rounded-full p-2 text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <BellRing size={18} />
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="hidden rounded-full p-2 text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10 sm:block"
            >
              <SettingsIcon size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-black/5 py-1 pl-1 pr-3 dark:border-white/10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-ink-900 dark:text-white">{user?.full_name}</p>
                <p className="text-[10px] leading-tight text-ink-900/40 dark:text-white/40">Administrator</p>
              </div>
              <ChevronDown size={14} className="text-ink-900/30 dark:text-white/30" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
