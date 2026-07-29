import { useEffect, useState } from 'react'
import { Target, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import LineChart from '../../components/charts/LineChart'
import api from '../../api/axios'

const LABELS = {
  argument_quality: 'Argument Quality',
  evidence_usage: 'Evidence Usage',
  logical_consistency: 'Logical Consistency',
  rebuttal_effectiveness: 'Rebuttal Effectiveness',
  communication_skills: 'Communication Skills',
}

export default function CoachSkillGap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roster, setRoster] = useState([])
  const [learnerId, setLearnerId] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    api.get('/coach/assigned-learners').then(({ data }) => setRoster(data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (learnerId) params.learner_id = learnerId
    if (department) params.department = department
    api.get('/coach/skill-gap', { params }).then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [learnerId, department])

  const dims = Object.entries(data?.averages || {})
  const departments = [...new Set(roster.map((l) => l.department).filter(Boolean))]

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Target size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Skill Gap Analysis</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Real scores across your roster — filter by learner or department, see trends over time.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={learnerId} onChange={(e) => { setLearnerId(e.target.value); setDepartment('') }} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-ink-800">
          <option value="">All learners</option>
          {roster.map((l) => (
            <option key={l.learner_id} value={l.learner_id}>{l.learner_name}</option>
          ))}
        </select>
        {departments.length > 0 && (
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setLearnerId('') }} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-ink-800">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <SkeletonCard />
      ) : dims.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">
            No scored debates match this filter yet — skill gap data will appear once matching learners complete debates.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
              Current Averages ({data.sample_size} report{data.sample_size !== 1 ? 's' : ''} across {data.learner_count} learner{data.learner_count !== 1 ? 's' : ''})
            </p>
            <div className="flex flex-col gap-4">
              {dims.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-900 dark:text-white">{LABELS[key] || key}</span>
                    <div className="flex items-center gap-2">
                      {data.improvement_percent?.[key] !== undefined && data.improvement_percent[key] !== 0 && (
                        <Badge tone={data.improvement_percent[key] > 0 ? 'success' : 'danger'}>
                          {data.improvement_percent[key] > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {Math.abs(data.improvement_percent[key])}%
                        </Badge>
                      )}
                      <span className="font-data font-bold text-brand-500">{value}%</span>
                    </div>
                  </div>
                  <ProgressBar value={value} size="sm" showValue={false} />
                </div>
              ))}
            </div>
          </Card>

          {data.trend?.length > 1 && (
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Historical Trend (overall average)</p>
              <LineChart data={data.trend} color="#3FA9F5" height={160} />
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-verdict-600">Strengths</p>
              <div className="flex flex-col gap-2">
                {data.strengths.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-ink-900 dark:text-white">{s.dimension}</span>
                    <span className="font-data font-bold text-verdict-500">{s.score}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alert-500">Weaknesses</p>
              <div className="flex flex-col gap-2">
                {data.weaknesses.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-ink-900 dark:text-white">{s.dimension}</span>
                    <span className="font-data font-bold text-alert-500">{s.score}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {data.recommendations?.length > 0 && (
            <Card>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                <Lightbulb size={13} /> Recommendations
              </p>
              <div className="flex flex-col gap-2">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="rounded-lg bg-black/[0.03] px-3 py-2 dark:bg-white/5">
                    <p className="text-sm font-medium text-ink-900 dark:text-white">{r.title}</p>
                    <p className="text-xs text-ink-900/50 dark:text-white/50">{r.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
