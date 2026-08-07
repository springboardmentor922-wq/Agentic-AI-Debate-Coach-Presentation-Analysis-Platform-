export default function ProgressBar({
  value = 0,
  tone = "brand",
  label,
  showValue = true,
  size = "md",
}) {
  const clamped = Math.max(0, Math.min(100, value));

  const toneClass =
    {
      brand: "bg-gradient-to-r from-blue-500 to-violet-500",

      success: "bg-gradient-to-r from-emerald-400 to-green-500",

      warning: "bg-gradient-to-r from-amber-400 to-orange-500",

      danger: "bg-gradient-to-r from-rose-400 to-red-500",
    }[tone] || "bg-gradient-to-r from-blue-500 to-violet-500";

  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span
              className="
              text-xs
              font-semibold

              text-ink-900/70
              dark:text-white/70
              "
            >
              {label}
            </span>
          )}

          {showValue && (
            <span
              className="
              font-data
              text-xs
              font-bold

              text-blue-600
              dark:text-blue-300
              "
            >
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        className={`
          w-full
          overflow-hidden
          rounded-full

          border
          border-blue-500/10

          bg-gradient-to-r
          from-blue-50
          to-purple-50

          dark:border-white/10
          dark:from-white/10
          dark:to-white/5

          ${height}
        `}
      >
        <div
          className={`
            ${height}
            rounded-full

            ${toneClass}

            shadow-sm

            transition-all
            duration-500
          `}
          style={{
            width: `${clamped}%`,
          }}
        />
      </div>
    </div>
  );
}
