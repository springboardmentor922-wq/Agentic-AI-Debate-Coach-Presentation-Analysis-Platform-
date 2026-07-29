import { useEffect, useState } from 'react'
import { Users, GraduationCap, Award, BookOpen } from 'lucide-react'
import api from '../api/axios'

const CARDS = [
  { key: 'total_users', label: 'Total Users', icon: Users, tone: 'cool' },
  { key: 'total_learners', label: 'Total Learners', icon: GraduationCap, tone: 'warm' },
  { key: 'total_debate_coaches', label: 'Total Debate Coaches', icon: Award, tone: 'verdict' },
  { key: 'total_educators', label: 'Total Educators', icon: BookOpen, tone: 'cool' },
]

const ICON_TONE = {
  cool: 'text-brand-500 dark:text-brand-300',
  warm: 'text-accent-500 dark:text-accent-300',
  verdict: 'text-verdict-500 dark:text-verdict-300',
}

export default function PlatformStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/users/stats/platform').then((res) => setStats(res.data)).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="stat-card" data-tone={tone}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-900/50 dark:text-white/50">
              {label}
            </span>
            <Icon size={16} className={ICON_TONE[tone]} />
          </div>
          <span className="font-data text-2xl font-bold text-ink-900 dark:text-white tabular-nums">
            {stats ? stats[key] : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
