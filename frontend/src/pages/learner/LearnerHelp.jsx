import { useState } from 'react'
import { LifeBuoy, ChevronDown } from 'lucide-react'
import Card from '../../components/ui/Card'

const FAQS = [
  { q: 'How is my debate scored?', a: 'Every debate session is scored by AI first across five dimensions — argument quality, evidence usage, logical consistency, rebuttal effectiveness, and communication skills. A Debate Coach then reviews it, and if it was assigned by an Educator, they add a final score too. Your report shows all scores side by side once they land.' },
  { q: 'Where do I find my coaching plan?', a: 'Open Feedback & Coaching from the sidebar — it combines AI recommendations with anything your coach or educator has added, and updates automatically as new reviews come in.' },
  { q: 'Why does my score change after I submit?', a: 'Your AI score appears immediately. If a coach or educator later reviews the same session, their score is added alongside it — your original AI score never gets overwritten.' },
  { q: 'How does the AI Debate Coach chatbot work?', a: 'It reads your own recent debate sessions, fallacy reports, and presentation analysis to answer questions in context — a fresh conversation starts each time you log in, and past conversations stay available under the history icon in the chat window.' },
  { q: 'Can other people see my data?', a: 'Only you can see your own raw responses and drafts. Your assigned coach and educator can see your scored sessions and reports so they can give feedback — that access is enforced on the server, not just hidden in the UI.' },
  { q: 'My audio/video upload seems stuck — what should I do?', a: 'Large files can take a little longer to transcribe and score. If it does not finish after a few minutes, refresh the Presentation Analysis page — if it still is not there, try re-uploading the file.' },
]

export default function LearnerHelp() {
  const [open, setOpen] = useState(null)
  return (
    <div className="mx-auto max-w-2xl page-fade">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <LifeBuoy size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Help & Support</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">Answers about how your dashboard actually works.</p>
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
