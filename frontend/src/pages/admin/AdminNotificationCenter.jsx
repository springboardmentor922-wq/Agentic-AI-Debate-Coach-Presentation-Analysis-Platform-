import { useState } from "react";
import { BellRing, Send, Loader2, CheckCircle2 } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../api/axios";

export default function AdminNotificationCenter() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const { data } = await api.post("/admin/notifications/broadcast", {
        title,
        message,
        target_role: targetRole || null,
      });

      setResult({
        ok: true,
        msg: data.message,
      });

      setTitle("");
      setMessage("");
    } catch (e) {
      setResult({
        ok: false,
        msg: e?.response?.data?.detail || "Could not send notification.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl page-fade">
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
          <BellRing size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Notification Center
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            Broadcast real notifications to users across the platform.
          </p>
        </div>
      </div>

      {/* Form */}

      <Card className="border border-gray-200 bg-white shadow-glass dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <div className="flex flex-col gap-5">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Platform Update"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Message
            </label>

            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We've launched new AI coaching features..."
              className="input-field resize-none border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-brand-500 dark:border-brand-500/20 dark:bg-brand-900/10 dark:text-white dark:placeholder:text-white/35"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Send To
            </label>

            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input-field border border-gray-300 bg-white text-gray-900 dark:border-brand-500/20 dark:bg-brand-900/10 dark:text-white"
            >
              <option value="">Everyone</option>
              <option value="learner">Learners only</option>
              <option value="debate_coach">Debate Coaches only</option>
              <option value="educator">Educators only</option>
              <option value="administrator">Administrators only</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={send}
              disabled={sending || !title.trim() || !message.trim()}
              className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Send Notification
            </Button>
          </div>

          {result && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                result.ok
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300"
                  : "border-alert-500/30 bg-alert-500/10 text-alert-600 dark:text-alert-300"
              }`}
            >
              {result.ok && <CheckCircle2 size={15} className="mr-2 inline" />}
              {result.msg}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
