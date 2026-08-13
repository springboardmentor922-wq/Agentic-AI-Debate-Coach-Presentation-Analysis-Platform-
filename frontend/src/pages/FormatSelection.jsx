import { useNavigate } from "react-router-dom";
import { Users, UsersRound, Gavel, Landmark, Scale, Sparkles } from "lucide-react";
import AppShell from "../components/AppShell";

const FORMATS = [
  {
    id: "one_on_one",
    name: "One-on-One",
    icon: Users,
    accent: "teal",
    description: "Single opponent. Argue FOR or AGAINST.",
    tag: "2 participants",
  },
  {
    id: "public_forum",
    name: "Public Forum",
    icon: UsersRound,
    accent: "teal",
    description: "Team debate with timed speeches and crossfire.",
    tag: "2 teams of 2",
  },
  {
    id: "oxford",
    name: "Oxford",
    icon: Gavel,
    accent: "purple",
    description: "Opening statements, audience vote, closing arguments.",
    tag: "Audience voting",
  },
  {
    id: "parliamentary",
    name: "Parliamentary",
    icon: Landmark,
    accent: "purple",
    description: "Government vs Opposition. Multiple speakers, strict order.",
    tag: "3+ participants",
  },
  {
    id: "policy",
    name: "Policy",
    icon: Scale,
    accent: "purple",
    description: "Constructive, cross-examination, and rebuttal phases.",
    tag: "Affirmative vs Negative",
  },
];

const ACCENT_STYLES = {
  teal: "text-motion-teal bg-motion-teal/10",
  purple: "text-purple-300 bg-purple-400/10",
};

export default function FormatSelection() {
  const navigate = useNavigate();

  const handleSelect = (formatId) => {
    navigate("/topics", { state: { debate_format: formatId } });
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Debate Topics</p>
        <h1 className="font-display text-3xl mb-8">Choose a debate format</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className="card p-6 text-left hover:border-motion-teal/40 border border-transparent transition flex flex-col"
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${ACCENT_STYLES[f.accent]}`}>
                <f.icon size={20} />
              </div>
              <p className="font-display text-lg mb-1">{f.name}</p>
              <p className="text-sm text-slate-muted mb-4 flex-1">{f.description}</p>
              <span className="text-[10px] uppercase font-mono text-slate-muted tracking-wide">{f.tag}</span>
            </button>
          ))}

          <button
            onClick={() => handleSelect("one_on_one")}
            className="card p-6 text-center flex flex-col items-center justify-center bg-motion-teal/10 border-[1.5px] border-motion-teal/40"
          >
            <Sparkles className="text-motion-teal mb-3" size={22} />
            <p className="font-display text-lg mb-1">Not sure?</p>
            <p className="text-sm text-slate-muted">Start with One-on-One — easiest to begin.</p>
          </button>
        </div>
      </div>
    </AppShell>
  );
}