import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Users, CheckSquare, MessageSquare } from 'lucide-react';

export const EducatorDashboard = ({ onNavigate }) => {
  const [counts, setCounts] = useState({ learners: 0, tasks: 0, feedbacks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [lRes, tRes, fRes] = await Promise.all([
        api.getEducatorLearnersCount(),
        api.getEducatorTasksCount(),
        api.getEducatorFeedbackCount()
      ]);

      setCounts({
        learners: lRes.count || 0,
        tasks: tRes.count || 0,
        feedbacks: fRes.count || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading Educator Stats...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Learner Count"
          value={counts.learners}
          icon={Users}
          color="emerald"
          onClick={() => onNavigate('learnersList')}
        />
        <StatCard
          title="Assigned Tasks"
          value={counts.tasks}
          icon={CheckSquare}
          color="cyan"
          onClick={() => onNavigate('tasksList')}
        />
        <StatCard
          title="Feedbacks"
          value={counts.feedbacks}
          icon={MessageSquare}
          color="violet"
          onClick={() => onNavigate('feedbacksList')}
        />
      </div>
    </div>
  );
};
