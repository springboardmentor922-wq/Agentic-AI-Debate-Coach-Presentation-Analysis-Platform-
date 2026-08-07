import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SettingsIcon,
  Moon,
  Sun,
  KeyRound,
  LogOut,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function CoachSettings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendResetEmail = async () => {
    if (!user?.email) return;

    setSending(true);

    try {
      await api.post("/auth/password/forgot", {
        email: user.email,
      });

      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/coach/login");
  };

  return (
    <div className="mx-auto max-w-2xl page-fade">
      {/* Header */}

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <SettingsIcon size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Settings
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Manage your account, appearance, and security.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Account */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
            Account
          </p>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-button-gradient shadow-premium">
              <UserCircle2 size={28} className="text-white" />
            </div>

            <div>
              <p className="font-semibold text-ink-900 dark:text-white">
                {user?.full_name}
              </p>

              <p className="text-sm text-gray-600 dark:text-white/50">
                {user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Appearance */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
            Appearance
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                Theme
              </p>

              <p className="text-xs text-gray-600 dark:text-white/50">
                Switch between light and dark mode
              </p>
            </div>

            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}

              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </Card>

        {/* Security */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-white/40">
            Security
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                Password
              </p>

              <p className="text-xs text-gray-600 dark:text-white/50">
                {sent
                  ? "Check your email for a reset link."
                  : "Send a secure reset link to your email."}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={sendResetEmail}
              disabled={sending || sent}
            >
              {sent ? <CheckCircle2 size={14} /> : <KeyRound size={14} />}

              {sent ? "Sent" : "Reset Password"}
            </Button>
          </div>
        </Card>

        {/* Logout */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                Log Out
              </p>

              <p className="text-xs text-gray-600 dark:text-white/50">
                Sign out of your account on this device.
              </p>
            </div>

            <Button variant="danger" size="sm" onClick={handleLogout}>
              <LogOut size={14} />
              Log Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
