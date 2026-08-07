export default function LineChart({ data, valueKey = 'value', labelKey = 'label', color = '#3FA9F5', height = 200 }) {
  const width = 600
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  const min = Math.min(...data.map((d) => d[valueKey]), 0)
  const range = max - min || 1
  const stepX = width / (data.length - 1 || 1)

  const points = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d[valueKey] - min) / range) * (height - 24) - 8
    return [x, y]
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`
  const gradientId = `lc-grad-${color.replace('#', '')}`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-ink-900/50 dark:text-white/50">
        {data.map((d, i) => (
          <span key={i}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  )
}
