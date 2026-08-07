import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ArrowRight } from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const RESULT_TONE = {
  Strong: "success",
  Fair: "warning",
  "Needs Work": "danger",
  "Pending Review": "neutral",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Analysis() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/debate/sessions/history");

        if (!cancelled) {
          setItems(res.data.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Could not load your debate history right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: "AI Analysis" }]} />

        <div className="flex items-center gap-3 mt-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 text-brand-500 shadow-premium">
            <BrainCircuit size={24} />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
              AI Analysis
            </h1>

            <p className="text-sm text-ink-900/60 dark:text-white/60">
              Every completed debate with a full AI-generated breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card border border-rose-300/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No completed debates yet"
          description="Finish a debate session to see its AI analysis here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <Link
              key={d.id}
              to={`/learner/analysis/${d.id}`}
              className="
                group
                glass-card
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-brand-500/10
                bg-gradient-to-br
                from-brand-500/5
                via-purple-500/5
                to-transparent
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-brand-500/30
                hover:shadow-glass
              "
            >
              {/* Top */}
              <div className="flex items-center justify-between">
                <div
                  className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-brand-500
                  to-accent-500
                  text-white
                  shadow-lg
                "
                >
                  <BrainCircuit size={18} />
                </div>

                <Badge tone={RESULT_TONE[d.result] || "neutral"}>
                  {d.result}
                </Badge>
              </div>

              {/* Topic */}
              <div>
                <p
                  className="
                  line-clamp-2
                  text-base
                  font-semibold
                  text-ink-900
                  dark:text-white
                  group-hover:text-brand-500
                  transition
                "
                >
                  {d.topic}
                </p>
              </div>

              {/* Meta */}
              <div
                className="
                flex
                items-center
                justify-between
                rounded-xl
                bg-black/[0.03]
                px-3
                py-2
                text-xs
                text-ink-900/50
                dark:bg-white/5
                dark:text-white/50
              "
              >
                <span>{d.format}</span>

                <span>{formatDate(d.date)}</span>
              </div>

              {/* Score */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-900/40 dark:text-white/40">
                    Score
                  </p>

                  <span
                    className="
                    font-data
                    text-2xl
                    font-bold
                    bg-gradient-to-r
                    from-brand-500
                    to-accent-500
                    bg-clip-text
                    text-transparent
                  "
                  >
                    {d.score != null ? `${d.score}/100` : "—"}
                  </span>
                </div>

                <span
                  className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-brand-500
                  group-hover:text-accent-500
                  transition
                "
                >
                  View analysis
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
