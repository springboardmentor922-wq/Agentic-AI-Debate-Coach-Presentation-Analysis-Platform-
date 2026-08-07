import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const TONE_STYLES = {
  cool: `
    bg-blue-500/10
    text-blue-600
    dark:bg-blue-400/15
    dark:text-blue-300
  `,
  warm: `
    bg-indigo-500/10
    text-indigo-600
    dark:bg-indigo-400/15
    dark:text-indigo-300
  `,
  verdict: `
    bg-violet-500/10
    text-violet-600
    dark:bg-violet-400/15
    dark:text-violet-300
  `,
  alert: `
    bg-purple-500/10
    text-purple-600
    dark:bg-purple-400/15
    dark:text-purple-300
  `,
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaTone = "success",
  hint,
  tone = "cool",
}) {
  const isUp = deltaTone === "success";

  return (
    <div
      className="
        glass-card
        flex
        flex-col
        gap-3
        p-5
        border
        border-blue-500/10
        transition
        hover:border-violet-500/30
        hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]
        dark:border-white/10
      "
    >
      <div
        className={`
          flex h-10 w-10 items-center justify-center rounded-xl
          ${TONE_STYLES[tone] || TONE_STYLES.cool}
        `}
      >
        {Icon && <Icon size={20} />}
      </div>

      {delta && (
        <span
          className={`
            inline-flex w-fit items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold
            ${
              isUp
                ? `
                  bg-blue-500/10
                  text-blue-600
                  dark:bg-blue-400/15
                  dark:text-blue-300
                `
                : `
                  bg-violet-500/10
                  text-violet-600
                  dark:bg-violet-400/15
                  dark:text-violet-300
                `
            }
          `}
        >
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </span>
      )}

      <div>
        <p
          className="
            font-data
            text-2xl
            font-bold
            bg-gradient-to-r
            from-blue-500
            via-indigo-500
            to-violet-500
            bg-clip-text
            text-transparent
          "
        >
          {value}
        </p>

        <p className="mt-1 text-sm font-medium text-ink-900 dark:text-white">
          {label}
        </p>

        {hint && (
          <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
