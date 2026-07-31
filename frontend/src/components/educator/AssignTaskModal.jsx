import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const AssignTaskModal = ({ isOpen, onClose, preselectedUsername, onCreated }) => {
  const [username, setUsername] = useState(preselectedUsername || '');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('60');
  const [debateType, setDebateType] = useState('One-to-One');
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
    if (!username || !topic) {
      alert("Please select a student and enter a topic.");
      return;
    }

    setLoading(true);
    try {
      const senderName = localStorage.getItem('fullname') || 'Educator';
      const senderRole = localStorage.getItem('role') || 'Educator';

      const res = await api.assignTask({
        username,
        topic,
        duration: `${duration} Seconds`,
        debate_type: debateType,
        sender_name: senderName,
        sender_role: senderRole
      });

      if (res.success) {
        alert("Debate task assigned successfully!");
        onCreated();
      } else {
        alert(res.message || "Failed to assign task.");
      }
    } catch (err) {
      alert("Server communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Debate Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label>Select Learner</label>
          {learners.length > 0 ? (
            <select
              className="form-select"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            >
              <option value="">-- Pick Student --</option>
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

        <div className="form-group">
          <label>Debate Topic</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Social media algorithm regulation"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label>Duration (Seconds)</label>
            <select
              className="form-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="30">30 Seconds</option>
              <option value="60">60 Seconds</option>
              <option value="120">120 Seconds</option>
              <option value="180">180 Seconds</option>
            </select>
          </div>

          <div className="form-group">
            <label>Debate Format</label>
            <select
              className="form-select"
              value={debateType}
              onChange={(e) => setDebateType(e.target.value)}
            >
              <option value="One-to-One">One-to-One</option>
              <option value="Rapid Fire">Rapid Fire</option>
              <option value="Persuasive Pitch">Persuasive Pitch</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 justify-center mt-2">
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </Modal>
  );
};
