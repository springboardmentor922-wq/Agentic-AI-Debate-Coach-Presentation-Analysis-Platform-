import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Users, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Edit3, 
  UserCheck, 
  Plus, 
  Trash2, 
  Download, 
  Sliders, 
  Sparkles, 
  Zap, 
  Check, 
  X, 
  Database, 
  Server, 
  Play, 
  ArrowRight, 
  Lock, 
  MessageSquare, 
  SlidersHorizontal,
  Layers,
  Scale,
  Gauge,
  Terminal,
  Radio,
  BarChart3,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { MOCK_ADMIN_DATA, MOCK_PRACTICE_TOPICS } from '../../data/mockData';
import { UserProfile, UserRole, PracticeTopic } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { assignCoachToLearner, getAssignedCoachForLearner } from '../../services/learnerCoachSyncService';

interface AdminDashboardViewProps {
  activeUser?: UserProfile;
  activeSubTab?: string;
  existingUsers?: UserProfile[];
  onUpdateUser?: (updated: UserProfile) => void;
  onNavigate?: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  activeUser, 
  activeSubTab = 'dashboard',
  existingUsers = [],
  onUpdateUser,
  onNavigate
}) => {
  const { isDark } = useTheme();
  const adminName = activeUser?.name || 'System Admin';

  // Internal tab state if navigated from within Admin dashboard
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab);

  useEffect(() => {
    setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // ----------------------------------------------------
  // 1. CONTENT MANAGEMENT STATE (Motions & Prompts)
  // ----------------------------------------------------
  const [contentSubTab, setContentSubTab] = useState<'motions' | 'prompts' | 'rubrics'>('motions');
  const [motionSearchQuery, setMotionSearchQuery] = useState('');
  const [motionCategoryFilter, setMotionCategoryFilter] = useState('All');
  const [motionDifficultyFilter, setMotionDifficultyFilter] = useState('All');

  // Load / Store Topics
  const [topicsList, setTopicsList] = useState<PracticeTopic[]>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_admin_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load stored topics', e);
    }
    return MOCK_PRACTICE_TOPICS;
  });

  const saveTopicsList = (newList: PracticeTopic[]) => {
    setTopicsList(newList);
    try {
      localStorage.setItem('ai_debate_admin_topics', JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to persist topics list', e);
    }
  };

  // Motion Modal (Add / Edit)
  const [isMotionModalOpen, setIsMotionModalOpen] = useState(false);
  const [editingMotion, setEditingMotion] = useState<PracticeTopic | null>(null);
  const [motionTitle, setMotionTitle] = useState('');
  const [motionCategory, setMotionCategory] = useState<'Technology' | 'Environment' | 'Society' | 'Politics' | 'Ethics'>('Technology');
  const [motionDifficulty, setMotionDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [motionDesc, setMotionDesc] = useState('');
  const [motionArgsFor, setMotionArgsFor] = useState('');
  const [motionArgsAgainst, setMotionArgsAgainst] = useState('');

  const handleOpenAddMotion = () => {
    setEditingMotion(null);
    setMotionTitle('');
    setMotionCategory('Technology');
    setMotionDifficulty('Intermediate');
    setMotionDesc('');
    setMotionArgsFor('Accelerates innovation and scientific discovery\nAutomates high-risk repetitive tasks\nDemocratizes access to high quality services');
    setMotionArgsAgainst('Potential disruption to legacy workforces\nAlgorithmic bias and safety vulnerabilities\nEconomic disparity and control concentration');
    setIsMotionModalOpen(true);
  };

  const handleOpenEditMotion = (topic: PracticeTopic) => {
    setEditingMotion(topic);
    setMotionTitle(topic.title);
    setMotionCategory(topic.category);
    setMotionDifficulty(topic.difficulty);
    setMotionDesc(topic.description);
    setMotionArgsFor((topic.keyArgumentsFor || []).join('\n'));
    setMotionArgsAgainst((topic.keyArgumentsAgainst || []).join('\n'));
    setIsMotionModalOpen(true);
  };

  const handleSaveMotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motionTitle.trim()) {
      showToast('Please provide a motion title.', 'error');
      return;
    }

    const argsForArray = motionArgsFor.split('\n').map(s => s.trim()).filter(Boolean);
    const argsAgainstArray = motionArgsAgainst.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingMotion) {
      // Update existing
      const updated = topicsList.map(t => {
        if (t.id === editingMotion.id) {
          return {
            ...t,
            title: motionTitle.trim(),
            category: motionCategory,
            difficulty: motionDifficulty,
            description: motionDesc.trim() || 'Debate motion curated by System Administrator.',
            keyArgumentsFor: argsForArray,
            keyArgumentsAgainst: argsAgainstArray,
          };
        }
        return t;
      });
      saveTopicsList(updated);
      showToast(`Updated debate motion "${motionTitle.trim()}"`);
      logAuditAction(`Admin edited debate topic: ${motionTitle.trim()}`);
    } else {
      // Create new
      const newTopic: PracticeTopic = {
        id: `top_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: motionTitle.trim(),
        category: motionCategory,
        difficulty: motionDifficulty,
        description: motionDesc.trim() || 'Debate motion curated by System Administrator.',
        keyArgumentsFor: argsForArray,
        keyArgumentsAgainst: argsAgainstArray,
        popularityCount: 1,
      };
      saveTopicsList([newTopic, ...topicsList]);
      showToast(`Created new debate motion: "${newTopic.title}"`);
      logAuditAction(`Admin created new debate topic: ${newTopic.title}`);
    }
    setIsMotionModalOpen(false);
  };

  const handleDeleteMotion = (topicId: string, title: string) => {
    if (confirm(`Are you sure you want to remove the motion: "${title}"?`)) {
      const updated = topicsList.filter(t => t.id !== topicId);
      saveTopicsList(updated);
      showToast(`Removed debate motion "${title}"`, 'info');
      logAuditAction(`Admin deleted debate topic: ${title}`);
    }
  };

  const handleResetTopics = () => {
    if (confirm('Reset all debate motions to platform defaults?')) {
      saveTopicsList(MOCK_PRACTICE_TOPICS);
      showToast('Debate motions reset to standard defaults.');
      logAuditAction('Admin reset debate topics catalog to factory defaults');
    }
  };

  // AI Prompt & Persona Configurator State
  const [selectedAgentId, setSelectedAgentId] = useState<'referee' | 'rival' | 'speech' | 'arbiter'>('referee');
  
  const [agentConfigs, setAgentConfigs] = useState({
    referee: {
      name: 'Agent 01: Logical Fallacy Referee',
      systemPrompt: 'You are an objective Parliamentary and Oxford Debate Adjudicator and Fallacy Auditor. You evaluate claims strictly for formal and informal fallacies (Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Circular Reasoning, Red Herring). When detected, flag the offending text with pinpoint explanations and severity deductions.',
      temperature: 0.0,
      fallacySensitivity: 85,
      strictness: 'Strict',
      autoGenerateCounter: true,
      strictCitations: true
    },
    rival: {
      name: 'Agent 02: Rival Opponent Player',
      systemPrompt: 'You are a formidable collegiate varsity debater. Listen to the user\'s affirmative or negative speech, identify structural weaknesses in their warrant and impact statements, and formulate a high-conviction 2-point refutation followed by a decisive counter-argument.',
      temperature: 0.7,
      fallacySensitivity: 60,
      strictness: 'Aggressive',
      personaStyle: 'Oxford Orator',
      rebuttalPoints: 2
    },
    speech: {
      name: 'Agent 03: Acoustic & Rhetoric Speech Coach',
      systemPrompt: 'Evaluate vocal pacing, filler frequency (um, uh, like, you know), clarity metrics, and cadence variance. Provide actionable vocal coaching adjustments.',
      temperature: 0.2,
      targetWpm: 145,
      fillerTolerance: 'Low (Max 2 per min)',
      energyBenchmark: 'Dynamic'
    },
    arbiter: {
      name: 'Agent 04: Multi-Agent Consensus Arbiter',
      systemPrompt: 'Synthesize outputs from Referee, Rival, and Rhetoric engines into a consolidated score rubric and actionable learning takeaway.',
      temperature: 0.1,
      consensusWeight: 100
    }
  });

  // Prompt Test Playground
  const [testSpeechInput, setTestSpeechInput] = useState('We must immediately ban artificial intelligence because if machines think for us, humans will stop using their brains completely, leading to total societal ruin.');
  const [testAgentOutput, setTestAgentOutput] = useState<string | null>(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  const handleTestAgentPrompt = () => {
    setIsTestingAgent(true);
    setTestAgentOutput(null);

    setTimeout(() => {
      setIsTestingAgent(false);
      if (selectedAgentId === 'referee') {
        setTestAgentOutput(
          JSON.stringify({
            fallacy_detected: true,
            fallacy_type: "Slippery Slope & False Dilemma",
            offending_text: "if machines think for us, humans will stop using their brains completely, leading to total societal ruin",
            explanation: "The argument assumes an extreme catastrophic chain reaction without demonstrating necessary intermediate causal links.",
            penalty_points: 18,
            confidence_score: 96,
            latency: "19ms"
          }, null, 2)
        );
      } else if (selectedAgentId === 'rival') {
        setTestAgentOutput(
          JSON.stringify({
            rebuttal_summary: "Refutes existential complacency premise with historical augmentation precedents.",
            counter_points: [
              "Technological tools historically amplify cognitive leverage (e.g. printing press, calculators) rather than terminating intellectual faculty.",
              "Total prohibition foregoes critical medical, climate, and logistical breakthroughs without addressing clandestine development."
            ],
            confidence: 94,
            latency: "38ms"
          }, null, 2)
        );
      } else {
        setTestAgentOutput(
          JSON.stringify({
            metrics_audit: "Speech clarity calibrated. Filler word density 0.0%, Pacing simulated at 142 WPM (Optimal).",
            status: "Optimal Resonance Verified"
          }, null, 2)
        );
      }
    }, 700);
  };

  const handleSavePromptConfig = () => {
    try {
      localStorage.setItem('ai_debate_agent_configs', JSON.stringify(agentConfigs));
      showToast(`Saved and deployed configurations for ${agentConfigs[selectedAgentId].name}!`);
      logAuditAction(`Admin updated AI prompt rules & hyper-parameters for ${agentConfigs[selectedAgentId].name}`);
    } catch (e) {
      console.error('Failed to save agent configs', e);
    }
  };

  // Rubrics State
  const [rubricWeights, setRubricWeights] = useState({
    logic: 35,
    evidence: 25,
    fallacy: 20,
    delivery: 20
  });

  const handleSaveRubrics = () => {
    showToast('Platform scoring rubrics calibrated and saved!');
    logAuditAction(`Admin updated scoring rubrics: Logic ${rubricWeights.logic}%, Evidence ${rubricWeights.evidence}%, Fallacy ${rubricWeights.fallacy}%, Delivery ${rubricWeights.delivery}%`);
  };

  // ----------------------------------------------------
  // 2. USER MANAGEMENT & COACH ASSIGNMENT STATE
  // ----------------------------------------------------
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userOverrides, setUserOverrides] = useState<Record<string, { role: UserRole; status: string }>>({});
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string; role: UserRole; status: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [selectedAssignedCoach, setSelectedAssignedCoach] = useState<string>('Arjun Mehta (Senior Coach)');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('learner');
  const [newUserInstitution, setNewUserInstitution] = useState('');
  const [newUserAssignedCoach, setNewUserAssignedCoach] = useState('Arjun Mehta (Senior Coach)');

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

  const filteredUsers = displayUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || normalizeRole(u.role) === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

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

    logAuditAction(`Admin updated role for ${editingUser.name} to ${selectedRole} (${selectedStatus})${selectedRole === 'learner' ? ` & Assigned Coach: ${selectedAssignedCoach}` : ''}`);
    showToast(`Updated ${editingUser.name}'s role to ${selectedRole.toUpperCase()}`);
    setEditingUser(null);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newUserEmail.trim().toLowerCase();
    const cleanName = newUserName.trim();

    if (!cleanName || !cleanEmail) {
      showToast('Name and email are required.', 'error');
      return;
    }

    if (existingUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      showToast(`User with email "${cleanEmail}" already exists.`, 'error');
      return;
    }

    const roleLabels: Record<UserRole, string> = {
      learner: 'Senior Debater',
      coach: 'Debate Coach',
      educator: 'Educator',
      admin: 'Super Admin'
    };

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      password: newUserPassword || 'password123',
      role: newUserRole,
      roleLabel: roleLabels[newUserRole],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution: newUserInstitution.trim() || 'Debate Society',
      assignedCoach: newUserRole === 'learner' ? newUserAssignedCoach : undefined,
      isCustomAccount: true
    };

    if (newUserRole === 'learner') {
      assignCoachToLearner(newUser.email, newUserAssignedCoach, activeUser?.name || 'System Admin');
    }

    if (onUpdateUser) {
      onUpdateUser(newUser);
    }

    showToast(`Account successfully created for ${newUser.name} (${newUser.roleLabel})`);
    logAuditAction(`Admin provisioned new account: ${newUser.name} (${newUser.email}) as ${newUser.role}`);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleExportUsersCsv = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Assigned Coach'];
    const rows = displayUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.role === 'learner' ? getAssignedCoachForLearner(u.email || u.id) : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `debate_platform_users_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users roster to CSV');
    logAuditAction('Admin exported complete users roster CSV');
  };

  // ----------------------------------------------------
  // 3. SYSTEM HEALTH & DIAGNOSTICS STATE
  // ----------------------------------------------------
  const [isRunningPing, setIsRunningPing] = useState(false);
  const [pingResults, setPingResults] = useState<{
    referee: { latency: number; status: string };
    rival: { latency: number; status: string };
    speech: { latency: number; status: string };
    analysis: { latency: number; status: string };
    postgres: { latency: number; status: string };
    mongo: { latency: number; status: string };
  }>({
    referee: { latency: 18, status: 'Operational' },
    rival: { latency: 42, status: 'Operational' },
    speech: { latency: 14, status: 'Operational' },
    analysis: { latency: 22, status: 'Operational' },
    postgres: { latency: 0.4, status: 'Connected' },
    mongo: { latency: 1.1, status: 'Streaming' }
  });

  const handleRunHealthCheck = () => {
    setIsRunningPing(true);
    setTimeout(() => {
      setPingResults({
        referee: { latency: Math.floor(Math.random() * 10) + 14, status: 'Optimal (200 OK)' },
        rival: { latency: Math.floor(Math.random() * 15) + 35, status: 'Optimal (200 OK)' },
        speech: { latency: Math.floor(Math.random() * 8) + 12, status: 'Optimal (200 OK)' },
        analysis: { latency: Math.floor(Math.random() * 12) + 18, status: 'Optimal (200 OK)' },
        postgres: { latency: Number((Math.random() * 0.5 + 0.2).toFixed(2)), status: 'Connected Pool Active' },
        mongo: { latency: Number((Math.random() * 0.8 + 0.8).toFixed(2)), status: 'JSON Pipe Live' }
      });
      setIsRunningPing(false);
      showToast('Real-time diagnostics check completed: 100% services healthy');
      logAuditAction('Admin executed full system health diagnostics ping');
    }, 1000);
  };

  const handleFlushCache = () => {
    showToast('AI response buffer & Redis cache successfully purged (14.2 MB freed)');
    logAuditAction('Admin flushed AI response telemetry cache');
  };

  // ----------------------------------------------------
  // 4. PLATFORM AUDIT LOGS STATE
  // ----------------------------------------------------
  const [auditLogs, setAuditLogs] = useState<{ id: string; timestamp: string; user: string; action: string; status: string }[]>([
    { id: '1', timestamp: '2026-08-17 11:24', user: activeUser?.email || 'admin@debatecoach.ai', action: 'Modified Gemini API Quota Limits to 500 RPM', status: 'Success' },
    { id: '2', timestamp: '2026-08-17 10:15', user: 'educator1@school.edu', action: 'Created Class Assignment: AP Rhetoric Debate', status: 'Success' },
    { id: '3', timestamp: '2026-08-17 09:02', user: 'coach1@debate.edu', action: 'Generated Speech Fallacy Audit for Alex Chen', status: 'Success' },
    { id: '4', timestamp: '2026-08-17 08:40', user: 'system_daemon', action: 'Automated PostgreSQL Relational DB Snapshot', status: 'Success' },
    { id: '5', timestamp: '2026-08-17 07:12', user: 'admin@debatecoach.ai', action: 'Calibrated Logical Fallacy Referee strictness parameter', status: 'Success' },
  ]);

  const [auditSearch, setAuditSearch] = useState('');

  const logAuditAction = (actionStr: string) => {
    const newEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: activeUser?.email || 'admin@debatecoach.ai',
      action: actionStr,
      status: 'Success'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const handleExportAuditCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Action', 'Status'];
    const rows = auditLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `platform_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported audit trail to CSV');
  };

  // Card theme classes
  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';

  // ----------------------------------------------------
  // MODALS
  // ----------------------------------------------------
  const renderEditRoleModal = () => {
    if (!editingUser) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-5 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
            <div>
              <h3 className="font-bold text-base">Edit User Role & Authority</h3>
              <p className="text-xs text-slate-400 mt-0.5">{editingUser.name} ({editingUser.email})</p>
            </div>
            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">User Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="learner">Learner (Senior Debater)</option>
                <option value="coach">Debate Coach</option>
                <option value="educator">Educator (Teacher / Professor)</option>
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
                  Admins hold exclusive authority to assign or reallocate mentor coaches to learners.
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
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

  const renderAddUserModal = () => {
    if (!isAddUserModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Provision New Platform Account</h3>
            </div>
            <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
          </div>

          <form onSubmit={handleCreateNewUser} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold block mb-1">Full Name *</label>
              <input 
                type="text" 
                required
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Unique Email Address *</label>
              <input 
                type="email" 
                required
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="e.g. eleanor.vance@debatecoach.ai"
                className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Password *</label>
                <input 
                  type="password" 
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Account Role *</label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="learner">Learner (Debater)</option>
                  <option value="coach">Debate Coach</option>
                  <option value="educator">Educator (Teacher)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            </div>

            {newUserRole === 'learner' && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                <label className="font-semibold text-indigo-400 block">Assigned Mentor Coach</label>
                <select 
                  value={newUserAssignedCoach}
                  onChange={e => setNewUserAssignedCoach(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Arjun Mehta (Senior Coach)">Arjun Mehta (Senior Coach)</option>
                  <option value="Dr. Evelyn Reed (Rhetoric Specialist)">Dr. Evelyn Reed (Rhetoric Specialist)</option>
                  <option value="Ananya Sharma (Speech Evaluator)">Ananya Sharma (Speech Evaluator)</option>
                </select>
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1">Institution / School</label>
              <input 
                type="text" 
                value={newUserInstitution}
                onChange={e => setNewUserInstitution(e.target.value)}
                placeholder="e.g. Oxford Debate Society"
                className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/50">
              <button 
                type="button"
                onClick={() => setIsAddUserModalOpen(false)} 
                className={`px-4 py-2 rounded-xl font-semibold border cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMotionModal = () => {
    if (!isMotionModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div className={`w-full max-w-xl p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">{editingMotion ? 'Edit Debate Motion' : 'Add New Debate Motion'}</h3>
            </div>
            <button onClick={() => setIsMotionModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
          </div>

          <form onSubmit={handleSaveMotion} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold block mb-1">Motion Title / Proposition Statement *</label>
              <input 
                type="text" 
                required
                value={motionTitle}
                onChange={e => setMotionTitle(e.target.value)}
                placeholder="e.g. This House Would Ban Algorithmic High-Frequency Trading"
                className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Category *</label>
                <select 
                  value={motionCategory}
                  onChange={e => setMotionCategory(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Technology">Technology</option>
                  <option value="Ethics">Ethics</option>
                  <option value="Environment">Environment</option>
                  <option value="Politics">Politics</option>
                  <option value="Society">Society</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Difficulty Level *</label>
                <select 
                  value={motionDifficulty}
                  onChange={e => setMotionDifficulty(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Context / Description</label>
              <textarea 
                rows={2}
                value={motionDesc}
                onChange={e => setMotionDesc(e.target.value)}
                placeholder="Provide briefing context for the debate rounds..."
                className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-emerald-400">Key Arguments FOR (1 per line)</label>
                <textarea 
                  rows={3}
                  value={motionArgsFor}
                  onChange={e => setMotionArgsFor(e.target.value)}
                  placeholder="Point 1&#10;Point 2&#10;Point 3"
                  className={`w-full p-2.5 rounded-xl border font-mono ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-rose-400">Key Arguments AGAINST (1 per line)</label>
                <textarea 
                  rows={3}
                  value={motionArgsAgainst}
                  onChange={e => setMotionArgsAgainst(e.target.value)}
                  placeholder="Point 1&#10;Point 2&#10;Point 3"
                  className={`w-full p-2.5 rounded-xl border font-mono ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/50">
              <button 
                type="button"
                onClick={() => setIsMotionModalOpen(false)} 
                className={`px-4 py-2 rounded-xl font-semibold border cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                {editingMotion ? 'Save Changes' : 'Publish Motion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // VIEW: 1. CONTENT MANAGEMENT
  // ----------------------------------------------------
  if (currentTab === 'content-management') {
    const filteredMotions = topicsList.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(motionSearchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(motionSearchQuery.toLowerCase());
      const matchesCat = motionCategoryFilter === 'All' || t.category === motionCategoryFilter;
      const matchesDiff = motionDifficultyFilter === 'All' || t.difficulty === motionDifficultyFilter;
      return matchesSearch && matchesCat && matchesDiff;
    });

    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Content & Multi-Agent Curriculum Management</h2>
            <p className={`text-xs ${textSub}`}>Curate global debate motions, configure AI Agent prompts & parameters, and calibrate scoring rubrics.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-700/80">
            <button 
              onClick={() => setContentSubTab('motions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentSubTab === 'motions' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Debate Motions ({topicsList.length})
            </button>
            <button 
              onClick={() => setContentSubTab('prompts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentSubTab === 'prompts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Agent Prompts & Rules
            </button>
            <button 
              onClick={() => setContentSubTab('rubrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentSubTab === 'rubrics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scoring Rubrics
            </button>
          </div>
        </div>

        {notification && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
            notification.type === 'error' 
              ? 'bg-rose-950/80 border border-rose-700 text-rose-300' 
              : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
          }`}>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-white hover:opacity-75 cursor-pointer">✕</button>
          </div>
        )}

        {/* MOTIONS TAB */}
        {contentSubTab === 'motions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    value={motionSearchQuery}
                    onChange={e => setMotionSearchQuery(e.target.value)}
                    placeholder="Search debate motions by title or keywords..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
                <select 
                  value={motionCategoryFilter}
                  onChange={e => setMotionCategoryFilter(e.target.value)}
                  className={`p-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="All">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Ethics">Ethics</option>
                  <option value="Environment">Environment</option>
                  <option value="Politics">Politics</option>
                  <option value="Society">Society</option>
                </select>
                <select 
                  value={motionDifficultyFilter}
                  onChange={e => setMotionDifficultyFilter(e.target.value)}
                  className={`p-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={handleResetTopics}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Defaults
                </button>
                <button 
                  onClick={handleOpenAddMotion}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Debate Motion
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMotions.map(topic => (
                <div key={topic.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:border-indigo-500/50 ${cardBgClass}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        topic.category === 'Technology' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        topic.category === 'Ethics' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        topic.category === 'Environment' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {topic.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {topic.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm leading-snug line-clamp-2">{topic.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{topic.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {topic.keyArgumentsFor?.length || 0} FOR • {topic.keyArgumentsAgainst?.length || 0} AGAINST
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEditMotion(topic)}
                        className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600/30 rounded-lg transition-colors cursor-pointer"
                        title="Edit Motion"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMotion(topic.id, topic.title)}
                        className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete Motion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMotions.length === 0 && (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-semibold">No motions found matching filters</p>
              </div>
            )}
          </div>
        )}

        {/* PROMPTS & PERSONA RULES TAB */}
        {contentSubTab === 'prompts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-4 rounded-2xl border space-y-2 lg:col-span-1 ${cardBgClass}`}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Specialized AI Agents
              </h3>
              
              <button 
                onClick={() => setSelectedAgentId('referee')}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedAgentId === 'referee' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'border-slate-800 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Agent 01: Logical Fallacy Referee</div>
                <div className="text-[11px] opacity-75 mt-0.5">Audits fallacies, circular logic & Ad Hominem</div>
              </button>

              <button 
                onClick={() => setSelectedAgentId('rival')}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedAgentId === 'rival' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'border-slate-800 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Agent 02: Rival Opponent Player</div>
                <div className="text-[11px] opacity-75 mt-0.5">Active refutations, Socratic counter-arguments</div>
              </button>

              <button 
                onClick={() => setSelectedAgentId('speech')}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedAgentId === 'speech' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'border-slate-800 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Agent 03: Speech & Rhetoric Coach</div>
                <div className="text-[11px] opacity-75 mt-0.5">Vocal pacing (WPM), fillers & cadence analysis</div>
              </button>

              <button 
                onClick={() => setSelectedAgentId('arbiter')}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedAgentId === 'arbiter' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'border-slate-800 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Agent 04: Multi-Agent Consensus Arbiter</div>
                <div className="text-[11px] opacity-75 mt-0.5">Aggregates turns, scores & feedback synthesis</div>
              </button>
            </div>

            <div className={`p-6 rounded-2xl border space-y-5 lg:col-span-2 ${cardBgClass}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
                <div>
                  <h3 className="font-bold text-base">{agentConfigs[selectedAgentId].name}</h3>
                  <p className="text-xs text-slate-400">Fine-tune system instructions, temperature, and enforcement constraints</p>
                </div>
                <button 
                  onClick={handleSavePromptConfig}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save & Deploy Rules
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1.5 text-slate-300">System Instruction Prompt Template</label>
                  <textarea 
                    rows={4}
                    value={agentConfigs[selectedAgentId].systemPrompt}
                    onChange={e => {
                      const val = e.target.value;
                      setAgentConfigs(prev => ({
                        ...prev,
                        [selectedAgentId]: { ...prev[selectedAgentId], systemPrompt: val }
                      }));
                    }}
                    className={`w-full p-3 rounded-xl border font-mono leading-relaxed ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Model Temperature</span>
                      <span className="text-indigo-400">{agentConfigs[selectedAgentId].temperature}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05"
                      value={agentConfigs[selectedAgentId].temperature}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setAgentConfigs(prev => ({
                          ...prev,
                          [selectedAgentId]: { ...prev[selectedAgentId], temperature: val }
                        }));
                      }}
                      className="w-full accent-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500">Lower = deterministic analytical auditor; Higher = creative rival persona</p>
                  </div>

                  {selectedAgentId === 'referee' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Fallacy Sensitivity Threshold</span>
                        <span className="text-emerald-400">{agentConfigs.referee.fallacySensitivity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        step="5"
                        value={agentConfigs.referee.fallacySensitivity}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setAgentConfigs(prev => ({
                            ...prev,
                            referee: { ...prev.referee, fallacySensitivity: val }
                          }));
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  )}

                  {selectedAgentId === 'speech' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Target Speech Pace (WPM)</span>
                        <span className="text-sky-400">{agentConfigs.speech.targetWpm} WPM</span>
                      </div>
                      <input 
                        type="range" 
                        min="110" 
                        max="180" 
                        step="5"
                        value={agentConfigs.speech.targetWpm}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setAgentConfigs(prev => ({
                            ...prev,
                            speech: { ...prev.speech, targetWpm: val }
                          }));
                        }}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  )}
                </div>

                {/* Prompt Testing Playground */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-400" /> Interactive Agent Playground Test
                    </span>
                    <button 
                      onClick={handleTestAgentPrompt}
                      disabled={isTestingAgent}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isTestingAgent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Test Prompt Execution
                    </button>
                  </div>

                  <input 
                    type="text"
                    value={testSpeechInput}
                    onChange={e => setTestSpeechInput(e.target.value)}
                    placeholder="Enter sample debater text to test this agent's response rules..."
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                  />

                  {testAgentOutput && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 animate-fadeIn">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Simulated Output Schema & Telemetry</div>
                      <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">{testAgentOutput}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RUBRICS CALIBRATION TAB */}
        {contentSubTab === 'rubrics' && (
          <div className={`p-6 rounded-2xl border space-y-6 max-w-3xl ${cardBgClass}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div>
                <h3 className="font-bold text-base">Debate Scoring Rubrics & Weightage</h3>
                <p className="text-xs text-slate-400">Calibrate the mathematical weightage distribution used across all live evaluations</p>
              </div>
              <button 
                onClick={handleSaveRubrics}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Rubric Weights
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-indigo-400">1. Logical Validity & Argument Structure</span>
                  <span>{rubricWeights.logic}%</span>
                </div>
                <input 
                  type="range" min="10" max="60" step="5"
                  value={rubricWeights.logic}
                  onChange={e => setRubricWeights(p => ({ ...p, logic: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-400">2. Empirical Evidence & Source Grounding</span>
                  <span>{rubricWeights.evidence}%</span>
                </div>
                <input 
                  type="range" min="10" max="50" step="5"
                  value={rubricWeights.evidence}
                  onChange={e => setRubricWeights(p => ({ ...p, evidence: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-rose-400">3. Fallacy Deduction Penalty Weight</span>
                  <span>{rubricWeights.fallacy}%</span>
                </div>
                <input 
                  type="range" min="10" max="40" step="5"
                  value={rubricWeights.fallacy}
                  onChange={e => setRubricWeights(p => ({ ...p, fallacy: parseInt(e.target.value) }))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between font-bold">
                  <span className="text-amber-400">4. Vocal Delivery, Clarity & Cadence</span>
                  <span>{rubricWeights.delivery}%</span>
                </div>
                <input 
                  type="range" min="10" max="40" step="5"
                  value={rubricWeights.delivery}
                  onChange={e => setRubricWeights(p => ({ ...p, delivery: parseInt(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {renderMotionModal()}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: 2. USER MANAGEMENT
  // ----------------------------------------------------
  if (currentTab === 'user-management') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>User Management & Authority Allocation</h2>
            <p className={`text-xs ${textSub}`}>Manage platform accounts, role permissions, and mentor coach allocations for Learners, Coaches, Educators, and Admins.</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportUsersCsv}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add User Account
            </button>
          </div>
        </div>

        {notification && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
            notification.type === 'error' 
              ? 'bg-rose-950/80 border border-rose-700 text-rose-300' 
              : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
          }`}>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-white hover:opacity-75 cursor-pointer">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              placeholder="Search by name, email or role..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
          <select 
            value={userRoleFilter}
            onChange={e => setUserRoleFilter(e.target.value)}
            className={`p-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
          >
            <option value="All">All Roles</option>
            <option value="Learner">Learners (Debaters)</option>
            <option value="Coach">Debate Coaches</option>
            <option value="Educator">Educators</option>
            <option value="Admin">Administrators</option>
          </select>
        </div>

        <div className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Unique Email</th>
                  <th className="p-3">Role Authority</th>
                  <th className="p-3">Assigned Mentor Coach</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u, uIdx) => {
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
        {renderAddUserModal()}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: 3. SYSTEM HEALTH & TELEMETRY
  // ----------------------------------------------------
  if (currentTab === 'system-health') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>System Health, Latency & Microservice Telemetry</h2>
            <p className={`text-xs ${textSub}`}>Real-time agent responsiveness, pipeline latencies, and API quota monitoring.</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleFlushCache}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Purge Cache
            </button>
            <button 
              onClick={handleRunHealthCheck}
              disabled={isRunningPing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isRunningPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              Run Full Diagnostics Ping
            </button>
          </div>
        </div>

        {notification && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-white hover:opacity-75 cursor-pointer">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader} flex items-center gap-2`}>
              <Cpu className="w-4 h-4 text-indigo-400" /> AI Microservice Agents Telemetry
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200">Logical Fallacy Referee</span>
                  <div className="text-[10px] text-slate-500">Gemini 2.5 Flash • Structured Output</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{pingResults.referee.latency}ms Latency</span>
                  <div className="text-[10px] text-emerald-500">{pingResults.referee.status}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200">Rival Opponent Agent</span>
                  <div className="text-[10px] text-slate-500">Socratic Refutation Player</div>
                </div>
                <div className="text-right">
                  <span className="text-indigo-400 font-bold">{pingResults.rival.latency}ms Latency</span>
                  <div className="text-[10px] text-indigo-400">{pingResults.rival.status}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200">Speech & Acoustic Coach</span>
                  <div className="text-[10px] text-slate-500">WPM & Tone Classifier Engine</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{pingResults.speech.latency}ms Latency</span>
                  <div className="text-[10px] text-emerald-500">{pingResults.speech.status}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200">Argument Analyzer Engine</span>
                  <div className="text-[10px] text-slate-500">Premise-Warrant-Impact Graph</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{pingResults.analysis.latency}ms Latency</span>
                  <div className="text-[10px] text-emerald-500">{pingResults.analysis.status}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader} flex items-center gap-2`}>
              <Database className="w-4 h-4 text-emerald-400" /> Database & Storage Infrastructure
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-emerald-950/30 rounded-xl flex items-center justify-between border border-emerald-800/40">
                <div>
                  <span className="font-semibold text-emerald-200">PostgreSQL Relational DB</span>
                  <div className="text-[10px] text-emerald-400/80">User Credentials, Roles & Rubrics</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">Connected ({pingResults.postgres.latency}ms)</span>
                  <div className="text-[10px] text-emerald-500">{pingResults.postgres.status}</div>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 rounded-xl flex items-center justify-between border border-indigo-800/40">
                <div>
                  <span className="font-semibold text-indigo-200">MongoDB Chat Stream DB</span>
                  <div className="text-[10px] text-indigo-400/80">JSON Arena Transcripts & Fallacy Logs</div>
                </div>
                <div className="text-right">
                  <span className="text-indigo-400 font-bold">Active ({pingResults.mongo.latency}ms)</span>
                  <div className="text-[10px] text-indigo-400">{pingResults.mongo.status}</div>
                </div>
              </div>

              <div className="p-3 bg-purple-950/30 rounded-xl flex items-center justify-between border border-purple-800/40">
                <div>
                  <span className="font-semibold text-purple-200">Gemini 2.5 Flash API Gateway</span>
                  <div className="text-[10px] text-purple-400/80">Rate Limit: 500 RPM • Error Rate: 0.01%</div>
                </div>
                <div className="text-right">
                  <span className="text-purple-400 font-bold">Quota: 94% Healthy</span>
                  <div className="text-[10px] text-purple-400">Low Jitter Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: 4. AUDIT LOGS
  // ----------------------------------------------------
  if (currentTab === 'audit-logs') {
    const filteredLogs = auditLogs.filter(l => 
      l.user.toLowerCase().includes(auditSearch.toLowerCase()) || 
      l.action.toLowerCase().includes(auditSearch.toLowerCase())
    );

    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Platform Audit Logs & Trail</h2>
            <p className={`text-xs ${textSub}`}>System event trail and administrative security actions log.</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportAuditCsv}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            value={auditSearch}
            onChange={e => setAuditSearch(e.target.value)}
            placeholder="Search audit trail by user email, action or keywords..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
          />
        </div>

        <div className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Authorized User</th>
                  <th className="p-3">Administrative Action</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log, lIdx) => (
                  <tr key={`audit_row_${log.id}_${lIdx}`} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-slate-400 shrink-0">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-indigo-300">{log.user}</td>
                    <td className="p-3 text-slate-200">{log.action}</td>
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

  // ----------------------------------------------------
  // DEFAULT: ADMIN DASHBOARD OVERVIEW
  // ----------------------------------------------------
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

        <div className="flex items-center gap-2">
          <div className="bg-emerald-400/20 text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs border border-emerald-300/40 shadow-md">
            Platform Status: 100% Operational
          </div>
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
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{displayUsers.filter(u => normalizeRole(u.role) === 'learner').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Coaches</p>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{displayUsers.filter(u => normalizeRole(u.role) === 'coach').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Debate Motions</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{topicsList.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Debates</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{MOCK_ADMIN_DATA.debatesConducted}</p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => {
            if (onNavigate) onNavigate('content-management');
            else setCurrentTab('content-management');
          }}
          className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 text-left transition-all group cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-xs text-white">Manage Debate Motions</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Add, edit, and curate global debate topics and arguments.</p>
        </button>

        <button 
          onClick={() => {
            if (onNavigate) onNavigate('content-management');
            else {
              setContentSubTab('prompts');
              setCurrentTab('content-management');
            }
          }}
          className="p-4 rounded-2xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600/20 text-left transition-all group cursor-pointer"
        >
          <Cpu className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-xs text-white">Configure AI Prompts</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Tune Referee & Rival system prompts, temperatures, and rules.</p>
        </button>

        <button 
          onClick={() => {
            if (onNavigate) onNavigate('user-management');
            else setCurrentTab('user-management');
          }}
          className="p-4 rounded-2xl border border-sky-500/30 bg-sky-600/10 hover:bg-sky-600/20 text-left transition-all group cursor-pointer"
        >
          <Users className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-xs text-white">User Accounts & Roles</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Allocate permissions, assign mentor coaches, and add accounts.</p>
        </button>

        <button 
          onClick={() => {
            if (onNavigate) onNavigate('system-health');
            else setCurrentTab('system-health');
          }}
          className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-600/10 hover:bg-emerald-600/20 text-left transition-all group cursor-pointer"
        >
          <Activity className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-xs text-white">Telemetry & Latency Ping</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Run microservice ping checks and verify database health.</p>
        </button>
      </div>

      {/* Agent Telemetry & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Specialized AI Agents Health
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
              <span className="font-medium text-slate-800 dark:text-slate-200">Agent 3: Speech & Rhetoric Coach</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">145 WPM Baseline • Optimal</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl">
              <span className="font-medium text-slate-800 dark:text-slate-200">Agent 4: Multi-Agent Consensus Arbiter</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Synthesizer</span>
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
      {renderAddUserModal()}
    </div>
  );
};
