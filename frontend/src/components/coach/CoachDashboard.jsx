import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Users, Clock, CheckCircle2, Award } from 'lucide-react';

export const CoachDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({ learners: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachStats();
  }, []);

  const loadCoachStats = async () => {
    setLoading(true);
    try {
      const [learners, pending, completed] = await Promise.all([
        api.getUsersByRole('Learner'),
        api.getCoachPendingDebates(),
        api.getCoachReviewedDebates()
      ]);

      setStats({
        learners: Array.isArray(learners) ? learners.length : 0,
        pending: Array.isArray(pending) ? pending.length : 0,
        completed: Array.isArray(completed) ? completed.length : 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading Coach Analytics...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Debate Coach Overview</h2>
        <p className="text-slate-400 text-sm">Review learner debate submissions, provide manual scores, and track feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Learners"
          value={stats.learners}
          icon={Users}
          color="indigo"
          onClick={() => onNavigate('learnersList')}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending}
          icon={Clock}
          color="amber"
          onClick={() => onNavigate('pending')}
        />
        <StatCard
          title="Completed Reviews"
          value={stats.completed}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigate('completed')}
        />
      </div>


    </div>
  );
};
