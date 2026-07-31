import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

// Learner components
import { StartDebate } from '../components/learner/StartDebate';
import { AudioRecorder } from '../components/learner/AudioRecorder';
import { DebateResults } from '../components/learner/DebateResults';
import { DebateHistory } from '../components/learner/DebateHistory';
import { LearnerTasks } from '../components/learner/LearnerTasks';
import { LearnerFeedbacks } from '../components/learner/LearnerFeedbacks';

// Coach components
import { CoachDashboard } from '../components/coach/CoachDashboard';
import { PendingReviews } from '../components/coach/PendingReviews';
import { ReviewedDebates } from '../components/coach/ReviewedDebates';

// Educator components
import { EducatorDashboard } from '../components/educator/EducatorDashboard';
import { LearnerReports } from '../components/educator/LearnerReports';
import { EducatorLearnersList } from '../components/educator/EducatorLearnersList';
import { EducatorTasksList } from '../components/educator/EducatorTasksList';
import { EducatorFeedbacksList } from '../components/educator/EducatorFeedbacksList';
import { EducatorDispatchFeedback } from '../components/educator/EducatorDispatchFeedback';
import { AssignTaskView } from '../components/educator/AssignTaskView';

// Admin components
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { TopicsManagement } from '../components/admin/TopicsManagement';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminDebatesList } from '../components/admin/AdminDebatesList';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterRole, setFilterRole] = useState(null);

  const handleNavigate = (tab, filter = null) => {
    setFilterRole(filter);
    setActiveTab(tab);
  };

  // Learner debate workflow state
  const [learnerState, setLearnerState] = useState('SETUP'); // SETUP | RECORDING | RESULTS
  const [activeSession, setActiveSession] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);

  const handleStartSession = (session) => {
    setActiveSession(session);
    setLearnerState('RECORDING');
  };

  const handleCompleteSession = (results) => {
    setSessionResults(results);
    setLearnerState('RESULTS');
  };

  const handleResetSession = () => {
    setActiveSession(null);
    setSessionResults(null);
    setLearnerState('SETUP');
    setActiveTab('dashboard');
  };

  const handleSelectAssignedTask = (task) => {
    handleStartSession({
      debateId: null, // Will create or launch task
      topic: task.topic,
      duration: parseInt(task.duration) || 60,
      debateType: task.debate_type || 'One-to-One'
    });
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    const role = user?.role || 'Learner';

    if (role === 'Learner') {
      if (activeTab === 'history') return <DebateHistory />;
      if (activeTab === 'performance') return <LearnerReports learnerUsername={user?.username} />;
      if (activeTab === 'tasks') return <LearnerTasks onSelectTask={handleSelectAssignedTask} />;
      if (activeTab === 'feedbacks') return <LearnerFeedbacks />;

      // Default Arena Dashboard
      if (learnerState === 'RECORDING' && activeSession) {
        return (
          <AudioRecorder
            debateSession={activeSession}
            onComplete={handleCompleteSession}
            onCancel={handleResetSession}
          />
        );
      }

      if (learnerState === 'RESULTS' && sessionResults) {
        return (
          <DebateResults
            results={sessionResults}
            onReset={handleResetSession}
          />
        );
      }

      return <StartDebate onDebateStarted={handleStartSession} />;
    }

    if (role === 'Debate Coach') {
      if (activeTab === 'pending') return <PendingReviews />;
      if (activeTab === 'completed') return <ReviewedDebates />;
      if (activeTab === 'learners') return <LearnerReports />;
      if (activeTab === 'learnersList') return <EducatorLearnersList onNavigate={setActiveTab} />;
      if (activeTab === 'myFeedbacks') return <LearnerFeedbacks />;
      return <CoachDashboard onNavigate={setActiveTab} />;
    }

    if (role === 'Educator') {
      if (activeTab === 'reports') return <LearnerReports onNavigate={setActiveTab} />;
      if (activeTab === 'assignTask') return <AssignTaskView onNavigate={setActiveTab} />;
      if (activeTab === 'feedbacks') return <EducatorDispatchFeedback />;
      if (activeTab === 'myFeedbacks') return <LearnerFeedbacks />;
      
      // Deep links from dashboard stat cards
      if (activeTab === 'learnersList') return <EducatorLearnersList onNavigate={setActiveTab} />;
      if (activeTab === 'tasksList') return <EducatorTasksList onNavigate={setActiveTab} />;
      if (activeTab === 'feedbacksList') return <EducatorFeedbacksList onNavigate={setActiveTab} />;
      
      return <EducatorDashboard onNavigate={setActiveTab} />;
    }

    if (role === 'Admin') {
      if (activeTab === 'reports') return <AdminReports />;
      if (activeTab === 'users' || activeTab === 'createUser') return <UserManagement filterRole={filterRole} onNavigate={handleNavigate} />;
      if (activeTab === 'topics') return <TopicsManagement />;
      if (activeTab === 'debates') return <AdminDebatesList onNavigate={handleNavigate} />;
      return <AdminDashboard onNavigate={handleNavigate} />;
    }

    return <div className="text-slate-400">Welcome to AI Debate Coach.</div>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTabTitle={activeTab.toUpperCase()} />
      <div className="flex flex-1">
        <Sidebar role={user?.role} activeTab={activeTab} setActiveTab={handleNavigate} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
