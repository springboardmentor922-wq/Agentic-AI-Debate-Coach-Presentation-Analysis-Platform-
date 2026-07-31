import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Play, Sparkles, Clock, Target, Lightbulb, Compass, Zap } from 'lucide-react';

export const StartDebate = ({ onDebateStarted }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('60');
  const [debateType, setDebateType] = useState('One-to-One');
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const topics = await api.getTopics();
      if (Array.isArray(topics)) {
        setAvailableTopics(topics);
      }
    } catch (err) {
      console.error("Failed to load topics catalog", err);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!topic || !duration || !debateType) {
      alert("Please specify a Topic, Duration, and Debate Format.");
      return;
    }

    setLoading(true);
    try {
      const username = localStorage.getItem('username');
      const res = await api.createDebate({
        username,
        topic,
        duration: parseInt(duration),
        debate_type: debateType
      });

      if (res.success && res.debate_id) {
        onDebateStarted({
          debateId: res.debate_id,
          topic,
          duration: parseInt(duration),
          debateType
        });
      } else {
        alert(res.message || "Failed to initiate debate session");
      }
    } catch (err) {
      alert("Backend connection error. Make sure FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-8 border-indigo-500/30 relative overflow-hidden glow-indigo">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />


        <form onSubmit={handleStart} className="space-y-6 relative z-10">
          <div className="form-group">
            <label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-400" /> Debate Topic
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Artificial Intelligence will create more jobs than it displaces"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          {availableTopics.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" /> Quick Catalog Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTopics.slice(0, 6).map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setTopic(t.title)}
                    className="text-xs glass-card px-3.5 py-2 hover:border-indigo-400/60 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-400" /> {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Duration
              </label>
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="30">30 Seconds (Blitz Speech)</option>
                <option value="60">60 Seconds (Standard Round)</option>
                <option value="120">120 Seconds (Extended Argument)</option>
                <option value="180">180 Seconds (Mastery Challenge)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Debate Format
              </label>
              <select
                className="form-select"
                value={debateType}
                onChange={(e) => setDebateType(e.target.value)}
              >
                <option value="One-on-One">One-on-One</option>
                <option value="AI Debate Simulation">AI Debate Simulation</option>
                <option value="Oxford Debate">Oxford Debate</option>
                <option value="Public Forum">Public Forum</option>
                <option value="Policy Debate">Policy Debate</option>
                <option value="Parliament">Parliament</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-base justify-center mt-2 font-display font-bold"
          >
            {loading ? (
              <span>Initializing Arena...</span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Start Debate
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
