import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Users, Mic, UserCheck, ShieldAlert, UserPlus, BookOpen } from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_debates: 0,
    learners: 0,
    educators: 0,
    coaches: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      if (data) setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading System Analytics...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold gradient-text">Administrator</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Platform Users"
          value={stats.total_users}
          icon={Users}
          color="indigo"
          onClick={() => onNavigate('users')}
        />
        <StatCard
          title="Total Debates Attempted"
          value={stats.total_debates}
          icon={Mic}
          color="cyan"
          onClick={() => onNavigate('debates')}
        />
        <StatCard
          title="Learners Count"
          value={stats.learners}
          icon={UserCheck}
          color="emerald"
          onClick={() => onNavigate('users', 'Learner')}
        />
        <StatCard
          title="Debate Coaches"
          value={stats.coaches}
          icon={ShieldAlert}
          color="amber"
          onClick={() => onNavigate('users', 'Debate Coach')}
        />
        <StatCard
          title="Educators"
          value={stats.educators}
          icon={Users}
          color="violet"
          onClick={() => onNavigate('users', 'Educator')}
        />
        <StatCard
          title="System Admins"
          value={stats.admins}
          icon={Users}
          color="rose"
          onClick={() => onNavigate('users', 'Admin')}
        />
      </div>



      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          loadStats();
        }}
      />
    </div>
  );
};
