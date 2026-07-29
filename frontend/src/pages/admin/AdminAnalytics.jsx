import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import Card from '../../components/ui/Card'
import LineChart from '../../components/charts/LineChart'
import BarChart from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const ROLE_COLORS = { learner: '#3FA9F5', debate_coach: '#F5A623', educator: '#22C55E', administrator: '#EF4444' }

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }
  if (!data) return null

  const roleData = Object.entries(data.users_by_role).map(([role, value]) => ({
    label: role.replace('_', ' '),
    value,
    color: ROLE_COLORS[role],
  }))

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">System Analytics</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real aggregations from live platform data — nothing simulated.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">Debate Sessions — Last 7 Days</p>
          <LineChart data={data.sessions_last_7_days.map((d) => ({ label: d.date.slice(5), value: d.count }))} color="#3FA9F5" />
        </Card>
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">New Signups — Last 7 Days</p>
          <BarChart data={data.user_signups_last_7_days.map((d) => ({ label: d.date.slice(5), value: d.count }))} color="#F5A623" />
        </Card>
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">User Role Distribution</p>
          <DonutChart data={roleData} centerLabel="Total Users" centerValue={data.total_users} />
        </Card>
        <Card>
          <p className="mb-4 font-semibold text-ink-900 dark:text-white">Platform Totals</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Total Users', data.total_users],
              ['Debate Sessions', data.total_debate_sessions],
              ['Fallacies Detected', data.total_fallacies_detected],
              ['Reports Generated', data.total_reports_generated],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-black/[0.03] p-3 dark:bg-white/5">
                <p className="font-data text-2xl font-bold text-ink-900 dark:text-white">{value}</p>
                <p className="text-xs text-ink-900/50 dark:text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
