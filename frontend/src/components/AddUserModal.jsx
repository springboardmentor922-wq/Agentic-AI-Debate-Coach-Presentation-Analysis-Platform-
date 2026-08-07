import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import api from "../api/axios";

const ROLES = [
  { value: "learner", label: "Learner" },
  { value: "debate_coach", label: "Debate Coach" },
  { value: "educator", label: "Educator" },
  { value: "administrator", label: "Administrator" },
];

export default function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "debate_coach",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/users", form);
      onCreated?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not create the account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-blue-500/20
          bg-white
          p-6
          shadow-2xl

          dark:border-violet-400/20
          dark:bg-ink-900
        "
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-500
                to-violet-500
                text-white
              "
            >
              <UserPlus size={18} />
            </div>

            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">
              Add User
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-lg
              p-1.5
              text-ink-900/40
              transition
              hover:bg-blue-500/10
              hover:text-blue-600

              dark:text-white/40
              dark:hover:bg-white/10
              dark:hover:text-blue-300
            "
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-xs text-ink-900/50 dark:text-white/50">
          Debate Coach, Educator, and Administrator accounts can only be created
          here by an administrator. Each account then signs in only through its
          own dedicated login portal.
        </p>

        {error && (
          <div
            className="
              mb-4
              rounded-xl
              border
              border-violet-500/20
              bg-violet-500/10
              px-4
              py-2.5
              text-sm
              text-violet-600

              dark:text-violet-300
            "
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">
              Full Name
            </label>

            <input
              required
              className="
                input-field
                focus:border-blue-500
                focus:ring-blue-500/20
              "
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">
              Email Address
            </label>

            <input
              type="email"
              required
              className="
                input-field
                focus:border-blue-500
                focus:ring-blue-500/20
              "
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">
              Temporary Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              className="
                input-field
                focus:border-indigo-500
                focus:ring-indigo-500/20
              "
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-900/60 dark:text-white/60">
              Role
            </label>

            <select
              className="
                input-field
                focus:border-violet-500
                focus:ring-violet-500/20
              "
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                btn-secondary
                hover:border-blue-500/40
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                via-indigo-600
                to-violet-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition
                hover:scale-[1.02]
                hover:from-blue-500
                hover:to-violet-500
                disabled:opacity-50
              "
            >
              {loading ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
