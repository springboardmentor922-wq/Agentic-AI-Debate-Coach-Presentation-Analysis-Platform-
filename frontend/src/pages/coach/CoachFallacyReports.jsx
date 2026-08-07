import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const SEVERITY_TONE = {
  low: "warning",
  medium: "warning",
  high: "danger",
};

export default function CoachFallacyReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/coach/fallacy-reports")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div
          className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl

          bg-gradient-to-br
          from-purple-600
          via-indigo-600
          to-blue-600

          text-white

          shadow-lg
          shadow-purple-500/30
          "
        >
          <AlertTriangle size={26} />
        </div>

        <div>
          <h1
            className="
            font-display
            text-3xl
            font-bold

            text-ink-900
            dark:text-white
            "
          >
            Fallacy Reports
          </h1>

          <p
            className="
            mt-1
            text-sm

            text-ink-900/60
            dark:text-white/60
            "
          >
            Real logical fallacies detected across your roster.
          </p>
        </div>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="
        border

        border-purple-500/20

        bg-white

        shadow-xl

        dark:bg-gradient-to-br
        dark:from-purple-900/20
        dark:via-indigo-900/20
        dark:to-blue-900/20

        dark:backdrop-blur-xl

        "
      >
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No fallacies detected"
            description="Your roster's reasoning has stayed clean — no fallacies found yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="
                  border-b

                  border-purple-500/20

                  text-xs
                  uppercase
                  tracking-widest

                  text-purple-600

                  dark:text-purple-300
                  "
                >
                  <th className="py-3 pl-3">Fallacy Type</th>

                  <th className="py-3">Severity</th>

                  <th className="py-3">Explanation</th>

                  <th className="py-3 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {items.map((f) => (
                  <tr
                    key={f.id}
                    className="
                    border-b

                    border-black/5

                    transition-all
                    duration-300

                    hover:bg-purple-500/5

                    dark:border-purple-500/10

                    dark:hover:bg-purple-500/10

                    last:border-0
                    "
                  >
                    <td
                      className="
                      py-3
                      pl-3

                      font-semibold

                      text-ink-900

                      dark:text-white
                      "
                    >
                      {f.fallacy_type}
                    </td>

                    <td className="py-3">
                      <Badge tone={SEVERITY_TONE[f.severity] || "warning"}>
                        {f.severity}
                      </Badge>
                    </td>

                    <td
                      className="
                      py-3

                      text-ink-900/70

                      dark:text-white/70
                      "
                    >
                      {f.explanation}
                    </td>

                    <td
                      className="
                      py-3
                      pr-3

                      text-ink-900/50

                      dark:text-white/50
                      "
                    >
                      {f.created_at
                        ? new Date(f.created_at).toLocaleDateString()
                        : "—"}
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
