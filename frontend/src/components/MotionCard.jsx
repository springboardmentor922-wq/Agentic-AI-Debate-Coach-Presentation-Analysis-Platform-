const DIFFICULTY_STYLES = {
  easy: "text-motion-teal",
  medium: "text-signal-amber",
  hard: "text-rebuttal-coral",
};

export default function MotionCard({ topic, onSelectStance, selectedStance }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-white/5 bg-docket-lines">
        <div className="flex items-center justify-between">
          <span className="label-eyebrow">{topic.category || "General Motion"}</span>
          <span className={`text-xs font-mono uppercase tracking-widest ${DIFFICULTY_STYLES[topic.difficulty] || "text-slate-muted"}`}>
            {topic.difficulty}
          </span>
        </div>
        <h3 className="font-display text-xl mt-2 leading-snug text-fog">
          &ldquo;This House believes {topic.title.replace(/^this house believes/i, "").trim()}&rdquo;
        </h3>
        {topic.description && (
          <p className="text-sm text-slate-muted mt-2 line-clamp-2">{topic.description}</p>
        )}
      </div>

      {onSelectStance && (
        <div className="grid grid-cols-2 divide-x divide-white/5">
          <button
            onClick={() => onSelectStance("for")}
            className={`py-3 text-sm font-semibold transition ${
              selectedStance === "for"
                ? "bg-motion-teal text-ink-900"
                : "text-motion-teal hover:bg-motion-teal/10"
            }`}
          >
            Argue FOR
          </button>
          <button
            onClick={() => onSelectStance("against")}
            className={`py-3 text-sm font-semibold transition ${
              selectedStance === "against"
                ? "bg-rebuttal-coral text-fog"
                : "text-rebuttal-coral hover:bg-rebuttal-coral/10"
            }`}
          >
            Argue AGAINST
          </button>
        </div>
      )}
    </div>
  );
}
