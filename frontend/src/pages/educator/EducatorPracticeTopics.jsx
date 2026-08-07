import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const DIFFICULTY_TONE = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export default function EducatorPracticeTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/educator/topics")
      .then(({ data }) => setTopics(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <ListTree size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Practice Topics
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Browse the same real topic library learners practice with — assign
            one from the Assignments page.
          </p>
        </div>
      </div>

      {/* Topics Table */}

      <Card
        padding="sm"
        className="border border-brand-500/20 bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : topics.length === 0 ? (
          <EmptyState
            icon={ListTree}
            title="No topics yet"
            description="Ask an administrator to add debate topics in Content Management."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-500/20 text-xs uppercase tracking-widest text-ink-900/50 dark:text-white/50">
                  <th className="py-3 pl-2">Title</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 pr-2">Difficulty</th>
                </tr>
              </thead>

              <tbody>
                {topics.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-brand-500/10 last:border-0 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors"
                  >
                    <td className="py-3 pl-2 font-medium text-ink-900 dark:text-white">
                      {t.title}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {t.category}
                    </td>

                    <td className="py-3 pr-2">
                      <Badge tone={DIFFICULTY_TONE[t.difficulty] || "neutral"}>
                        {t.difficulty}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
