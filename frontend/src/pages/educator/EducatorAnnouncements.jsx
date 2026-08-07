import { useEffect, useState } from "react";
import { Megaphone, Send, Loader2, CheckCircle2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/educator/announcements")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const { data } = await api.post("/educator/announcements", {
        title,
        message,
      });

      setResult({
        ok: true,
        msg: `Sent to ${data.recipient_count} learner(s).`,
      });

      setTitle("");
      setMessage("");

      load();
    } catch (e) {
      setResult({
        ok: false,
        msg: e?.response?.data?.detail || "Could not send announcement.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl page-fade">
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Megaphone size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Announcements
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Real class-wide announcements, delivered to every learner's
            notification bell.
          </p>
        </div>
      </div>

      {/* Create Announcement */}

      <Card className="mb-6 border border-brand-500/20 bg-gradient-to-br from-brand-900/10 to-accent-900/10">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New Debate Topic Added"
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              Message
            </label>

            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Should social media be regulated? is now available to practice."
              className="input-field resize-none"
            />
          </div>

          <Button
            onClick={send}
            disabled={sending || !title.trim() || !message.trim()}
            className="self-end"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send Announcement
          </Button>

          {result && (
            <p
              className={`text-sm font-medium ${
                result.ok ? "text-brand-400" : "text-alert-500"
              }`}
            >
              {result.ok && <CheckCircle2 size={14} className="mr-1 inline" />}

              {result.msg}
            </p>
          )}
        </div>
      </Card>

      {/* List */}

      {loading ? (
        <SkeletonCard />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements sent yet"
          description="Announcements you send will be listed here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((a) => (
            <Card
              key={a.id}
              padding="sm"
              className="border border-brand-500/20 bg-gradient-to-br from-brand-900/10 to-accent-900/10 transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium"
            >
              <p className="text-lg font-semibold text-white">{a.title}</p>

              <p className="mt-2 text-sm text-white/70">{a.message}</p>

              <p className="mt-3 text-xs text-brand-300">
                Sent to {a.recipient_count} learner(s) ·{" "}
                {new Date(a.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
