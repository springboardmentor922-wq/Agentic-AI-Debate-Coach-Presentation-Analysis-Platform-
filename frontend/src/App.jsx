import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmailOtp from './pages/VerifyEmailOtp'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute from './components/ProtectedRoute'
import GlobalChatbot from './components/GlobalChatbot'
import { useAuth } from './context/AuthContext'

import LearnerLayout from './layouts/LearnerLayout'
import LearnerLogin from './pages/learner/LearnerLogin'
import LearnerDashboardHome from './pages/learner/Dashboard'
import LearnerProfile from './pages/learner/Profile'
import LearnerTopics from './pages/learner/Topics'
import LearnerSessions from './pages/learner/Sessions'
import LearnerAnalysis from './pages/learner/Analysis'
import LearnerAnalysisDetail from './pages/learner/AnalysisDetail'
import LearnerPresentation from './pages/learner/Presentation'
import LearnerLearning from './pages/learner/Learning'
import LearnerReports from './pages/learner/Reports'
import ArgumentAnalyzer from './pages/learner/ArgumentAnalyzer'
import FallacyDetector from './pages/learner/FallacyDetector'
import CounterargumentGenerator from './pages/learner/CounterargumentGenerator'
import FeedbackCoaching from './pages/learner/FeedbackCoaching'
import LearnerNotes from './pages/learner/Notes'
import NotificationsPage from './pages/learner/NotificationsPage'
import LearnerSettings from './pages/learner/Settings'
import LearnerHelp from './pages/learner/LearnerHelp'
import CoachLogin from './pages/coach/CoachLogin'
import CoachLayout from './layouts/CoachLayout'
import CoachDashboardHome from './pages/coach/CoachDashboardHome'
import CoachLearners from './pages/coach/CoachLearners'
import CoachAssignedDebates from './pages/coach/CoachAssignedDebates'
import CoachDebateSessions from './pages/coach/CoachDebateSessions'
import CoachEvaluationQueue from './pages/coach/CoachEvaluationQueue'
import CoachArgumentReviews from './pages/coach/CoachArgumentReviews'
import CoachFallacyReports from './pages/coach/CoachFallacyReports'
import CoachPresentationReviews from './pages/coach/CoachPresentationReviews'
import CoachCoachingPlans from './pages/coach/CoachCoachingPlans'
import CoachPerformanceAnalytics from './pages/coach/CoachPerformanceAnalytics'
import CoachReports from './pages/coach/CoachReports'
import CoachSkillGap from './pages/coach/CoachSkillGap'
import CoachMessages from './pages/coach/CoachMessages'
import CoachNotifications from './pages/coach/CoachNotifications'
import CoachSettings from './pages/coach/CoachSettings'
import CoachHelp from './pages/coach/CoachHelp'
import CoachReviewDetail from './pages/coach/CoachReviewDetail'
import EducatorLogin from './pages/educator/EducatorLogin'
import EducatorLayout from './layouts/EducatorLayout'
import EducatorDashboardHome from './pages/educator/EducatorDashboardHome'
import EducatorClasses from './pages/educator/EducatorClasses'
import EducatorLearners from './pages/educator/EducatorLearners'
import EducatorDebateSessions from './pages/educator/EducatorDebateSessions'
import EducatorAssignments from './pages/educator/EducatorAssignments'
import EducatorEvaluationQueue from './pages/educator/EducatorEvaluationQueue'
import EducatorClassAnalytics from './pages/educator/EducatorClassAnalytics'
import EducatorPerformanceReports from './pages/educator/EducatorPerformanceReports'
import EducatorPresentationReports from './pages/educator/EducatorPresentationReports'
import EducatorSkillGap from './pages/educator/EducatorSkillGap'
import EducatorPracticeTopics from './pages/educator/EducatorPracticeTopics'
import EducatorDebateFormats from './pages/educator/EducatorDebateFormats'
import EducatorRubrics from './pages/educator/EducatorRubrics'
import EducatorResourceLibrary from './pages/educator/EducatorResourceLibrary'
import EducatorAnnouncements from './pages/educator/EducatorAnnouncements'
import EducatorMessages from './pages/educator/EducatorMessages'
import EducatorSettings from './pages/educator/EducatorSettings'
import EducatorHelp from './pages/educator/EducatorHelp'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardHome from './pages/admin/AdminDashboardHome'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSessions from './pages/admin/AdminSessions'
import AdminContent from './pages/admin/AdminContent'
import AdminBilling from './pages/admin/AdminBilling'
import AdminNotificationCenter from './pages/admin/AdminNotificationCenter'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSecurity from './pages/admin/AdminSecurity'
import AdminIntegrations from './pages/admin/AdminIntegrations'
import AdminAIServices from './pages/admin/AdminAIServices'
import AdminBackup from './pages/admin/AdminBackup'
import AdminReports from './pages/admin/AdminReports'
import AdminHelp from './pages/admin/AdminHelp'

