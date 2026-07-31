import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, Calendar, Eye, ArrowLeft, MessageSquare, Bot, AlertTriangle, Lightbulb } from 'lucide-react';

export const DebateHistory = ({ targetUsername }) => {
  const [debates, setDebates] = useState([]);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const username = targetUsername || localStorage.getItem('username');
      const data = await api.getUserDebates(username);
      if (Array.isArray(data)) {
        setDebates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (debateId) => {
    try {
      const review = await api.getDebateReview(debateId);
      setSelectedDebate(review);
    } catch (err) {
      alert("Unable to fetch debate details.");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-12 text-center text-slate-400">
        Loading historical records...
      </div>
    );
  }

  if (selectedDebate) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => setSelectedDebate(null)}
          className="btn-secondary text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History List
        </button>

        <div className="glass-card p-6 border-indigo-500/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="badge badge-submitted mb-2">Debate Record</span>
              <h2 className="font-display text-2xl font-bold text-slate-100">{selectedDebate.topic}</h2>
              <p className="text-xs text-slate-400 mt-1">Speaker: {selectedDebate.username}</p>
            </div>
            {selectedDebate.coach && (
              <span className="badge badge-reviewed">Evaluated by {selectedDebate.coach}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 glass-card">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2">
                <MessageSquare className="w-4 h-4" /> Speech Transcript
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {selectedDebate.transcript || "No transcript recorded."}
              </p>
            </div>

            <div className="p-4 glass-card border-violet-500/20">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-2">
                <Bot className="w-4 h-4" /> AI Opponent Response
              </div>
              <p className="text-xs text-violet-200 leading-relaxed max-h-40 overflow-y-auto">
                {selectedDebate.ai_response || "No AI response."}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-semibold">Confidence</p>
              <p className="font-display text-xl font-bold text-indigo-400">{(selectedDebate.confidence || 0) * 10}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Fluency</p>
              <p className="font-display text-xl font-bold text-cyan-400">{(selectedDebate.fluency || 0) * 10}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Argument Strength</p>
              <p className="font-display text-xl font-bold text-emerald-400">{(selectedDebate.argument_strength || 0) * 10}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Communication</p>
              <p className="font-display text-xl font-bold text-amber-400">{(selectedDebate.communication || 0) * 10}%</p>
            </div>
          </div>

          {/* Fallacies & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 glass-card border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" /> Detected Logical Fallacies
              </div>
              <ul className="text-xs text-amber-200/80 space-y-2 list-disc pl-4">
                {selectedDebate.fallacies && selectedDebate.fallacies.length > 0 ? (
                  selectedDebate.fallacies.map((f, i) => <li key={i}>{f}</li>)
                ) : (
                  <li className="list-none text-emerald-400">Solid reasoning! No fallacies detected.</li>
                )}
              </ul>
            </div>

            <div className="p-4 glass-card border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-2">
                <Lightbulb className="w-4 h-4" /> AI Suggestions for Improvement
              </div>
              <ul className="text-xs text-cyan-200/80 space-y-2 list-disc pl-4">
                {selectedDebate.suggestions && selectedDebate.suggestions.length > 0 ? (
                  selectedDebate.suggestions.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li className="list-none text-slate-400">No specific suggestions available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold gradient-text">Debate History</h2>
          <p className="text-slate-400 text-sm">Review your past speech attempts, transcripts, and scores.</p>
        </div>
      </div>

      {debates.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <History className="w-12 h-12 mx-auto text-slate-500" />
          <p>No debate records found yet. Start your first debate session in the Practice Arena!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {debates.map((item) => (
            <div
              key={item._id}
              onClick={() => handleInspect(item._id)}
              className="glass-card p-5 glass-card-interactive cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`badge ${item.status === 'Reviewed' ? 'badge-reviewed' : 'badge-submitted'}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.created_at || 'Recent'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">{item.topic}</h3>
                <p className="text-xs text-slate-400">Duration: {item.duration}s | Type: {item.debate_type}</p>
              </div>

              <button className="btn-secondary text-xs p-2.5">
                <Eye className="w-4 h-4" /> View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
