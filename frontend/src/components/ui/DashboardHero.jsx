import PulseBars from "./PulseBars";

export default function DashboardHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8">
      {/* Blue Glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.55), transparent 70%)",
        }}
      />

      {/* Purple Glow */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55), transparent 70%)",
        }}
      />

      {/* Extra subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/10" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          {eyebrow && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
              {Icon && <Icon size={13} />}
              {eyebrow}
            </p>
          )}

          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1.5 max-w-xl text-sm text-ink-900/60 dark:text-white/60">
              {subtitle}
            </p>
          )}
        </div>

        {/* AI Status */}
        <div
          className="
          flex shrink-0 items-center gap-3 self-start rounded-2xl
          border border-blue-500/20
          bg-gradient-to-br from-blue-50/80 to-purple-50/80
          px-4 py-3

          shadow-lg shadow-blue-500/10

          dark:border-blue-400/20
          dark:bg-gradient-to-br
          dark:from-blue-950/40
          dark:to-purple-950/40

          sm:self-auto
          "
        >
          <PulseBars />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-900/40 dark:text-white/40">
              AI Engine
            </p>

            <p className="text-xs font-medium text-blue-600 dark:text-blue-300">
              Live &amp; analyzing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
