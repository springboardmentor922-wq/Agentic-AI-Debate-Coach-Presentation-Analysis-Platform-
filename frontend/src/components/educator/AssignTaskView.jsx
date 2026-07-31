import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckSquare, User, Lightbulb, Target, Clock, Zap } from 'lucide-react';

export const AssignTaskView = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    topic: "",
    debate_type: "One-to-One",
    duration: "60"
  });

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      const res = await api.getEducatorReports();
      if (Array.isArray(res)) setLearners(res);
    } catch (err) {
      console.error("Failed to load learners", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) return alert("Select a learner.");
    
    setLoading(true);
    setSuccessMsg("");
    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        assigned_by: localStorage.getItem("username")
      };
      const res = await api.assignTask(payload);
      if (res.success) {
        setSuccessMsg("Task successfully assigned!");
        setFormData({ ...formData, topic: "" }); // Reset topic
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert(res.message || "Failed to assign task");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="glass-card p-8 border-cyan-500/30">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Assign Debate Task</h2>
            <p className="text-slate-400 text-sm">Create a structured debate exercise for a specific learner.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Select Learner
            </label>
            <select
              className="form-select"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            >
              <option value="">-- Choose Learner --</option>
              {learners.map(l => (
                <option key={l.username} value={l.username}>{l.fullname} (@{l.username})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Debate Topic
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Universal Basic Income"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Debate Type
              </label>
              <select
                className="form-select"
                value={formData.debate_type}
                onChange={(e) => setFormData({...formData, debate_type: e.target.value})}
              >
                <option value="One-to-One">One-to-One</option>
                <option value="AI Debate Simulation">AI Debate Simulation</option>
                <option value="Oxford Debate">Oxford Debate</option>
              </select>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Duration
              </label>
              <select
                className="form-select"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                <option value="30">30 Seconds</option>
                <option value="60">60 Seconds</option>
                <option value="120">120 Seconds</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 font-bold mt-4"
          >
            {loading ? "Assigning..." : "Assign Task"}
          </button>
        </form>
      </div>
    </div>
  );
};
