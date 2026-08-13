export default function ArgumentAnalysisCard({ argumentAnalysis }) {
  if (!argumentAnalysis) {
    return (
      <div className="card p-4 text-sm text-slate-muted">
        No argument analysis available.
      </div>
    );
  }

  const { claim, evidence = [], assumptions = [], reasoning, conclusion } = argumentAnalysis;

  return (
    <div className="card p-4 space-y-4">
      <p className="label-eyebrow">Argument Analysis</p>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Claim</p>
        <p className="text-sm text-fog">{claim || "—"}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Evidence</p>
        {evidence.length === 0 ? (
          <p className="text-sm text-slate-muted">—</p>
        ) : (
          <ul className="text-sm text-fog list-disc list-inside space-y-0.5">
            {evidence.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Assumptions</p>
        {assumptions.length === 0 ? (
          <p className="text-sm text-slate-muted">—</p>
        ) : (
          <ul className="text-sm text-fog list-disc list-inside space-y-0.5">
            {assumptions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Reasoning</p>
        <p className="text-sm text-fog">{reasoning || "—"}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Conclusion</p>
        <p className="text-sm text-fog">{conclusion || "—"}</p>
      </div>
    </div>
  );
}