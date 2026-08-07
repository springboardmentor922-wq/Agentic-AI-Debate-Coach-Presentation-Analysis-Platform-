export function SkeletonLine({ className = "" }) {
  return (
    <div
      className={`
        animate-pulse 
        rounded-lg
        bg-gradient-to-r
        from-blue-500/10
        via-indigo-500/15
        to-violet-500/10

        dark:from-blue-400/10
        dark:via-indigo-400/15
        dark:to-purple-400/10

        ${className}
      `}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="
        glass-card
        flex
        flex-col
        gap-4
        p-6
        border
        border-blue-500/10
        dark:border-indigo-400/10
      "
    >
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-8 w-2/3" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-5/6" />
      <SkeletonLine className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-blue-500/10
        dark:border-violet-400/10
      "
    >
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="
            grid
            gap-3
            border-b
            border-black/5
            px-4
            py-3

            dark:border-white/10
          "
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine
              key={c}
              className={`
                h-4
                ${
                  r === 0
                    ? "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-purple-400/20"
                    : ""
                }
              `}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
