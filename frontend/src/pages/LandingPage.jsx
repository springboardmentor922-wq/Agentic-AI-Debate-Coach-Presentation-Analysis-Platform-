import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Gavel,
  Users,
  BookOpen,
  Mic,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

/**
 * Landing page for Podium.
 *
 * Signature element: the hero doesn't use a generic stat-and-gradient
 * treatment — it replays an actual (scripted) debate turn using the same
 * transcript-bubble language as the real DebateRoom screen: a user
 * argument typing in, a fallacy badge landing, a score readout, then the
 * AI opponent's rebuttal. It's built from the product's own visual
 * vocabulary rather than stock hero imagery.
 */

const OPENING_ARGUMENT =
  "Everyone who disagrees with banning homework is just lazy and doesn't care about kids' futures.";
const AI_REBUTTAL =
  "That's an ad hominem — it dismisses the person instead of the argument. Let's look at what the evidence on homework and learning outcomes actually shows.";

function useTypewriter(text, { speed = 22, startDelay = 0, loopDelay = 4200 } = {}) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | typing | done
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let i = 0;

    function start() {
      setDisplay("");
      setPhase("typing");
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setDisplay(text.slice(0, i));
        if (i < text.length) {
          timeoutRef.current = setTimeout(tick, speed);
        } else {
          setPhase("done");
          timeoutRef.current = setTimeout(() => {
            if (!cancelled) start();
          }, loopDelay);
        }
      };
      timeoutRef.current = setTimeout(tick, speed);
    }

    timeoutRef.current = setTimeout(start, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return { display, phase };
}

function HeroDemo() {
  const user = useTypewriter(OPENING_ARGUMENT, { speed: 20, startDelay: 400, loopDelay: 5200 });
  const showBadge = user.phase === "done";
  const ai = useTypewriter(AI_REBUTTAL, { speed: 16, startDelay: 900, loopDelay: 5200 });
  const showAi = showBadge;

  return (
    <div className="card w-full max-w-md p-5 flex flex-col gap-4" aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-fog">Debate transcript</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-muted">Live preview</span>
      </div>

      <div className="flex flex-col items-end gap-1.5 min-h-[92px]">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-motion-teal px-4 py-2.5 text-sm text-ink-900">
          {user.display}
          {user.phase === "typing" && <span className="animate-pulse">|</span>}
        </div>
        {showBadge && (
          <span className="inline-flex items-center gap-1 rounded-md bg-rebuttal-coral/15 px-2 py-1 text-[10px] font-medium text-rebuttal-coral">
            Ad hominem detected
          </span>
        )}
      </div>

      {showAi && (
        <div className="flex flex-col items-start gap-1.5 min-h-[70px]">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-ink-600 border border-white/10 px-4 py-2.5 text-sm text-fog">
            {ai.display}
            {ai.phase === "typing" && <span className="animate-pulse">|</span>}
          </div>
        </div>
      )}

      <div className="pt-1 border-t border-white/5 flex items-center gap-4 text-[10px] font-mono text-slate-muted">
        <span>Clarity 8</span>
        <span>Evidence 4</span>
        <span>Logic 3</span>
      </div>
    </div>
  );
}

const FORMATS = [
  { icon: Users, name: "One-on-One", note: "2 participants" },
  { icon: Users, name: "Public Forum", note: "2 teams of 2" },
  { icon: Gavel, name: "Oxford", note: "Audience voting" },
  { icon: BookOpen, name: "Parliamentary", note: "3+ participants" },
  { icon: ShieldCheck, name: "Policy", note: "Affirmative vs Negative" },
];

