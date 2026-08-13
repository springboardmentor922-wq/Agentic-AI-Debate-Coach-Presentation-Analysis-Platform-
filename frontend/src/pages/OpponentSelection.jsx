import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bot, Users, Sparkles, ArrowRight } from "lucide-react";
import AppShell from "../components/AppShell";
import { matchmakingApi } from "../api/endpoints";

function AvatarCircle({ name, role }) {
  const isCoach = role === "debate_coach";
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm ${
        isCoach ? "bg-signal-amber/15 text-signal-amber" : "bg-motion-teal/15 text-motion-teal"
      }`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function OpponentSelection() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState(null);
  const [waitingInvite, setWaitingInvite] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await matchmakingApi.listAvailable();
      setAvailable(data);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!waitingInvite) return;
    const interval = setInterval(async () => {
      const { data } = await matchmakingApi.getInvite(waitingInvite.id);
      if (data.status === "accepted") {
        clearInterval(interval);
        navigate(`/debate-room/${sessionId}`);
      } else if (data.status === "declined" || data.status === "expired") {
        clearInterval(interval);
        setWaitingInvite(null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waitingInvite, navigate, sessionId]);

  const handleStartAi = () => {
    navigate(`/debate-room/${sessionId}`);
  };

  const handleInvite = async (user, inviteType) => {
    setInvitingId(user.id);
    try {
      const { data } = await matchmakingApi.sendInvite({
        to_user_id: user.id,
        session_id: Number(sessionId),
        invite_type: inviteType,
      });
      setWaitingInvite(data);
    } finally {
      setInvitingId(null);
    }
  };

  const learners = available.filter((u) => u.role === "learner");
  const coaches = available.filter((u) => u.role === "debate_coach");

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Debate Session</p>
        <h1 className="font-display text-3xl mb-8">Who do you want to debate?</h1>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="card border-2 border-motion-teal p-6 relative">
            <span className="absolute -top-3 left-4 bg-motion-teal text-ink-900 text-xs font-mono font-semibold px-2.5 py-1 rounded-full">
              Instant start
            </span>
            <Bot className="text-motion-teal mb-4" size={28} />
            <h3 className="font-display text-lg mb-1">Practice with AI</h3>
            <p className="text-sm text-slate-muted mb-6">Adjustable difficulty. Available anytime.</p>
            <button onClick={handleStartAi} className="btn-primary w-full">
              Start now <ArrowRight size={16} />
            </button>
          </div>

          <div className="card p-6">
            <Users className="text-slate-muted mb-4" size={28} />
            <h3 className="font-display text-lg mb-1">Challenge a learner</h3>
            <p className="text-sm text-slate-muted mb-6">Match by topic or invite someone directly.</p>
            <button
              onClick={() => document.getElementById("available-panel")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary w-full"
            >
              Find a match
            </button>
          </div>

          <div className="card p-6">
            <Sparkles className="text-signal-amber mb-4" size={28} />
            <h3 className="font-display text-lg mb-1">Request a coach</h3>
            <p className="text-sm text-slate-muted mb-6">Debate live or get adjudicated feedback.</p>
            <button
              onClick={() => document.getElementById("available-panel")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary w-full"
            >
              Request session
            </button>
          </div>
        </div>

        <div id="available-panel" className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-display text-lg">Available now</h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-muted text-sm">Loading…</p>
          ) : available.length === 0 ? (
            <p className="p-8 text-center text-slate-muted text-sm">
              No one is available right now — try Practice with AI instead.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {[...coaches, ...learners].map((u) => (
                <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarCircle name={u.full_name} role={u.role} />
                    <div>
                      <p className="text-sm font-semibold">{u.full_name}</p>
                      <p className="text-xs text-slate-muted capitalize">{u.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvite(u, u.role === "debate_coach" ? "coach_debate" : "human")}
                    disabled={invitingId === u.id}
                    className="btn-secondary text-sm px-4 py-1.5"
                  >
                    {invitingId === u.id ? "Inviting…" : "Invite"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {waitingInvite && (
          <div className="fixed bottom-6 right-6 card p-4 max-w-xs">
            <p className="text-sm font-semibold mb-1">Invite sent</p>
            <p className="text-xs text-slate-muted">Waiting for a response… (expires in 60s)</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}