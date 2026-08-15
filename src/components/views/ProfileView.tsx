import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Calendar, UserCheck, Check, Sparkles, Building, Edit3, Save, X, Lock, ShieldCheck, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getAssignedCoachForLearner, assignCoachToLearner } from '../../services/learnerCoachSyncService';

interface ProfileViewProps {
  activeUser?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

const COACH_DATABASE: Record<string, { title: string; specialty: string; avatar: string; rating: number }> = {
  'Arjun Mehta (Senior Coach)': {
    title: 'Senior Debate Coach',
    specialty: 'Parliamentary & Cross-Examination',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    rating: 4.9
  },
  'Dr. Evelyn Reed (Rhetoric Specialist)': {
    title: 'Rhetoric & Logic Lead',
    specialty: 'Oxford Format & Fallacy Defense',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 4.95
  },
  'Ananya Sharma (Speech Evaluator)': {
    title: 'Speech Cadence Specialist',
    specialty: 'Vocal Delivery & Dynamic Pacing',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    rating: 4.85
  },
  'Debate Coach 1 (Beginner)': {
    title: 'Foundational Debate Mentor',
    specialty: 'Constructive Speeches & Rebuttals',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.8
  }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ activeUser, onUpdateProfile }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Current user role
  const isAdmin = activeUser?.role === 'admin';
  const isCoach = activeUser?.role === 'coach';
  const isEducator = activeUser?.role === 'educator';
  const isLearner = !isAdmin && !isCoach && !isEducator;

  // Resolve assigned coach
  const currentAssignedCoach = activeUser?.assignedCoach || 
    getAssignedCoachForLearner(activeUser?.email || activeUser?.id || '') || 
    'Arjun Mehta (Senior Coach)';

