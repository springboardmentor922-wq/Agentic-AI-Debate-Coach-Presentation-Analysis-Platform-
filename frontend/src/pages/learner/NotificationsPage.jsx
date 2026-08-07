import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api from "../../api/axios";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    await api.patch(`/notifications/${id}/read`);
  };

  const markAllRead = async () => {
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      })),
    );

    await api.patch("/notifications/read-all");
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl page-fade flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glass">
            <Bell size={24} />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
              Notifications
            </h1>

            <p className="text-sm text-ink-900/60 dark:text-white/60">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You’re all caught up"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            className="border border-brand-500/30 hover:bg-gradient-to-r hover:from-brand-500/10 hover:to-accent-500/10"
            onClick={markAllRead}
          >
            <CheckCheck size={14} />
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Debate reminders, feedback alerts, and platform updates will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <Card
              key={n.id}
              padding="sm"
              onClick={() => !n.read && markRead(n.id)}
              className={`
                flex cursor-pointer items-start gap-4
                border border-black/10
                bg-white
                shadow-card
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-glass

                dark:border-brand-500/20
                dark:bg-gradient-to-br
                dark:from-brand-900/20
                dark:to-accent-900/20

                ${!n.read ? "border-l-4 border-l-brand-500" : "opacity-70"}
              `}
            >
              {/* unread dot */}

              <div
                className={`
                  mt-2 h-2.5 w-2.5 shrink-0 rounded-full

                  ${
                    !n.read
                      ? "bg-gradient-to-r from-brand-500 to-accent-500"
                      : "bg-transparent"
                  }
                `}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">
                  {n.title}
                </p>

                <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
                  {n.message}
                </p>

                <p className="mt-2 text-[11px] text-ink-900/40 dark:text-white/40">
                  {timeAgo(n.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