const FEATURES = [
  {
    icon: Swords,
    title: "An opponent that's actually tuned to you",
    body:
      "Set the AI's aggressiveness, sophistication, and how often it slips in a deliberate fallacy — so practice gets harder as you do.",
  },
  {
    icon: ShieldCheck,
    title: "Fallacies flagged as they happen",
    body:
      "Ad hominem, straw man, false dilemma, and more are caught inline, with a plain-English explanation and a way to fix it.",
  },
  {
    icon: Mic,
    title: "Delivery, not just content",
    body:
      "Pace, filler words, and confidence are scored from your actual voice — not just what you typed.",
  },
  {
    icon: BarChart3,
    title: "Reports that show real change",
    body:
      "Clarity, evidence, rebuttal quality, and logical consistency tracked across every session, not just the last one.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-fog">
      {/* Nav */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-motion-teal" size={20} strokeWidth={2.2} />
            <span className="font-display text-lg">Podium</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-muted">
            <a href="#formats" className="hover:text-fog transition-colors">Formats</a>
            <a href="#how" className="hover:text-fog transition-colors">How it works</a>
            <a href="#roles" className="hover:text-fog transition-colors">For coaches &amp; educators</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-muted hover:text-fog transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="label-eyebrow mb-3">This House believes</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.1] mb-6">
            Anyone can learn to argue well &mdash; with the right opponent.
          </h1>
          <p className="text-slate-muted text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            Podium is an AI debate coach. Practice against an opponent tuned to your
            level, get every fallacy flagged as it happens, and see your clarity,
            evidence, and delivery improve session over session.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/signup" className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              Start your first debate <ArrowRight size={16} />
            </Link>
            <a href="#how" className="btn-secondary px-6 py-3 text-sm">
              See how it works
            </a>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <HeroDemo />
        </div>
      </section>

      {/* Formats */}
      <section id="formats" className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-2">Formats</p>
          <h2 className="font-display text-2xl md:text-3xl mb-10 max-w-xl">
            Practice the format you actually compete in.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
            {FORMATS.map(({ icon: Icon, name, note }) => (
              <div key={name} className="card p-4 flex flex-col gap-2">
                <Icon size={20} className="text-motion-teal" strokeWidth={2} />
                <span className="text-sm font-medium text-fog">{name}</span>
                <span className="text-xs text-slate-muted">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — asymmetric grid, not a generic 3-up icon row */}
      <section id="how" className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-2">How it works</p>
          <h2 className="font-display text-2xl md:text-3xl mb-10 max-w-xl">
            Every turn is analyzed while it still matters &mdash; not after.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6 flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-motion-teal/10 flex items-center justify-center">
                  <Icon size={18} className="text-motion-teal" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-fog mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-2">Built for more than solo practice</p>
          <h2 className="font-display text-2xl md:text-3xl mb-10 max-w-xl">
            Coaches and educators run it too.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-6">
              <p className="text-xs uppercase tracking-wide text-motion-teal mb-2">Debate coach</p>
              <p className="text-sm text-fog font-medium mb-2">
                Debate a learner directly, or sit in as an adjudicator with live scoring.
              </p>
              <p className="text-sm text-slate-muted leading-relaxed">
                Every session you're assigned to shows up in one place &mdash; feedback given,
                learners assigned, and how quickly you're responding.
              </p>
            </div>
            <div className="card p-6">
              <p className="text-xs uppercase tracking-wide text-motion-teal mb-2">Educator</p>
              <p className="text-sm text-fog font-medium mb-2">
                Assign a motion to your whole class and see who's actually practiced.
              </p>
              <p className="text-sm text-slate-muted leading-relaxed">
                A class-wide view of completion, engagement, and skill trends &mdash; not just
                one learner at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Pick a motion. Start arguing.</h2>
          <p className="text-slate-muted mb-8 max-w-md mx-auto">
            No scheduling required for your first session &mdash; practice with AI is ready
            whenever you are.
          </p>
          <Link to="/signup" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-muted">
          <span>&copy; {new Date().getFullYear()} Podium.</span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-fog transition-colors">Sign in</Link>
            <a href="#formats" className="hover:text-fog transition-colors">Formats</a>
            <a href="#roles" className="hover:text-fog transition-colors">For educators</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
