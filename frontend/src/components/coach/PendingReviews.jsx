import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, User, CheckCircle, Award } from 'lucide-react';
import { ReviewForm } from './ReviewForm';

export const PendingReviews = () => {
  const [debates, setDebates] = useState([]);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.getCoachPendingDebates();
      if (Array.isArray(data)) {
        setDebates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedDebate) {
    return (
      <ReviewForm
        debate={selectedDebate}
        onBack={() => setSelectedDebate(null)}
        onSubmitted={() => {
          setSelectedDebate(null);
          loadPending();
        }}
      />
    );
  }

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading pending reviews...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Pending Debate Reviews</h2>
        <p className="text-slate-400 text-sm">Debates submitted by learners awaiting manual evaluation and scoring.</p>
      </div>

      {debates.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
          <p className="text-slate-300 font-semibold">All Caught Up!</p>
          <p className="text-xs">There are no pending debate submissions to review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {debates.map((item) => (
            <div key={item._id} className="glass-card p-5 flex items-center justify-between border-amber-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-submitted">Submitted</span>
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5" /> Learner: {item.username}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">{item.topic}</h3>
                <p className="text-xs text-slate-400">Duration: {item.duration}s | Created: {item.created_at || 'Recent'}</p>
              </div>

              <button
                onClick={() => setSelectedDebate(item)}
                className="btn-primary text-xs py-2.5"
              >
                <Award className="w-4 h-4" /> Evaluate Debate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
