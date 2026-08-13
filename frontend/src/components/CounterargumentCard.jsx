export default function CounterargumentCard({ counterarguments, challengeQuestions }) {
  if (!counterarguments) {
    return <div className="card p-4 text-sm text-slate-muted">No counterarguments available.</div>;
  }

  const fields = [
    ["Logical Rebuttal", counterarguments.logical_rebuttal],
    ["Evidence-Based Rebuttal", counterarguments.evidence_rebuttal],
    ["Ethical Counterargument", counterarguments.ethical_counterargument],
    ["Practical Counterargument", counterarguments.practical_counterargument],
    ["Policy Counterargument", counterarguments.policy_counterargument],
  ];

  return (
    <div className="card p-4 space-y-4">
      <p className="label-eyebrow">Counterargument Analysis</p>

      {fields.map(([label, text]) => (
        <div key={label}>
          <p className="text-xs font-semibold text-slate-muted mb-1">{label}</p>
          <p className="text-sm text-fog">{text || "—"}</p>
        </div>
      ))}

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Challenge Questions</p>
        {challengeQuestions?.length > 0 ? (
          <ul className="text-sm text-fog list-disc list-inside space-y-0.5">
            {challengeQuestions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-muted">—</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-1">Strategy Suggestions</p>
        {counterarguments.strategy_suggestions?.length > 0 ? (
          <ul className="text-sm text-fog list-disc list-inside space-y-0.5">
            {counterarguments.strategy_suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-muted">—</p>
        )}
      </div>
    </div>
  );
}