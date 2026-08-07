import { useEffect, useState } from "react";
import { FileBarChart2, Download, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api
      .get("/coach/reports")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (sessionId) => {
    setDownloadingId(sessionId);

    try {
      const res = await api.get(`/reports/${sessionId}/pdf`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `debate_report_${sessionId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <FileBarChart2 size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Reports
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Real debate feedback reports generated for your roster.
          </p>
        </div>
      </div>

      {/* Reports */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileBarChart2}
            title="No reports yet"
            description="Reports appear the moment a learner on your roster finishes a debate."
          />
        ) : (
          <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {items.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl px-3 py-4 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900 dark:text-white">
                    {r.final_summary}
                  </p>

                  <p className="mt-1 text-xs text-ink-900/50 dark:text-white/50">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>

                <p className="font-data text-xl font-bold text-brand-500">
                  {r.overall_rating}/10
                </p>

                <button
                  onClick={() => downloadPdf(r.session_id)}
                  disabled={downloadingId === r.session_id}
                  title="Download PDF report"
                  className="rounded-xl p-2 text-ink-900/50 transition-all duration-300 hover:bg-gray-100 hover:text-brand-500 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingId === r.session_id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
