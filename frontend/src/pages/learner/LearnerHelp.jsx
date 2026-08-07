import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";

const FAQS = [
  {
    q: "How is my debate scored?",
    a: "Every debate session is scored by AI first across five dimensions — argument quality, evidence usage, logical consistency, rebuttal effectiveness, and communication skills. A Debate Coach then reviews it, and if it was assigned by an Educator, they add a final score too. Your report shows all scores side by side once they land.",
  },
  {
    q: "Where do I find my coaching plan?",
    a: "Open Feedback & Coaching from the sidebar — it combines AI recommendations with anything your coach or educator has added, and updates automatically as new reviews come in.",
  },
  {
    q: "Why does my score change after I submit?",
    a: "Your AI score appears immediately. If a coach or educator later reviews the same session, their score is added alongside it — your original AI score never gets overwritten.",
  },
  {
    q: "How does the AI Debate Coach chatbot work?",
    a: "It reads your own recent debate sessions, fallacy reports, and presentation analysis to answer questions in context — a fresh conversation starts each time you log in, and past conversations stay available under the history icon in the chat window.",
  },
  {
    q: "Can other people see my data?",
    a: "Only you can see your own raw responses and drafts. Your assigned coach and educator can see your scored sessions and reports so they can give feedback — that access is enforced on the server, not just hidden in the UI.",
  },
  {
    q: "My audio/video upload seems stuck — what should I do?",
    a: "Large files can take a little longer to transcribe and score. If it does not finish after a few minutes, refresh the Presentation Analysis page — if it still is not there, try re-uploading the file.",
  },
];

export default function LearnerHelp() {
  const [open, setOpen] = useState(null);

  return (
    <div className="mx-auto max-w-2xl page-fade flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glass">
          <LifeBuoy size={24} />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Help & Support
          </h1>

          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Answers about how your dashboard actually works.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, i) => (
          <Card
            key={i}
            padding="sm"
            onClick={() => setOpen(open === i ? null : i)}
            className="
              cursor-pointer
              border border-black/10
              bg-white
              shadow-card
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-glass
              dark:border-brand-500/20
              dark:bg-gradient-to-br
              dark:from-brand-900/20
              dark:to-accent-900/20
            "
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                {faq.q}
              </p>

              <ChevronDown
                size={18}
                className={`
                  shrink-0
                  text-brand-500
                  transition-transform
                  duration-300
                  ${open === i ? "rotate-180" : ""}
                `}
              />
            </div>

            {open === i && (
              <div className="mt-3 rounded-xl bg-gradient-to-r from-brand-500/5 to-accent-500/5 p-3">
                <p className="text-sm leading-relaxed text-ink-900/70 dark:text-white/70">
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
