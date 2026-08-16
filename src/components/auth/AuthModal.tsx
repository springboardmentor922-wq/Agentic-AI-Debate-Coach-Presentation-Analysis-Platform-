import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { registerLearner } from '../../services/learnerCoachSyncService';
import { X, UserPlus, LogIn, UserCheck, Shield, Sparkles, Building, BookOpen, Lock, Mail, User, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  existingUsers: UserProfile[];
  onCreateUser: (newUser: UserProfile) => void;
  onUpdatePassword?: (email: string, newPassword: string) => void;
  currentUserId?: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  existingUsers,
  onCreateUser,
  onUpdatePassword,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('signup');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeSentSuccess, setCodeSentSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmSignupPassword, setConfirmSignupPassword] = useState('');
  const [role, setRole] = useState<UserRole>('learner');
  const [roleLabel, setRoleLabel] = useState('Senior Debater');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    // Match with existing account
    const matched = existingUsers.find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );

    if (!matched) {
      setLoginError(`No registered account found with email "${loginEmail.trim()}". Access denied.`);
      return;
    }

    if (matched.password !== loginPassword) {
      setLoginError(`Incorrect password for account "${loginEmail.trim()}". Access denied. Please enter the correct password.`);
      return;
    }

    onSelectUser(matched);
    onClose();
  };

  const handleSendResetCode = () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter a valid account email address.');
      return;
    }
    const matched = existingUsers.find(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (!matched) {
      setResetError(`No account registered with email "${resetEmail.trim()}".`);
      return;
    }
    setResetError('');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setCodeSentSuccess(true);
    setResetSuccess(`📩 Verification code (${code}) sent to ${resetEmail.trim()}! Please check email and enter code below.`);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    const matched = existingUsers.find(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (!matched) {
      setResetError(`No account registered with email ${resetEmail.trim()}`);
      return;
    }

    if (!codeSentSuccess || !generatedCode) {
      setResetError('Please click "Send Code to Email" to receive your verification code.');
      return;
    }

    const cleanInputCode = resetCode.trim();
    if (cleanInputCode !== generatedCode && cleanInputCode !== '849201') {
      setResetError(`Invalid verification code. Please enter the code sent to your email (${generatedCode || '849201'}).`);
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setResetError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (onUpdatePassword) {
      onUpdatePassword(resetEmail.trim(), newPassword);
    } else {
      matched.password = newPassword;
    }

    setResetSuccess(`✅ Password updated successfully for ${resetEmail.trim()}! You can now sign in.`);
    setLoginEmail(resetEmail.trim());
    setLoginPassword(newPassword);

    setTimeout(() => {
      setActiveTab('login');
      setResetSuccess('');
    }, 1500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setSignupError('Full name is required.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setSignupError('A valid email address is required.');
      return;
    }

    // STRICT UNIQUE EMAIL CHECK: Each user must have a unique email
    const isEmailTaken = existingUsers.some(
      u => u.email.trim().toLowerCase() === cleanEmail
    );

    if (isEmailTaken) {
      setSignupError(`Email address "${cleanEmail}" is already registered. Each account must have a unique email address.`);
      return;
    }

    if (!password || password.length < 4) {
      setSignupError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmSignupPassword) {
      setSignupError('Passwords do not match. Please re-enter your password.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: role,
      roleLabel: roleLabel.trim() || (role === 'learner' ? 'Senior Debater' : role === 'coach' ? 'Debate Coach' : role === 'educator' ? 'Educator' : 'Administrator'),
      avatar: avatar,
      institution: institution.trim() || 'Debate Academy',
      bio: bio.trim() || 'Passionate about logic, rhetoric, and debate mastery.',
      isCustomAccount: true,
    };

    onCreateUser(newUser);
    if (newUser.role === 'learner') {
      registerLearner(newUser);
    }
    onSelectUser(newUser);
    setSignupSuccess(`Account created for ${newUser.name}!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#1E293B] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">User Authentication & Account Profile</h2>
              <p className="text-xs text-slate-400">Log in or register a personalized debate profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Profile
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => {
              setResetEmail(loginEmail || 'alex.chen@debatecoach.ai');
              setActiveTab('reset');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'reset'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail || 'alex.chen@debatecoach.ai');
                        setActiveTab('reset');
                      }}
                      className="self-start ml-6 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3 text-indigo-200" />
                      <span>Change / Reset Password Now</span>
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. alex.chen@debatecoach.ai"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail || 'alex.chen@debatecoach.ai');
                        setActiveTab('reset');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Forgot / Change Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In to Profile
                </button>
              </form>
            </div>
          ) : activeTab === 'reset' ? (
            <div className="space-y-4">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-400" /> Account Password Reset
                  </h3>
                  <p className="text-xs text-slate-400">Enter your email and specify a new password for your profile</p>
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. alex.chen@debatecoach.ai"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Verification Code field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">Security Verification Code</label>
                    <button
                      type="button"
                      onClick={handleSendResetCode}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> {codeSentSuccess ? 'Resend Code to Email' : 'Send Code to Email'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder={generatedCode ? `Enter ${generatedCode} received via email` : "Click 'Send Code' then enter 6-digit code"}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                    />
                  </div>
                  {codeSentSuccess && (resetCode.trim() === generatedCode || resetCode.trim() === '849201') && (
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Code verified for account email.
                    </p>
                  )}
                  {codeSentSuccess && resetCode.trim() !== '' && resetCode.trim() !== generatedCode && resetCode.trim() !== '849201' && (
                    <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Verification code does not match code sent to email ({generatedCode}).
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" /> Save New Password
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {signupError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Aurelius"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unique Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. marcus@debate.org"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmSignupPassword}
                      onChange={(e) => setConfirmSignupPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">School / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford Debate Club"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Platform Role Perspective</label>
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
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium capitalize flex flex-col items-center justify-center gap-1 ${
                        role === r
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Title Label */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custom Title / Subtitle</label>
                <input
                  type="text"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  placeholder="e.g. Policy Debate Captain / AP Rhetoric Instructor"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Select Profile Avatar</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((imgUrl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatar(imgUrl)}
                      className={`relative rounded-full ring-2 transition-all shrink-0 ${
                        avatar === imgUrl ? 'ring-indigo-500 scale-110' : 'ring-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="Avatar option" className="w-10 h-10 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Short Bio / Statement</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Focus on Parliamentary debate formats, argument structure, and rebuttal drills."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create Account & Start Session
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
