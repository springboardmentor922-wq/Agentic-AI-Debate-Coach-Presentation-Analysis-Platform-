import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import api from '../../api/axios'

const SEVERITY_TONE = { low: 'warning', medium: 'warning', high: 'danger' }

export default function FallacyDetector() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const check = async () => {
    if (text.trim().length < 3) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/analysis/fallacy', { text })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not check this text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alert-500/10 text-alert-500">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Fallacy Detector</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Checks your argument for the 8 fallacies the platform detects: Ad Hominem, Straw Man, False Dilemma,
            Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring.
          </p>
        </div>
      </div>

      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste the argument you want checked for logical fallacies..."
          className="input-field resize-none"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-ink-900/40 dark:text-white/40">{text.length} characters</span>
          <Button onClick={check} disabled={loading || text.trim().length < 3}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            Check for Fallacies
          </Button>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-alert-500">{error}</p>}
      </Card>

      {result && (
        <Card className="mt-6">
          {result.fallacy_detected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-alert-500/10 text-alert-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink-900 dark:text-white">{result.fallacy_type}</p>
                  {result.severity && <Badge tone={SEVERITY_TONE[result.severity] || 'warning'}>{result.severity} severity</Badge>}
                </div>
              </div>
              {result.offending_text && (
                <div className="rounded-lg border-l-4 border-alert-500 bg-alert-500/5 px-4 py-2.5 text-sm italic text-ink-900/80 dark:text-white/80">
                  "{result.offending_text}"
                </div>
              )}
              {result.explanation && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">Why this is a fallacy</p>
                  <p className="text-sm text-ink-900/80 dark:text-white/80">{result.explanation}</p>
                </div>
              )}
              {result.correction_suggestion && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">How to fix it</p>
                  <p className="text-sm text-ink-900/80 dark:text-white/80">{result.correction_suggestion}</p>
                </div>
              )}
              {result.better_version && (
                <div className="rounded-lg bg-verdict-50 px-4 py-2.5 dark:bg-verdict-500/10">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-verdict-600">Suggested rewrite</p>
                  <p className="text-sm text-ink-900 dark:text-white">{result.better_version}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-verdict-600">
              <CheckCircle2 size={22} />
              <p className="font-semibold">No logical fallacy detected — your reasoning holds up.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
