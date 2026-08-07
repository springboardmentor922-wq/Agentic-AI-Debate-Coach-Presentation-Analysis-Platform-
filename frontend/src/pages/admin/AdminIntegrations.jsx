import { useEffect, useState } from "react";
import { Plug, CheckCircle2, XCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function AdminIntegrations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/integrations")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <Plug size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Integrations
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            Real status read from server configuration — not a marketplace of
            fake connectors.
          </p>
        </div>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Card
                key={item.name}
                className="flex items-start justify-between gap-4 border border-gray-200 bg-white shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                    {item.category}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-white/60">
                    {item.description}
                  </p>
                </div>

                {item.configured ? (
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-brand-600/20 to-accent-500/20 px-3 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-500/30 dark:text-brand-300">
                    <CheckCircle2 size={14} />
                    Configured
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-300 dark:bg-white/5 dark:text-white/60 dark:ring-white/10">
                    <XCircle size={14} />
                    Not set up
                  </span>
                )}
              </Card>
            ))}
      </div>
    </div>
  );
}
