import { useEffect, useState } from "react";
import { FileBarChart2, Download } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api
      .get("/admin/backup/collections-summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  const exportReport = async () => {
    setExporting(true);

    try {
      const { data } = await api.get("/admin/backup/export");

      downloadJson(
        data,
        `platform-report-${new Date().toISOString().slice(0, 10)}.json`,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <FileBarChart2 size={26} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Logs
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
              Real record counts across the platform, exportable on demand.
            </p>
          </div>
        </div>

        <Button
          onClick={exportReport}
          disabled={exporting}
          size="sm"
          className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
        >
          <Download size={16} />
          Export Platform Report
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Object.entries(summary || {})
            .filter(([key]) => key !== "generated_at")
            .map(([key, value]) => (
              <Card
                key={key}
                className="border border-gray-200 bg-white transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <p className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text font-data text-4xl font-bold text-transparent">
                  {value}
                </p>

                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                  {key.replace(/_/g, " ")}
                </p>
              </Card>
            ))}
        </div>
      )}

      {summary?.generated_at && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-brand-500/20 dark:bg-gradient-to-r dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="text-xs text-gray-600 dark:text-white/60">
            Generated on{" "}
            <span className="font-semibold text-brand-600 dark:text-brand-300">
              {new Date(summary.generated_at).toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
