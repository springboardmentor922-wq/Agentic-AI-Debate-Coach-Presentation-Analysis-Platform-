import { useState } from 'react'
import { BrainCircuit, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'

export default function ArgumentAnalyzer() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (text.trim().length < 3) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/analysis/argument', { text })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not analyze this argument. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Argument Analyzer</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Paste any argument to get claim extraction, evidence evaluation, and a reasoning-quality score.
          </p>
        </div>
      </div>

      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste your argument here (e.g. 'Social media should be regulated because it spreads misinformation and harms mental health...')"
          className="input-field resize-none"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-ink-900/40 dark:text-white/40">{text.length} characters</span>
          <Button onClick={analyze} disabled={loading || text.trim().length < 3}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
            Analyze
          </Button>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-alert-500">{error}</p>}
      </Card>

      {result && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
              Overall Score
            </p>
            <p className="font-data text-4xl font-bold text-brand-500">{result.overall_argument_score}/10</p>
          </Card>
          <Card>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
              Reasoning Quality
            </p>
            <p className="text-sm text-ink-900 dark:text-white">{result.reasoning_quality}</p>
          </Card>
          <Card className="sm:col-span-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
              Score Breakdown
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Clarity', result.clarity_score],
                ['Relevance', result.relevance_score],
                ['Evidence Strength', result.evidence_strength_score],
                ['Logical Consistency', result.logical_consistency_score],
                ['Persuasiveness', result.persuasiveness_score],
              ].map(([label, score]) => (
                <div key={label} className="rounded-lg bg-black/[0.03] px-3 py-2.5 text-center dark:bg-white/5">
                  <p className="font-data text-lg font-bold text-ink-900 dark:text-white">{score}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-900/40 dark:text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="sm:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-900/40 dark:text-white/40">
              Claims Identified
            </p>
            <ul className="flex flex-col gap-2">
              {(result.claims || []).map((c, i) => (
                <li key={i} className="rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-ink-900 dark:bg-white/5 dark:text-white">
                  {c}
                </li>
              ))}
              {(!result.claims || result.claims.length === 0) && (
                <p className="text-sm text-ink-900/50 dark:text-white/50">No distinct claims extracted.</p>
              )}
            </ul>
          </Card>
          {result.evidence?.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-verdict-600">Evidence Found</p>
              <ul className="flex flex-col gap-1.5">
                {result.evidence.map((e, i) => (
                  <li key={i} className="text-sm text-ink-900/80 dark:text-white/80">• {e}</li>
                ))}
              </ul>
            </Card>
          )}
          {result.feedback && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600">Coach Feedback</p>
              <p className="text-sm text-ink-900/80 dark:text-white/80">{result.feedback}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
