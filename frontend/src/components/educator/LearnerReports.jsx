import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Users, BarChart3, ChevronLeft, Mic, Target, Zap, Clock, TrendingUp, X, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DebateHistory } from '../learner/DebateHistory';
import { SendFeedbackModal } from './SendFeedbackModal';

export const LearnerReports = ({ learnerUsername = null }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDebates, setLearnerDebates] = useState([]);
  const [debatesLoading, setDebatesLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [feedbackUser, setFeedbackUser] = useState(null);

  useEffect(() => {
    if (learnerUsername) {
      handleSelectLearner({ username: learnerUsername, fullname: learnerUsername });
      setLoading(false);
    } else {
      loadLearners();
    }
  }, [learnerUsername]);

  const loadLearners = async () => {
    setLoading(true);
    try {
      const res = await api.getEducatorReports();
      if (Array.isArray(res)) setLearners(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLearner = async (learner) => {
    setSelectedLearner(learner);
    setDebatesLoading(true);
    try {
      const res = await api.getLearnerDebates(learner.username);
      if (Array.isArray(res)) {
        // Sort by date ascending for charts
        const sorted = res.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setLearnerDebates(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDebatesLoading(false);
    }
  };

  // --- Calculations ---
  
  // Calculate historical averages for the learner across all debates
  const stats = useMemo(() => {
    if (!learnerDebates || learnerDebates.length === 0) {
      return { avgOverall: 0, avgConf: 0, avgFl: 0, avgArg: 0, avgCom: 0 };
    }
    
    let sumConf = 0, sumFl = 0, sumArg = 0, sumCom = 0;
    learnerDebates.forEach(d => {
      sumConf += (d.confidence || 0) * 10;
      sumFl += (d.fluency || 0) * 10;
      sumArg += (d.argument_strength || 0) * 10;
      sumCom += (d.communication || 0) * 10;
    });

    const len = learnerDebates.length;
    const avgConf = Math.round(sumConf / len);
    const avgFl = Math.round(sumFl / len);
    const avgArg = Math.round(sumArg / len);
    const avgCom = Math.round(sumCom / len);
    
    const avgOverall = Math.round((avgConf + avgFl + avgArg + avgCom) / 4);

    return {
      avgOverall, avgConf, avgFl, avgArg, avgCom
    };
  }, [learnerDebates]);

  const getLevel = (averageScore) => {
    if (averageScore >= 81) return "Expert";
    if (averageScore >= 41) return "Intermediate";
    return "Beginner";
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return learnerDebates.map((d, index) => ({
      name: `Debate ${index + 1}`,
      confidence: (d.confidence || 0) * 10,
      fluency: (d.fluency || 0) * 10,
      argument: (d.argument_strength || 0) * 10,
      communication: (d.communication || 0) * 10,
    }));
  }, [learnerDebates]);

  // --- Renderers ---

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading Student Analytics...</div>;
  }

  // Detailed Report View
  if (selectedLearner) {
    const level = getLevel(stats.avgOverall);

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
        {!learnerUsername && (
          <button 
            onClick={() => setSelectedLearner(null)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Student Directory
          </button>
        )}

        <div className="glass-card p-8 border-indigo-500/30 relative">
          <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Learner Report</h2>
              <p className="text-slate-400 text-lg">@{selectedLearner.username} • {selectedLearner.fullname}</p>
            </div>
            
            <div className="flex items-center gap-12">
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Overall Avg</div>
                <div className="text-4xl font-black text-white">{stats.avgOverall}</div>
              </div>

              <div className="text-right flex flex-col items-end gap-3 border-l border-white/10 pl-12">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-slate-400 text-sm font-normal uppercase tracking-widest">Level:</span>
                <span className={`px-4 py-1.5 rounded-full border ${
                  level === 'Expert' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  level === 'Intermediate' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                  'bg-slate-500/10 border-slate-500/30 text-slate-400'
                }`}>
                  {level}
                </span>
              </div>
              
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
              >
                <HistoryIcon className="w-4 h-4" /> Debate History
              </button>
            </div>
          </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-2 inline-flex">
              <TrendingUp className="w-6 h-6 text-indigo-400" /> Performance:
            </h3>

            {debatesLoading ? (
              <div className="text-slate-400 text-center py-10">Compiling historical charts...</div>
            ) : learnerDebates.length === 0 ? (
              <div className="text-slate-400 text-center py-10 bg-slate-900/50 rounded-xl border border-white/5">
                No debate history available to chart.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScoreChart 
                  title="Confidence" 
                  dataKey="confidence" 
                  data={chartData} 
                  avg={stats.avgConf}
                  color="#10b981" 
                />
                <ScoreChart 
                  title="Fluency" 
                  dataKey="fluency" 
                  data={chartData} 
                  avg={stats.avgFl}
                  color="#06b6d4" 
                />
                <ScoreChart 
                  title="Argument Strength" 
                  dataKey="argument" 
                  data={chartData} 
                  avg={stats.avgArg}
                  color="#8b5cf6" 
                />
                <ScoreChart 
                  title="Communication" 
                  dataKey="communication" 
                  data={chartData} 
                  avg={stats.avgCom}
                  color="#f43f5e" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Debate History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
            <div className="glass-card w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
               <button 
                 onClick={() => setShowHistoryModal(false)} 
                 className="absolute top-4 right-4 z-50 p-2 bg-slate-900 rounded-full hover:bg-slate-800 border border-white/10 text-white shadow-lg transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex-1 overflow-y-auto p-2 sm:p-6 mt-8">
                 <DebateHistory targetUsername={selectedLearner.username} />
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main List View ---
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold gradient-text mb-6">Student Analytics & Reports</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-semibold text-slate-400">
                <th className="p-3">Learner Name</th>
                <th className="p-3">Total Debates</th>
                <th className="p-3">Assigned Tasks</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{l.fullname}</td>
                  <td className="p-3 text-emerald-400 font-bold">{l.debates}</td>
                  <td className="p-3 text-slate-400">{l.tasks}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setFeedbackUser(l.username)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 border-indigo-500/50 hover:bg-indigo-500/10 hover:border-indigo-500"
                      >
                        <Send className="w-3 h-3" /> Feedback
                      </button>
                      <button 
                        onClick={() => handleSelectLearner(l)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        View Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">No learners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

// Simple History Icon component
const HistoryIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);

// Chart Component wrapper
const ScoreChart = ({ title, dataKey, data, avg, color }) => (
  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
    <h4 className="text-sm text-slate-400 mb-4 font-semibold uppercase tracking-wider">{title}</h4>
    
    <div className="h-64 w-full mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className="text-center pt-3 border-t border-white/5">
      <span className="text-slate-400 text-sm">Overall average score : </span>
      <span className="text-white font-bold text-lg">{avg}</span>
    </div>
  </div>
);
