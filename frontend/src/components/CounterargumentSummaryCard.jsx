export default function CounterargumentSummaryCard({ summary }) {
  if (!summary || summary.turns_with_counterarguments === 0) {
    return (
      <div className="card p-4 text-sm text-slate-muted">
        No counterargument practice data yet — debate a few turns to see this fill in.
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <p className="label-eyebrow">Counterargument Practice Summary</p>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-muted text-xs">Turns with counterarguments</p>
          <p className="text-fog text-lg font-semibold">{summary.turns_with_counterarguments}</p>
        </div>
        <div>
          <p className="text-slate-muted text-xs">Challenge questions received</p>
          <p className="text-fog text-lg font-semibold">{summary.total_challenge_questions}</p>
        </div>
      </div>

      {summary.most_common_strategy_suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Frequently Suggested Improvements</p>
          <div className="flex flex-wrap gap-2">
            {summary.most_common_strategy_suggestions.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-signal-amber/10 text-signal-amber">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.recent_strategy_suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Recommended Debate Strategies</p>
          <ul className="text-sm text-fog list-disc list-inside space-y-0.5">
            {summary.recent_strategy_suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}