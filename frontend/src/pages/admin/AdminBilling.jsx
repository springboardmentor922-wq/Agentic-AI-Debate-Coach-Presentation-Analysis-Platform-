import { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const PLAN_META = {
  free: {
    label: "Free",
    desc: "Core debate practice and AI feedback.",
  },
  pro: {
    label: "Pro",
    desc: "Adds presentation analytics and priority coaching.",
  },
  enterprise: {
    label: "Enterprise",
    desc: "For institutions — bulk seats, class analytics, dedicated support.",
  },
};

export default function AdminBilling() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("pro");
  const [status, setStatus] = useState(null);
  const [working, setWorking] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/admin/plans/summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const assignPlan = async () => {
    if (!email.trim()) return;

    setWorking(true);
    setStatus(null);

    try {
      const { data: users } = await api.get("/admin/users", {
        params: {
          search: email,
        },
      });

      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (!match) {
        setStatus({
          ok: false,
          msg: "No user found with that exact email.",
        });
        return;
      }

      await api.patch(`/admin/users/${match.id}/plan`, {
        plan,
      });

      setStatus({
        ok: true,
        msg: `${match.full_name} moved to the ${PLAN_META[plan].label} plan.`,
      });

      load();
    } catch (e) {
      setStatus({
        ok: false,
        msg: e?.response?.data?.detail || "Could not update plan.",
      });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <CreditCard size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Subscriptions & Billing
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            No payment processor is connected in this build — this shows real
            plan-tier assignments only, not fabricated revenue.
          </p>
        </div>
      </div>

      {/* Plan Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          : Object.entries(PLAN_META).map(([key, meta]) => (
              <Card
                key={key}
                className="border border-gray-200 bg-white transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {meta.label} Plan
                </p>

                <p className="mt-4 bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-4xl font-bold text-transparent">
                  {summary?.[key] ?? 0}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-white/60">
                  {meta.desc}
                </p>
              </Card>
            ))}
      </div>

      {/* Assign Plan */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
          Assign a Plan
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              User Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              Plan
            </label>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="input-field"
            >
              {Object.entries(PLAN_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={assignPlan}
            disabled={working || !email.trim()}
            className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
          >
            {working ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            Assign Plan
          </Button>
        </div>

        {status && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 ${
              status.ok
                ? "border-verdict-500/30 bg-verdict-500/10 text-verdict-600 dark:text-verdict-300"
                : "border-alert-500/30 bg-alert-500/10 text-alert-600 dark:text-alert-300"
            }`}
          >
            {status.msg}
          </div>
        )}
      </Card>
    </div>
  );
}
