export default function TimerRing({ totalSeconds, remainingSeconds, size = 180 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(Math.max(remainingSeconds, 0) / 60);
  const seconds = Math.max(remainingSeconds, 0) % 60;
  const isLow = remainingSeconds <= 30 && remainingSeconds > 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isLow ? "#E8543F" : "#3FBFAE"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold text-fog">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-xs text-slate-muted uppercase tracking-widest mt-1">Speaking Time</span>
      </div>
    </div>
  );
}
