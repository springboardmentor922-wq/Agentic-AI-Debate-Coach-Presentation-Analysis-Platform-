export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 py-14 text-center dark:border-white/10">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 text-ink-900/40 dark:bg-white/5 dark:text-white/40">
          <Icon size={24} />
        </div>
      )}
      <div>
        <p className="font-display font-semibold text-ink-900 dark:text-white">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-900/50 dark:text-white/50">{description}</p>}
      </div>
      {action}
    </div>
  )
}
