import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import aiEngine from "../api/aiEngine";
import { getUser } from "../utils/useAuth";

const PAGE_LABELS = {
  "/dashboard": "Dashboard Guidance",
  "/topics": "Topic Recommendations",
  "/debate-room": "Live Debate Coaching",
  "/skill-tracking": "Performance Insights",
  "/reports": "Analytics Assistant",
  "/profile": "Account Help"
};

const newConversationId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function AIChatbotWidget() {
  const user = getUser();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat");

  const [conversationId, setConversationId] = useState(newConversationId());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!user) return null;

  const pageLabel = PAGE_LABELS[location.pathname] || "AI Debate Coach";

  const handleNewChat = () => {
    setConversationId(newConversationId());
    setMessages([]);
    setView("chat");
  };

  const handleOpenHistory = async () => {
    setView("history");
    setHistoryLoading(true);
    try {
      const res = await aiEngine.get("/api/v1/assistant/conversations", { params: { user_id: user.id } });
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenConversation = async (id) => {
    try {
      const res = await aiEngine.get(`/api/v1/assistant/conversation/${id}`, { params: { user_id: user.id } });
      setMessages(res.data);
      setConversationId(id);
      setView("chat");
    } catch (err) {
      console.error(err);
    }
  };

  const startRename = (c, e) => {
    e.stopPropagation();
    setRenamingId(c.conversation_id);
    setRenameValue(c.title || c.preview);
  };

  const saveRename = async (id, e) => {
    e.stopPropagation();
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await aiEngine.put(`/api/v1/assistant/conversation/${id}/title`, { user_id: user.id, title: renameValue.trim() });
      setConversations((prev) => prev.map((c) => c.conversation_id === id ? { ...c, title: renameValue.trim() } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setRenamingId(null);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    // 30s client-side timeout so it never hangs on "Thinking..." forever
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await aiEngine.post(
        "/api/v1/assistant/chat",
        { user_id: user.id, conversation_id: conversationId, page: location.pathname, message: text },
        { signal: controller.signal }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      const isTimeout = err.code === "ERR_CANCELED" || err.name === "CanceledError";
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: isTimeout
          ? "That took too long and timed out. Make sure the AI engine (localhost:8000) and backend are both running, then try again."
          : "Sorry, I couldn't reach the AI engine. Make sure it's running on localhost:8000."
      }]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* FLOATING BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center justify-center text-2xl transition"
          aria-label="Open AI Debate Coach"
        >
          🤖
        </button>
      )}

      {/* FULL-SCREEN CHAT */}
      {open && (
        <div className="fixed inset-0 z-50 bg-[#0f0f1a] flex flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#13131f]">
            <div>
              <p className="font-semibold">AI Debate Coach</p>
              <p className="text-gray-500 text-xs">{view === "history" ? "Chat History" : pageLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleNewChat} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg px-3 py-1.5 text-sm">
                + New Chat
              </button>
              <button onClick={handleOpenHistory} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg px-3 py-1.5 text-sm">
                🕒 History
              </button>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg w-9 h-9 flex items-center justify-center text-lg ml-2">
                ✕
              </button>
            </div>
          </div>

          {/* HISTORY VIEW */}
          {view === "history" ? (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl mx-auto space-y-2">
                {historyLoading && <p className="text-gray-500 text-sm">Loading...</p>}
                {!historyLoading && conversations.length === 0 && <p className="text-gray-500 text-sm">No past conversations yet.</p>}
                {conversations.map((c) => (
                  <div
                    key={c.conversation_id}
                    onClick={() => renamingId !== c.conversation_id && handleOpenConversation(c.conversation_id)}
                    className="w-full text-left bg-[#1a1a2b] hover:bg-[#20202f] border border-white/5 rounded-xl px-4 py-3 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    {renamingId === c.conversation_id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === "Enter" && saveRename(c.conversation_id, e)}
                        className="flex-1 bg-[#0f0f1a] border border-purple-500 rounded-lg px-2 py-1 text-sm text-gray-200 outline-none"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-gray-200 truncate">{c.title || c.preview}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDate(c.last_updated)} · {c.message_count} messages</p>
                      </div>
                    )}

                    {renamingId === c.conversation_id ? (
                      <button onClick={(e) => saveRename(c.conversation_id, e)} className="text-purple-400 hover:text-purple-300 text-xs shrink-0">
                        Save
                      </button>
                    ) : (
                      <button onClick={(e) => startRename(c, e)} className="text-gray-500 hover:text-gray-300 text-xs shrink-0" title="Rename">
                        ✎
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* CHAT VIEW — centered column like a typical chat interface */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.length === 0 && !loading && (
                    <div className="text-center mt-20">
                      <div className="text-4xl mb-4">🤖</div>
                      <p className="text-gray-300 text-lg font-medium">Hi {user.name?.split(" ")[0] || ""}, I'm your AI Debate Coach.</p>
                      <p className="text-gray-500 text-sm mt-1">Ask me anything about debating, argument strategy, or this page.</p>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 whitespace-pre-wrap leading-relaxed ${
                        m.role === "user" ? "bg-purple-600 text-white" : "bg-[#1a1a2b] text-gray-200 border border-white/5"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-[#1a1a2b] border border-white/5 text-gray-500 rounded-2xl px-5 py-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* INPUT */}
              <div className="border-t border-white/10 bg-[#13131f] px-6 py-4">
                <div className="max-w-3xl mx-auto flex gap-3 items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-purple-500 max-h-40"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white px-5 py-3 rounded-xl text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default AIChatbotWidget;
