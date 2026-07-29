import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import {
  User,
  Settings,
  Shield,
  Bell,
  Cpu,
  Check,
  Save,
  Building,
  Mail,
  Lock,
  Sparkles,
  UserCheck,
  UserPlus,
  RefreshCw,
  Camera,
  Award,
  Globe,
  Sliders,
  Trash2,
  AlertTriangle,
  X,
  Trophy
} from 'lucide-react';
import { BadgesShowcase } from '../badges/BadgesShowcase';

interface SettingsViewProps {
  activeUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAuthModal: () => void;
  onDeleteAccount?: (userId: string) => void;
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

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeUser,
  onUpdateProfile,
  onOpenAuthModal,
  onDeleteAccount
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'preferences' | 'security'>('profile');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form local state initialized with current activeUser
  const [name, setName] = useState(activeUser.name);
  const [email, setEmail] = useState(activeUser.email);
  const [role, setRole] = useState<UserRole>(activeUser.role);
  const [roleLabel, setRoleLabel] = useState(activeUser.roleLabel);
  const [institution, setInstitution] = useState(activeUser.institution || '');
  const [bio, setBio] = useState(activeUser.bio || '');
  const [avatar, setAvatar] = useState(activeUser.avatar);

  // Platform preferences state
  const [refereeStrictness, setRefereeStrictness] = useState<'strict' | 'balanced' | 'lenient'>('strict');
  const [opponentCreativity, setOpponentCreativity] = useState<number>(0.7);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Toast / feedback message
  const [savedMessage, setSavedMessage] = useState('');

  // Keep state in sync if activeUser changes externally
  useEffect(() => {
    setName(activeUser.name);
    setEmail(activeUser.email);
    setRole(activeUser.role);
    setRoleLabel(activeUser.roleLabel);
    setInstitution(activeUser.institution || '');
    setBio(activeUser.bio || '');
    setAvatar(activeUser.avatar);
  }, [activeUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...activeUser,
      name: name.trim() || activeUser.name,
      email: email.trim() || activeUser.email,
      role: role,
      roleLabel: roleLabel.trim() || activeUser.roleLabel,
      institution: institution.trim(),
      bio: bio.trim(),
      avatar: avatar,
    };

    onUpdateProfile(updated);
    setSavedMessage('Profile updated and saved successfully!');
    setTimeout(() => {
      setSavedMessage('');
    }, 3500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#1E293B] rounded-full flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{name}</h2>
              {activeUser.isCustomAccount && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                  Custom Account
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-400 font-medium">{roleLabel} • {institution || 'Debate Coach AI'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{email}</p>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Switch or Create Account
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/80 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> My Registered Profile
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'badges'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" /> Badges & Achievements
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> AI & Platform Preferences
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Session
        </button>
      </div>

      {/* Success Notification */}
      {savedMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" /> {savedMessage}
        </div>
      )}

      {/* TAB 1: EDIT REGISTERED PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" /> Edit Profile & Credentials
              </h3>
              <p className="text-xs text-slate-400">Update your public identity, title, school, and debate background.</p>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Profile Avatar</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatar(url)}
                    className={`relative rounded-full ring-2 transition-all shrink-0 ${
                      avatar === url ? 'ring-indigo-500 scale-110' : 'ring-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">School / Institution / Club</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Harvard Debate Team"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custom Role Title</label>
                <input
                  type="text"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  placeholder="e.g. AP Rhetoric Lead / Parliamentary Captain"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Perspective Role</label>
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
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium capitalize flex items-center justify-center gap-1.5 ${
                      role === r
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Debate Background</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your experience, preferred debate formats, or coaching focus..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: BADGES & ACHIEVEMENTS */}
      {activeTab === 'badges' && (
        <BadgesShowcase />
      )}

      {/* TAB 2: AI & PLATFORM PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-md space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> AI Coach & Evaluation Settings
            </h3>
            <p className="text-xs text-slate-400">Customize how the Gemini AI referee judges logic and generates counterarguments.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Referee Strictness */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">AI Referee Fallacy Strictness</p>
                  <p className="text-slate-400 text-[11px]">Controls how strictly the referee flags informal fallacies and weak evidence.</p>
                </div>
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {(['strict', 'balanced', 'lenient'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setRefereeStrictness(mode)}
                      className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                        refereeStrictness === mode
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opponent Creativity */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Rival AI Opponent Creativity (Temperature)</p>
                  <p className="text-slate-400 text-[11px]">Higher values yield unpredictable arguments; lower values yield precise logical rebuttals.</p>
                </div>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800">
                  {opponentCreativity}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={opponentCreativity}
                onChange={(e) => setOpponentCreativity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Notifications toggle */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Email & Performance Alerts</p>
                <p className="text-slate-400 text-[11px]">Receive summary reports after simulated debate sessions.</p>
              </div>
              <button
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                  emailNotifs ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & SESSION */}
      {activeTab === 'security' && (
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-md space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Account Security & Session Overview
            </h3>
            <p className="text-xs text-slate-400">Current authenticated session details and system permissions.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">User Account ID</span>
              <span className="font-mono text-indigo-300 font-semibold">{activeUser.id}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Account Type</span>
              <span className="text-emerald-400 font-semibold">
                {activeUser.isCustomAccount ? 'Custom Registered Profile' : 'System Preset Profile'}
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Active Role Permission</span>
              <span className="text-white font-bold uppercase">{activeUser.role}</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" /> Switch Active Profile or Sign Out
            </button>

            {/* Danger Zone: Delete Account */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone: Permanent Account Deletion
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Permanently delete profile <strong className="text-slate-200">{activeUser.name}</strong> ({activeUser.email}).
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#1E293B] border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Profile Account?</h3>
                  <p className="text-xs text-rose-300">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Preview */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-3">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{activeUser.name}</p>
                <p className="text-[11px] text-indigo-400 truncate">{activeUser.roleLabel}</p>
                <p className="text-[10px] text-slate-400 truncate">{activeUser.email}</p>
              </div>
            </div>

            {/* Warning Text */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this user profile? All locally stored settings and credentials for <span className="font-semibold text-white">{activeUser.name}</span> will be permanently removed.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onDeleteAccount) {
                    onDeleteAccount(activeUser.id);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
