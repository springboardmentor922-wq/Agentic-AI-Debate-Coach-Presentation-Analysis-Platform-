import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Target,
  Clock,
  ShieldCheck,
  Sparkles,
  Swords,
  BrainCircuit,
  Presentation,
  CalendarClock,
  ArrowRight,
  Activity,
} from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import DashboardHero from '../../components/ui/DashboardHero'
import LineChart from '../../components/charts/LineChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const QUICK_ACTIONS = [
  { label: 'Start a Debate', to: '/learner/sessions', icon: Swords, tone: 'bg-brand-400' },
  { label: 'View AI Analysis', to: '/learner/analysis', icon: BrainCircuit, tone: 'bg-verdict-400' },
  { label: 'Presentation Check', to: '/learner/presentation', icon: Presentation, tone: 'bg-accent-400' },
  { label: 'Browse Topics', to: '/learner/topics', icon: Target, tone: 'bg-alert-400' },
]

const FORMAT_LABELS = {
  one_on_one: 'One-on-One',
  parliamentary: 'Parliamentary',
  oxford: 'Oxford',
  policy: 'Policy',
  public_forum: 'Public Forum',
  ai_simulation: 'AI Simulation',
  popularity: 'Popularity Debate',
  group_debate: 'Group Debate',
}

function formatSessionDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [leaderboard, setLeaderboard] = useState({ leaderboard: [], my_rank: null })
  const [recentActivity, setRecentActivity] = useState([])
  const firstName = user?.full_name?.split(' ')[0] || 'there'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [summaryRes, recsRes, upcomingRes, leaderboardRes, activityRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/recommendations'),
          api.get('/debate/sessions/upcoming'),
          api.get('/dashboard/leaderboard'),
          api.get('/dashboard/recent-activity'),
        ])
        if (cancelled) return
        setSummary(summaryRes.data)
        setRecommendations(recsRes.data.items)
        setUpcoming(upcomingRes.data)
        setLeaderboard(leaderboardRes.data)
        setRecentActivity(activityRes.data.items)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Could not load your dashboard right now.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page-fade flex flex-col gap-6">
      <DashboardHero
        eyebrow="Learner"
        icon={Sparkles}
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here's how your debate skills are progressing this week."
      />

      {error && (
        <div className="glass-card border border-rose-200 p-4 text-sm text-rose-600 dark:border-rose-500/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Performance summary */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            tone="verdict" icon={Trophy} label="Overall Score"
            value={summary?.sessions_completed ? summary.overall_score : 'Not enough data yet'}
            delta={summary?.sessions_completed ? summary.score_delta : undefined}
          />
          <StatCard tone="cool" icon={Swords} label="Sessions Completed" value={summary?.sessions_completed ?? 0} delta={summary?.sessions_delta} />
          <StatCard
            tone="warm" icon={Clock} label="Avg. Debate Duration"
            value={summary?.avg_debate_duration || 'Not enough data yet'}
          />
          <StatCard
            tone="cool" icon={ShieldCheck} label="Fallacies Avoided"
            value={summary?.fallacies_avoided_pct != null ? `${summary.fallacies_avoided_pct}%` : 'Not enough data yet'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly trend chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
              <Activity size={18} className="text-brand-400" /> Weekly Performance Trend
            </h2>
          </div>
          {!loading && summary && summary.weekly_trend.every((d) => d.value === 0) ? (
            <EmptyState icon={Activity} title="No sessions scored yet" description="Complete a debate and generate a feedback report to see your trend here." />
          ) : (
            <LineChart data={summary?.weekly_trend || []} height={220} />
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-start gap-2 rounded-xl border border-black/5 p-3.5 transition hover:-translate-y-0.5 hover:shadow-glass dark:border-white/10"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.tone} text-white`}>
                  <a.icon size={16} />
                </div>
                <span className="text-xs font-semibold text-ink-900 dark:text-white">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* AI Recommendations */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <Sparkles size={18} className="text-accent-400" /> AI Recommendations
          </h2>
          {!loading && recommendations.length === 0 ? (
            <EmptyState icon={Sparkles} title="No recommendations yet" description="Complete a debate to get personalized recommendations based on your actual performance." />
          ) : (
            <div className="flex flex-col gap-3">
              {recommendations.map((r) => (
                <div key={r.id} className="rounded-xl border border-l-[3px] border-black/5 border-l-accent-400 p-3.5 dark:border-white/10 dark:border-l-accent-400">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{r.title}</p>
                    <Badge tone="brand">{r.tag}</Badge>
                  </div>
                  <p className="text-xs text-ink-900/60 dark:text-white/60">{r.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming sessions (learner-created only) */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <CalendarClock size={18} className="text-brand-400" /> Upcoming Sessions
          </h2>
          {!loading && upcoming.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled" description="Schedule a debate session from the Sessions page." />
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.slice(0, 5).map((s) => (
                <div key={s.id} className="rounded-xl border border-black/5 p-3.5 dark:border-white/10">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white line-clamp-2">{s.topic}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-900/50 dark:text-white/50">
                    <Badge tone="neutral">{FORMAT_LABELS[s.debate_format] || s.debate_format}</Badge>
                    <span>{formatSessionDate(s.scheduled_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/learner/sessions" className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-500">
            View all sessions <ArrowRight size={13} />
          </Link>
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <Trophy size={18} className="text-verdict-400" /> Leaderboard
          </h2>
          {!loading && leaderboard.leaderboard.length === 0 ? (
            <EmptyState icon={Trophy} title="No ranked learners yet" description="Scores appear once learners complete debates and generate feedback reports." />
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.leaderboard.map((l) => (
                <div
                  key={l.user_id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${l.is_me ? 'bg-brand-50 dark:bg-brand-400/10' : ''}`}
                >
                  <span className="w-5 text-sm font-bold text-ink-900/50 dark:text-white/50">#{l.rank}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-400 text-xs font-bold text-white">
                    {l.avatar}
                  </div>
                  <span className={`flex-1 text-sm ${l.is_me ? 'font-semibold text-ink-900 dark:text-white' : 'text-ink-900/70 dark:text-white/70'}`}>
                    {l.name} {l.is_me && '(You)'}
                  </span>
                  <span className="font-data text-sm font-semibold text-ink-900 dark:text-white">{l.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Recent Activity</h2>
        {!loading && recentActivity.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" description="Your completed debates and generated reports will show up here." />
        ) : (
          <div className="flex flex-col">
            {recentActivity.map((a, i) => (
              <div key={a.id} className={`flex items-center gap-4 py-3 ${i !== recentActivity.length - 1 ? 'border-b border-black/5 dark:border-white/10' : ''}`}>
                <div className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-accent-400" />
                <p className="flex-1 text-sm text-ink-900/80 dark:text-white/80">{a.text}</p>
                {a.score != null && <Badge tone="success">{a.score}/100</Badge>}
                <span className="text-xs text-ink-900/40 dark:text-white/40">{timeAgo(a.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
