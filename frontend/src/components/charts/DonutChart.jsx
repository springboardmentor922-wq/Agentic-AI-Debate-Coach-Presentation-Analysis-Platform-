export default function DonutChart({
  data,
  size = 160,
  thickness = 22,
  centerLabel,
  centerValue,
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
              strokeWidth={thickness}
            />
            {data.map((d, i) => {
              const dash = (d.value / total) * circumference;
              const el = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offsetAcc}
                  strokeLinecap="butt"
                />
              );
              offsetAcc += dash;
              return el;
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-ink-900 dark:text-white">
            {centerValue}
          </span>
          <span className="text-[10px] text-ink-900/50 dark:text-white/50">
            {centerLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-ink-900/60 dark:text-white/60">
              {d.label}
            </span>
            <span className="font-semibold text-ink-900 dark:text-white">
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
