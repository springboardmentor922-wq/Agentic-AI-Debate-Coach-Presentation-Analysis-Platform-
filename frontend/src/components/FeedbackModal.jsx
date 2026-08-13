import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { feedbackApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const STAFF_ROLES = ["debate_coach", "educator", "administrator"];

export default function FeedbackModal({ targetUserId, targetUserName, onClose }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canGiveFeedback = STAFF_ROLES.includes(user?.role);

  const load = async () => {
    setLoading(true);
    const { data } = await feedbackApi.list(targetUserId);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);
    try {
      await feedbackApi.create({ user_id: targetUserId, text: newText.trim() });
      setNewText("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg">Feedback for {targetUserName}</h3>
          <button onClick={onClose} className="text-slate-muted hover:text-fog">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <p className="text-slate-muted text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-slate-muted text-sm">No feedback yet.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{entry.given_by_name}</span>
                  <span className="text-xs text-slate-muted">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-muted">{entry.text}</p>
              </div>
            ))
          )}
        </div>

        {canGiveFeedback && (
          <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/5 flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Write feedback…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button type="submit" disabled={submitting} className="btn-primary px-4">
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}