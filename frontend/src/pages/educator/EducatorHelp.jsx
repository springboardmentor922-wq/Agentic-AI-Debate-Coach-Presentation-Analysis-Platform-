import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";

const FAQS = [
  {
    q: "How does final grading work?",
    a: "Every debate is AI-scored first, then a Debate Coach reviews it, then it lands in your Evaluation Queue for final grading and approval — the last step before the report is published back to the learner with all three scores.",
  },
  {
    q: "How do I assign a topic to a learner?",
    a: "Go to Assignments → New Assignment, pick a learner and a real topic from the library, and it appears on their dashboard immediately.",
  },
  {
    q: "Where do Announcements go?",
    a: "Announcements write directly into the same notifications collection every learner dashboard's bell icon reads from — they see it immediately.",
  },
  {
    q: 'How are "My Classes" grouped?',
    a: "Classes are derived live from learners' institution/department profile fields — there's no separate class-creation step.",
  },
  {
    q: "Where does Skill Gap Analysis data come from?",
    a: "It's the real average of 5 scored dimensions (argument quality, evidence usage, logical consistency, rebuttal effectiveness, communication skills) across every debate feedback report platform-wide.",
  },
];

export default function EducatorHelp() {
  const [open, setOpen] = useState(null);

  return (
    <div className="mx-auto max-w-3xl page-fade">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <LifeBuoy size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Answers about how the educator console actually works.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-4">
        {FAQS.map((faq, i) => (
          <Card
            key={i}
            padding="sm"
            onClick={() => setOpen(open === i ? null : i)}
            className="cursor-pointer border border-gray-200 bg-white transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {faq.q}
              </p>

              <ChevronDown
                size={18}
                className={`shrink-0 text-brand-500 dark:text-brand-300 transition-all duration-300 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </div>

            {open === i && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-brand-500/20">
                <p className="text-sm leading-7 text-gray-600 dark:text-white/70">
                  {faq.a}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
