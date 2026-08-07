import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function CoachMessages() {
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
        <div
          className="
          flex h-16 w-16 items-center justify-center
          rounded-2xl
          bg-gradient-to-br
          from-purple-600
          via-indigo-600
          to-blue-600
          text-white
          shadow-lg
          shadow-purple-500/30
          "
        >
          <MessageSquare size={28} />
        </div>

        <div>
          <h1
            className="
            font-display
            text-3xl
            font-bold
            text-white
            "
          >
            Messages
          </h1>

          <p
            className="
            text-sm
            text-white/60
            "
          >
            Real conversations with your learners.
          </p>
        </div>
      </div>

      {/* Main */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Conversation List */}

        <Card
          padding="sm"
          className="
          lg:col-span-1

          border
          border-purple-500/20

          bg-gradient-to-br
          from-purple-900/20
          via-indigo-900/20
          to-blue-900/20

          backdrop-blur-xl

          shadow-xl
          "
        >
          {loading ? (
            <p className="p-4 text-sm text-white/40">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-white/50">
              No conversations yet. Message a learner from the Learners page to
              start one — or wait for them to message you.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                onClick={() => setActive(c)}
                className={`
                mb-2
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-3
                py-3
                text-left
                transition-all

                ${
                  active?.user_id === c.user_id
                    ? `
                    bg-gradient-to-r
                    from-purple-600/30
                    via-indigo-600/20
                    to-blue-600/30

                    border
                    border-purple-400/30
                    `
                    : `
                    hover:bg-white/5
                    `
                }
                `}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{c.name}</p>

                  <p className="truncate text-xs text-white/50">
                    {c.last_message}
                  </p>
                </div>

                {c.unread_count > 0 && (
                  <span
                    className="
                    ml-2
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full

                    bg-gradient-to-r
                    from-purple-500
                    to-blue-500

                    text-[10px]
                    font-bold
                    text-white
                    "
                  >
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </Card>

        {/* Chat Section */}

        <Card
          padding="sm"
          className="
          flex
          flex-col

          lg:col-span-2

          border
          border-purple-500/20

          bg-gradient-to-br
          from-purple-900/20
          via-indigo-900/20
          to-blue-900/20

          backdrop-blur-xl

          shadow-xl
          "
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
                className="
                flex
                max-h-96
                flex-col
                gap-3
                overflow-y-auto
                rounded-xl
                p-3
                "
              >
                {thread.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_id === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`

                      max-w-[75%]

                      rounded-2xl

                      px-4
                      py-2

                      text-sm

                      shadow-lg


                      ${
                        m.sender_id === user.id
                          ? `
                          bg-gradient-to-r
                          from-purple-600
                          via-indigo-600
                          to-blue-600

                          text-white
                          `
                          : `
                          border
                          border-white/10

                          bg-white/5

                          text-white

                          backdrop-blur-md
                          `
                      }

                      `}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}

              <div
                className="
                mt-4
                flex
                items-center
                gap-3

                border-t
                border-white/10

                pt-3
                "
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message ${active.name}...`}
                  className="
                  input-field
                  flex-1

                  bg-white/5

                  border-white/10

                  text-white

                  placeholder:text-white/40

                  "
                />

                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="
                  flex
                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-full


                  bg-gradient-to-r
                  from-purple-600
                  via-indigo-600
                  to-blue-600


                  text-white

                  shadow-lg

                  transition

                  hover:scale-105

                  disabled:opacity-40

                  "
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
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
