import { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Ban,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const ROLE_TONE = {
  learner: "brand",
  debate_coach: "warm",
  educator: "success",
  administrator: "danger",
};

const EMPTY_FORM = {
  full_name: "",
  email: "",
  password: "",
  role: "debate_coach",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/admin/users", {
        params: {
          role: roleFilter || undefined,
          search: search || undefined,
        },
      });

      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const toggleActive = async (u) => {
    const endpoint = u.is_active ? "deactivate" : "activate";

    await api.patch(`/users/${u.id}/${endpoint}`);

    setUsers((prev) =>
      prev.map((x) =>
        x.id === u.id
          ? {
              ...x,
              is_active: !u.is_active,
            }
          : x,
      ),
    );
  };

  const createUser = async () => {
    setSaving(true);
    setError(null);

    try {
      await api.post("/admin/users", form);

      setShowCreate(false);
      setForm(EMPTY_FORM);

      load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <Users size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
              User Management
            </h1>

            <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
              {users.length} user(s) shown
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium hover:scale-105 transition-all"
        >
          <UserPlus size={16} />
          Create Account
        </Button>
      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 dark:text-brand-300"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="debate_coach">Debate Coach</option>
          <option value="educator">Educator</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>

      {/* Create User */}

      {showCreate && (
        <Card className="border border-brand-500/30 bg-white dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-ink-900 dark:text-white">
              Create Coach / Educator / Admin Account
            </p>

            <button onClick={() => setShowCreate(false)}>
              <X
                className="text-ink-900/50 hover:text-brand-500 dark:text-white/60 dark:hover:text-brand-300"
                size={18}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  full_name: e.target.value,
                }))
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  email: e.target.value,
                }))
              }
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  password: e.target.value,
                }))
              }
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                Role
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="debate_coach">Debate Coach</option>
                <option value="educator">Educator</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm font-semibold text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              onClick={createUser}
              disabled={
                saving ||
                !form.full_name ||
                !form.email ||
                form.password.length < 6
              }
              className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Create Account
            </Button>
          </div>
        </Card>
      )}

      {/* Table */}

      <Card
        padding="sm"
        className="border border-brand-500/20 bg-white dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 uppercase tracking-wider text-brand-600 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-2">Name</th>

                  <th>Email</th>

                  <th>Role</th>

                  <th>Status</th>

                  <th className="pr-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 transition hover:bg-gray-50 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-2 font-medium text-ink-900 dark:text-white">
                      {u.full_name}
                    </td>

                    <td className="text-ink-900/70 dark:text-white/70">
                      {u.email}
                    </td>

                    <td>
                      <Badge tone={ROLE_TONE[u.role] || "neutral"}>
                        {u.role.replace("_", " ")}
                      </Badge>
                    </td>

                    <td>
                      <Badge tone={u.is_active ? "success" : "danger"}>
                        {u.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                          u.is_active
                            ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            : "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        }`}
                      >
                        {u.is_active ? (
                          <Ban size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}

                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-gray-500 dark:text-white/50"
                    >
                      No users match this search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
