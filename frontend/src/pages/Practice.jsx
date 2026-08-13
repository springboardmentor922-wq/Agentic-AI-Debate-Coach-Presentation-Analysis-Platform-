import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shuffle } from "lucide-react";
import AppShell from "../components/AppShell";
import { topicApi, debateApi } from "../api/endpoints";

const CATEGORY_COLORS = {
  Technology: "bg-sky-400/15 text-sky-300",
  Ethics: "bg-signal-amber/15 text-signal-amber",
  Politics: "bg-purple-400/15 text-purple-300",
};

function categoryColor(category) {
  return CATEGORY_COLORS[category] || "bg-motion-teal/15 text-motion-teal";
}

const DIFFICULTY_MINUTES = { easy: 10, medium: 15, hard: 20 };

export default function Practice() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("any");
  const [startingId, setStartingId] = useState(null);
  const [surprising, setSurprising] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    const { data } = await topicApi.list({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      difficulty: difficulty !== "any" ? difficulty : undefined,
    });
    setTopics(data);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(loadTopics, 250); // debounce live filtering
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty]);

  const categories = useMemo(() => {
    const allTopics = topics; // categories derived from currently loaded set is fine for a simple filter bar
    return Array.from(new Set(allTopics.map((t) => t.category).filter(Boolean)));
  }, [topics]);

  const handlePractice = async (topicId) => {
    setStartingId(topicId);
    try {
      const { data } = await debateApi.quickstart({ topic_id: topicId });
      navigate(`/debate-room/${data.session_id}`);
    } finally {
      setStartingId(null);
    }
  };

  const handleSurpriseMe = async () => {
    setSurprising(true);
    try {
      const { data } = await debateApi.quickstart({ topic_id: null });
      navigate(`/debate-room/${data.session_id}`);
    } finally {
      setSurprising(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Practice with AI</p>
        <h1 className="font-display text-3xl mb-8">Pick a topic to get started</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              className="input-field pl-10"
              placeholder="Search topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="input-field sm:w-48" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="any">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {loading ? (
            <p className="text-slate-muted text-sm col-span-2">Loading topics…</p>
          ) : (
            <>
              {topics.map((topic) => (
                <div key={topic.id} className="card p-5 flex flex-col">
                  <span className={`inline-block w-fit text-xs font-mono uppercase px-2.5 py-1 rounded-full mb-3 ${categoryColor(topic.category)}`}>
                    {topic.category || "General"}
                  </span>
                  <h3 className="font-display text-lg leading-snug mb-2 flex-1">&ldquo;{topic.title}&rdquo;</h3>
                  <p className="text-xs text-slate-muted mb-4 capitalize">
                    {topic.difficulty} · ~{DIFFICULTY_MINUTES[topic.difficulty] || 10} min
                  </p>
                  <button
                    onClick={() => handlePractice(topic.id)}
                    disabled={startingId === topic.id}
                    className="btn-primary w-full"
                  >
                    {startingId === topic.id ? "Starting…" : "Practice this"}
                  </button>
                </div>
              ))}

              <div className="card p-5 flex flex-col bg-motion-teal/10 border-motion-teal/30">
                <div className="w-10 h-10 rounded-lg bg-motion-teal/20 flex items-center justify-center mb-3">
                  <Shuffle className="text-motion-teal" size={18} />
                </div>
                <h3 className="font-display text-lg mb-1 flex-1">Not sure? Let AI pick</h3>
                <p className="text-xs text-slate-muted mb-4">Get a random topic matched to your level.</p>
                <button onClick={handleSurpriseMe} disabled={surprising} className="btn-primary w-full">
                  {surprising ? "Picking…" : "Surprise me"}
                </button>
              </div>

              {topics.length === 0 && (
                <p className="text-slate-muted text-sm col-span-2 text-center py-6">
                  No topics match your filters — try broadening your search, or use "Surprise me."
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}