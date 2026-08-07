import { useEffect, useState } from "react";
import { NotebookPen, CalendarClock } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const SOURCE_LABELS = {
  ai_analysis: "AI Analysis",
  coach_review: "Coach Review",
  educator_review: "Educator Review",
  combined: "Coach + Educator",
};

export default function CoachCoachingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: roster } = await api.get("/coach/assigned-learners");

        const results = await Promise.all(
          roster.map(async (learner) => {
            try {
              const { data } = await api.get("/coaching-plans", {
                params: {
                  learner_id: learner.learner_id,
                },
              });

              const latest = data?.[0];

              return latest
                ? {
                    ...latest,
                    learner_name: learner.learner_name,
                  }
                : null;
            } catch {
              return null;
            }
          }),
        );

        setPlans(results.filter(Boolean));
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <NotebookPen size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Coaching Plans
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Real, trackable plans generated from AI analysis and your reviews —
            weekly exercises, deadlines, and live completion status.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No coaching plans yet"
          description="Plans generate automatically once a learner has AI analysis or you submit a review."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {plans.map((plan) => {
            const nextDue = plan.weeks
              ?.flatMap((w) =>
                w.exercises.filter((exercise) => !exercise.completed),
              )
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

            return (
              <Card
                key={plan.id}
                className="border border-black/10 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10 dark:hover:border-brand-400/40 dark:hover:shadow-premium"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-ink-900 dark:text-white">
                    {plan.learner_name}
                  </p>

                  <Badge
                    tone={plan.status === "completed" ? "success" : "brand"}
                  >
                    {plan.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                <p className="mb-3 text-xs uppercase tracking-wider text-ink-900/50 dark:text-brand-300">
                  Source: {SOURCE_LABELS[plan.source] || plan.source}
                </p>

                <ProgressBar
                  value={plan.completion_percent}
                  size="sm"
                  label="Completion"
                />

                <p className="mt-4 text-sm leading-6 text-ink-900/70 dark:text-white/70">
                  {plan.summary}
                </p>

                {nextDue && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 bg-gray-50 px-3 py-2 dark:border-brand-500/20 dark:bg-brand-900/10">
                    <CalendarClock size={14} className="text-brand-500" />

                    <span className="text-xs text-ink-900/70 dark:text-white/70">
                      <span className="font-semibold">Next Due:</span>{" "}
                      {nextDue.title} •{" "}
                      {new Date(nextDue.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
