import { useEffect, useState } from "react";
import { DatabaseBackup, Download, Loader2 } from "lucide-react";
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

export default function AdminBackup() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api
      .get("/admin/backup/collections-summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  const runExport = async () => {
    setExporting(true);

    try {
      const { data } = await api.get("/admin/backup/export");

      downloadJson(
        data,
        `manual-backup-${new Date().toISOString().slice(0, 10)}.json`,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <DatabaseBackup size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Backup & Recovery
          </h1>

          <p className="max-w-3xl text-sm text-gray-600 dark:text-white/60">
            No automated cloud backup pipeline is part of this build — this is
            an honest, on-demand manual export of core collections (users,
            debate topics), not a simulated backup widget.
          </p>
        </div>
      </div>

      {/* Stats */}

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
                className="border border-gray-200 bg-white shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <p className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text font-data text-4xl font-bold text-transparent">
                  {value}
                </p>

                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-gray-600 dark:text-white/55">
                  {key.replace(/_/g, " ")} records
                </p>
              </Card>
            ))}
        </div>
      )}

      {/* Export */}

      <Card className="border border-gray-200 bg-white shadow-glass dark:border-brand-500/20 dark:bg-gradient-to-r dark:from-brand-900/10 dark:to-accent-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Manual Data Export
            </p>

            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
              Downloads a real JSON snapshot of users and debate topics from the
              database at this moment.
            </p>
          </div>

          <Button
            onClick={runExport}
            disabled={exporting}
            className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
          >
            {exporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            Export Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
