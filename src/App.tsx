import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, ActiveDebateSession } from './types';
import { useTheme } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FloatingAIChatbot } from './components/chatbot/FloatingAIChatbot';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';

// Views
import { LearnerDashboardView } from './components/views/LearnerDashboardView';
import { EducatorDashboardView } from './components/views/EducatorDashboardView';
import { CoachDashboardView } from './components/views/CoachDashboardView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { MyDebatesView } from './components/views/MyDebatesView';
import { AIDebateSimulationView } from './components/views/AIDebateSimulationView';
import { PracticeTopicsView } from './components/views/PracticeTopicsView';
import { ArgumentAnalyzerView } from './components/views/ArgumentAnalyzerView';
import { FallacyDetectorView } from './components/views/FallacyDetectorView';
import { CounterargumentGeneratorView } from './components/views/CounterargumentGeneratorView';
import { PresentationAnalysisView } from './components/views/PresentationAnalysisView';
import { PerformanceScoresView } from './components/views/PerformanceScoresView';
import { FeedbackCoachingView } from './components/views/FeedbackCoachingView';
import { LearningResourcesView } from './components/views/LearningResourcesView';
import { MyNotesView } from './components/views/MyNotesView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { HelpSupportView } from './components/views/HelpSupportView';
import { ProfileView } from './components/views/ProfileView';

