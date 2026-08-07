import { useEffect, useState } from 'react'
import {
  Dumbbell, BookOpen, Bot, HelpCircle, Send, PlayCircle, FileText, ClipboardList,
  ListChecks, Sparkles, Loader2, CheckCircle2, Circle, MessageCircleHeart,
} from 'lucide-react'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const TYPE_ICON = { Article: FileText, Video: PlayCircle, PDF: ClipboardList, 'Debate Example': FileText, 'TED Talk': PlayCircle, Book: BookOpen }
const DIFFICULTY_TONE = { Easy: 'success', Medium: 'warning', Hard: 'danger' }

function LearningPlanPanel() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/learning-plan').then((res) => setPlan(res.data)).catch(() => setPlan(null)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await api.post('/learning-plan/generate')
      setPlan(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate a learning plan yet — complete a debate first.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleTask = async (weekIdx, taskIdx) => {
    if (!plan) return
    const key = `w${weekIdx}-t${taskIdx}`
    const nowCompleted = !plan.progress?.[key]
    setPlan((p) => ({ ...p, progress: { ...p.progress, [key]: nowCompleted } }))
    try {
      await api.patch(`/learning-plan/${plan.id}/progress`, { task_key: key, completed: nowCompleted })
    } catch {
      /* optimistic UI already applied; ignore transient errors */
    }
  }

  return (
    <div className="glass-card p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
          <ListChecks size={18} className="text-brand-500" /> Personalized Learning Plan
        </h2>
        <button onClick={generate} disabled={generating} className="btn-secondary !py-1.5 text-xs">
          {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

      {loading ? (
        <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">Loading…</p>
      ) : !plan ? (
        <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">
          No plan yet — finish a debate session, then generate a 4-week plan built from your real weaknesses.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-900/60 dark:text-white/60">{plan.plan.summary}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plan.plan.weeks.map((w, wi) => (
              <div key={w.week} className="rounded-xl border border-black/5 p-4 dark:border-white/10">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  <Badge tone="brand">Week {w.week}</Badge> {w.focus}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {w.tasks.map((t, ti) => {
                    const key = `w${wi}-t${ti}`
                    const done = !!plan.progress?.[key]
                    return (
                      <li key={ti}>
                        <button
                          onClick={() => toggleTask(wi, ti)}
                          className={`flex w-full items-start gap-2 text-left text-xs ${done ? 'text-ink-900/40 line-through dark:text-white/30' : 'text-ink-900/70 dark:text-white/70'}`}
                        >
                          {done ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" /> : <Circle size={14} className="mt-0.5 shrink-0" />}
                          {t}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CoachingPanel() {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/coaching/latest').then((res) => setFeedback(res.data)).catch(() => setFeedback(null)).finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await api.post('/coaching/generate')
      setFeedback(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate coaching feedback yet — complete a debate first.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
          <MessageCircleHeart size={18} className="text-brand-500" /> AI Coaching
        </h2>
        <button onClick={generate} disabled={generating} className="btn-secondary !py-1.5 text-xs">
          {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Refresh
        </button>
      </div>
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
      {loading ? (
        <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">Loading…</p>
      ) : !feedback ? (
        <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">No coaching feedback yet — it's generated from your real debate history.</p>
      ) : (
        <div className="flex flex-col gap-3 text-xs">
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
            <span className="font-semibold">Priority focus:</span> {feedback.feedback.priority_focus}
          </div>
          {feedback.feedback.observations?.length > 0 && (
            <div>
              <p className="mb-1 font-semibold text-ink-900 dark:text-white">Observations</p>
              <ul className="space-y-1 text-ink-900/70 dark:text-white/70">
                {feedback.feedback.observations.map((o, i) => <li key={i}>— {o}</li>)}
              </ul>
            </div>
          )}
          {feedback.feedback.strengths?.length > 0 && (
            <div>
              <p className="mb-1 font-semibold text-ink-900 dark:text-white">Strengths</p>
              <ul className="space-y-1 text-emerald-700 dark:text-emerald-300">
                {feedback.feedback.strengths.map((s, i) => <li key={i}>— {s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PracticeExercisesPanel() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/practice-exercises').then((res) => setExercises(res.data)).catch(() => setExercises([])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      await api.post('/practice-exercises/generate')
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Complete a debate first — exercises are generated from your real weaknesses.')
    } finally {
      setGenerating(false)
    }
  }

  const complete = async (id) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, completed: true } : e)))
    try {
      await api.post(`/practice-exercises/${id}/complete`)
    } catch { /* optimistic UI already applied */ }
  }

  return (
    <div className="glass-card p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
          <Dumbbell size={18} className="text-brand-500" /> Practice Exercises
        </h2>
        <button onClick={generate} disabled={generating} className="btn-secondary !py-1.5 text-xs">
          {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Generate
        </button>
      </div>
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
      {loading ? (
        <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">Loading…</p>
      ) : exercises.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises yet" description="Generate practice drills built from your real debate weaknesses." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {exercises.map((ex) => (
            <div key={ex.id} className="flex flex-col gap-2 rounded-xl border border-black/5 p-4 dark:border-white/10">
              <Badge tone={DIFFICULTY_TONE[ex.difficulty] || 'neutral'} className="w-fit">{ex.difficulty}</Badge>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{ex.title}</p>
              <p className="text-xs text-ink-900/50 dark:text-white/50">{ex.focus_area}</p>
              <p className="text-xs text-ink-900/60 dark:text-white/60">{ex.instructions}</p>
              <button
                onClick={() => complete(ex.id)}
                disabled={ex.completed}
                className={`mt-auto !py-1.5 text-xs ${ex.completed ? 'btn-secondary opacity-60' : 'btn-primary'}`}
              >
                {ex.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuizzesPanel() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [starting, setStarting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/quizzes').then((res) => setTopics(res.data)).catch(() => setTopics([])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const start = async (topic) => {
    setStarting(topic)
    setResult(null)
    try {
      const res = await api.post(`/quizzes/${encodeURIComponent(topic)}/start`)
      setActiveQuiz(res.data)
      setAnswers({})
    } catch {
      /* topic unavailable right now */
    } finally {
      setStarting(null)
    }
  }

  const submit = async () => {
    if (!activeQuiz) return
    setSubmitting(true)
    try {
      const answerList = activeQuiz.questions.map((_, i) => answers[i] ?? -1)
      const res = await api.post(`/quizzes/attempt/${activeQuiz.id}/submit`, { answers: answerList })
      setResult(res.data.score)
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  if (activeQuiz) {
    return (
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{activeQuiz.topic}</h2>
          <button onClick={() => { setActiveQuiz(null); setResult(null) }} className="btn-secondary !py-1.5 text-xs">Back</button>
        </div>
        {result != null ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-brand-500/30 dark:bg-brand-500/10">
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-300">{result}%</p>
            <p className="text-xs text-ink-900/60 dark:text-white/60">Score recorded to your quiz history.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeQuiz.questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-black/5 p-3.5 dark:border-white/10">
                <p className="mb-2 text-sm font-medium text-ink-900 dark:text-white">{qi + 1}. {q.question}</p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2 text-xs text-ink-900/70 dark:text-white/70">
                      <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers({ ...answers, [qi]: oi })} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submit} disabled={submitting} className="btn-primary w-full text-sm">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Quiz'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
        <HelpCircle size={18} className="text-brand-500" /> Quizzes
      </h2>
      {loading ? (
        <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map((t) => (
            <div key={t.topic} className="rounded-xl border border-black/5 p-3.5 dark:border-white/10">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{t.topic}</p>
                {t.recommended && <Badge tone="brand">Recommended</Badge>}
              </div>
              <p className="text-xs text-ink-900/50 dark:text-white/50">
                {t.attempts > 0 ? `${t.attempts} attempt(s) · last score ${t.last_score}%` : 'Not attempted yet'}
              </p>
              <button onClick={() => start(t.topic)} disabled={starting === t.topic} className="btn-primary mt-2 w-full !py-1.5 text-xs">
                {starting === t.topic ? <Loader2 size={13} className="animate-spin" /> : 'Take Quiz'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LearningMaterialsPanel() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/learning-materials').then((res) => setMaterials(res.data)).catch(() => setMaterials([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="glass-card p-6 lg:col-span-1">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
        <BookOpen size={18} className="text-brand-500" /> Learning Materials
      </h2>
      {loading ? (
        <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">Loading…</p>
      ) : materials.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nothing to recommend yet" description="Complete a debate to get materials matched to your weaknesses." />
      ) : (
        <div className="flex flex-col gap-3">
          {materials.map((m) => {
            const Icon = TYPE_ICON[m.type] || FileText
            return (
              <div key={m.id} className="flex items-start gap-3 rounded-xl border border-black/5 p-3 dark:border-white/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-brand-200">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-ink-900/50 dark:text-white/50">{m.type} · {m.level}</p>
                  {m.reason && <p className="mt-1 text-[11px] text-ink-900/40 dark:text-white/40">{m.reason}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MentorPanel() {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/mentor/history').then((res) => {
      setMessages(res.data.length > 0 ? res.data : [])
    }).catch(() => setMessages([])).finally(() => setLoaded(true))
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!draft.trim() || sending) return
    const question = draft
    setDraft('')
    setMessages((prev) => [...prev, { id: `local_${Date.now()}`, role: 'user', text: question, created_at: '' }])
    setSending(true)
    try {
      const res = await api.post('/mentor/ask', { question })
      setMessages((prev) => [...prev, res.data])
    } catch {
      setMessages((prev) => [...prev, { id: 'err', role: 'mentor', text: "Sorry, I couldn't reach the AI mentor just now — try again in a moment.", created_at: '' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass-card flex flex-col p-6 lg:col-span-1">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
        <Bot size={18} className="text-brand-500" /> AI Mentor
      </h2>
      <div className="mb-3 flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
        {loaded && messages.length === 0 && (
          <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm bg-black/5 px-3.5 py-2 text-xs text-ink-900 dark:bg-white/10 dark:text-white">
            Hi {firstName}! Ask me anything about debate technique, fallacies, or how to structure a rebuttal — I'll answer using your real debate history.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id || i}
            className={`max-w-[90%] rounded-2xl px-3.5 py-2 text-xs ${
              m.role === 'user'
                ? 'ml-auto rounded-tr-sm bg-brand-500 text-white'
                : 'mr-auto rounded-tl-sm bg-black/5 text-ink-900 dark:bg-white/10 dark:text-white'
            }`}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div className="mr-auto flex items-center gap-1 rounded-2xl rounded-tl-sm bg-black/5 px-3.5 py-2 text-xs text-ink-900/50 dark:bg-white/10 dark:text-white/50">
            <Loader2 size={12} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} className="mt-auto flex gap-2">
        <input
          className="input-field !py-2 text-sm"
          placeholder="Ask your mentor…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn-primary !px-3">
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

function RecommendedPanel() {
  const [recommended, setRecommended] = useState([])
  useEffect(() => {
    api.get('/recommendations').then((res) => setRecommended(res.data.items || [])).catch(() => setRecommended([]))
  }, [])

  return (
    <div className="glass-card p-6 lg:col-span-1">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Recommended For You</h2>
      <div className="flex flex-col gap-3">
        {recommended.length === 0 ? (
          <p className="text-xs text-ink-900/50 dark:text-white/50">Complete a debate to unlock personalized recommendations.</p>
        ) : (
          recommended.map((r) => (
            <div key={r.id} className="rounded-xl border border-black/5 p-3 dark:border-white/10">
              <p className="text-sm font-medium text-ink-900 dark:text-white">{r.title}</p>
              <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">{r.detail}</p>
              <Badge tone="neutral" className="mt-1.5">{r.tag}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Learning() {
  return (
    <div className="page-fade flex flex-col gap-6">
      <div>
        <Breadcrumbs items={[{ label: 'Learning' }]} />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Learning Hub</h1>
        <p className="text-sm text-ink-900/60 dark:text-white/60">Your personalized plan, coaching, exercises, and AI mentor — all generated from your real debate history.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LearningPlanPanel />
        <CoachingPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PracticeExercisesPanel />
        <QuizzesPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LearningMaterialsPanel />
        <RecommendedPanel />
        <MentorPanel />
      </div>
    </div>
  )
}
