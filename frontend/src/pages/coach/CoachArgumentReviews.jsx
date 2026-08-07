import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachArgumentReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/coach/review-queue")
      .then(({ data }) =>
        setItems(data.filter((r) => r.ai_overall_score != null)),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <BrainCircuit size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Argument Reviews
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            AI-scored arguments from your roster, ready for your review.
          </p>
        </div>
      </div>

      {/* Reviews List */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BrainCircuit}
            title="No scored arguments yet"
            description="AI-scored debates from your roster will appear here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/coach/review/${item.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-4 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-ink-900 dark:text-white">
                    {item.learner_name}
                  </p>

                  <p className="mt-1 truncate text-sm text-ink-900/60 dark:text-white/60">
                    {item.topic}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-data text-2xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                    {item.ai_overall_score}/100
                  </p>

                  <p className="text-xs uppercase tracking-widest text-ink-900/40 dark:text-white/40">
                    AI Score
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