const DEFAULT_PROFILES: UserProfile[] = [
  { id: 'usr_alex', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', password: 'debater123', role: 'learner', roleLabel: 'Senior Debater', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', institution: 'Stanford Debate Union' },
  { id: 'usr_arjun', name: 'Arjun Mehta', email: 'arjun.mehta@debatecoach.ai', password: 'coach123', role: 'coach', roleLabel: 'Debate Coach', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', institution: 'National Speech & Debate Assoc.' },
  { id: 'usr_ananya', name: 'Ananya Sharma', email: 'ananya.sharma@debatecoach.ai', password: 'educator123', role: 'educator', roleLabel: 'Educator', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', institution: 'Department of Communication' },
  { id: 'usr_admin', name: 'System Admin', email: 'admin@debatecoach.ai', password: 'admin123', role: 'admin', roleLabel: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', institution: 'Platform Ops' },
  { id: 'usr_siddharth', name: 'Siddharth Rao', email: 'siddharth@student.edu', password: 'student123', role: 'learner', roleLabel: 'Debater', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', institution: 'Debate Club' },
];

export function App() {
  const { isDark } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_coach_custom_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_PROFILES, ...parsed];
      }
    } catch (e) {
      console.error('Failed to parse saved user accounts', e);
    }
    return DEFAULT_PROFILES;
  });

  const [activeUser, setActiveUser] = useState<UserProfile>(DEFAULT_PROFILES[0]);
  const currentRole = activeUser.role;
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [activeSession, setActiveSession] = useState<ActiveDebateSession>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.topic) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse active debate session', e);
    }
    return {
      id: 'session_default',
      topic: 'Universal Basic Income creates a safety net for economic innovation.',
      format: 'One-on-One',
      side: 'Proposition',
      turns: [
        {
          id: 'turn_0',
          userText: 'UBI provides financial security that empowers individuals to take entrepreneurial risks without fear of poverty.',
          aiRebuttal: "While you argue that UBI might stifle ambition, isn't it more accurate to say that it creates a floor for creative risk? Without the fear of poverty, how many would-be entrepreneurs are actually liberated?",
          wpm: 142,
          paceStatus: 'Optimal',
          fallacyMetrics: {
            fallacy_detected: false,
            fallacy_type: 'None',
            explanation: 'No logical inconsistencies found in economic rationale.',
            counter_strategy: 'Frame economic burden vs creative liberation.'
          },
          argumentScore: 88,
          activatedAgents: ['Argument Analysis', 'Agent 01: Referee', 'Agent 02: Rival'],
          timestamp: '10:30 AM'
        }
      ],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  });

  const [activeDebateTopic, setActiveDebateTopic] = useState<string>(activeSession.topic);

  const handleUpdateActiveSession = (updatedSession: ActiveDebateSession) => {
    setActiveSession(updatedSession);
    setActiveDebateTopic(updatedSession.topic);
    try {
      localStorage.setItem('ai_debate_active_session', JSON.stringify(updatedSession));
    } catch (e) {
      console.error('Failed to save active session', e);
    }
  };

  const handleCompleteActiveSession = (sessionToComplete: ActiveDebateSession) => {
    const completedSession: ActiveDebateSession = {
      ...sessionToComplete,
      status: 'completed',
      lastUpdated: new Date().toISOString()
    };
    setActiveSession(completedSession);
    try {
      localStorage.setItem('ai_debate_active_session', JSON.stringify(completedSession));

      // Append to completed list in localStorage for MyDebatesView
      const existingStr = localStorage.getItem('ai_debate_completed_list');
      const existingList = existingStr ? JSON.parse(existingStr) : [];
      const turns = completedSession.turns || [];
      const avgScore = turns.length > 0
        ? Math.round(turns.reduce((acc, t) => acc + (t.argumentScore || 80), 0) / turns.length)
        : 85;

      const newHistoryItem = {
        id: completedSession.id,
        title: completedSession.topic,
        format: completedSession.format,
        status: 'Completed',
        side: completedSession.side === 'Proposition' ? 'For' : 'Against',
        date: new Date().toLocaleDateString(),
        score: avgScore,
        report: {
          grade: avgScore >= 85 ? 'A' : avgScore >= 75 ? 'B' : 'C',
          gradeColor: avgScore >= 85 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
          overallSummary: `Completed ${turns.length} debate turn(s) for motion: "${completedSession.topic}".`,
          metrics: {
            clarity: avgScore,
            evidence: Math.max(avgScore - 4, 50),
            reasoning: Math.min(avgScore + 3, 98),
            structure: Math.max(avgScore - 2, 50)
          },
          strengths: ['Active multi-agent debate participation', 'Logical structuring under timed pressure'],
          improvements: ['Incorporate deeper statistical citations in future rounds'],
          judgeNotes: 'Session successfully completed and evaluated.',
          fallaciesCount: turns.filter(t => t.fallacyMetrics?.fallacy_detected).length,
          speechPace: 142,
          keyHighlight: 'Maintained strong position across all rounds.'
        }
      };

      const updatedHistory = [newHistoryItem, ...existingList.filter((item: any) => item.id !== newHistoryItem.id)];
      localStorage.setItem('ai_debate_completed_list', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to archive completed session', e);
    }
  };

  const handleStartPracticeTopic = (topicTitle?: string) => {
    const title = topicTitle || 'Universal Basic Income creates a safety net for economic innovation.';

    // Only start a fresh session if picking a DIFFERENT topic or if current active session was already completed
    if (activeSession.topic !== title || activeSession.status === 'completed') {
      const freshSession: ActiveDebateSession = {
        id: `session_${Date.now()}`,
        topic: title,
        format: 'One-on-One',
        side: 'Proposition',
        turns: [],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      handleUpdateActiveSession(freshSession);
    }
    setActiveTab('ai-simulation');
  };

  // Sync state when active user changes
  const handleSelectUser = (user: UserProfile) => {
    setActiveUser(user);
    setActiveTab('dashboard');
    setIsLoggedIn(true);
  };

  const handleCreateUser = (newUser: UserProfile) => {
    setUserProfiles((prev: any) => {
      const updated = [...prev, newUser];
      // Save custom created users only
      const customOnly = updated.filter(u => u.isCustomAccount);
      localStorage.setItem('ai_debate_coach_custom_users', JSON.stringify(customOnly));
      return updated;
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    if (activeUser.id === updatedProfile.id || activeUser.email.toLowerCase() === updatedProfile.email.toLowerCase()) {
      setActiveUser(prev => ({ ...prev, ...updatedProfile }));
    }
    setUserProfiles(prev => {
      const exists = prev.some(u => u.id === updatedProfile.id || u.email.toLowerCase() === updatedProfile.email.toLowerCase());
      let updatedList: UserProfile[];
      if (exists) {
        updatedList = prev.map(u => 
          (u.id === updatedProfile.id || u.email.toLowerCase() === updatedProfile.email.toLowerCase()) 
            ? { ...u, ...updatedProfile } 
            : u
        );
      } else {
        updatedList = [...prev, updatedProfile];
      }
      const customOnly = updatedList.filter(u => u.isCustomAccount || u.role !== DEFAULT_PROFILES.find(d => d.id === u.id)?.role);
      localStorage.setItem('ai_debate_coach_custom_users', JSON.stringify(customOnly));
      return updatedList;
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUserProfiles(prev => {
      const updatedList = prev.filter(u => u.id !== userId);
      // Ensure there's at least one default profile available
      const newList = updatedList.length > 0 ? updatedList : DEFAULT_PROFILES;
      const customOnly = newList.filter(u => u.isCustomAccount);
      localStorage.setItem('ai_debate_coach_custom_users', JSON.stringify(customOnly));
      
      // Fallback active user
      const nextUser = newList[0];
      setActiveUser(nextUser);
      return newList;
    });
    setActiveTab('dashboard');
  };

  const handleUpdatePassword = (email: string, newPassword: string) => {
    setUserProfiles(prev => {
      const updatedList = prev.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      const customOnly = updatedList.filter(u => u.isCustomAccount);
      localStorage.setItem('ai_debate_coach_custom_users', JSON.stringify(customOnly));
      return updatedList;
    });
  };

  const getPageTitle = () => {
    if (activeTab === 'dashboard') {
      switch (currentRole) {
        case 'educator': return 'Educator Dashboard';
        case 'coach': return 'Coach Portal';
        case 'admin': return 'System Admin Console';
        default: return 'Learner Dashboard';
      }
    }
    const titles: Record<string, string> = {
      'my-debates': 'My Debates',
      'ai-simulation': 'Debate Simulation',
      'practice-topics': 'Practice Topics Repository',
      'argument-analyzer': 'Argument Analyzer Engine',
      'fallacy-detector': 'Fallacy Detector (Agent 1 Referee)',
      'counterargument-gen': 'Counterargument Generator (Agent 2 Rival)',
      'presentation-analysis': 'Presentation & Speech Quality Analysis',
      'performance-scores': 'Performance Scores & Analytics',
      'improvement-hub': 'Improvement Hub (Learning Path & Coaching)',
      'learning-path': 'Personalized Learning Path',
      'feedback-coaching': 'Feedback & Coaching Plans',
      'recommended': 'Recommended For You',
      'learning-resources': 'Learning Resources',
      'my-notes': 'My Notes',
      'notifications': 'Notifications Center',
      'settings': 'Platform Settings',
      'help-support': 'Help & Support',
      'profile': 'My Profile',
      // Coach sub-tabs
      'learners': 'Learners Overview',
      'argument-reviews': 'Argument Reviews',
      'fallacy-reports': 'Fallacy Reports',
      'presentation-reviews': 'Presentation Reviews',
      'coaching-plans': 'Coaching Plans',
      'performance-analytics': 'Performance Analytics',
      'reports': 'Reports',
      'skill-gap-analysis': 'Skill Gap Analysis',
      // Educator sub-tabs
      'my-classes': 'My Classes Roster',
      'assignments': 'Class Assignments',
      'rubrics': 'Rubrics & Criteria',
      'evaluation-queue': 'Evaluation Queue',
      'badges': 'Badges & Achievements',
      // Admin sub-tabs
      'user-management': 'User Management',
      'content-management': 'Content Management',
      'system-health': 'System Health & Telemetry',
      'audit-logs': 'Platform Audit Logs',
    };
    return titles[activeTab] || 'Debate Coach';
  };

  const renderActiveView = () => {
    if (activeTab === 'dashboard') {
      switch (currentRole) {
        case 'educator':
          return <EducatorDashboardView activeUser={activeUser} activeSubTab="dashboard" existingUsers={userProfiles} />;
        case 'coach':
          return <CoachDashboardView activeUser={activeUser} activeSubTab="dashboard" existingUsers={userProfiles} />;
        case 'admin':
          return <AdminDashboardView activeUser={activeUser} activeSubTab="dashboard" existingUsers={userProfiles} onUpdateUser={handleUpdateUser} />;
        default:
          return (
            <LearnerDashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              activeUser={activeUser}
              activeDebateTopic={activeDebateTopic}
              activeSession={activeSession}
              onCompleteSession={() => handleCompleteActiveSession(activeSession)}
            />
          );
      }
    }

    // Educator specific tabs routing
    if (currentRole === 'educator' && [
      'my-classes', 'assignments', 'rubrics', 'evaluation-queue', 
      'performance-analytics', 'reports', 'badges'
    ].includes(activeTab)) {
      return <EducatorDashboardView activeUser={activeUser} activeSubTab={activeTab} existingUsers={userProfiles} />;
    }

    // Coach specific tabs routing
    if (currentRole === 'coach' && [
      'learners', 'argument-reviews', 'fallacy-reports', 
      'presentation-reviews', 'coaching-plans', 'performance-analytics', 
      'reports', 'skill-gap-analysis'
    ].includes(activeTab)) {
      return <CoachDashboardView activeUser={activeUser} activeSubTab={activeTab} existingUsers={userProfiles} />;
    }

    // Admin specific tabs routing
    if (currentRole === 'admin' && [
      'user-management', 'content-management', 'system-health', 'audit-logs'
    ].includes(activeTab)) {
      return <AdminDashboardView activeUser={activeUser} activeSubTab={activeTab} existingUsers={userProfiles} onUpdateUser={handleUpdateUser} />;
    }

    switch (activeTab) {
      case 'my-debates':
        return <MyDebatesView onStartNewDebate={() => setActiveTab('ai-simulation')} />;
      case 'ai-simulation':
        return (
          <AIDebateSimulationView
            activeTopic={activeDebateTopic}
            activeSession={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            onCompleteSession={handleCompleteActiveSession}
            onTopicChange={(t) => {
              setActiveDebateTopic(t);
              handleUpdateActiveSession({ ...activeSession, topic: t });
            }}
          />
        );
      case 'practice-topics':
        return (
          <PracticeTopicsView
            onStartPractice={(topicTitle) => handleStartPracticeTopic(topicTitle)}
          />
        );
      case 'argument-analyzer':
        return <ArgumentAnalyzerView />;
      case 'fallacy-detector':
        return <FallacyDetectorView />;
      case 'counterargument-gen':
        return <CounterargumentGeneratorView />;
      case 'presentation-analysis':
        return <PresentationAnalysisView />;
      case 'performance-scores':
        return <PerformanceScoresView />;
      case 'improvement-hub':
      case 'learning-path':
      case 'feedback-coaching':
      case 'recommended':
        return (
          <FeedbackCoachingView
            activeSubTab={activeTab === 'improvement-hub' ? 'learning-path' : activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartPractice={(topicTitle) => handleStartPracticeTopic(topicTitle)}
          />
        );
      case 'learning-resources':
        return <LearningResourcesView />;
      case 'my-notes':
        return <MyNotesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return (
          <SettingsView
            activeUser={activeUser}
            onUpdateProfile={handleUpdateUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onDeleteAccount={handleDeleteUser}
          />
        );
      case 'help-support':
        return <HelpSupportView />;
      case 'profile':
        return <ProfileView activeUser={activeUser} onUpdateProfile={handleUpdateUser} />;
      default:
        return (
          <LearnerDashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            activeUser={activeUser}
            activeDebateTopic={activeDebateTopic}
            activeSession={activeSession}
            onCompleteSession={() => handleCompleteActiveSession(activeSession)}
          />
        );
    }
  };

  // If user is not authenticated, show standalone Login/Register Page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={handleSelectUser}
        existingUsers={userProfiles}
        onCreateUser={handleCreateUser}
        onUpdatePassword={handleUpdatePassword}
      />
    );
  }

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden transition-colors duration-250 ${
      isDark ? 'bg-[#0F172A] text-slate-200' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeDebateTopic={activeDebateTopic}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header with Search, Role Indicator, & Notifications */}
        <Header
          currentRole={currentRole}
          title={getPageTitle()}
          onNavigateNotifications={() => setActiveTab('notifications')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          activeUser={activeUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          existingUsers={userProfiles}
          onSelectUser={handleSelectUser}
        />

        {/* Scrollable View Content */}
        <main className={`flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 transition-colors duration-250 ${
          isDark ? 'bg-[#0F172A]' : 'bg-slate-100'
        }`}>
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Auth Modal for Sign In / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectUser={handleSelectUser}
        existingUsers={userProfiles}
        onCreateUser={handleCreateUser}
        onUpdatePassword={handleUpdatePassword}
        currentUserId={activeUser.id}
      />

      {/* Floating AI Chatbot Fixed at Bottom-Right of EVERY Page */}
      <FloatingAIChatbot currentTab={activeTab} activeUser={activeUser} />
    </div>
  );
}

export default App;
