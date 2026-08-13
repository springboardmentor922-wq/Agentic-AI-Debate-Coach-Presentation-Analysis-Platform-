const ROLE_STYLES = {
  learner: "bg-motion-teal/15 text-motion-teal border-motion-teal/30",
  debate_coach: "bg-signal-amber/15 text-signal-amber border-signal-amber/30",
  educator: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  administrator: "bg-rebuttal-coral/15 text-rebuttal-coral border-rebuttal-coral/30",
};

const ROLE_LABELS = {
  learner: "Learner",
  debate_coach: "Debate Coach",
  educator: "Educator",
  administrator: "Administrator",
};

export default function RoleBadge({ role, className = "" }) {
  const style = ROLE_STYLES[role] || "bg-white/10 text-fog border-white/20";
  const label = ROLE_LABELS[role] || role;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono uppercase tracking-wider ${style} ${className}`}
    >
      {label}
    </span>
  );
}
