import { Link } from 'react-router-dom'
import { Scale, Brain, Mic2, TrendingUp } from 'lucide-react'
import TopNav from '../components/TopNav'
import { ContainerScroll } from '../components/ui/container-scroll-animation'

const FEATURES = [
  { icon: Brain, title: 'Argument Analysis', desc: 'AI extracts claims, evidence, and scores your reasoning quality.' },
  { icon: Scale, title: 'Fallacy Detection', desc: 'Instantly flags Ad Hominem, Straw Man, and 6 other fallacies.' },
  { icon: Mic2, title: 'Presentation Analytics', desc: 'Speech pace, filler words, and confidence scoring.' },
  { icon: TrendingUp, title: 'Performance Coaching', desc: 'Personalized feedback that tracks your growth over time.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-white dark:bg-ink-950">
      <TopNav />

      <ContainerScroll
        titleComponent={
          <>
            <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:bg-white/10 dark:text-brand-200">
              Agentic AI Debate Coach
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink-900 dark:text-white sm:text-6xl">
              Master the art of argument,
              <br />
              <span className="text-brand-500">one debate at a time.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-ink-900/60 dark:text-white/60">
              An AI-powered coach that analyzes your arguments, catches logical fallacies, and helps you
              become a sharper, more persuasive communicator.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </>
        }
      >
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
          alt="Team debating and collaborating around a table"
          className="mx-auto h-full w-full rounded-2xl object-cover object-top"
          draggable={false}
        />
      </ContainerScroll>

      <main className="mx-auto max-w-6xl px-6 pb-24 text-center page-fade">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-6 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon size={20} />
              </div>
              <h3 className="mb-1 font-display font-semibold text-ink-900 dark:text-white">{title}</h3>
              <p className="text-sm text-ink-900/60 dark:text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
