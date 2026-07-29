export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-black/5 dark:bg-white/10 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="glass-card flex flex-col gap-3 p-5">
      <SkeletonLine className="h-9 w-9 !rounded-xl" />
      <SkeletonLine className="h-6 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
