import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChevronLeft, MessageSquare, Eye } from 'lucide-react';

export const EducatorFeedbacksList = ({ onNavigate }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFeedback, setViewFeedback] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.getEducatorFeedbacks();
      if (Array.isArray(res)) setFeedbacks(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading Feedbacks...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>
      
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <MessageSquare className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Dispatched Feedbacks</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
                <th className="p-3">Receiver Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => (
                <tr key={f._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{f.fullname}</td>
                  <td className="p-3">
                    <span className="badge-pill badge-pill-indigo text-[10px]">{f.role}</span>
                  </td>
                  <td className="p-3 text-slate-400 text-sm">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => setViewFeedback(f)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3 h-3" /> View Feedback
                    </button>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">No feedbacks dispatched yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg p-6 border-violet-500/30 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              Feedback Message
            </h3>
            <p className="text-sm text-slate-400 mb-6">Sent to {viewFeedback.fullname}</p>
            
            <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
              {viewFeedback.message}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setViewFeedback(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
