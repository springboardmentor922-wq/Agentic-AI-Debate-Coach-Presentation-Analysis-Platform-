import { useState } from 'react'
import { LifeBuoy, ChevronDown } from 'lucide-react'
import Card from '../../components/ui/Card'

const FAQS = [
  { q: 'How does a debate reach my queue?', a: 'The instant a learner finishes a debate, it\'s automatically AI-analyzed and pushed into the AI Evaluation Queue — pre-routed to you if that learner is on your roster, otherwise it lands unassigned for any coach to claim.' },
  { q: 'What happens after I submit a review?', a: 'Your review moves to "reviewed" status and becomes visible in the Educator queue for final grading and approval — the last step before the report is published back to the learner with all three scores (AI, Coach, Educator).' },
  { q: 'How do I message a learner?', a: 'Go to Messages and start a conversation, or reply to one they\'ve started — it\'s a real, persisted 1:1 inbox.' },
  { q: 'Where does Skill Gap Analysis data come from?', a: 'It\'s the real average of 5 scored dimensions (argument quality, evidence usage, logical consistency, rebuttal effectiveness, communication skills) across every debate feedback report from your roster.' },
]

export default function CoachHelp() {
  const [open, setOpen] = useState(null)
  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <LifeBuoy size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Help & Support</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Answers about how the coach console actually works.</p>
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
