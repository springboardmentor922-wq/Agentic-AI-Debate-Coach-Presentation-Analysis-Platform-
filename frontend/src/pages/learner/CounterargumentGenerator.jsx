import { useState } from 'react'
import { Swords, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'

const SECTIONS = [
  ['counterarguments', 'Direct Rebuttals'],
  ['alternative_perspectives', 'Alternative Perspectives'],
  ['opponent_questions', 'Questions an Opponent May Ask'],
  ['missing_evidence', 'Evidence You Should Add'],
  ['weak_claims', 'Weak Claims to Reinforce'],
  ['improvement_suggestions', 'Improvement Suggestions'],
]

export default function CounterargumentGenerator() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const generate = async () => {
    if (text.trim().length < 3) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/analysis/counterargument', { text })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not generate counterarguments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500">
          <Swords size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Counterargument Generator</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Paste your argument to get rebuttals, alternative perspectives, and likely opponent questions —
            so you can strengthen it before your next debate.
          </p>
        </div>
      </div>

      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste the argument you want to stress-test..."
          className="input-field resize-none"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-ink-900/40 dark:text-white/40">{text.length} characters</span>
          <Button onClick={generate} disabled={loading || text.trim().length < 3}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} />}
            Generate Counterarguments
          </Button>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-alert-500">{error}</p>}
      </Card>

      {result && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map(([key, label]) =>
            result[key]?.length > 0 ? (
              <Card key={key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                  {label}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {result[key].map((item, i) => (
                    <li key={i} className="text-sm text-ink-900/80 dark:text-white/80">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
