import React, { useState } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, Volume2, Send, Star, MessageSquare } from 'lucide-react';

export const ReviewForm = ({ debate, onBack, onSubmitted }) => {
  const [confidence, setConfidence] = useState('');
  const [fluency, setFluency] = useState('');
  const [communication, setCommunication] = useState('');
  const [argumentStrength, setArgumentStrength] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confidence || !fluency || !communication || !argumentStrength || !feedback) {
      alert("Please fill out all scores and feedback comments.");
      return;
    }

    setSubmitting(true);
    try {
      const coachName = localStorage.getItem('fullname') || 'Debate Coach';
      const res = await api.submitCoachFeedback({
        debate_id: debate._id,
        coach: coachName,
        confidence: parseInt(confidence),
        fluency: parseInt(fluency),
        communication: parseInt(communication),
        argument_strength: parseInt(argumentStrength),
        feedback
      });

      if (res.success) {
        alert("Evaluation feedback submitted successfully!");
        onSubmitted();
      } else {
        alert(res.message || "Failed to submit evaluation.");
      }
    } catch (err) {
      console.error(err);
      alert("Server communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <button onClick={onBack} className="btn-secondary text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Pending List
      </button>

      <div className="glass-card p-6 border-indigo-500/30 space-y-6">
        <div>
          <span className="badge badge-submitted mb-2">Manual Evaluation</span>
          <h2 className="font-display text-2xl font-bold text-slate-100">{debate.topic}</h2>
          <p className="text-xs text-slate-400 mt-1">Learner: <span className="text-indigo-300 font-semibold">{debate.username}</span> | Duration: {debate.duration}s</p>
        </div>

        {/* Audio Player */}
        {debate.audio_path && (
          <div className="p-4 glass-card bg-slate-900/60 border-indigo-500/20">
            <p className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-indigo-400" /> Recorded Speech Audio
            </p>
            <audio controls src={`http://localhost:8000/${debate.audio_path}`} className="w-full h-10" />
          </div>
        )}

        {/* Transcripts */}
        {debate.transcript && (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Transcribed Speech:
            </div>
            <p className="text-slate-200 leading-relaxed max-h-36 overflow-y-auto">{debate.transcript}</p>
          </div>
        )}

        {/* Scoring Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-700/60">
          <h3 className="font-display text-lg font-bold text-slate-200">Coach Metrics (Score 1 - 10)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-xs font-semibold text-indigo-300">Confidence Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-cyan-300">Fluency Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={fluency}
                onChange={(e) => setFluency(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-amber-300">Communication Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={communication}
                onChange={(e) => setCommunication(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-emerald-300">Argument Strength (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={argumentStrength}
                onChange={(e) => setArgumentStrength(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold text-slate-300">Detailed Coach Feedback & Advice</label>
            <textarea
              rows="5"
              className="form-textarea"
              placeholder="Provide constructive feedback regarding vocal tone, argument structure, transitions, and fallacy avoidance..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 justify-center text-sm"
          >
            {submitting ? "Submitting Evaluation..." : (
              <>
                <Send className="w-4 h-4" /> Submit Coach Evaluation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
