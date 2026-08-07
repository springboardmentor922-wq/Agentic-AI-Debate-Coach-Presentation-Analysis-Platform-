import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function EducatorMessages() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);

  const loadConversations = () => {
    setLoading(true);

    api
      .get("/messages/conversations")
      .then(({ data }) => setConversations(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!active) return;

    api
      .get(`/messages/thread/${active.user_id}`)
      .then(({ data }) => setThread(data));
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [thread]);

  const send = async () => {
    if (!text.trim() || !active) return;

    setSending(true);

    try {
      const { data } = await api.post("/messages", {
        recipient_id: active.user_id,
        text,
      });

      setThread((prev) => [...prev, data]);
      setText("");
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <MessageSquare size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real conversations with your learners.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Conversation List */}
        <Card
          padding="sm"
          className="lg:col-span-1 border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
        >
          {loading ? (
            <p className="p-3 text-sm text-gray-500 dark:text-white/40">
              Loading...
            </p>
          ) : conversations.length === 0 ? (
            <p className="p-3 text-sm text-gray-500 dark:text-white/40">
              No conversations yet. Message a learner from the Learners page to
              start one — or wait for them to message you.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                onClick={() => setActive(c)}
                className={`mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                  active?.user_id === c.user_id
                    ? "border border-brand-500/40 bg-gradient-to-r from-brand-600/20 to-accent-500/20 shadow-md"
                    : "hover:bg-gray-100 dark:hover:bg-brand-500/5"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">
                    {c.name}
                  </p>

                  <p className="truncate text-xs text-gray-500 dark:text-white/50">
                    {c.last_message}
                  </p>
                </div>

                {c.unread_count > 0 && (
                  <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-button-gradient text-[11px] font-bold text-white shadow-glow-mix">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </Card>

        {/* Chat Area */}
        <Card
          padding="sm"
          className="flex flex-col lg:col-span-2 border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
        >
          {!active ? (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a learner from the list to see your message history."
            />
          ) : (
            <>
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex h-[500px] flex-col gap-3 overflow-y-auto rounded-xl bg-gray-50 p-4 dark:bg-transparent"
              >
                {thread.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-white/50">
                    No messages yet.
                  </div>
                ) : (
                  thread.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender_id === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                          m.sender_id === user.id
                            ? "bg-button-gradient text-white"
                            : "border border-gray-200 bg-white text-gray-900 dark:border-brand-500/20 dark:bg-gradient-to-r dark:from-brand-900/20 dark:to-accent-900/20 dark:text-white"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-brand-500/20">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message ${active.name}...`}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-brand-500/20 dark:bg-brand-950/30 dark:text-white dark:placeholder:text-white/40"
                />

                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-button-gradient text-white shadow-premium transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
