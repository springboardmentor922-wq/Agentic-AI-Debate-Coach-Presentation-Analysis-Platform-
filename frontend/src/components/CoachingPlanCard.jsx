export default function CoachingPlanCard({ plan }) {
  if (!plan) return null;

  const { personalized_feedback, skill_gap_analysis, learning_path, practice_recommendations, recommended_topics, coaching_summary } = plan;

  return (
    <div className="card p-6 space-y-6">
      <p className="label-eyebrow">AI Coaching Plan</p>

      <div>
        <p className="text-xs font-semibold text-slate-muted mb-2">Coaching Summary</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-motion-teal text-xs font-semibold mb-1">Strengths</p>
            <ul className="list-disc list-inside text-fog space-y-0.5">
              {coaching_summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-rebuttal-coral text-xs font-semibold mb-1">Weaknesses</p>
            <ul className="list-disc list-inside text-fog space-y-0.5">
              {coaching_summary.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
        {coaching_summary.next_steps.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-muted mb-1">Next Steps</p>
            <ul className="list-disc list-inside text-sm text-fog space-y-0.5">
              {coaching_summary.next_steps.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>

      {skill_gap_analysis && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Skill Gap Analysis</p>
          <p className="text-sm text-fog mb-1">
            Strongest: {skill_gap_analysis.strongest_skills.join(", ") || "—"}
          </p>
          <p className="text-sm text-fog mb-1">
            Weakest: {skill_gap_analysis.weakest_skills.join(", ") || "—"}
          </p>
          {skill_gap_analysis.recurring_fallacies.length > 0 && (
            <p className="text-sm text-fog">
              Recurring fallacies: {skill_gap_analysis.recurring_fallacies.join(", ")}
            </p>
          )}
          <span className="inline-block mt-1 text-[10px] uppercase font-mono text-slate-muted">
            Trend: {skill_gap_analysis.improvement_trend.replace("_", " ")}
          </span>
        </div>
      )}

      {learning_path.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">4-Week Learning Path</p>
          <div className="space-y-2">
            {learning_path.map((w) => (
              <div key={w.week} className="border-l-2 border-motion-teal/40 pl-3">
                <p className="text-sm font-semibold text-fog">Week {w.week}: {w.goal}</p>
                <ul className="list-disc list-inside text-xs text-slate-muted">
                  {w.activities.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {personalized_feedback.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Personalized Feedback</p>
          <div className="space-y-3">
            {personalized_feedback.map((f, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-fog">{f.area}</p>
                <p className="text-slate-muted">{f.practical_advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {practice_recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Practice Recommendations</p>
          <ul className="list-disc list-inside text-sm text-fog space-y-0.5">
            {practice_recommendations.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {recommended_topics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-muted mb-2">Recommended Topics</p>
          <div className="flex flex-wrap gap-2">
            {recommended_topics.map((t, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-motion-teal/10 text-motion-teal">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}