import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";

const FAQS = [
  {
    q: "How do I create a Coach, Educator, or Admin account?",
    a: "Go to User Management → Create Account. Learners can only self-register from the public site; every other role is created here by an existing administrator.",
  },
  {
    q: "How does the AI provider fallback work?",
    a: "Every AI feature tries the primary provider (configured in AI Models & Services), falls back to the secondary provider on failure, then falls back to a deterministic rule-based engine so results are never empty.",
  },
  {
    q: "Where do broadcast notifications go?",
    a: "Notification Center writes directly into the same notifications collection every dashboard's bell icon reads from — recipients see it immediately.",
  },
  {
    q: "Is there a payment processor connected?",
    a: "No. Subscriptions & Billing manages plan-tier labels only (free/pro/enterprise) for internal tracking — no real payments are processed in this build.",
  },
  {
    q: "How is data backed up?",
    a: "There is no automated cloud backup pipeline yet. Backup & Recovery provides an honest on-demand manual JSON export of core collections.",
  },
];

export default function AdminHelp() {
  const [open, setOpen] = useState(null);

  return (
    <div className="mx-auto max-w-3xl page-fade">
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <LifeBuoy size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            Answers about how the admin console actually works.
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
            className="cursor-pointer border border-gray-200 bg-white shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-gray-900 dark:text-white">
                {faq.q}
              </p>

              <ChevronDown
                size={18}
                className={`shrink-0 text-brand-600 transition-transform duration-300 dark:text-brand-300 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </div>

            {open === i && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
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
