import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function timeAgo(iso) {
  if (!iso) return "";

  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);

  const loadUnread = () => {
    if (!user) return;

    api
      .get("/notifications/unread-count")
      .then((res) => setUnread(res.data.unread_count))
      .catch(() => {});
  };

  useEffect(() => {
    loadUnread();

    const interval = setInterval(loadUnread, 30000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;

    setOpen(next);

    if (next) {
      setLoading(true);

      api
        .get("/notifications", { params: { limit: 15 } })
        .then((res) => setItems(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        })),
      );

      setUnread(0);
    } catch {}
  };

  const markOneRead = async (n) => {
    if (n.read) return;

    try {
      await api.patch(`/notifications/${n.id}/read`);

      setItems((prev) =>
        prev.map((it) => (it.id === n.id ? { ...it, read: true } : it)),
      );

      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* Notification Button */}
      <button
        onClick={toggleOpen}
        className="
          relative
          flex h-10 w-10 items-center justify-center
          rounded-xl
          border
          border-blue-500/20
          bg-gradient-to-br
          from-blue-500/10
          via-indigo-500/10
          to-violet-500/10
          text-blue-600
          transition-all
          duration-300
          hover:scale-105
          hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]

          dark:border-white/10
          dark:text-blue-300
        "
      >
        <Bell size={20} />

        {unread > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-blue-600
              via-indigo-600
              to-violet-600
              px-1
              text-[10px]
              font-bold
              text-white
              shadow-lg
              shadow-blue-500/30
            "
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            z-40
            mt-3
            w-80
            overflow-hidden
            rounded-2xl
            border
            border-blue-500/20
            bg-white/95
            p-2
            shadow-2xl
            backdrop-blur-xl

            dark:border-violet-400/20
            dark:bg-ink-900/95
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              bg-gradient-to-r
              from-blue-500/10
              via-indigo-500/10
              to-violet-500/10
              px-3
              py-2
            "
          >
            <p
              className="
                font-display
                text-sm
                font-semibold
                text-ink-900
                dark:text-white
              "
            >
              Notifications
            </p>

            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-blue-600
                  transition
                  hover:text-violet-600

                  dark:text-blue-300
                  dark:hover:text-violet-300
                "
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-900/50 dark:text-white/50">
                You're all caught up.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n)}
                  className={`
                    group
                    flex
                    w-full
                    flex-col
                    gap-1
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition-all

                    ${
                      n.read
                        ? "opacity-60"
                        : `
                          border
                          border-blue-500/10
                          bg-gradient-to-r
                          from-blue-500/10
                          via-indigo-500/10
                          to-violet-500/10
                        `
                    }

                    hover:-translate-y-0.5
                    hover:shadow-lg
                    dark:hover:bg-white/10
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-900 dark:text-white">
                      {n.title}
                    </span>

                    {!n.read && (
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-gradient-to-r
                          from-blue-500
                          to-violet-500
                          shadow-md
                        "
                      />
                    )}
                  </div>

                  <span className="text-xs text-ink-900/60 dark:text-white/60">
                    {n.message}
                  </span>

                  <span className="text-[10px] text-ink-900/40 dark:text-white/40">
                    {timeAgo(n.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
