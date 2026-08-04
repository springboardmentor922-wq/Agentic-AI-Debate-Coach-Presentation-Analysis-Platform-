import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const FAQS = [
  { q: "How does AI evaluation work?", a: "Voice-mode recordings run through 4 real AI agents: fallacy detection, delivery coaching (grammar/confidence/clarity), argument analysis (5 criteria), and an AI opponent." },
  { q: "How can I improve my argument quality?", a: "Use the Argument Analyzer to check clarity, relevance, evidence strength, logical consistency, and persuasiveness on any text before you debate." },
  { q: "What are logical fallacies?", a: "Reasoning errors like Ad Hominem, Straw Man, or False Dilemma that weaken an argument even if it sounds persuasive. The Fallacy Detector checks for 8 of them." },
  { q: "How is my score calculated?", a: "Communication comes from delivery clarity, Argument from logical consistency, and Confidence from phrasing analysis — all computed live by the AI engine, never hardcoded." }
];

function HelpSupport() {
  const [openIdx, setOpenIdx] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState("");

  const loadTickets = () => api.get("/support/tickets/mine").then((res) => setTickets(res.data)).catch(() => {});
  useEffect(() => { loadTickets(); }, []);

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      await api.post("/support/tickets", { subject, message });
      setSubject(""); setMessage("");
      setMsg("Ticket submitted.");
      loadTickets();
    } catch { setMsg("Failed to submit ticket."); }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Help & Support</h2>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <h3 className="font-semibold mb-4">FAQs</h3>
        {FAQS.map((f, i) => (
          <div key={i} className="border-b border-white/5 py-3 last:border-0">
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full text-left text-sm font-medium text-gray-200">
              {f.q}
            </button>
            {openIdx === i && <p className="text-gray-500 text-sm mt-2">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <h3 className="font-semibold mb-4">Submit a Ticket</h3>
        {msg && <p className="text-purple-400 text-sm mb-3">{msg}</p>}
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[100px]" />
        <button onClick={submitTicket} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
          Submit Ticket
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
          <h3 className="font-semibold mb-4">Your Tickets</h3>
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t._id} className="bg-[#0f0f1a] rounded-lg p-3 text-sm flex justify-between">
                <span>{t.subject}</span>
                <span className={t.status === "Open" ? "text-orange-400" : "text-green-400"}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
export default HelpSupport;
