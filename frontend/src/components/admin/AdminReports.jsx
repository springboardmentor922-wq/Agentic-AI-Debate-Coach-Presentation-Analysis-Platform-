import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, BookOpen, ShieldAlert, ChevronDown, ChevronUp, CheckSquare, MessageSquare, Award, Send } from 'lucide-react';
import { LearnerReports } from '../educator/LearnerReports';
import { SendFeedbackModal } from '../educator/SendFeedbackModal';

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('learners');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="glass-card p-6 border-indigo-500/30">
        <h2 className="text-2xl font-bold gradient-text mb-6">System Reports & Analytics</h2>
        
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('learners')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-all ${
              activeTab === 'learners' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Learners
          </button>
          <button
            onClick={() => setActiveTab('educators')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-all ${
              activeTab === 'educators' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Educators
          </button>
          <button
            onClick={() => setActiveTab('coaches')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-all ${
              activeTab === 'coaches' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Debate Coaches
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'learners' && <LearnerReports />}
        {activeTab === 'educators' && <EducatorsReportView />}
        {activeTab === 'coaches' && <CoachesReportView />}
      </div>
    </div>
  );
};

const EducatorsReportView = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackUser, setFeedbackUser] = useState(null);

  useEffect(() => {
    loadEducators();
  }, []);

  const loadEducators = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminEducatorReports();
      if (Array.isArray(data)) setEducators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-400">Loading Educator Reports...</div>;

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-6">Educator Performance Reports</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
              <th className="p-3">Educator Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Total Tasks Assigned</th>
              <th className="p-3">Total Feedbacks Given</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {educators.map((edu) => (
              <React.Fragment key={edu.username}>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{edu.fullname}</td>
                  <td className="p-3 text-slate-400">@{edu.username}</td>
                  <td className="p-3 text-indigo-400 font-bold">{edu.total_tasks}</td>
                  <td className="p-3 text-emerald-400 font-bold">{edu.total_feedbacks}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setFeedbackUser(edu.username)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Feedback
                      </button>
                      <button 
                        onClick={() => setExpandedId(expandedId === edu.username ? null : edu.username)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        {expandedId === edu.username ? (
                          <><ChevronUp className="w-3 h-3"/> Close Details</>
                        ) : (
                          <><ChevronDown className="w-3 h-3"/> View Details</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === edu.username && (
                  <tr>
                    <td colSpan="5" className="p-0 border-b border-white/10">
                      <div className="bg-slate-900/50 p-6 animate-fadeIn flex flex-col md:flex-row gap-6">
                        
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-indigo-400" /> Assigned Tasks
                          </h4>
                          {edu.assigned_tasks.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1">
                              {edu.assigned_tasks.map((t, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded border border-white/5 text-xs">
                                  <div className="text-slate-200 font-semibold mb-1">{t.topic}</div>
                                  <div className="text-slate-500">Receiver: <span className="text-indigo-300">@{t.username}</span></div>
                                  <div className="text-slate-500">Type: {t.debate_type} | Duration: {t.duration}s</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No tasks assigned yet.</p>
                          )}
                        </div>

                        <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-400" /> Sent Feedbacks
                          </h4>
                          {edu.given_feedbacks.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1">
                              {edu.given_feedbacks.map((f, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded border border-white/5 text-xs">
                                  <div className="text-slate-400 mb-1">To: <span className="text-emerald-300">@{f.username}</span></div>
                                  <p className="text-slate-300 italic">"{f.message}"</p>
                                  <div className="text-slate-600 mt-2">{f.created_at}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No feedbacks sent yet.</p>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {educators.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">No educators found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {feedbackUser && (
        <SendFeedbackModal 
          isOpen={!!feedbackUser} 
          onClose={() => setFeedbackUser(null)} 
          preselectedUsername={feedbackUser}
          onSent={() => setFeedbackUser(null)}
        />
      )}
    </div>
  );
};

const CoachesReportView = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackUser, setFeedbackUser] = useState(null);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCoachReports();
      if (Array.isArray(data)) setCoaches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-400">Loading Coach Reports...</div>;

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-6">Debate Coach Performance Reports</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
              <th className="p-3">Coach Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Debates Reviewed</th>
              <th className="p-3">Total Feedbacks Given</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((coach) => (
              <React.Fragment key={coach.username}>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{coach.fullname}</td>
                  <td className="p-3 text-slate-400">@{coach.username}</td>
                  <td className="p-3 text-amber-400 font-bold">{coach.total_debates_reviewed}</td>
                  <td className="p-3 text-emerald-400 font-bold">{coach.total_feedbacks}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setFeedbackUser(coach.username)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Feedback
                      </button>
                      <button 
                        onClick={() => setExpandedId(expandedId === coach.username ? null : coach.username)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        {expandedId === coach.username ? (
                          <><ChevronUp className="w-3 h-3"/> Close Details</>
                        ) : (
                          <><ChevronDown className="w-3 h-3"/> View Details</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === coach.username && (
                  <tr>
                    <td colSpan="5" className="p-0 border-b border-white/10">
                      <div className="bg-slate-900/50 p-6 animate-fadeIn flex flex-col md:flex-row gap-6">
                        
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" /> Reviewed Debates
                          </h4>
                          {coach.reviewed_debates.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1">
                              {coach.reviewed_debates.map((r, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded border border-white/5 text-xs">
                                  <div className="text-slate-200 font-semibold mb-1">{r.topic}</div>
                                  <div className="text-slate-500">Learner: <span className="text-amber-300">@{r.username}</span></div>
                                  <div className="text-slate-400 mt-2 italic">"{r.feedback}"</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No debates reviewed yet.</p>
                          )}
                        </div>

                        <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-400" /> Direct Feedbacks Sent
                          </h4>
                          {coach.given_feedbacks.length > 0 ? (
                            <div className="grid gap-3 grid-cols-1">
                              {coach.given_feedbacks.map((f, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded border border-white/5 text-xs">
                                  <div className="text-slate-400 mb-1">To: <span className="text-emerald-300">@{f.username}</span></div>
                                  <p className="text-slate-300 italic">"{f.message}"</p>
                                  <div className="text-slate-600 mt-2">{f.created_at}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No direct feedbacks sent yet.</p>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {coaches.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">No coaches found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {feedbackUser && (
        <SendFeedbackModal 
          isOpen={!!feedbackUser} 
          onClose={() => setFeedbackUser(null)} 
          preselectedUsername={feedbackUser}
          onSent={() => setFeedbackUser(null)}
        />
      )}
    </div>
  );
};
