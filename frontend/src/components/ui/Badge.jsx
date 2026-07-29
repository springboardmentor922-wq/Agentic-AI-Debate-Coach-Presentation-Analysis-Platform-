const TONES = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300',
  warm: 'bg-accent-50 text-accent-700 dark:bg-accent-400/15 dark:text-accent-300',
  success: 'bg-verdict-50 text-verdict-700 dark:bg-verdict-400/15 dark:text-verdict-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-alert-50 text-alert-700 dark:bg-alert-400/15 dark:text-alert-300',
  neutral: 'bg-black/5 text-ink-900/70 dark:bg-white/10 dark:text-white/70',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
