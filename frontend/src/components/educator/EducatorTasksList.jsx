import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChevronLeft, CheckSquare, Clock } from 'lucide-react';

export const EducatorTasksList = ({ onNavigate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getEducatorTasks();
      if (Array.isArray(res)) setTasks(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading Tasks...</div>;
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Assigned Tasks</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
                <th className="p-3">Learner (Receiver)</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Debate Type</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{t.fullname}</td>
                  <td className="p-3 text-slate-300 font-medium">{t.topic}</td>
                  <td className="p-3 text-slate-400">{t.debate_type || 'One-to-One'}</td>
                  <td className="p-3 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.duration}s
                  </td>
                  <td className="p-3">
                    <span className={`badge-pill ${t.status === 'Completed' ? 'badge-pill-emerald' : 'badge-pill-amber'}`}>
                      {t.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">No tasks assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
