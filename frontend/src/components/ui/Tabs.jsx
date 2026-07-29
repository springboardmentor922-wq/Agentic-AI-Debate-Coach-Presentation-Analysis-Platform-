export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-black/5 bg-black/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
            active === t.value
              ? 'bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-brand-300'
              : 'text-ink-900/50 hover:text-ink-900 dark:text-white/50 dark:hover:text-white'
          }`}
        >
          {t.icon && <t.icon size={13} />}
          {t.label}
          {typeof t.count === 'number' && (
            <span className="ml-0.5 rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
