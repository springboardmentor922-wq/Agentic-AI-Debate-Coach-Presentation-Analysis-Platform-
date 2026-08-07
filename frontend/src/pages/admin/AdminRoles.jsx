import { useEffect, useState } from "react";
import {
  ShieldCheck,
  GraduationCap,
  Users,
  School,
  Crown,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const ROLE_META = {
  learner: {
    label: "Learner",
    icon: GraduationCap,
    toneClass:
      "bg-gradient-to-r from-brand-600/20 to-accent-500/20 text-brand-300",
    desc: "Practices debates, gets AI feedback, tracks personal progress.",
  },
  debate_coach: {
    label: "Debate Coach",
    icon: Users,
    toneClass:
      "bg-gradient-to-r from-accent-500/20 to-brand-500/20 text-accent-300",
    desc: "Reviews learner debates, gives coaching, tracks skill gaps.",
  },
  educator: {
    label: "Educator",
    icon: School,
    toneClass:
      "bg-gradient-to-r from-brand-700/20 to-accent-600/20 text-brand-300",
    desc: "Manages classes, assigns topics, reviews class-wide analytics.",
  },
  administrator: {
    label: "Administrator",
    icon: Crown,
    toneClass:
      "bg-gradient-to-r from-brand-600/20 to-brand-400/20 text-brand-300",
    desc: "Full platform access: users, content, system settings, security.",
  },
};

export default function AdminRoles() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailToChange, setEmailToChange] = useState("");
  const [newRole, setNewRole] = useState("debate_coach");
  const [status, setStatus] = useState(null);
  const [working, setWorking] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/admin/roles/summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeRole = async () => {
    if (!emailToChange.trim()) return;

    setWorking(true);
    setStatus(null);

    try {
      const { data: users } = await api.get("/admin/users", {
        params: {
          search: emailToChange,
        },
      });

      const match = users.find(
        (u) => u.email.toLowerCase() === emailToChange.trim().toLowerCase(),
      );

      if (!match) {
        setStatus({
          ok: false,
          msg: "No user found with that exact email.",
        });
        return;
      }

      await api.patch(`/admin/users/${match.id}/role`, {
        role: newRole,
      });

      setStatus({
        ok: true,
        msg: `${match.full_name}'s role updated to ${ROLE_META[newRole].label}.`,
      });

      load();
    } catch (e) {
      setStatus({
        ok: false,
        msg: e?.response?.data?.detail || "Could not update role.",
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
          <ShieldCheck size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Role & Permissions
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real per-role headcounts and role reassignment.
          </p>
        </div>
      </div>

      {/* Role Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : Object.entries(ROLE_META).map(([role, meta]) => (
              <Card
                key={role}
                className="border border-gray-200 bg-white transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${meta.toneClass}`}
                  >
                    <meta.icon size={20} />
                  </div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {meta.label}
                  </p>
                </div>

                <p className="mt-5 bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-4xl font-bold text-transparent">
                  {summary?.[role] ?? 0}
                </p>

                <p className="mt-2 text-xs text-gray-600 dark:text-white/60">
                  {meta.desc}
                </p>
              </Card>
            ))}
      </div>

      {/* Change Role */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Change User Role
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              User Email
            </label>

            <input
              value={emailToChange}
              onChange={(e) => setEmailToChange(e.target.value)}
              placeholder="user@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              New Role
            </label>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="input-field"
            >
              {Object.entries(ROLE_META).map(([role, meta]) => (
                <option key={role} value={role}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={changeRole}
            disabled={working || !emailToChange.trim()}
            className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
          >
            {working ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            Update Role
          </Button>
        </div>

        {status && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 ${
              status.ok
                ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
            }`}
          >
            {status.msg}
          </div>
        )}
      </Card>
    </div>
  );
}
