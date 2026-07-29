import { useEffect, useState } from 'react'
import { Users, Swords, TrendingUp, AlertTriangle, FileBarChart2 } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import LineChart from '../../components/charts/LineChart'
import DonutChart from '../../components/charts/DonutChart'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

const ROLE_COLORS = { learner: '#3FA9F5', debate_coach: '#F5A623', educator: '#22C55E', administrator: '#EF4444' }
const ROLE_LABELS = { learner: 'Learners', debate_coach: 'Debate Coaches', educator: 'Educators', administrator: 'Admins' }

export default function AdminDashboardHome() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!data) return null

  const roleData = Object.entries(data.users_by_role).map(([role, value]) => ({
    label: ROLE_LABELS[role] || role,
    value,
    color: ROLE_COLORS[role],
  }))

  return (
    <div className="page-fade flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Real-time overview of platform operations and performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={data.total_users} tone="cool" />
        <StatCard icon={Swords} label="Debate Sessions" value={data.total_debate_sessions} tone="warm" />
        <StatCard icon={AlertTriangle} label="Fallacies Detected" value={data.total_fallacies_detected} tone="alert" />
        <StatCard icon={FileBarChart2} label="Reports Generated" value={data.total_reports_generated} tone="verdict" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" />
            <p className="font-semibold text-ink-900 dark:text-white">Debate Sessions — Last 7 Days</p>
          </div>
          <LineChart
            data={data.sessions_last_7_days.map((d) => ({ label: d.date.slice(5), value: d.count }))}
            color="#3FA9F5"
          />
        </Card>
        <Card>
          <p className="mb-3 font-semibold text-ink-900 dark:text-white">User Role Distribution</p>
          <DonutChart data={roleData} centerLabel="Total Users" centerValue={data.total_users} />
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-accent-500" />
          <p className="font-semibold text-ink-900 dark:text-white">New Signups — Last 7 Days</p>
        </div>
        <LineChart
          data={data.user_signups_last_7_days.map((d) => ({ label: d.date.slice(5), value: d.count }))}
          color="#F5A623"
        />
      </Card>
    </div>
  )
}
