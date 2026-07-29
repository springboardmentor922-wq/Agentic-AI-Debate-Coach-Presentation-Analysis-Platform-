import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const TONE_STYLES = {
  cool: 'bg-brand-50 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300',
  warm: 'bg-accent-50 text-accent-600 dark:bg-accent-400/15 dark:text-accent-300',
  verdict: 'bg-verdict-50 text-verdict-600 dark:bg-verdict-400/15 dark:text-verdict-300',
  alert: 'bg-alert-50 text-alert-600 dark:bg-alert-400/15 dark:text-alert-300',
}

export default function StatCard({ icon: Icon, label, value, delta, deltaTone = 'success', hint, tone = 'cool' }) {
  const isUp = deltaTone === 'success'
  return (
    <div className="stat-card" data-tone={tone}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE_STYLES[tone] || TONE_STYLES.cool}`}>
          {Icon && <Icon size={18} />}
        </div>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isUp
                ? 'bg-verdict-50 text-verdict-700 dark:bg-verdict-400/15 dark:text-verdict-300'
                : 'bg-alert-50 text-alert-700 dark:bg-alert-400/15 dark:text-alert-300'
            }`}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-3 font-data font-bold text-2xl text-ink-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-xs text-ink-900/50 dark:text-white/50">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-900/40 dark:text-white/40">{hint}</p>}
    </div>
  )
}
