import { useEffect, useState } from "react";
import { Library } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorResourceLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/learning-materials")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Library size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Resource Library
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            The same real learning materials library learners see — for you to
            reference or share.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No resources yet"
          description="Learning materials will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border border-brand-500/20 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-premium dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
            >
              <Badge tone="brand">{item.type}</Badge>

              <p className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">
                {item.title}
              </p>

              <p className="mt-2 text-sm text-ink-900/60 dark:text-white/60">
                {item.level}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-brand-500/30 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
