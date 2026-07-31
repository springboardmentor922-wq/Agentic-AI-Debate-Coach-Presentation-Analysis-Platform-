import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { User, Mail, Mic, Trash2, Send } from 'lucide-react';
import { SendFeedbackModal } from '../educator/SendFeedbackModal';

export const UserProfileModal = ({ user, onClose, onDeleted }) => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (user?.username) {
      loadUserDebates();
    }
  }, [user]);

  const loadUserDebates = async () => {
    setLoading(true);
    try {
      const data = await api.getUserDebates(user.username);
      if (Array.isArray(data)) setDebates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Delete user ${user.fullname}? This cannot be undone.`)) return;
    try {
      const res = await api.deleteUser(user._id);
      alert(res.message);
      onDeleted();
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title={`User Profile: ${user.fullname}`}>
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">User ID:</span>
              <span className="font-mono text-indigo-400 font-bold">{user.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Email:</span>
              <span className="text-slate-200">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Role:</span>
              <span className="badge badge-learner">{user.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Account Status:</span>
              <span className="text-emerald-400 font-bold">{user.status || 'Active'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Mic className="w-4 h-4 text-indigo-400" /> Debate Session History ({debates.length})
            </h4>

            {loading ? (
              <div className="text-xs text-slate-500 py-4 text-center">Loading debates...</div>
            ) : debates.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center glass-card">No debates attempted yet.</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {debates.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">{d.topic}</p>
                      <p className="text-slate-400 text-[11px]">Type: {d.debate_type} | Duration: {d.duration}s</p>
                    </div>
                    <span className="badge badge-submitted">{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700/60">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex-1 btn-secondary text-xs justify-center"
            >
              <Send className="w-4 h-4" /> Send Direct Message
            </button>
            <button
              onClick={handleDeleteUser}
              className="btn-danger text-xs px-3"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </Modal>

      <SendFeedbackModal
        isOpen={showFeedbackModal}
        preselectedUsername={user.username}
        onClose={() => setShowFeedbackModal(false)}
        onSent={() => setShowFeedbackModal(false)}
      />
    </>
  );
};
