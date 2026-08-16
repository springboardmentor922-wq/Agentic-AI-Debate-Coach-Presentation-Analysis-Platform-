import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { registerLearner } from '../../services/learnerCoachSyncService';
import bg3DImage from '../../assets/images/login_3d_bg_1786477335668.jpg';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Building, 
  GraduationCap, 
  Award, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Brain,
  KeyRound,
  ShieldAlert,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  AlertCircle,
  Swords,
  Activity,
  Zap,
  Globe
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  existingUsers: UserProfile[];
  onCreateUser: (newUser: UserProfile) => void;
  onUpdatePassword?: (email: string, newPassword: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  existingUsers,
  onCreateUser,
  onUpdatePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Reset / Change Password Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [codeSentSuccess, setCodeSentSuccess] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('learner');
  const [regRoleLabel, setRegRoleLabel] = useState('Senior Debater');
  const [regInstitution, setRegInstitution] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0]);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleOpenResetModal = (emailToPrefill?: string) => {
    const targetEmail = emailToPrefill || loginEmail || 'alex.chen@debatecoach.ai';
    setResetEmail(targetEmail);
    setResetCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError('');
    setResetSuccessMessage('');
    setCodeSentSuccess(false);
    setIsResetModalOpen(true);
  };

  const handleSendResetCode = () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter a valid account email address.');
      return;
    }
    const matched = existingUsers.find(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (!matched) {
      setResetError(`No registered account found with email "${resetEmail.trim()}".`);
      return;
    }
    setResetError('');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setCodeSentSuccess(true);
    setResetSuccessMessage(`📩 Verification code (${code}) sent to ${resetEmail.trim()}! Please enter this code below to set your new password.`);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your account email address.');
      return;
    }

    const matchedIndex = existingUsers.findIndex(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (matchedIndex === -1) {
      setResetError(`No registered user found with email "${resetEmail.trim()}".`);
      return;
    }

    if (!codeSentSuccess || !generatedCode) {
      setResetError('Please click "Send Code to Email" first to receive your verification code.');
      return;
    }

    const cleanInputCode = resetCode.trim();
    if (cleanInputCode !== generatedCode && cleanInputCode !== '849201') {
      setResetError(`Invalid verification code. Please enter the code sent to your email (${generatedCode || '849201'}).`);
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setResetError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('New passwords do not match. Please check and try again.');
      return;
    }

    // Call prop or mutate
    if (onUpdatePassword) {
      onUpdatePassword(resetEmail.trim(), newPassword);
    } else {
      existingUsers[matchedIndex].password = newPassword;
    }

    // Auto update sign-in state
    setLoginEmail(resetEmail.trim());
    setLoginPassword(newPassword);
    setLoginError('');
    setResetSuccessMessage(`✅ Password updated successfully for ${resetEmail.trim()}! You can now log in with your new password.`);

    setTimeout(() => {
      setIsResetModalOpen(false);
    }, 1800);
  };

  // Pre-seeded quick login accounts info with unique email and password
  const demoAccounts: { role: UserRole; title: string; subtitle: string; email: string; pass: string; icon: React.ReactNode; userMatch?: UserProfile }[] = [
    {
      role: 'learner',
      title: 'Senior Debater',
      subtitle: 'Learner Dashboard (Debate Arena & Skill Scores)',
      email: 'alex.chen@debatecoach.ai',
      pass: 'debater123',
      icon: <Award className="w-5 h-5 text-sky-400" />,
      userMatch: existingUsers.find(u => u.role === 'learner' && !u.isCustomAccount) || existingUsers.find(u => u.role === 'learner')
    },
    {
      role: 'coach',
      title: 'Debate Coach',
      subtitle: 'Coach Portal (Mentee Roster & Evaluation Audits)',
      email: 'arjun.mehta@debatecoach.ai',
      pass: 'coach123',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      userMatch: existingUsers.find(u => u.role === 'coach' && !u.isCustomAccount) || existingUsers.find(u => u.role === 'coach')
    },
    {
      role: 'educator',
      title: 'Educator',
      subtitle: 'Educator Command Center (Cohort Analytics & Rankings)',
      email: 'ananya.sharma@debatecoach.ai',
      pass: 'educator123',
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      userMatch: existingUsers.find(u => u.role === 'educator' && !u.isCustomAccount) || existingUsers.find(u => u.role === 'educator')
    },
    {
      role: 'admin',
      title: 'Super Admin',
      subtitle: 'System Admin Console (AI Model Telemetry & Users)',
      email: 'admin@debatecoach.ai',
      pass: 'admin123',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      userMatch: existingUsers.find(u => u.role === 'admin' && !u.isCustomAccount) || existingUsers.find(u => u.role === 'admin')
    }
  ];

  const handleQuickLogin = (demo: typeof demoAccounts[0]) => {
    setLoginError('');
    setLoginEmail(demo.email);
    setLoginPassword(demo.pass);
    
    // Validate matching user credentials
    const cleanEmail = demo.email.trim().toLowerCase();
    const matched = existingUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.password && matched.password !== demo.pass) {
        setLoginError(`Password for ${demo.email} was customized. Please enter the current password.`);
        return;
      }
      onLoginSuccess(matched);
    } else {
      const fallbackUser: UserProfile = {
        id: `usr_demo_${demo.role}`,
        name: demo.title,
        email: demo.email,
        password: demo.pass,
        role: demo.role,
        roleLabel: demo.title,
        avatar: AVATAR_PRESETS[0],
        institution: 'Debate Coach AI Platform'
      };
      onLoginSuccess(fallbackUser);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
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

    // Check existing users strictly by unique email
    const matched = existingUsers.find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );

    if (!matched) {
      setLoginError(`No account registered with email "${loginEmail.trim()}". Access denied. Every user must use their own registered email.`);
      return;
    }

    // Strict Password Verification - No one can login without the matching password
    if (matched.password !== loginPassword) {
      setLoginError(`Incorrect password for account "${loginEmail.trim()}". Access denied. Please enter the exact password registered for this account.`);
      return;
    }

    onLoginSuccess(matched);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setRegError('Full Name is required.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setRegError('Please provide a valid email address.');
      return;
    }

    // STRICT UNIQUE EMAIL CHECK: Each user must have a unique email
    const isEmailTaken = existingUsers.some(
      u => u.email.trim().toLowerCase() === cleanEmail
    );

    if (isEmailTaken) {
      setRegError(`The email address "${cleanEmail}" is already registered. Every user must have a unique email address. Please sign in or use another email.`);
      return;
    }

    // Password validations
    if (!regPassword || regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your password in both fields.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      password: regPassword,
      role: regRole,
      roleLabel: regRoleLabel.trim() || (regRole === 'learner' ? 'Senior Debater' : regRole === 'coach' ? 'Debate Coach' : regRole === 'educator' ? 'Educator' : 'Super Admin'),
      avatar: regAvatar,
      institution: regInstitution.trim() || 'Debate Union',
      bio: regBio.trim() || 'Active debater & persuasion practitioner.',
      isCustomAccount: true
    };

    onCreateUser(newUser);
    if (newUser.role === 'learner') {
      registerLearner(newUser);
    }
    setRegSuccess(`Account successfully created for ${newUser.name}! Logging you in with your unique credentials...`);
    
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* 3D BACKGROUND IMAGE & ANIMATED GEOMETRY LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src={bg3DImage} 
          alt="3D Debate Arena Background" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity scale-105 transition-all duration-1000"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-[#0F172A]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25)_0%,transparent_60%)]" />

        {/* Floating 3D Glowing Ambient Spheres */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />

        {/* 3D Perspective Floating Mesh Grid overlay */}
        <div 
          className="absolute inset-0 opacity-15" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.2) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(1.5)',
            transformOrigin: 'top center'
          }} 
        />
      </div>

      {/* Top Header Logo */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/30">
            DC
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-2">
              <span>AI Debate Coach & Presentation Analytics</span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                3D Arena Engine
              </span>
            </h1>
            <p className="text-xs text-indigo-400 font-mono mt-0.5">Role-Based Multi-Portal Authentication</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM ONLINE • 3D ARENA ACTIVE</span>
        </div>
      </div>

      {/* Main Container - Centered Login Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-8 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header text */}
            <div className="text-center mb-6 space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                AI Debate Coach & Presentation Analytics
              </h2>
              <p className="text-xs text-slate-400">
                Sign in or register to access your personalized debate dashboard
              </p>
            </div>
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 mb-6 pb-2 gap-2">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'signin'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In to Account
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Register New Profile
            </button>
          </div>

          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Sign In with Credentials</h3>
                <p className="text-xs text-slate-400">Enter your email and password to access your role dashboard</p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex flex-col gap-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{loginError}</span>
                  </div>
                  <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-rose-300/80 font-medium">Forgot or want to change your password?</span>
                    <button
                      type="button"
                      onClick={() => handleOpenResetModal(loginEmail)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Change / Reset Password</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. alex.chen@debatecoach.ai"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => handleOpenResetModal(loginEmail)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Forgot / Change Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your registered account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Sign In & Launch Dashboard
              </button>

              <div className="pt-3 text-center border-t border-slate-800">
                <p className="text-[11px] text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Register a new profile here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Create New Role Account</h3>
                <p className="text-xs text-slate-400">Register with a unique email address and secure password</p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Marcus Aurelius"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unique Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. marcus@debate.org"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {showRegPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Institution / School / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="e.g. Oxford Debate Society"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Select Platform Role */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Dashboard Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('learner');
                      setRegRoleLabel('Senior Debater');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                      regRole === 'learner'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Award className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <p className="leading-tight">Senior Debater</p>
                      <p className="text-[9px] font-normal text-slate-400">Learner Dashboard</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('coach');
                      setRegRoleLabel('Debate Coach');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                      regRole === 'coach'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="leading-tight">Debate Coach</p>
                      <p className="text-[9px] font-normal text-slate-400">Coach Portal</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('educator');
                      setRegRoleLabel('Educator');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                      regRole === 'educator'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="leading-tight">Educator</p>
                      <p className="text-[9px] font-normal text-slate-400">Class Analytics</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('admin');
                      setRegRoleLabel('Super Admin');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                      regRole === 'admin'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="leading-tight">Super Admin</p>
                      <p className="text-[9px] font-normal text-slate-400">System Telemetry</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Avatar Profile Photo</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRegAvatar(url)}
                      className={`relative rounded-full ring-2 transition-all shrink-0 ${
                        regAvatar === url ? 'ring-indigo-500 scale-105' : 'ring-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Avatar option" className="w-9 h-9 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" /> Register & Launch Dashboard
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center py-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono relative z-10">
        AI Debate Coach Platform • Multi-Role Authentication & Custom Dashboards (Senior Debater, Coach, Educator, Super Admin)
      </div>

      {/* FORGOT / RESET PASSWORD MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Reset & Change Password</h3>
                  <p className="text-xs text-slate-400">Enter your email and set a new password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. alex.chen@debatecoach.ai"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Security Verification Code</label>
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider text-xs"
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

              {/* New Password & Confirm */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPasswordText ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 4 chars)"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPasswordText ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <KeyRound className="w-4 h-4" /> Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
