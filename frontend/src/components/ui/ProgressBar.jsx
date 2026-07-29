export default function ProgressBar({ value = 0, tone = 'brand', label, showValue = true, size = 'md' }) {
  const clamped = Math.max(0, Math.min(100, value))
  const toneClass =
    {
      brand: 'bg-brand-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
    }[tone] || 'bg-brand-500'
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5'

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-ink-900/60 dark:text-white/60">{label}</span>}
          {showValue && <span className="font-semibold text-ink-900 dark:text-white">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10 ${height}`}>
        <div
          className={`${height} rounded-full ${toneClass} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
