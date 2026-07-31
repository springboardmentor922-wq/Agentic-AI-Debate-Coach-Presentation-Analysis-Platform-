import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, User, Calendar, Star } from 'lucide-react';

export const LearnerFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem('username');
      const data = await api.getUserFeedbacks(username);
      if (Array.isArray(data)) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading your feedback inbox...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Feedbacks</h2>
        <p className="text-slate-400 text-sm">Direct evaluation notes and advice sent by Coaches, Educators, and Admins.</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-500" />
          <p>No feedback messages in your inbox yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item, idx) => (
            <div key={item._id || idx} className="glass-card p-5 space-y-3 border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {item.sender_name ? item.sender_name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">{item.sender_name || 'Coach'}</p>
                    <p className="text-xs text-slate-400">{item.sender_role || 'Debate Coach'}</p>
                  </div>
                </div>
                {item.created_at && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.created_at}
                  </span>
                )}
              </div>

              {item.topic && (
                <div className="text-xs font-semibold text-indigo-300">Topic: {item.topic}</div>
              )}

              {/* Scores if coach evaluation */}
              {item.confidence !== undefined && (
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-900/60 text-xs">
                  <div><span className="text-slate-400">Confidence:</span> <span className="font-bold text-indigo-400">{item.confidence}/10</span></div>
                  <div><span className="text-slate-400">Fluency:</span> <span className="font-bold text-cyan-400">{item.fluency}/10</span></div>
                  <div><span className="text-slate-400">Argument:</span> <span className="font-bold text-emerald-400">{item.argument_strength}/10</span></div>
                  <div><span className="text-slate-400">Comm:</span> <span className="font-bold text-amber-400">{item.communication}/10</span></div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {item.feedback || item.message || "No message content."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
