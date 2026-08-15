import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then(({ data }) => setForm(data))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const { data } = await api.put("/admin/settings", {
        site_name: form.site_name,
        support_email: form.support_email,
        maintenance_mode: form.maintenance_mode,
        allow_public_registration: form.allow_public_registration,
      });

      setForm(data);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <SkeletonCard />;
  }

  return (
    <div className="mx-auto max-w-2xl page-fade">
      {/* =========================
          HEADER
      ========================== */}

      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <SettingsIcon size={24} className="text-white" />
        </div>

        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real, persisted platform configuration — every change here takes
            effect immediately.
          </p>
        </div>
      </div>

      {/* =========================
          SETTINGS CARD
      ========================== */}

      <Card
        className="
          border border-gray-200
          bg-white
          shadow-glass
          dark:border-brand-500/20
          dark:bg-[#10121c]
        "
      >
        <div className="flex flex-col gap-5">
          {/* =========================
              SITE NAME
          ========================== */}

          <Input
            label="Site Name"
            value={form.site_name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                site_name: e.target.value,
              }))
            }
          />

          {/* =========================
              SUPPORT EMAIL
          ========================== */}

          <Input
            label="Support Email"
            value={form.support_email}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                support_email: e.target.value,
              }))
            }
          />

          {/* =========================
              MAINTENANCE MODE
          ========================== */}

          <div
            className="
              flex items-center justify-between gap-4
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              px-5
              py-4
              transition-all
              dark:border-brand-500/20
              dark:bg-[#17192a]
              dark:hover:border-brand-500/30
            "
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Maintenance Mode
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-white/60">
                Shows a maintenance notice instead of the app to non-admins.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  maintenance_mode: !f.maintenance_mode,
                }))
              }
              aria-label="Toggle maintenance mode"
              aria-pressed={form.maintenance_mode}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
                form.maintenance_mode
                  ? "bg-gradient-to-r from-alert-500 to-alert-600 shadow-lg shadow-alert-500/20"
                  : "bg-gray-300 dark:bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  form.maintenance_mode ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* =========================
              PUBLIC REGISTRATION
          ========================== */}

          <div
            className="
              flex items-center justify-between gap-4
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              px-5
              py-4
              transition-all
              dark:border-brand-500/20
              dark:bg-[#17192a]
              dark:hover:border-brand-500/30
            "
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Allow Public Registration
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-white/60">
                New learners can self-register from the public site.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  allow_public_registration: !f.allow_public_registration,
                }))
              }
              aria-label="Toggle public registration"
              aria-pressed={form.allow_public_registration}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
                form.allow_public_registration
                  ? "bg-gradient-to-r from-brand-600 to-accent-500 shadow-lg shadow-brand-500/20"
                  : "bg-gray-300 dark:bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  form.allow_public_registration ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* =========================
              FOOTER
          ========================== */}

          <div
            className="
              flex flex-col gap-4
              border-t
              border-gray-200
              pt-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              dark:border-white/10
            "
          >
            <p className="text-xs text-gray-500 dark:text-white/40">
              Last updated{" "}
              <span className="font-medium text-gray-700 dark:text-white/60">
                {new Date(form.updated_at).toLocaleString()}
              </span>
            </p>

            <Button
              onClick={save}
              disabled={saving}
              className="
                bg-gradient-to-r
                from-brand-600
                to-accent-500
                text-white
                shadow-premium
                transition-all
                hover:scale-105
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={15} />
              ) : (
                <Save size={15} />
              )}

              {saved ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
