import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import AppShell from "../components/AppShell";
import MotionCard from "../components/MotionCard";
import { useAuth } from "../context/AuthContext";
import { sessionApi, topicApi } from "../api/endpoints";

const CAN_CREATE_TOPICS = ["educator", "debate_coach", "administrator"];
const MIN_DURATION = 1;
const MAX_DURATION = 60;

const FORMAT_LABELS = {
  one_on_one: "One-on-One",
  public_forum: "Public Forum",
  oxford: "Oxford",
  parliamentary: "Parliamentary",
  policy: "Policy",
};

const FORMAT_OPTIONS = ["one_on_one", "public_forum", "oxford", "parliamentary", "policy"];

export default function TopicSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const debateFormat = location.state?.debate_format || null;

  const [topics, setTopics] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(10);
  const [creating, setCreating] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    category: "",
    description: "",
    difficulty: "medium",
    compatible_formats: [],
  });

  const loadTopics = async () => {
    const { data } = await topicApi.list(debateFormat);
    setTopics(data);
  };

  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debateFormat]);

  // Client-side fallback filter: an empty/missing compatible_formats list means the topic
  // was never scoped to specific formats, so it should remain visible everywhere.
  const formatFiltered = debateFormat
    ? topics.filter((t) => !t.compatible_formats?.length || t.compatible_formats.includes(debateFormat))
    : topics;

  const filtered = formatFiltered.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleStanceSelect = (topicId, stance) => {
    setSelected((prev) => (prev?.topicId === topicId && prev.stance === stance ? null : { topicId, stance }));
  };

  const handleDurationChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;
    setDuration(value);
  };

  const clampedDuration = Math.min(Math.max(duration || MIN_DURATION, MIN_DURATION), MAX_DURATION);

  const handleStartSession = async () => {
    if (!selected) return;
    setCreating(true);
    try {
      const { data } = await sessionApi.create({
        topic_id: selected.topicId,
        stance: selected.stance,
        duration_minutes: clampedDuration,
        debate_format: debateFormat || "one_on_one",
      });
      navigate(`/debate-room/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleFormat = (fmt) => {
    setNewTopic((prev) => ({
      ...prev,
      compatible_formats: prev.compatible_formats.includes(fmt)
        ? prev.compatible_formats.filter((f) => f !== fmt)
        : [...prev.compatible_formats, fmt],
    }));
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    await topicApi.create(newTopic);
    setNewTopic({ title: "", category: "", description: "", difficulty: "medium", compatible_formats: [] });
    setShowNewTopic(false);
    loadTopics();
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="label-eyebrow mb-1">
              Debate Topics {debateFormat && `· ${FORMAT_LABELS[debateFormat] || debateFormat}`}
            </p>
            <h1 className="font-display text-3xl">Pick a motion</h1>
          </div>
          {CAN_CREATE_TOPICS.includes(user?.role) && (
            <button onClick={() => setShowNewTopic((s) => !s)} className="btn-secondary">
              <Plus size={16} /> New topic
            </button>
          )}
        </div>

        {showNewTopic && (
          <form onSubmit={handleCreateTopic} className="card p-6 mb-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                className="input-field"
                placeholder="Motion title, e.g. social media does more harm than good"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Category, e.g. Technology"
                value={newTopic.category}
                onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
              />
            </div>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Short description"
              value={newTopic.description}
              onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            />

            <div>
              <label className="label-eyebrow block mb-2">
                Compatible formats (leave empty to allow all formats)
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      newTopic.compatible_formats.includes(fmt)
                        ? "border-motion-teal bg-motion-teal/10 text-motion-teal"
                        : "border-white/10 text-slate-muted hover:border-white/20"
                    }`}
                  >
                    {FORMAT_LABELS[fmt]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <select
                className="input-field w-40"
                value={newTopic.difficulty}
                onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button type="submit" className="btn-primary">
                Publish topic
              </button>
            </div>
          </form>
        )}

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input
            className="input-field pl-10"
            placeholder="Search topics by title or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-slate-muted text-sm">
            {debateFormat ? (
              <>
                No topics available yet for {FORMAT_LABELS[debateFormat] || debateFormat}. Try another format or
                ask an educator/coach to add one.
              </>
            ) : (
              <>No topics found yet. {CAN_CREATE_TOPICS.includes(user?.role) && "Publish the first one above."}</>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((topic) => (
              <MotionCard
                key={topic.id}
                topic={topic}
                onSelectStance={(stance) => handleStanceSelect(topic.id, stance)}
                selectedStance={selected?.topicId === topic.id ? selected.stance : null}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed bottom-0 left-64 right-0 border-t border-white/10 bg-ink-800/95 backdrop-blur px-8 py-4 flex items-center justify-between gap-6">
          <p className="text-sm text-slate-muted">
            Ready to argue <span className="text-fog font-semibold capitalize">{selected.stance}</span> the selected motion?
          </p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-muted">
              Duration
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_DURATION}
                value={duration}
                onChange={handleDurationChange}
                className="input-field w-20 py-1.5 text-center"
              />
              min
            </label>
            <button onClick={handleStartSession} disabled={creating} className="btn-primary">
              {creating ? "Starting…" : "Start debate session"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}