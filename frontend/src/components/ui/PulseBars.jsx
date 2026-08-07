// Signature "Argument Pulse" visual: a dual-tone animated waveform
// (blue -> purple gradient) used across dashboard heroes.
// Purely decorative — respects reduced motion.

export default function PulseBars({ bars = 9, className = "" }) {
  return (
    <div
      className={`pulse-bars motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            height: `${28 - Math.abs(i - Math.floor(bars / 2)) * 3}px`,
            animationDelay: `${i * 0.08}s`,
          }}
          className="
            bg-gradient-to-t
            from-blue-500
            via-indigo-500
            to-violet-500

            shadow-[0_0_12px_rgba(99,102,241,0.45)]

            dark:from-blue-400
            dark:via-indigo-400
            dark:to-purple-400
          "
        />
      ))}
    </div>
  );
}
