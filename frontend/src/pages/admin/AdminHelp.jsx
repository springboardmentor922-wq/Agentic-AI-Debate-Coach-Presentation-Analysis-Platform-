import { useState } from 'react'
import { LifeBuoy, ChevronDown } from 'lucide-react'
import Card from '../../components/ui/Card'

const FAQS = [
  { q: 'How do I create a Coach, Educator, or Admin account?', a: 'Go to User Management → Create Account. Learners can only self-register from the public site; every other role is created here by an existing administrator.' },
  { q: 'How does the AI provider fallback work?', a: 'Every AI feature tries the primary provider (configured in AI Models & Services), falls back to the secondary provider on failure, then falls back to a deterministic rule-based engine so results are never empty.' },
  { q: 'Where do broadcast notifications go?', a: 'Notification Center writes directly into the same notifications collection every dashboard\'s bell icon reads from — recipients see it immediately.' },
  { q: 'Is there a payment processor connected?', a: 'No. Subscriptions & Billing manages plan-tier labels only (free/pro/enterprise) for internal tracking — no real payments are processed in this build.' },
  { q: 'How is data backed up?', a: 'There is no automated cloud backup pipeline yet. Backup & Recovery provides an honest on-demand manual JSON export of core collections.' },
]

export default function AdminHelp() {
  const [open, setOpen] = useState(null)

  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <LifeBuoy size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Help & Support</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Answers about how the admin console actually works.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {FAQS.map((faq, i) => (
          <Card key={i} padding="sm" onClick={() => setOpen(open === i ? null : i)} className="cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{faq.q}</p>
              <ChevronDown size={16} className={`shrink-0 text-ink-900/40 transition dark:text-white/40 ${open === i ? 'rotate-180' : ''}`} />
            </div>
            {open === i && <p className="mt-2 text-sm text-ink-900/60 dark:text-white/60">{faq.a}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
