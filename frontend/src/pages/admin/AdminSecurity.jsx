import { useEffect, useState } from "react";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function AdminSecurity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/security/overview")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <Lock size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Security & Compliance
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real, derivable security posture. Note: JWT auth is stateless, so
            there's no server-side session store to audit.
          </p>
        </div>
      </div>

      {/* Stat Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Email-Verified Users"
          value={data.email_verified_users}
          tone="brand"
        />

        <StatCard
          icon={ShieldAlert}
          label="Unverified Users"
          value={data.unverified_users}
          tone="alert"
        />

        <StatCard
          icon={Lock}
          label="Deactivated Accounts"
          value={data.deactivated_users}
          tone="brand"
        />

        <StatCard
          icon={ShieldCheck}
          label="Administrator Accounts"
          value={data.administrator_count}
          tone="brand"
        />
      </div>

      {/* Password Policy */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
          Password Policy
        </p>

        <p className="text-sm text-gray-900 dark:text-white">
          {data.password_policy}
        </p>
      </Card>

      {/* Authentication */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
          Authentication Mechanism
        </p>

        <p className="text-sm text-gray-900 dark:text-white">
          {data.auth_mechanism}
        </p>
      </Card>

      {/* Recent Actions */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Security-Relevant Actions
        </p>

        {data.recent_security_relevant_actions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/50">
            No recent security-relevant admin actions.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.recent_security_relevant_actions.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 hover:border-brand-400/50 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-r dark:from-brand-600/10 dark:to-accent-500/10"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {log.action.replace(/_/g, " ")}
                </span>

                <span className="text-gray-600 dark:text-white/60">
                  {" "}
                  by {log.actor_name} ·{" "}
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
