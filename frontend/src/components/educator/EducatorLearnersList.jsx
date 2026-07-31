import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChevronLeft, User, MessageSquare } from 'lucide-react';
import { SendFeedbackModal } from './SendFeedbackModal';

export const EducatorLearnersList = ({ onNavigate }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    setLoading(true);
    try {
      // Reusing reports API since it fetches learners
      const res = await api.getEducatorReports();
      if (Array.isArray(res)) setLearners(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (averageScore) => {
    if (averageScore >= 81) return "Expert";
    if (averageScore >= 41) return "Intermediate";
    return "Beginner";
  };

  const handleSendFeedback = (learner) => {
    setSelectedLearner(learner);
    setShowFeedbackModal(true);
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading Learners...</div>;
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
        <h2 className="text-xl font-bold gradient-text mb-6">Learners Directory</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
                <th className="p-3">Learner Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Level</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{l.fullname}</td>
                  <td className="p-3 text-slate-400">@{l.username}</td>
                  <td className="p-3">
                    <span className="badge-pill badge-pill-indigo text-[10px]">Learner</span>
                  </td>
                  <td className="p-3 text-slate-300">{getLevel(l.average_score || 0)}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleSendFeedback(l)}
                      className="btn-primary flex items-center gap-2 text-xs py-1.5 px-3 ml-auto"
                    >
                      <MessageSquare className="w-3 h-3" /> Send Feedback
                    </button>
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">No learners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFeedbackModal && selectedLearner && (
        <SendFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          preselectedUsername={selectedLearner.username}
          onSent={() => {
            setShowFeedbackModal(false);
          }}
        />
      )}
    </div>
  );
};
