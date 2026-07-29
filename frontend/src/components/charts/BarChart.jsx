export default function BarChart({ data, height = 200, valueKey = 'value', labelKey = 'label', color = '#3FA9F5' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              <span className="absolute -top-5 text-[11px] font-semibold text-ink-900/70 dark:text-white/70">
                {d[valueKey]}
              </span>
              <div
                className="w-full max-w-[28px] rounded-t-lg transition-all duration-500"
                style={{ height: `${pct}%`, backgroundColor: d.color || color, minHeight: 4 }}
              />
            </div>
            <span className="text-[11px] text-ink-900/50 dark:text-white/50">{d[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}
