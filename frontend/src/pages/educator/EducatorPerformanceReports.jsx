import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

export default function EducatorPerformanceReports() {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);

    try {
      const { data } = await api.get("/educator/reports/export", {
        responseType: "blob",
      });

      const url = URL.createObjectURL(
        new Blob([data], {
          type: "text/csv",
        }),
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `classroom-performance-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl page-fade">
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <FileText size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Performance Reports
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Export a real CSV of every learner's performance data.
          </p>
        </div>
      </div>

      {/* Report Card */}

      <Card className="border border-brand-500/20 bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-ink-900 dark:text-white">
              Classroom Performance Report
            </p>

            <p className="mt-2 text-sm leading-6 text-ink-900/60 dark:text-white/60">
              CSV containing learner names, completed debate sessions, average
              scores, and classroom performance metrics.
            </p>
          </div>

          <Button
            onClick={download}
            disabled={downloading}
            className="shadow-premium"
          >
            {downloading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            Export CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}
