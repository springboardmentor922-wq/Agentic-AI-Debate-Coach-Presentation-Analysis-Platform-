import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Mic, FileText, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export const AdminDebatesList = ({ onNavigate }) => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebates();
  }, []);

  const loadDebates = async () => {
    setLoading(true);
    try {
      const data = await api.getAllDebates();
      if (Array.isArray(data)) setDebates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-400">Loading debates...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {onNavigate && (
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      )}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Total Debates Attempted</h2>
        <p className="text-sm text-slate-400 mb-6">View all debates performed by learners across the platform.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
                <th className="p-3">Topic</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {debates.map((d, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                  <td className="p-3 font-medium text-white">{d.topic}</td>
                  <td className="p-3 text-indigo-400">@{d.username}</td>
                  <td className="p-3 text-slate-300">{d.duration}s</td>
                  <td className="p-3">
                    {d.status === 'Reviewed' && <span className="flex items-center gap-1 text-emerald-400"> <CheckCircle className="w-3 h-3"/> Reviewed</span>}
                    {d.status === 'Submitted' && <span className="flex items-center gap-1 text-amber-400"> <FileText className="w-3 h-3"/> Pending Review</span>}
                    {d.status === 'Started' && <span className="flex items-center gap-1 text-blue-400"> <Mic className="w-3 h-3"/> In Progress</span>}
                  </td>
                  <td className="p-3 text-slate-400">{d.created_at || 'N/A'}</td>
                </tr>
              ))}
              {debates.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">No debates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
