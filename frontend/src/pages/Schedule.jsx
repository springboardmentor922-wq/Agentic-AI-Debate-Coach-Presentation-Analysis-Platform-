import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, ListChecks, Check, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { scheduleApi, topicApi } from "../api/endpoints";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const ROLE_STYLES = {
  learner: "bg-motion-teal/15 text-motion-teal",
  debate_coach: "bg-purple-400/15 text-purple-300",
  educator: "bg-signal-amber/15 text-signal-amber",
  administrator: "bg-rebuttal-coral/15 text-rebuttal-coral",
};

function Avatar({ name, role }) {
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display shrink-0 ${ROLE_STYLES[role] || "bg-white/10 text-fog"}`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function Schedule() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedInvitee, setSelectedInvitee] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [decideLater, setDecideLater] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const listSectionRef = useRef(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [scheduleRes, directoryRes, topicsRes] = await Promise.all([
        scheduleApi.list(), scheduleApi.directory(), topicApi.list(),
      ]);
      setItems(scheduleRes.data);
      setDirectory(directoryRes.data);
      setTopics(topicsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const filteredDirectory = useMemo(
    () => directory.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase())),
    [directory, search]
  );

  const pending = items.filter((i) => i.status === "pending");
  const upcoming = items
    .filter((i) => i.status === "confirmed")
    .sort((a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime));

  const scrollToList = () => listSectionRef.current?.scrollIntoView({ behavior: "smooth" });

  const resetForm = () => {
    setSelectedInvitee(null); setSelectedTopic(""); setDecideLater(false);
    setDate(""); setTime(""); setSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvitee || !date || !time) return;
    setSubmitting(true);

    const scheduled_datetime = new Date(`${date}T${time}`).toISOString();
    const topic_id = decideLater ? null : (selectedTopic ? Number(selectedTopic) : null);

    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [...prev, {
      id: tempId,
      scheduled_by: { id: user.id, full_name: user.full_name, role: user.role },
      invitee: selectedInvitee,
      topic: topic_id ? topics.find((t) => t.id === topic_id) : null,
      scheduled_datetime,
      status: "pending",
      created_at: new Date().toISOString(),
    }]);

    try {
      const { data } = await scheduleApi.create({ invitee_id: selectedInvitee.id, topic_id, scheduled_datetime });
      setItems((prev) => prev.map((i) => (i.id === tempId ? data : i)));
      resetForm();
      setShowCreateForm(false);
      scrollToList();
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id, accept) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: accept ? "confirmed" : "declined" } : i)));
    try {
      const { data } = await scheduleApi.respond(id, accept);
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    } catch {
      loadAll();
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Schedule</p>
        <h1 className="font-display text-3xl mb-8">Plan a debate session</h1>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <button onClick={scrollToList} className="card p-6 text-left hover:border-motion-teal/40 border border-transparent transition">
            <ListChecks className="text-motion-teal mb-3" size={22} />
            <p className="font-display text-lg mb-1">My scheduled sessions</p>
            <p className="text-sm text-slate-muted">View invites you've sent, received, and confirmed sessions.</p>
          </button>

          <button onClick={() => setShowCreateForm((s) => !s)} className="card p-6 text-left hover:border-motion-teal/40 border border-transparent transition">
            <CalendarPlus className="text-motion-teal mb-3" size={22} />
            <p className="font-display text-lg mb-1">Create new schedule</p>
            <p className="text-sm text-slate-muted">Invite a learner or coach to a debate at a specific time.</p>
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleSubmit} className="card p-6 mb-10 space-y-6">
            <div>
              <p className="label-eyebrow mb-3">Step 1 — Debate with</p>
              <input
                className="input-field mb-3"
                placeholder="Search learners or coaches…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1 border border-white/5 rounded-lg p-2">
                {filteredDirectory.length === 0 && <p className="text-sm text-slate-muted px-2 py-3">No matches.</p>}
                {filteredDirectory.map((u) => (
                  <label key={u.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${selectedInvitee?.id === u.id ? "bg-motion-teal/10" : "hover:bg-white/5"}`}>
                    <input type="radio" name="invitee" checked={selectedInvitee?.id === u.id} onChange={() => setSelectedInvitee(u)} />
                    <Avatar name={u.full_name} role={u.role} />
                    <span className="text-sm">{u.full_name}</span>
                    <span className="text-[10px] uppercase text-slate-muted font-mono ml-auto">{u.role.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Step 2 — Topic</p>
              <select className="input-field mb-2" value={selectedTopic} disabled={decideLater} onChange={(e) => setSelectedTopic(e.target.value)}>
                <option value="">Select a motion…</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-muted">
                <input type="checkbox" checked={decideLater} onChange={(e) => { setDecideLater(e.target.checked); if (e.target.checked) setSelectedTopic(""); }} />
                Decide topic later
              </label>
            </div>

            <div>
              <p className="label-eyebrow mb-3">Step 3 — Date & time</p>
              <div className="flex gap-3">
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
                <input type="time" className="input-field" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={!selectedInvitee || !date || !time || submitting} className="btn-primary">
              {submitting ? "Sending…" : "Send schedule invite"}
            </button>
          </form>
        )}

        <div ref={listSectionRef} className="space-y-10">
          <div className="card">
            <div className="px-6 py-4 border-b border-white/5"><h2 className="font-display text-lg">Pending response</h2></div>
            {loading ? (
              <div className="p-8 text-center text-slate-muted text-sm">Loading…</div>
            ) : pending.length === 0 ? (
              <div className="p-8 text-center text-slate-muted text-sm">No pending invites.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {pending.map((i) => {
                  const isInvitee = i.invitee.id === user.id;
                  const other = isInvitee ? i.scheduled_by : i.invitee;
                  return (
                    <div key={i.id} className="flex items-center gap-4 px-6 py-4">
                      <Avatar name={other.full_name} role={other.role} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{isInvitee ? `${other.full_name} invited you` : `You invited ${other.full_name}`}</p>
                        <p className="text-xs text-slate-muted">{i.topic ? i.topic.title : "Topic: to be decided"} · {formatDateTime(i.scheduled_datetime)}</p>
                      </div>
                      {isInvitee ? (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRespond(i.id, true)} className="btn-primary px-3 py-1.5 text-xs"><Check size={14} /> Accept</button>
                          <button onClick={() => handleRespond(i.id, false)} className="btn-secondary px-3 py-1.5 text-xs"><X size={14} /> Decline</button>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono uppercase bg-signal-amber/15 text-signal-amber shrink-0">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="px-6 py-4 border-b border-white/5"><h2 className="font-display text-lg">Upcoming</h2></div>
            {loading ? (
              <div className="p-8 text-center text-slate-muted text-sm">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 text-center text-slate-muted text-sm">No confirmed sessions yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {upcoming.map((i) => {
                  const other = i.invitee.id === user.id ? i.scheduled_by : i.invitee;
                  return (
                    <div key={i.id} className="flex items-center gap-4 px-6 py-4">
                      <Avatar name={other.full_name} role={other.role} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">Debate with {other.full_name}</p>
                        <p className="text-xs text-slate-muted">{i.topic ? i.topic.title : "Topic: to be decided"} · {formatDateTime(i.scheduled_datetime)}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono uppercase bg-motion-teal/15 text-motion-teal shrink-0">Confirmed</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}