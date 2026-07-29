import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, Loader2, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { SkeletonCard } from '../../components/ui/Skeleton'
import api from '../../api/axios'

export default function AdminSettings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setForm(data)).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const { data } = await api.put('/admin/settings', {
        site_name: form.site_name,
        support_email: form.support_email,
        maintenance_mode: form.maintenance_mode,
        allow_public_registration: form.allow_public_registration,
      })
      setForm(data)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <SkeletonCard />

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <SettingsIcon size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">System Settings</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Real, persisted platform configuration — every change here takes effect immediately.</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Site Name" value={form.site_name} onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))} />
          <Input label="Support Email" value={form.support_email} onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))} />

          <div className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-3 dark:bg-white/5">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Maintenance Mode</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">Shows a maintenance notice instead of the app to non-admins.</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, maintenance_mode: !f.maintenance_mode }))}
              className={`relative h-6 w-11 rounded-full transition ${form.maintenance_mode ? 'bg-alert-500' : 'bg-black/10 dark:bg-white/20'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${form.maintenance_mode ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-3 dark:bg-white/5">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Allow Public Registration</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">New learners can self-register from the public site.</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, allow_public_registration: !f.allow_public_registration }))}
              className={`relative h-6 w-11 rounded-full transition ${form.allow_public_registration ? 'bg-verdict-500' : 'bg-black/10 dark:bg-white/20'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${form.allow_public_registration ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-900/40 dark:text-white/40">Last updated {new Date(form.updated_at).toLocaleString()}</p>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {saved ? 'Saved' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