  const [selectedAdminCoach, setSelectedAdminCoach] = useState(currentAssignedCoach);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Reassignment request modal/state for learners
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Form local state
  const [name, setName] = useState(activeUser?.name || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [roleLabel, setRoleLabel] = useState(activeUser?.roleLabel || '');
  const [role, setRole] = useState<UserRole>(activeUser?.role || 'learner');
  const [institution, setInstitution] = useState(activeUser?.institution || '');
  const [bio, setBio] = useState(activeUser?.bio || '');
  const [avatar, setAvatar] = useState(activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name);
      setEmail(activeUser.email);
      setRoleLabel(activeUser.roleLabel);
      setRole(activeUser.role);
      setInstitution(activeUser.institution || '');
      setBio(activeUser.bio || '');
      setAvatar(activeUser.avatar);
      setSelectedAdminCoach(activeUser.assignedCoach || getAssignedCoachForLearner(activeUser.email || activeUser.id || ''));
    }
  }, [activeUser]);

  const coachOptions = [
    'Arjun Mehta (Senior Coach)',
    'Dr. Evelyn Reed (Rhetoric Specialist)',
    'Ananya Sharma (Speech Evaluator)',
    'Debate Coach 1 (Beginner)'
  ];

  const handleAdminAssignCoach = () => {
    if (!isAdmin || !activeUser) return;
    assignCoachToLearner(activeUser.email || activeUser.id, selectedAdminCoach, activeUser.name);
    
    if (onUpdateProfile) {
      onUpdateProfile({
        ...activeUser,
        assignedCoach: selectedAdminCoach
      });
    }
    
    setIsSaved(true);
    setSaveMessage(`Assigned coach "${selectedAdminCoach}" successfully!`);
    setTimeout(() => {
      setIsSaved(false);
      setSaveMessage('');
    }, 3000);
  };

  const handleSendReassignmentRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestSubmitted(false);
      setRequestReason('');
      setSaveMessage('Reassignment request sent to System Administrator.');
      setTimeout(() => setSaveMessage(''), 3500);
    }, 1800);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !onUpdateProfile) return;

    const updated: UserProfile = {
      ...activeUser,
      name: name.trim() || activeUser.name,
      email: email.trim() || activeUser.email,
      roleLabel: roleLabel.trim() || activeUser.roleLabel,
      role: role,
      institution: institution.trim(),
      bio: bio.trim(),
      avatar: avatar,
      assignedCoach: activeUser.assignedCoach || currentAssignedCoach
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    setSaveMessage('Profile details updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const coachInfo = COACH_DATABASE[currentAssignedCoach] || {
    title: 'Senior Debate Coach',
    specialty: 'Parliamentary Debate & Logic',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    rating: 4.9
  };

  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderDivider = isDark ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>My Profile</h2>
          <p className={`text-xs ${textSub}`}>
            {isLearner && "Manage your learner account info, background, and view your admin-assigned mentor coach"}
            {isAdmin && "Manage your Administrator account credentials and coach allocation governance"}
            {isCoach && "Manage your Debate Coach faculty credentials and active mentee specialization"}
            {isEducator && "Manage your Educator faculty profile and academic department details"}
          </p>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
            isEditing
              ? isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-200 text-slate-800 border border-slate-300'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" /> {saveMessage}
        </div>
      )}

      {/* EDIT FORM MODE */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className={`p-6 rounded-2xl border space-y-6 ${cardBgClass}`}>
          <div className={`border-b pb-4 ${borderDivider}`}>
            <h3 className={`font-bold text-base ${textHeader}`}>Edit Profile Credentials</h3>
            <p className={`text-xs ${textSub}`}>Update your public profile details, school, role, and avatar.</p>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold block ${textHeader}`}>Choose Profile Avatar</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {AVATAR_PRESETS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatar(url)}
                  className={`relative rounded-full ring-2 transition-all shrink-0 cursor-pointer ${
                    avatar === url ? 'ring-indigo-500 scale-110' : 'ring-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={`font-semibold block mb-1 ${textHeader}`}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`font-semibold block mb-1 ${textHeader}`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`font-semibold block mb-1 ${textHeader}`}>School / Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford Debate Society"
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`font-semibold block mb-1 ${textHeader}`}>Role Title</label>
              <input
                type="text"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="e.g. Parliamentary Lead"
                className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${textHeader}`}>Perspective Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['learner', 'coach', 'educator', 'admin'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setRole(r);
                    if (r === 'learner') setRoleLabel('Learner / Debater');
                    if (r === 'coach') setRoleLabel('Debate Coach');
                    if (r === 'educator') setRoleLabel('Educator');
                    if (r === 'admin') setRoleLabel('System Admin');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium capitalize flex items-center justify-center cursor-pointer ${
                    role === r
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold'
                      : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${textHeader}`}>Bio & Debate Background</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your coach about your goals, favorite debate topics..."
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      ) : (
        /* VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Details Card */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
            <div className={`flex items-center gap-4 border-b pb-4 ${borderDivider}`}>
              <img 
                src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt={activeUser?.name || "User"} 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
              />
              <div>
                <h3 className={`font-bold text-base ${textHeader}`}>{activeUser?.name || 'User'}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mt-1">
                  <Shield className="w-3 h-3" /> {activeUser?.roleLabel || 'Learner'}
                </span>
                <p className={`text-[11px] font-mono mt-1 ${textSub}`}>{activeUser?.email || 'user@debatecoach.ai'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.name || 'User'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.email || 'user@debatecoach.ai'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Institution:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.institution || 'Stanford Debate Union'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Access Tier:
                </span>
                <span className="font-semibold text-indigo-500 capitalize">{activeUser?.role || 'Learner'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Experience:
                </span>
                <span className="font-semibold text-emerald-500">
                  {isAdmin ? 'System Administrator' : isCoach ? 'Senior Faculty' : isEducator ? 'Curriculum Lead' : 'Senior Debater'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className={`${textSub} flex items-center gap-2`}>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since:
                </span>
                <span className={`font-mono ${textHeader}`}>19/7/2026</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: ROLE-SPECIFIC COACH / GOVERNANCE PANEL */}
          {/* ========================================================================= */}

          {/* CASE 1: LEARNER PROFILE (READ-ONLY ASSIGNED COACH - ADMIN GOVERNANCE ONLY) */}
          {isLearner && (
            <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
              <div className="space-y-4">
                {/* Header with Admin-Assigned Badge */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${textHeader}`}>👨‍🏫 Assigned Mentor Coach</h3>
                      <p className={`text-[11px] ${textSub}`}>Assigned via Department Administration</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" /> Admin Assigned
                  </span>
                </div>

                {/* Assigned Coach Profile Card */}
                <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <img 
                    src={coachInfo.avatar} 
                    alt={currentAssignedCoach} 
                    className="w-13 h-13 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0" 
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold text-sm truncate ${textHeader}`}>{currentAssignedCoach}</h4>
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-0.5 shrink-0">
                        ★ {coachInfo.rating}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-400 font-medium">{coachInfo.title}</p>
                    <p className={`text-[11px] truncate ${textSub}`}>Specialty: {coachInfo.specialty}</p>
                  </div>
                </div>

                {/* Feedback Stream Info */}
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-indigo-500 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> Assigned Feedback Loop
                  </div>
                  <p className={`text-[11px] leading-relaxed ${textSub}`}>
                    {currentAssignedCoach} continuously reviews your completed debate transcripts, fallacy logs, and submits weekly pace & rhetoric reports.
                  </p>
                </div>

                {/* Administrative Authority Notice */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}>
                  <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[11px] leading-snug">
                    <p className="font-semibold text-slate-300">Administrative Allocation Policy</p>
                    <p>
                      Mentor coach assignments are officially managed by System Administrators to ensure balanced mentee ratios and discipline tracks. Learners cannot self-assign coaches.
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Reassignment Action */}
              <button
                onClick={() => setShowRequestModal(true)}
                className={`w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark 
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300' 
                    : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Request Coach Reassignment
              </button>
            </div>
          )}

          {/* CASE 2: ADMIN PROFILE (ADMINISTRATIVE COACH ALLOCATION CONTROLS) */}
          {isAdmin && (
            <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${textHeader}`}>👑 Coach Assignment Authority</h3>
                      <p className={`text-[11px] ${textSub}`}>Super Administrator Allocation Controls</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin Access
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <label className={`text-xs font-semibold ${textHeader}`}>Select Primary Mentor Coach to Allocate</label>
                  <select
                    value={selectedAdminCoach}
                    onChange={(e) => setSelectedAdminCoach(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-slate-200' 
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    {coachOptions.map((coach) => (
                      <option key={coach} value={coach}>{coach}</option>
                    ))}
                  </select>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                    <Shield className="w-3.5 h-3.5" /> Administrative Rule
                  </div>
                  <p className={`text-[11px] leading-relaxed ${textSub}`}>
                    As System Administrator, assigning a mentor coach updates the learner's feedback pipeline, synchronizes telemetry, and sends an official notification.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdminAssignCoach}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Assignment Saved!
                  </>
                ) : (
                  'Save Coach Assignment (Admin)'
                )}
              </button>
            </div>
          )}

          {/* CASE 3: COACH PROFILE (FACULTY ROSTER & MENTOR STATUS) */}
          {isCoach && (
            <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${textHeader}`}>🎯 Coaching Faculty Status</h3>
                      <p className={`text-[11px] ${textSub}`}>Admin-Verified Faculty Mentor</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Faculty Coach
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Assigned Cohort:</span>
                    <span className="font-bold text-white">18 Active Debaters</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Evaluation SLA:</span>
                    <span className="font-bold text-emerald-400">&lt; 24h Speech Audit</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Specialization:</span>
                    <span className="font-bold text-indigo-400">Parliamentary & Cross-Exam</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" /> Certified Platform Coach (Admin Authorized)
              </div>
            </div>
          )}

          {/* CASE 4: EDUCATOR PROFILE (INSTITUTIONAL CURRICULUM STATUS) */}
          {isEducator && (
            <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${textHeader}`}>🏫 Academic Faculty Status</h3>
                      <p className={`text-[11px] ${textSub}`}>Curriculum Lead & Institutional Evaluator</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Faculty Lead
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Active Debate Classes:</span>
                    <span className="font-bold text-white">4 Sections (82 Students)</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400">Curriculum Track:</span>
                    <span className="font-bold text-amber-400">Competitive AP Rhetoric</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-indigo-300 text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" /> Department Course Adjudication Active
              </div>
            </div>
          )}
        </div>
      )}

      {/* REASSIGNMENT REQUEST MODAL FOR LEARNERS */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Request Coach Reassignment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Submit transfer request to Department Admin</p>
              </div>
              <button 
                onClick={() => setShowRequestModal(false)} 
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-emerald-400">Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your transfer request (Ref #CR-2026) has been logged with Department Administrators. You will receive a notification upon review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReassignmentRequest} className="space-y-4 text-xs">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs">
                  <strong>Current Assigned Mentor:</strong> {currentAssignedCoach}
                </div>

                <div>
                  <label className="font-semibold block mb-1">Reason for Reassignment Request</label>
                  <textarea
                    rows={3}
                    required
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="e.g. Seeking specialization in Oxford format or scheduling alignment..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700/50">
                  <button 
                    type="button"
                    onClick={() => setShowRequestModal(false)} 
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Request to Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

