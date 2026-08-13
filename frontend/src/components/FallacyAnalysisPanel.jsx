import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

export default function FallacyAnalysisPanel({ fallacyResult }) {
  const [expanded, setExpanded] = useState(false);

  if (!fallacyResult) return null;

  const hasFallacies = fallacyResult.fallacies?.length > 0;
  const { reasoning_analysis, credibility_assessment } = fallacyResult;

  const qualityColor = {
    Weak: "text-rebuttal-coral",
    Moderate: "text-signal-amber",
    Strong: "text-motion-teal",
  }[reasoning_analysis?.quality] || "text-slate-muted";

  return (
    <div className="w-full max-w-[75%] mt-2 border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-muted hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          {hasFallacies && <AlertTriangle size={12} className="text-rebuttal-coral" />}
          Reasoning: <span className={qualityColor}>{reasoning_analysis?.quality || "—"}</span>
          {" · "}Credibility: {credibility_assessment?.score ?? "—"}/10
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 text-xs">
          {reasoning_analysis && (
            <div>
              <p className="label-eyebrow mb-1">Reasoning quality</p>
              <p className="text-slate-muted">{reasoning_analysis.feedback}</p>
            </div>
          )}

          {credibility_assessment && (
            <div>
              <p className="label-eyebrow mb-1">Credibility ({credibility_assessment.score}/10)</p>
              <p className="text-slate-muted">{credibility_assessment.feedback}</p>
            </div>
          )}

          {hasFallacies && (
            <div>
              <p className="label-eyebrow mb-1">Fallacies &amp; corrections</p>
              <div className="space-y-2">
                {fallacyResult.fallacies.map((f, i) => (
                  <div key={i} className="border-l-2 border-rebuttal-coral/40 pl-2">
                    <p className="text-rebuttal-coral font-semibold">{f.fallacy_type}</p>
                    <p className="text-slate-muted mt-0.5">{f.explanation}</p>
                    <p className="text-motion-teal mt-0.5">→ {f.correction_suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}