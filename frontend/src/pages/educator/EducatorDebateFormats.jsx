import { Swords } from 'lucide-react'
import Card from '../../components/ui/Card'

const FORMATS = [
  { name: 'One-on-One Debate', desc: 'Direct head-to-head debate between two learners, or a learner and the AI opponent.' },
  { name: 'Parliamentary Debate', desc: 'Government vs. Opposition format with structured speaking roles.' },
  { name: 'Oxford Debate', desc: 'Formal proposition/opposition format with a motion, rebuttals, and closing statements.' },
  { name: 'Policy Debate', desc: 'Evidence-heavy format focused on a specific policy proposal and its real-world impact.' },
  { name: 'Public Forum Debate', desc: 'Accessible, persuasion-focused format aimed at a general audience.' },
  { name: 'AI Debate Simulation', desc: "Practice against the platform's AI opponent, which adapts difficulty and argument style." },
]

export default function EducatorDebateFormats() {
  return (
    <div className="page-fade flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <Swords size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Debate Formats</h1>
          <p className="text-sm text-ink-900/60 dark:text-white/60">The 6 formats supported platform-wide, exactly as used in Assignments and Practice Topics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FORMATS.map((f) => (
          <Card key={f.name}>
            <p className="font-semibold text-ink-900 dark:text-white">{f.name}</p>
            <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">{f.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
