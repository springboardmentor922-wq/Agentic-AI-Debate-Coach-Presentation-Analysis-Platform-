import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";

const FAQS = [
  {
    q: "How does a debate reach my queue?",
    a: "The instant a learner finishes a debate, it's automatically AI-analyzed and pushed into the AI Evaluation Queue — pre-routed to you if that learner is on your roster, otherwise it lands unassigned for any coach to claim.",
  },
  {
    q: "What happens after I submit a review?",
    a: "Your review moves to 'Reviewed' status and becomes visible in the Educator queue for final grading and approval — the last step before the report is published back to the learner with AI, Coach, and Educator scores.",
  },
  {
    q: "How do I message a learner?",
    a: "Go to Messages and start a conversation, or reply to one they've started — it's a real, persisted one-to-one inbox.",
  },
  {
    q: "Where does Skill Gap Analysis data come from?",
    a: "It's calculated from the five scored dimensions across every debate feedback report from learners on your roster: Argument Quality, Evidence Usage, Logical Consistency, Rebuttal Effectiveness, and Communication Skills.",
  },
];

export default function CoachHelp() {
  const [open, setOpen] = useState(null);

  return (
    <div className="mx-auto max-w-3xl page-fade">
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <LifeBuoy size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Help & Support
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Answers about how the Coach Console works.
          </p>
        </div>
      </div>

      {/* FAQ */}

      <div className="flex flex-col gap-4">
        {FAQS.map((faq, index) => (
          <Card
            key={index}
            padding="sm"
            onClick={() => setOpen(open === index ? null : index)}
            className="cursor-pointer border border-black/10 bg-white shadow-card transition-all duration-300 hover:shadow-lg dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10 dark:hover:border-brand-400/40 dark:hover:shadow-premium"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-base font-semibold text-ink-900 dark:text-white">
                {faq.q}
              </p>

              <ChevronDown
                size={18}
                className={`shrink-0 text-ink-900/50 transition-transform duration-300 dark:text-white/50 ${
                  open === index ? "rotate-180" : ""
                }`}
              />
            </div>

            {open === index && (
              <div className="mt-4 border-t border-black/10 pt-4 dark:border-brand-500/20">
                <p className="text-sm leading-7 text-ink-900/70 dark:text-white/70">
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
