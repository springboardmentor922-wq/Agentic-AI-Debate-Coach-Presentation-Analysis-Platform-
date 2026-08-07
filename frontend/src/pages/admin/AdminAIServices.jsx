import { useEffect, useState } from "react";
import { Cpu, CheckCircle2, XCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function AdminAIServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/ai-services")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <Cpu size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            AI Models & Services
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            Real configuration status for every AI provider in the pipeline — no
            simulated uptime percentages.
          </p>
        </div>
      </div>

      {/* Services */}

      <div className="flex flex-col gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Card
                key={item.provider}
                className="flex items-center justify-between gap-4 border border-gray-200 bg-white transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.provider}
                  </p>

                  <Badge
                    tone={item.role === "primary" ? "brand" : "neutral"}
                    className="mt-2"
                  >
                    {item.role}
                  </Badge>
                </div>

                {item.configured ? (
                  <span className="flex items-center gap-2 rounded-full border border-verdict-400/30 bg-verdict-500/10 px-4 py-2 text-sm font-semibold text-verdict-600 dark:text-verdict-300">
                    <CheckCircle2 size={16} />
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-alert-400/20 bg-alert-500/10 px-4 py-2 text-sm font-semibold text-alert-600 dark:text-alert-300">
                    <XCircle size={16} />
                    No API Key
                  </span>
                )}
              </Card>
            ))}
      </div>

      {/* Information */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/25 dark:bg-gradient-to-r dark:from-brand-900/10 dark:to-accent-900/10">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-accent-500">
            <Cpu size={18} className="text-white" />
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              AI Service Pipeline
            </h3>

            <p className="text-sm leading-7 text-gray-600 dark:text-white/70">
              Every AI feature on the platform (argument analysis, fallacy
              detection, coaching, and chatbot) first attempts the primary AI
              provider, then switches to the configured fallback provider if
              needed, and finally uses the deterministic rule-based engine if
              both AI providers are unavailable. This ensures the platform
              always returns a response instead of failing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
