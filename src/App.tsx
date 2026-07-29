import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FloatingAIChatbot } from './components/chatbot/FloatingAIChatbot';
import { AuthModal } from './components/auth/AuthModal';

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

const DEFAULT_PROFILES: UserProfile[] = [
  { id: 'usr_alex', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', role: 'learner', roleLabel: 'Senior Debater', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', institution: 'Stanford Debate Union' },
  { id: 'usr_arjun', name: 'Arjun Mehta', email: 'arjun.mehta@debatecoach.ai', role: 'coach', roleLabel: 'Debate Coach', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', institution: 'National Speech & Debate Assoc.' },
  { id: 'usr_ananya', name: 'Ananya Sharma', email: 'ananya.sharma@debatecoach.ai', role: 'educator', roleLabel: 'Educator', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', institution: 'Department of Communication' },
  { id: 'usr_admin', name: 'System Admin', email: 'admin@debatecoach.ai', role: 'admin', roleLabel: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', institution: 'Platform Ops' },
];

export function App() {
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
  const [currentRole, setCurrentRole] = useState<UserRole>(DEFAULT_PROFILES[0].role);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync role when active user changes
  const handleSelectUser = (user: UserProfile) => {
    setActiveUser(user);
    setCurrentRole(user.role);
    setActiveTab('dashboard');
  };

  const handleCreateUser = (newUser: UserProfile) => {
    setUserProfiles(prev => {
      const updated = [...prev, newUser];
      // Save custom created users only
      const customOnly = updated.filter(u => u.isCustomAccount);
      localStorage.setItem('ai_debate_coach_custom_users', JSON.stringify(customOnly));
      return updated;
    });
  };

  const handleLogout = () => {
    handleSelectUser(DEFAULT_PROFILES[0]);
    setIsAuthModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    // Find matching profile for this role in userProfiles, defaulting to first match
    const matchingProfile = userProfiles.find(u => u.role === role) || activeUser;
    setActiveUser(matchingProfile);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setActiveUser(updatedProfile);
    setCurrentRole(updatedProfile.role);
    setUserProfiles(prev => {
      const updatedList = prev.map(u => u.id === updatedProfile.id ? updatedProfile : u);
      const customOnly = updatedList.filter(u => u.isCustomAccount);
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
      setCurrentRole(nextUser.role);
      return newList;
    });
    setActiveTab('dashboard');
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
      'ai-simulation': 'AI Debate Simulation Arena',
      'practice-topics': 'Practice Topics Repository',
      'argument-analyzer': 'Argument Analyzer Engine',
      'fallacy-detector': 'Fallacy Detector (Agent 1 Referee)',
      'counterargument-gen': 'Counterargument Generator (Agent 2 Rival)',
      'presentation-analysis': 'Presentation & Speech Quality Analysis',
      'performance-scores': 'Performance Scores & Analytics',
      'feedback-coaching': 'Feedback & Coaching Plans',
      'recommended': 'Recommended Practices',
      'learning-resources': 'Learning Resources',
      'my-notes': 'My Scratchpad Notes',
      'notifications': 'Notifications Center',
      'settings': 'User Profile & Settings',
      'help-support': 'Help & Support'
    };
    return titles[activeTab] || 'Debate Coach';
  };

  const renderActiveView = () => {
    if (activeTab === 'dashboard') {
      switch (currentRole) {
        case 'educator':
          return <EducatorDashboardView />;
        case 'coach':
          return <CoachDashboardView />;
        case 'admin':
          return <AdminDashboardView />;
        default:
          return <LearnerDashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    switch (activeTab) {
      case 'my-debates':
        return <MyDebatesView onStartNewDebate={() => setActiveTab('ai-simulation')} />;
      case 'ai-simulation':
        return <AIDebateSimulationView />;
      case 'practice-topics':
        return <PracticeTopicsView onStartPractice={() => setActiveTab('ai-simulation')} />;
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
      case 'feedback-coaching':
      case 'recommended':
        return <FeedbackCoachingView />;
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
      default:
        return <LearnerDashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0F172A] font-sans antialiased text-slate-200 overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header with Search, Role Perspective Switcher, & Notifications */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
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
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 bg-[#0F172A]">
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
        currentUserId={activeUser.id}
      />

      {/* Floating AI Chatbot Fixed at Bottom-Right of EVERY Page */}
      <FloatingAIChatbot currentTab={activeTab} />
    </div>
  );
}

export default App;