export default function App() {
  const { user } = useAuth()
  return (
    <>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmailOtp />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Learner role — separate login + fully nested dashboard routes */}
      <Route path="/learner/login" element={<LearnerLogin />} />
      <Route
        path="/learner"
        element={
          <ProtectedRoute allowedRoles={['learner']}>
            <LearnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LearnerDashboardHome />} />
        <Route path="profile" element={<LearnerProfile />} />
        <Route path="topics" element={<LearnerTopics />} />
        <Route path="sessions" element={<LearnerSessions />} />
        <Route path="analysis" element={<LearnerAnalysis />} />
        <Route path="analysis/:sessionId" element={<LearnerAnalysisDetail />} />
        <Route path="presentation" element={<LearnerPresentation />} />
        <Route path="learning" element={<LearnerLearning />} />
        <Route path="reports" element={<LearnerReports />} />
        <Route path="tools/argument-analyzer" element={<ArgumentAnalyzer />} />
        <Route path="tools/fallacy-detector" element={<FallacyDetector />} />
        <Route path="tools/counterargument-generator" element={<CounterargumentGenerator />} />
        <Route path="feedback-coaching" element={<FeedbackCoaching />} />
        <Route path="notes" element={<LearnerNotes />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<LearnerSettings />} />
        <Route path="help" element={<LearnerHelp />} />
      </Route>

      <Route path="/coach/login" element={<CoachLogin />} />
      <Route
        path="/coach"
        element={
          <ProtectedRoute allowedRoles={['debate_coach']}>
            <CoachLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CoachDashboardHome />} />
        <Route path="learners" element={<CoachLearners />} />
        <Route path="assigned-debates" element={<CoachAssignedDebates />} />
        <Route path="debate-sessions" element={<CoachDebateSessions />} />
        <Route path="evaluation-queue" element={<CoachEvaluationQueue />} />
        <Route path="argument-reviews" element={<CoachArgumentReviews />} />
        <Route path="fallacy-reports" element={<CoachFallacyReports />} />
        <Route path="presentation-reviews" element={<CoachPresentationReviews />} />
        <Route path="coaching-plans" element={<CoachCoachingPlans />} />
        <Route path="performance-analytics" element={<CoachPerformanceAnalytics />} />
        <Route path="reports" element={<CoachReports />} />
        <Route path="skill-gap" element={<CoachSkillGap />} />
        <Route path="messages" element={<CoachMessages />} />
        <Route path="notifications" element={<CoachNotifications />} />
        <Route path="settings" element={<CoachSettings />} />
        <Route path="help" element={<CoachHelp />} />
        <Route path="review/:reviewId" element={<CoachReviewDetail />} />
      </Route>
      <Route path="/educator/login" element={<EducatorLogin />} />
      <Route
        path="/educator"
        element={
          <ProtectedRoute allowedRoles={['educator']}>
            <EducatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EducatorDashboardHome />} />
        <Route path="classes" element={<EducatorClasses />} />
        <Route path="learners" element={<EducatorLearners />} />
        <Route path="debate-sessions" element={<EducatorDebateSessions />} />
        <Route path="assignments" element={<EducatorAssignments />} />
        <Route path="evaluation-queue" element={<EducatorEvaluationQueue />} />
        <Route path="class-analytics" element={<EducatorClassAnalytics />} />
        <Route path="performance-reports" element={<EducatorPerformanceReports />} />
        <Route path="presentation-reports" element={<EducatorPresentationReports />} />
        <Route path="skill-gap" element={<EducatorSkillGap />} />
        <Route path="practice-topics" element={<EducatorPracticeTopics />} />
        <Route path="debate-formats" element={<EducatorDebateFormats />} />
        <Route path="rubrics" element={<EducatorRubrics />} />
        <Route path="resources" element={<EducatorResourceLibrary />} />
        <Route path="announcements" element={<EducatorAnnouncements />} />
        <Route path="messages" element={<EducatorMessages />} />
        <Route path="settings" element={<EducatorSettings />} />
        <Route path="help" element={<EducatorHelp />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="debate-sessions" element={<AdminSessions />} />
        <Route path="ai-services" element={<AdminAIServices />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="notification-center" element={<AdminNotificationCenter />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="integrations" element={<AdminIntegrations />} />
        <Route path="backup" element={<AdminBackup />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="help" element={<AdminHelp />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <GlobalChatbot key={user?.id || 'anonymous'} />
    </>
  )
}
