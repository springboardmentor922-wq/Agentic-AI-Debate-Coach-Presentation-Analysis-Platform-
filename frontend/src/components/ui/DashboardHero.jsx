import PulseBars from './PulseBars'

export default function DashboardHero({ eyebrow, title, subtitle, icon: Icon }) {
  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(63,169,245,0.5), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,122,80,0.45), transparent 70%)' }}
      />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          {eyebrow && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-300">
              {Icon && <Icon size={13} />}
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-xl text-sm text-ink-900/60 dark:text-white/60">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-black/5 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-white/5 sm:self-auto">
          <PulseBars />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">AI Engine</p>
            <p className="text-xs font-medium text-verdict-600 dark:text-verdict-300">Live &amp; analyzing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
