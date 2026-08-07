import { Swords } from "lucide-react";
import Card from "../../components/ui/Card";

const FORMATS = [
  {
    name: "One-on-One Debate",
    desc: "Direct head-to-head debate between two learners, or a learner and the AI opponent.",
  },
  {
    name: "Parliamentary Debate",
    desc: "Government vs. Opposition format with structured speaking roles.",
  },
  {
    name: "Oxford Debate",
    desc: "Formal proposition/opposition format with a motion, rebuttals, and closing statements.",
  },
  {
    name: "Policy Debate",
    desc: "Evidence-heavy format focused on a specific policy proposal and its real-world impact.",
  },
  {
    name: "Public Forum Debate",
    desc: "Accessible, persuasion-focused format aimed at a general audience.",
  },
  {
    name: "AI Debate Simulation",
    desc: "Practice against the platform's AI opponent, which adapts difficulty and argument style.",
  },
];

export default function EducatorDebateFormats() {
  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Swords size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Debate Formats
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            The 6 formats supported platform-wide, exactly as used in
            Assignments and Practice Topics.
          </p>
        </div>
      </div>

      {/* Format Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FORMATS.map((f) => (
          <Card
            key={f.name}
            className="border border-brand-500/20 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-premium dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
          >
            <h3 className="text-xl font-semibold text-ink-900 dark:text-white">
              {f.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-ink-900/70 dark:text-white/65">
              {f.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
