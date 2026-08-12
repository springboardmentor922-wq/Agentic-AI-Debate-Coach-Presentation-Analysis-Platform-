import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Calendar, UserCheck, Check, Sparkles, Building, Edit3, Save, X } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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

export const ProfileView: React.FC<ProfileViewProps> = ({ activeUser, onUpdateProfile }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState('Debate Coach 1 (Beginner)');
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
    }
  }, [activeUser]);

  const coachOptions = [
    'Debate Coach 1 (Beginner)',
    'Arjun Mehta (Senior Coach)',
    'Dr. Evelyn Reed (Rhetoric Specialist)',
    'Ananya Sharma (Speech Evaluator)'
  ];

  const handleSaveCoach = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    setSaveMessage('Profile details updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
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
          <p className={`text-xs ${textSub}`}>Manage your learner account info, background, and assigned mentor coach</p>
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
          {/* Profile Card */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
            <div className={`flex items-center gap-4 border-b pb-4 ${borderDivider}`}>
              <img 
                src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt={activeUser?.name || "User"} 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50"
              />
              <div>
                <h3 className={`font-bold text-base ${textHeader}`}>{activeUser?.name || 'learner1'}</h3>
                <p className="text-xs text-indigo-500 font-semibold">{activeUser?.roleLabel || 'Learner'}</p>
                <p className={`text-[11px] font-mono mt-0.5 ${textSub}`}>{activeUser?.email || 'learner1@gmail.com'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <User className="w-3.5 h-3.5 text-slate-400" /> Name:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.name || 'learner1'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.email || 'learner1@gmail.com'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Institution:
                </span>
                <span className={`font-semibold ${textHeader}`}>{activeUser?.institution || 'Debate League'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Role:
                </span>
                <span className="font-semibold text-indigo-500 capitalize">{activeUser?.roleLabel || 'Learner'}</span>
              </div>

              <div className={`flex items-center justify-between py-1 border-b ${borderDivider}`}>
                <span className={`${textSub} flex items-center gap-2`}>
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Experience:
                </span>
                <span className="font-semibold text-emerald-500">Beginner</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className={`${textSub} flex items-center gap-2`}>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since:
                </span>
                <span className={`font-mono ${textHeader}`}>19/7/2026</span>
              </div>
            </div>
          </div>

          {/* My Coach Section */}
          <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-colors ${cardBgClass}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${textHeader}`}>👨‍🏫 My Coach</h3>
                  <p className={`text-xs ${textSub}`}>Currently mentored by {selectedCoach}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className={`text-xs font-medium ${textHeader}`}>Select Primary Mentor Coach</label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
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
                <div className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Assigned Feedback Loop
                </div>
                <p className={`text-[11px] ${textSub}`}>
                  Your assigned coach reviews completed debate transcripts and provides speech quality reports every week.
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveCoach}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved Coach!
                </>
              ) : (
                'Save Coach'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
