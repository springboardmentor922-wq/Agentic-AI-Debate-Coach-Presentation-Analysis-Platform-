import { useEffect, useState } from 'react'
import { Users, UserPlus, X, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function CoachLearners() {
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [allLearners, setAllLearners] = useState([])
  const [selected, setSelected] = useState('')
  const [assigning, setAssigning] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/coach/assigned-learners').then(({ data }) => setLearners(data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAssign = async () => {
    setShowAssign(true)
    const { data } = await api.get('/users/learners')
    setAllLearners(data)
  }

  const assign = async () => {
    if (!selected) return
    setAssigning(true)
    try {
      await api.post('/coach/assigned-learners', { learner_id: selected })
      setShowAssign(false)
      setSelected('')
      load()
    } finally {
      setAssigning(false)
    }
  }

  const unassignedLearners = allLearners.filter((u) => !learners.some((l) => l.learner_id === u.id))

  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Users size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Learners</h1>
            <p className="text-sm text-ink-900/60 dark:text-white/60">{learners.length} learner(s) in your roster</p>
          </div>
        </div>
        <Button onClick={openAssign} size="sm">
          <UserPlus size={16} /> Assign Learner
        </Button>
      </div>

      {showAssign && (
        <Card className="border border-brand-500/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">Assign a Learner to Your Roster</p>
            <button onClick={() => setShowAssign(false)} aria-label="Close form"><X size={18} className="text-ink-900/40 dark:text-white/40" /></button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input-field flex-1">
              <option value="">Select a learner...</option>
              {unassignedLearners.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
            <Button onClick={assign} disabled={assigning || !selected}>
              {assigning && <Loader2 size={14} className="animate-spin" />} Assign
            </Button>
          </div>
        </Card>
      )}

      <Card padding="sm">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : learners.length === 0 ? (
          <EmptyState icon={Users} title="No learners assigned yet" description="Assign learners to your roster to start coaching them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-900/40 dark:border-white/10 dark:text-white/40">
                  <th className="py-2 pl-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Sessions</th>
                  <th className="py-2">Avg Score</th>
                  <th className="py-2 pr-2">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((l) => (
                  <tr key={l.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                    <td className="py-2.5 pl-2 font-medium text-ink-900 dark:text-white">{l.learner_name}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{l.learner_email}</td>
                    <td className="py-2.5 text-ink-900/60 dark:text-white/60">{l.sessions_completed}</td>
                    <td className="py-2.5 font-data text-ink-900 dark:text-white">{l.average_score ?? '—'}</td>
                    <td className="py-2.5 pr-2 text-ink-900/50 dark:text-white/50">
                      {l.last_activity_at ? new Date(l.last_activity_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
