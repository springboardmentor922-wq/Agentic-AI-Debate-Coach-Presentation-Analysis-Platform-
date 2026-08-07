import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachEvaluationQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);

    api
      .get("/coach/review-queue", {
        params: {
          status: "pending",
        },
      })
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const claim = async (id) => {
    setClaimingId(id);

    try {
      await api.post(`/coach/review/${id}/claim`);
      navigate(`/coach/review/${id}`);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Inbox size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            AI Evaluation Queue
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            {items.length} debate(s) waiting for coach review.
          </p>
        </div>
      </div>

      {/* Queue */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Queue is empty"
            description="Nothing is waiting for review right now — nice work staying on top of it."
          />
        ) : (
          <div className="flex flex-col divide-y divide-black/10 dark:divide-brand-500/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">
                    {item.learner_name}
                  </p>

                  <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
                    {item.topic} • AI Score{" "}
                    <span className="font-semibold text-brand-500 dark:text-brand-300">
                      {item.ai_overall_score ?? "—"}
                    </span>
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => claim(item.id)}
                  disabled={claimingId === item.id}
                  className="shadow-premium"
                >
                  {claimingId === item.id && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
