export default function Tabs({ tabs, active, onChange }) {
  return (
    <div
      className="
        flex
        items-center
        gap-1
        rounded-xl
        border
        border-blue-500/10
        bg-blue-500/5
        p-1

        dark:border-white/10
        dark:bg-white/5
      "
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`
            flex items-center gap-1.5
            rounded-lg
            px-3.5
            py-2
            text-xs
            font-semibold
            transition-all

            ${
              active === t.value
                ? `
                  bg-gradient-to-r
                  from-blue-500
                  via-indigo-500
                  to-violet-500
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                `
                : `
                  text-ink-900/50
                  hover:bg-blue-500/5
                  hover:text-blue-600

                  dark:text-white/50
                  dark:hover:bg-white/10
                  dark:hover:text-blue-300
                `
            }
          `}
        >
          {t.icon && <t.icon size={13} />}

          {t.label}

          {typeof t.count === "number" && (
            <span
              className={`
                ml-1
                rounded-full
                px-1.5
                py-0.5
                text-[10px]
                font-bold

                ${
                  active === t.value
                    ? "bg-white/20 text-white"
                    : `
                      bg-blue-500/10
                      text-blue-600
                      dark:bg-blue-400/15
                      dark:text-blue-300
                    `
                }
              `}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
