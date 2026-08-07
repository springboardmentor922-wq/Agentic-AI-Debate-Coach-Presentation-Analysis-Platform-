import { useEffect, useState } from "react";
import { Presentation, Download, Loader2, ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api, { mediaAudioUrl } from "../../api/axios";

export default function EducatorPresentationReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api
      .get("/educator/presentation-reports")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (sessionId) => {
    if (!sessionId) return;

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
    } catch {
      // ignore
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Presentation size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Presentation Reports
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real presentation analyses across all learners.
          </p>
        </div>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Presentation}
            title="No presentations analyzed yet"
            description="Presentation recordings will appear here once learners submit them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-widest text-gray-500 dark:border-brand-500/20 dark:text-white/50">
                  <th className="py-3 pl-2">Learner</th>
                  <th className="py-3">Topic</th>
                  <th className="py-3">Overall Score</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Recording</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 pr-2"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => (
                  <Fragment key={p.id}>
                    <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-brand-500/10 dark:hover:bg-brand-500/5">
                      <td className="py-3 pl-2 font-medium text-gray-900 dark:text-white">
                        {p.learner_name || "—"}
                      </td>

                      <td className="py-3 text-gray-900 dark:text-white">
                        {p.topic || "—"}
                      </td>

                      <td className="py-3 font-data font-bold text-brand-600 dark:text-brand-300">
                        {p.presentation_score?.overall_score ?? "—"}/100
                      </td>

                      <td className="py-3 text-gray-600 dark:text-white/70">
                        {p.speech_metrics?.duration_seconds
                          ? `${Math.round(p.speech_metrics.duration_seconds)}s`
                          : "—"}
                      </td>

                      <td className="py-3">
                        {p.audio_filename ? (
                          <audio
                            controls
                            src={mediaAudioUrl(p.id)}
                            className="h-8 max-w-[200px]"
                          />
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-white/40">
                            No audio retained
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-gray-600 dark:text-white/60">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-1">
                          {p.transcript && (
                            <button
                              onClick={() =>
                                setExpanded(expanded === p.id ? null : p.id)
                              }
                              className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600 dark:text-white/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                              title="View transcript"
                            >
                              <ChevronDown
                                size={14}
                                className={`transition ${
                                  expanded === p.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}

                          {p.session_id && (
                            <button
                              onClick={() => downloadPdf(p.session_id)}
                              disabled={downloadingId === p.session_id}
                              className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600 dark:text-white/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                              title="Download PDF report"
                            >
                              {downloadingId === p.session_id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expanded === p.id && p.transcript && (
                      <tr className="border-b border-gray-200 dark:border-brand-500/10">
                        <td
                          colSpan={7}
                          className="bg-gray-50 px-4 py-4 text-sm text-gray-700 dark:bg-gradient-to-r dark:from-brand-600/10 dark:to-accent-500/10 dark:text-white/70"
                        >
                          {p.transcript}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
