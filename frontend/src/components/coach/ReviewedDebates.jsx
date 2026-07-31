import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, User, Eye, ArrowLeft, Star } from 'lucide-react';

export const ReviewedDebates = () => {
  const [debates, setDebates] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompleted();
  }, []);

  const loadCompleted = async () => {
    setLoading(true);
    try {
      const data = await api.getCoachReviewedDebates();
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
      setSelectedReview(review);
    } catch (err) {
      alert("Unable to fetch review record.");
    }
  };

  if (selectedReview) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <button onClick={() => setSelectedReview(null)} className="btn-secondary text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Reviewed List
        </button>

        <div className="glass-card p-6 border-emerald-500/30 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="badge badge-reviewed mb-2">Evaluated Debate</span>
              <h2 className="font-display text-2xl font-bold text-slate-100">{selectedReview.topic}</h2>
              <p className="text-xs text-slate-400 mt-1">Learner: {selectedReview.username} | Coach: {selectedReview.coach}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div><p className="text-xs text-slate-400">Confidence</p><p className="font-bold text-indigo-400 text-lg">{selectedReview.confidence}/10</p></div>
            <div><p className="text-xs text-slate-400">Fluency</p><p className="font-bold text-cyan-400 text-lg">{selectedReview.fluency}/10</p></div>
            <div><p className="text-xs text-slate-400">Communication</p><p className="font-bold text-amber-400 text-lg">{selectedReview.communication}/10</p></div>
            <div><p className="text-xs text-slate-400">Argument</p><p className="font-bold text-emerald-400 text-lg">{selectedReview.argument_strength}/10</p></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-slate-300">Coach Feedback:</p>
            <p className="text-slate-200 leading-relaxed">{selectedReview.feedback || "No feedback provided."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading reviewed debates...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Completed Evaluations</h2>
        <p className="text-slate-400 text-sm">Debates you have previously scored and provided feedback for.</p>
      </div>

      {debates.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-slate-500" />
          <p>No completed evaluation records found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {debates.map((item) => (
            <div key={item._id} className="glass-card p-5 flex items-center justify-between border-emerald-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-reviewed">Reviewed</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5" /> Learner: {item.username}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">{item.topic}</h3>
                <p className="text-xs text-slate-400">Status: {item.status}</p>
              </div>

              <button
                onClick={() => handleInspect(item._id)}
                className="btn-secondary text-xs"
              >
                <Eye className="w-4 h-4" /> View Feedback
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
