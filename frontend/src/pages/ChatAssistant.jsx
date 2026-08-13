import { useEffect, useRef, useState } from "react";
import { Plus, Search, Pin, Archive, Trash2, Send, Pencil, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AppShell from "../components/AppShell";
import { assistantApi } from "../api/endpoints";

export default function ChatAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const transcriptEndRef = useRef(null);

  const loadConversations = async () => {
    const { data } = await assistantApi.listConversations();
    setConversations(data);
    return data;
  };

  useEffect(() => {
    (async () => {
      const convos = await loadConversations();
      if (convos.length > 0) selectConversation(convos[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const selectConversation = async (id) => {
    setActiveId(id);
    const { data } = await assistantApi.listMessages(id);
    setMessages(data);
  };

  const handleNewChat = async () => {
    const { data } = await assistantApi.createConversation();
    setConversations((prev) => [data, ...prev]);
    setActiveId(data.id);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !activeId) return;

    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    setInput("");
    setSending(true);

    try {
      const { data } = await assistantApi.sendMessage(activeId, text);
      setMessages((prev) => [...prev.slice(0, -1), data.user_message, data.assistant_message]);
      loadConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "(Something went wrong — try again.)", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    await assistantApi.deleteConversation(id);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeId === id) {
      if (remaining.length > 0) selectConversation(remaining[0].id);
      else {
        setActiveId(null);
        setMessages([]);
      }
    }
  };

  const handleTogglePin = async (convo) => {
    const { data } = await assistantApi.updateConversation(convo.id, { pinned: !convo.pinned });
    setConversations((prev) => prev.map((c) => (c.id === data.id ? data : c)).sort((a, b) => b.pinned - a.pinned));
  };

  const handleToggleArchive = async (convo) => {
    const { data } = await assistantApi.updateConversation(convo.id, { archived: !convo.archived });
    setConversations((prev) => prev.map((c) => (c.id === data.id ? data : c)));
  };

  const startRename = (convo) => {
    setRenamingId(convo.id);
    setRenameValue(convo.title);
  };

  const confirmRename = async (id) => {
    const { data } = await assistantApi.updateConversation(id, { title: renameValue.trim() || "New chat" });
    setConversations((prev) => prev.map((c) => (c.id === id ? data : c)));
    setRenamingId(null);
  };

  const filtered = conversations.filter(
    (c) => !c.archived && c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-white/5 bg-ink-800 flex flex-col">
          <div className="p-4">
            <button onClick={handleNewChat} className="btn-primary w-full mb-3">
              <Plus size={16} /> New chat
            </button>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
              <input
                className="input-field pl-9 py-1.5 text-sm"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  activeId === c.id ? "bg-motion-teal/10 text-motion-teal" : "text-slate-muted hover:bg-white/5"
                }`}
                onClick={() => selectConversation(c.id)}
              >
                {renamingId === c.id ? (
                  <>
                    <input
                      autoFocus
                      className="input-field flex-1 py-1 text-xs"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); confirmRename(c.id); }}>
                      <Check size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}>
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    {c.pinned && <Pin size={12} className="shrink-0" />}
                    <span className="flex-1 truncate">{c.title}</span>
                    <div className="hidden group-hover:flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); startRename(c); }}><Pencil size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleTogglePin(c); }}><Pin size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleArchive(c); }}><Archive size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}><Trash2 size={12} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-muted text-center mt-6">No conversations yet.</p>
            )}
          </div>
        </aside>

        {/* Chat window */}
        <div className="flex-1 flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-slate-muted text-sm">
              Start a new chat to talk with the Podium AI Assistant.
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === "user"
                          ? "bg-motion-teal text-ink-900 rounded-br-sm whitespace-pre-wrap"
                          : "bg-ink-600 text-fog border border-white/10 rounded-bl-sm markdown-body"
                      }`}
                    >
                      {m.role === "user" ? (
                        m.content
                      ) : (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-ink-600 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-muted">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-white/5 p-4 max-w-3xl mx-auto w-full flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Ask anything…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}