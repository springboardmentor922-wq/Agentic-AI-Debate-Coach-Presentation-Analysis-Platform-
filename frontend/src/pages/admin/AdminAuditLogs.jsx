import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    setLoading(true);

    api
      .get("/admin/audit-logs", {
        params: {
          action: actionFilter || undefined,
        },
      })
      .then(({ data }) => setLogs(data))
      .finally(() => setLoading(false));
  }, [actionFilter]);

  const actions = [
    "create_user",
    "update_role",
    "update_plan",
    "create_topic",
    "update_topic",
    "delete_topic",
    "broadcast_notification",
    "update_platform_settings",
    "export_core_data",
  ];

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <ScrollText size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Audit Logs
            </h1>

            <p className="text-sm text-gray-600 dark:text-white/60">
              Every sensitive admin action is permanently recorded for
              transparency.
            </p>
          </div>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="input-field w-auto border border-gray-300 bg-white text-gray-900 dark:border-brand-500/20 dark:bg-brand-900/10 dark:text-white"
        >
          <option value="">All Actions</option>

          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="border border-gray-200 bg-white shadow-glass dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={8} cols={4} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit entries yet"
            description="Actions like creating users, changing roles, exporting data and broadcasting notifications will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-[0.18em] text-brand-600 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-3">Action</th>

                  <th className="py-3">By</th>

                  <th className="py-3">Details</th>

                  <th className="py-3 pr-3">When</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-0 dark:border-white/5 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-3 font-semibold text-gray-900 dark:text-white">
                      {log.action.replace(/_/g, " ")}
                    </td>

                    <td className="py-3 text-gray-700 dark:text-white/75">
                      {log.actor_name}
                    </td>

                    <td className="max-w-md break-all py-3 text-gray-600 dark:text-white/55">
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap py-3 pr-3 text-gray-500 dark:text-white/45">
                      {new Date(log.created_at).toLocaleString()}
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
