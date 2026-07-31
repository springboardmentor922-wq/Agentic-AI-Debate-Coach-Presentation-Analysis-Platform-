import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckSquare, User, Clock, Play } from 'lucide-react';

export const LearnerTasks = ({ onSelectTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem('username');
      const data = await api.getUserTasks(username);
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading assigned tasks...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Tasks</h2>
        <p className="text-slate-400 text-sm">Tasks assigned directly to you by Educators or Debate Coaches.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-500" />
          <p>No active tasks assigned at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="glass-card p-5 space-y-4 border-indigo-500/20 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-learner">Assigned Task</span>
                  <span className="text-xs text-indigo-400 flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5" /> {task.sender_name} ({task.sender_role})
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">{task.topic}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.duration}s</span>
                  <span>Type: {task.debate_type}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectTask(task)}
                className="w-full btn-primary text-xs py-2.5 justify-center"
              >
                <Play className="w-4 h-4 fill-current" /> Start Assigned Debate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
