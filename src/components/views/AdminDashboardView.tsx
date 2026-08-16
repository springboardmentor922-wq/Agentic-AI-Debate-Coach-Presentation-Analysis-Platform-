import React, { useState } from 'react';
import { ShieldCheck, Cpu, Activity, Users, BookOpen, FileText, CheckCircle, Search, RefreshCw, AlertCircle, Edit3, UserCheck } from 'lucide-react';
import { MOCK_ADMIN_DATA } from '../../data/mockData';
import { UserProfile, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { assignCoachToLearner, getAssignedCoachForLearner } from '../../services/learnerCoachSyncService';

interface AdminDashboardViewProps {
  activeUser?: UserProfile;
  activeSubTab?: string;
  existingUsers?: UserProfile[];
  onUpdateUser?: (updated: UserProfile) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  activeUser, 
  activeSubTab = 'dashboard',
  existingUsers = [],
  onUpdateUser
}) => {
  const { isDark } = useTheme();
  const adminName = activeUser?.name || 'System Admin';

  const [userOverrides, setUserOverrides] = useState<Record<string, { role: UserRole; status: string }>>({});
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string; role: UserRole; status: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [selectedAssignedCoach, setSelectedAssignedCoach] = useState<string>('Arjun Mehta (Senior Coach)');

  const baseUsers = [
    { id: 'usr_alex', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', role: 'learner', status: 'Active' },
    { id: 'usr_arjun', name: 'Arjun Mehta', email: 'arjun.mehta@debatecoach.ai', role: 'coach', status: 'Active' },
    { id: 'usr_ananya', name: 'Ananya Sharma', email: 'ananya.sharma@debatecoach.ai', role: 'educator', status: 'Active' },
    { id: 'usr_admin', name: 'System Admin', email: 'admin@debatecoach.ai', role: 'admin', status: 'Active' },
    { id: 'usr_siddharth', name: 'Siddharth Rao', email: 'siddharth@student.edu', role: 'learner', status: 'Active' },
  ];

  const allUsersMap = new Map<string, { id: string; name: string; email: string; role: string; status: string }>();

  baseUsers.forEach(u => allUsersMap.set(u.email.toLowerCase(), u));

  existingUsers.forEach(u => {
    allUsersMap.set(u.email.toLowerCase(), {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'Active'
    });
  });

  const normalizeRole = (roleStr: string): UserRole => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('admin')) return 'admin';
    if (r.includes('educator') || r.includes('teacher')) return 'educator';
    if (r.includes('coach')) return 'coach';
    return 'learner';
  };

  const displayUsers = Array.from(allUsersMap.values()).map(u => {
    const override = userOverrides[u.id] || userOverrides[u.email.toLowerCase()];
    return {
      ...u,
      role: override?.role || normalizeRole(u.role),
      status: override?.status || u.status
    };
  });

  const [roleUpdateNotification, setRoleUpdateNotification] = useState<string | null>(null);

  const handleSaveUserRole = () => {
    if (!editingUser) return;
    const key = editingUser.id;
    const emailKey = editingUser.email.toLowerCase();

    setUserOverrides(prev => ({
      ...prev,
      [key]: { role: selectedRole, status: selectedStatus },
      [emailKey]: { role: selectedRole, status: selectedStatus }
    }));

    if (selectedRole === 'learner') {
      assignCoachToLearner(editingUser.email || editingUser.id, selectedAssignedCoach, activeUser?.name || 'System Admin');
    }

    const roleLabels: Record<UserRole, string> = {
      learner: 'Senior Debater',
      coach: 'Debate Coach',
      educator: 'Educator',
      admin: 'Super Admin'
    };

    if (onUpdateUser) {
      const existing = existingUsers.find(x => x.id === editingUser.id || x.email.toLowerCase() === emailKey);
      onUpdateUser({
        id: existing?.id || editingUser.id,
        name: existing?.name || editingUser.name,
        email: existing?.email || editingUser.email,
        password: existing?.password || 'password123',
        role: selectedRole,
        roleLabel: roleLabels[selectedRole] || selectedRole,
        avatar: existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        institution: existing?.institution || 'Debate Union',
        assignedCoach: selectedRole === 'learner' ? selectedAssignedCoach : undefined,
        isCustomAccount: true
      });
    }

    const coachAuditDetail = selectedRole === 'learner' ? ` & Mentor: ${selectedAssignedCoach}` : '';

    setAuditLogs(prev => [
      {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: activeUser?.email || 'admin@platform.com',
        action: `Admin updated role for ${editingUser.name} to ${selectedRole} (${selectedStatus})${coachAuditDetail}`,
        status: 'Success'
      },
      ...prev
    ]);

    setRoleUpdateNotification(`Updated ${editingUser.name}'s role to ${selectedRole.toUpperCase()} (${selectedStatus})${selectedRole === 'learner' ? ` with assigned coach ${selectedAssignedCoach}` : ''}`);
    setTimeout(() => setRoleUpdateNotification(null), 4000);

    setEditingUser(null);
  };

  const [auditLogs, setAuditLogs] = useState([
    { id: '1', timestamp: '2026-08-09 08:24', user: 'admin@platform.com', action: 'Modified Gemini API Quota Limit', status: 'Success' },
    { id: '2', timestamp: '2026-08-09 07:15', user: 'educator1@school.edu', action: 'Created Class: AP Rhetoric Debate', status: 'Success' },
    { id: '3', timestamp: '2026-08-09 06:02', user: 'coach1@debate.edu', action: 'Generated Fallacy Speech Audit', status: 'Success' },
    { id: '4', timestamp: '2026-08-08 22:40', user: 'system', action: 'PostgreSQL Relational DB Backup', status: 'Success' },
  ]);

  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';

  const renderEditRoleModal = () => {
    if (!editingUser) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-5 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
            <div>
              <h3 className="font-bold text-base">Edit User Role & Access</h3>
              <p className="text-xs text-slate-400 mt-0.5">{editingUser.name} ({editingUser.email})</p>
            </div>
            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">User Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="learner">Learner (Debater)</option>
                <option value="coach">Debate Coach</option>
                <option value="educator">Educator (Teacher)</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            {selectedRole === 'learner' && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1.5">
                <label className="font-semibold text-indigo-400 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Assign Primary Mentor Coach (Admin Authority)
                </label>
                <select 
                  value={selectedAssignedCoach}
                  onChange={(e) => setSelectedAssignedCoach(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Arjun Mehta (Senior Coach)">Arjun Mehta (Senior Coach)</option>
                  <option value="Dr. Evelyn Reed (Rhetoric Specialist)">Dr. Evelyn Reed (Rhetoric Specialist)</option>
                  <option value="Ananya Sharma (Speech Evaluator)">Ananya Sharma (Speech Evaluator)</option>
                  <option value="Debate Coach 1 (Beginner)">Debate Coach 1 (Beginner)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Only System Admins have authority to assign or reallocate mentor coaches to learners.
                </p>
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1.5">Account Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700/50">
            <button 
              onClick={() => setEditingUser(null)} 
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveUserRole} 
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW: User Management ---
  if (activeSubTab === 'user-management') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>User Management</h2>
            <p className={`text-xs ${textSub}`}>Manage platform accounts and coach assignments across Learners, Coaches, Educators, and Admins.</p>
          </div>
        </div>

        {roleUpdateNotification && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {roleUpdateNotification}
            </span>
            <button onClick={() => setRoleUpdateNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        <div className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Assigned Mentor Coach</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayUsers.map((u, uIdx) => {
                  const normRole = normalizeRole(u.role);
                  const userCoach = getAssignedCoachForLearner(u.email || u.id);
                  return (
                    <tr key={`admin_user_${u.id}_${uIdx}`} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold">{u.name}</td>
                      <td className="p-3 font-mono">{u.email}</td>
                      <td className="p-3 capitalize font-semibold text-indigo-400">{normRole}</td>
                      <td className="p-3">
                        {normRole === 'learner' ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-400" /> {userCoach}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">Faculty / Staff</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            setEditingUser({
                              id: u.id,
                              name: u.name,
                              email: u.email,
                              role: normRole,
                              status: u.status
                            });
                            setSelectedRole(normRole);
                            setSelectedStatus(u.status || 'Active');
                            setSelectedAssignedCoach(getAssignedCoachForLearner(u.email || u.id));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Edit Role & Coach
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {renderEditRoleModal()}
      </div>
    );
  }

  // --- SUBVIEW: Content Management ---
  if (activeSubTab === 'content-management') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Content Management</h2>
          <p className={`text-xs ${textSub}`}>Curate global debate motions, AI prompt rules, and learning materials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>Global Debate Motions (32 Topics)</h3>
            <p className={`text-xs ${textSub}`}>Active topics available in the AI Simulation & Practice modules.</p>
            <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Manage Motions</button>
          </div>
          <div className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>AI Agent Persona Rules</h3>
            <p className={`text-xs ${textSub}`}>Prompt configurations for Agent 1 (Referee) & Agent 2 (Rival).</p>
            <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Configure Prompts</button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBVIEW: System Health & Telemetry ---
  if (activeSubTab === 'system-health') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>System Health & Telemetry</h2>
          <p className={`text-xs ${textSub}`}>Real-time agent responsiveness and API quotas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader} flex items-center gap-2`}>
              <Cpu className="w-4 h-4 text-indigo-400" /> AI Agent Services
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-xl flex justify-between">
                <span>Logical Fallacy Referee</span>
                <span className="text-emerald-400 font-bold">18ms Latency</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl flex justify-between">
                <span>Rival Opponent Agent</span>
                <span className="text-indigo-400 font-bold">42ms Latency</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl flex justify-between">
                <span>Speech Analysis Engine</span>
                <span className="text-emerald-400 font-bold">Operational</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader} flex items-center gap-2`}>
              <Activity className="w-4 h-4 text-emerald-400" /> Database Services
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-emerald-950/40 rounded-xl flex justify-between border border-emerald-800/40">
                <span>PostgreSQL DB</span>
                <span className="text-emerald-400 font-bold">Connected (0.4ms)</span>
              </div>
              <div className="p-2.5 bg-indigo-950/40 rounded-xl flex justify-between border border-indigo-800/40">
                <span>MongoDB Logs DB</span>
                <span className="text-indigo-400 font-bold">Streaming Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBVIEW: Audit Logs ---
  if (activeSubTab === 'audit-logs') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Platform Audit Logs</h2>
          <p className={`text-xs ${textSub}`}>System event trail and administrative actions log.</p>
        </div>

        <div className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log, lIdx) => (
                  <tr key={`audit_row_${log.id}_${lIdx}`} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="p-3 font-semibold">{log.user}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT SUBVIEW: Admin Dashboard ---
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-sky-400/30">
        <div className="space-y-1">
          <span className="text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Super Admin ({adminName})
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Platform Operations & Telemetry ⚙️</h2>
          <p className="text-sky-100 text-xs font-medium">Monitoring 8 AI Agents, Gemini API quotas, database synchronization, and user activity</p>
        </div>

        <div className="bg-emerald-400/20 text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs border border-emerald-300/40 shadow-md">
          Platform Status: 100% Operational
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Users</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{displayUsers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Learners</p>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{displayUsers.filter(u => u.role === 'learner').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Coaches</p>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{displayUsers.filter(u => u.role === 'coach').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Educators</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{displayUsers.filter(u => u.role === 'educator').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Debates</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{MOCK_ADMIN_DATA.debatesConducted}</p>
        </div>
      </div>

      {/* Agent Telemetry & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 8 Specialized AI Agents Health
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl">
              <span className="font-medium text-slate-800 dark:text-slate-200">Agent 1: Logical Fallacy Referee</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.0 Temp • 18ms Latency</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl">
              <span className="font-medium text-slate-800 dark:text-slate-200">Agent 2: Rival Opponent Player</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">0.7 Temp • 42ms Latency</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl">
              <span className="font-medium text-slate-800 dark:text-slate-200">Argument Analysis Agent</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimal</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl">
              <span className="font-medium text-slate-800 dark:text-slate-200">Speech & Presentation Analytics</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimal</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> System Architecture & Databases
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-900 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="font-medium">PostgreSQL Relational DB</span>
              <span className="font-bold">Tabular Metrics Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-900 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/40">
              <span className="font-medium">MongoDB Chat Logs DB</span>
              <span className="font-bold">JSON Logs Streamed</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-900 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/40">
              <span className="font-medium">Gemini 2.5 AI Pipeline</span>
              <span className="font-bold">Schema Enforcement Active</span>
            </div>
          </div>
        </div>
      </div>

      {renderEditRoleModal()}
    </div>
  );
};
