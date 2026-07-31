import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const SendFeedbackModal = ({ isOpen, onClose, preselectedUsername, onSent }) => {
  const [username, setUsername] = useState(preselectedUsername || '');
  const [message, setMessage] = useState('');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedUsername) setUsername(preselectedUsername);
    if (isOpen) fetchLearners();
  }, [isOpen, preselectedUsername]);

  const fetchLearners = async () => {
    try {
      const data = await api.getUsersByRole('Learner');
      if (Array.isArray(data)) setLearners(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !message) {
      alert("Please select a student and enter feedback.");
      return;
    }

    setLoading(true);
    try {
      const senderName = localStorage.getItem('fullname') || 'Educator';
      const senderRole = localStorage.getItem('role') || 'Educator';

      const res = await api.sendDirectFeedback({
        username,
        message,
        sender_name: senderName,
        sender_role: senderRole
      });

      if (res.success) {
        alert("Feedback message sent successfully!");
        setMessage('');
        onSent();
      } else {
        alert(res.message || "Failed to send feedback.");
      }
    } catch (err) {
      alert("Server communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Feedback">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!preselectedUsername && (
          <div className="form-group">
            <label>Target Learner</label>
            {learners.length > 0 ? (
              <select
                className="form-select"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              >
                <option value="">-- Select Student --</option>
                {learners.map((u) => (
                  <option key={u._id} value={u.username}>
                    {u.fullname} (@{u.username})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-input"
                placeholder="Enter Learner Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
          </div>
        )}

        <div className="form-group">
          <label>Guidance Message</label>
          <textarea
            rows="5"
            className="form-textarea"
            placeholder="Write constructive coaching feedback or recommendations for future debates..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 justify-center mt-2">
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </Modal>
  );
};
