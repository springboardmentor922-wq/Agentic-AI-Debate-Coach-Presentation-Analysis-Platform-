import { useEffect, useState } from 'react'
import { User, GraduationCap, Heart, Sliders, Settings as SettingsIcon, Lock, Camera } from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const TABS = [
  { key: 'personal', label: 'Personal Information', icon: User },
  { key: 'academic', label: 'Academic Information', icon: GraduationCap },
  { key: 'interests', label: 'Debate Interests', icon: Heart },
  { key: 'skills', label: 'Skills', icon: Sliders },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
  { key: 'password', label: 'Change Password', icon: Lock },
]

const INTEREST_OPTIONS = ['Oxford', 'AI Simulation', 'Popularity Debate', 'One-on-One', 'Group Debate', 'Public Forum', 'Parliamentary', 'Policy Debate']

export default function Profile() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState('personal')
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || '',
        institution: user.institution || '',
        department: user.department || '',
        year: user.year || '',
        phone_number: user.phone_number || '',
        preferred_debate_topics: user.preferred_debate_topics || [],
      })
    }
  }, [user])

  if (!user || !form) {
    return (
      <div className="page-fade flex flex-col gap-6">
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-96" />
      </div>
    )
  }

  const initials = (user.full_name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')

  const persistProfile = async (payload) => {
    const res = await api.put('/users/me', payload)
    setUser?.(res.data)
    localStorage.setItem('user', JSON.stringify(res.data))
    return res.data
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      await persistProfile({
        full_name: form.full_name,
        bio: form.bio,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = async (interest) => {
    const next = form.preferred_debate_topics.includes(interest)
      ? form.preferred_debate_topics.filter((i) => i !== interest)
      : [...form.preferred_debate_topics, interest]
    setForm({ ...form, preferred_debate_topics: next })
    try {
      await persistProfile({ preferred_debate_topics: next })
    } catch {
      // revert on failure
      setForm((f) => ({ ...f, preferred_debate_topics: form.preferred_debate_topics }))
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPwError('')
    if (!pwForm.current || !pwForm.next) return setPwError('All fields are required.')
    if (pwForm.next.length < 8) return setPwError('New password must be at least 8 characters.')
    if (pwForm.next !== pwForm.confirm) return setPwError('Passwords do not match.')
    setPwSaved(true)
    setPwForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwSaved(false), 2500)
  }

  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'Profile' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">My Profile</h1>
      </div>

      <div className="glass-card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="relative">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white">
              {initials}
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-ink-900 text-white dark:border-ink-900 dark:bg-white dark:text-ink-900">
            <Camera size={13} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{user.full_name}</h2>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            {[user.institution, user.year].filter(Boolean).join(' · ') || 'Add your institution and year in Academic Information'}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {(user.preferred_debate_topics || []).length > 0 ? (
              user.preferred_debate_topics.map((i) => (
                <Badge key={i} tone="brand">{i}</Badge>
              ))
            ) : (
              <span className="text-xs text-ink-900/40 dark:text-white/40">No debate interests selected yet</span>
            )}
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-xs text-ink-900/40 dark:text-white/40">Member since</p>
          <p className="text-sm font-semibold text-ink-900 dark:text-white">
            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tabs sidebar */}
        <div className="flex gap-2 overflow-x-auto lg:w-64 lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-brand-500 text-white shadow-premium'
                  : 'bg-white text-ink-900/60 hover:bg-black/5 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              <t.icon size={16} />
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass-card flex-1 p-6">
          {tab === 'personal' && (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <h3 className="font-display font-semibold text-ink-900 dark:text-white">Personal Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Full Name</label>
                  <input className="input-field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Email Address</label>
                  <input type="email" disabled className="input-field opacity-60" value={form.email} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Phone Number</label>
                  <input className="input-field" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Not set" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">Bio</label>
                <textarea rows={3} className="input-field resize-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell others about yourself" />
              </div>
              {saveError && <p className="text-xs font-medium text-red-500">{saveError}</p>}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
                {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Saved successfully.</span>}
              </div>
            </form>
          )}

          {tab === 'academic' && (
            <AcademicTab form={form} setForm={setForm} persistProfile={persistProfile} />
          )}

          {tab === 'interests' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-semibold text-ink-900 dark:text-white">Debate Interests</h3>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      form.preferred_debate_topics.includes(i)
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-200'
                        : 'border-black/10 text-ink-900/60 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-900/40 dark:text-white/40">Changes save automatically.</p>
            </div>
          )}

          {tab === 'skills' && (
            <div className="flex flex-col gap-5">
              <h3 className="font-display font-semibold text-ink-900 dark:text-white">Skill Levels</h3>
              {(user.skills || []).length > 0 ? (
                user.skills.map((s) => (
                  <ProgressBar key={s.name} label={s.name} value={s.level} tone={s.level > 75 ? 'success' : s.level > 50 ? 'brand' : 'warning'} />
                ))
              ) : (
                <p className="text-sm text-ink-900/50 dark:text-white/50">
                  Skill levels are calculated automatically from your debate sessions and AI analysis. Complete a debate to see your skills here.
                </p>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-semibold text-ink-900 dark:text-white">Preferences</h3>
              {[
                { label: 'Email notifications for new AI feedback', defaultChecked: true },
                { label: 'Weekly progress summary email', defaultChecked: true },
                { label: 'Leaderboard visibility to peers', defaultChecked: false },
                { label: 'Allow coaches to review my sessions', defaultChecked: true },
              ].map((s) => (
                <label key={s.label} className="flex items-center justify-between rounded-xl border border-black/5 px-4 py-3 dark:border-white/10">
                  <span className="text-sm text-ink-900/80 dark:text-white/80">{s.label}</span>
                  <input type="checkbox" defaultChecked={s.defaultChecked} className="h-5 w-9 appearance-none rounded-full bg-black/10 outline-none transition checked:bg-brand-500 dark:bg-white/10" />
                </label>
              ))}
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <h3 className="font-display font-semibold text-ink-900 dark:text-white">Change Password</h3>
              {pwError && (
                <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{pwError}</div>
              )}
              {pwSaved && (
                <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Password updated successfully.
                </div>
              )}
              <input
                type="password"
                placeholder="Current password"
                className="input-field max-w-sm"
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              />
              <input
                type="password"
                placeholder="New password"
                className="input-field max-w-sm"
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="input-field max-w-sm"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
              <button type="submit" className="btn-primary w-fit">Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function AcademicTab({ form, setForm, persistProfile }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await persistProfile({
        institution: form.institution,
        department: form.department,
        year: form.year,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <h3 className="font-display font-semibold text-ink-900 dark:text-white">Academic Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EditableField label="Institution" value={form.institution} onChange={(v) => setForm({ ...form, institution: v })} />
        <EditableField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
        <EditableField label="Year / Grade" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary w-fit">{saving ? 'Saving…' : 'Save Academic Info'}</button>
        {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Saved successfully.</span>}
      </div>
    </form>
  )
}

function EditableField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">{label}</label>
      <input className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Not set" />
    </div>
  )
}
