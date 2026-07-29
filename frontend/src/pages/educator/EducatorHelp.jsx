import { useState } from 'react'
import { LifeBuoy, ChevronDown } from 'lucide-react'
import Card from '../../components/ui/Card'

const FAQS = [
  { q: 'How does final grading work?', a: 'Every debate is AI-scored first, then a Debate Coach reviews it, then it lands in your Evaluation Queue for final grading and approval — the last step before the report is published back to the learner with all three scores.' },
  { q: 'How do I assign a topic to a learner?', a: 'Go to Assignments → New Assignment, pick a learner and a real topic from the library, and it appears on their dashboard immediately.' },
  { q: 'Where do Announcements go?', a: 'Announcements write directly into the same notifications collection every learner dashboard\'s bell icon reads from — they see it immediately.' },
  { q: 'How are "My Classes" grouped?', a: 'Classes are derived live from learners\' institution/department profile fields — there\'s no separate class-creation step.' },
  { q: 'Where does Skill Gap Analysis data come from?', a: 'It\'s the real average of 5 scored dimensions (argument quality, evidence usage, logical consistency, rebuttal effectiveness, communication skills) across every debate feedback report platform-wide.' },
]

export default function EducatorHelp() {
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
