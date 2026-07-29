// Signature "Argument Pulse" visual: a dual-tone animated waveform
// (argon blue -> ember coral) used across every dashboard hero to signal
// live AI analysis. Purely decorative — respects reduced motion.
export default function PulseBars({ bars = 9, className = '' }) {
  return (
    <div className={`pulse-bars motion-reduce:animate-none ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            height: `${28 - Math.abs(i - Math.floor(bars / 2)) * 3}px`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}
