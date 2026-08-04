import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Topics from "./pages/Topics";
import DebateRoom from "./pages/DebateRoom";
import SkillTracking from "./pages/SkillTracking";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import MyDebates from "./pages/MyDebates";
import ArgumentAnalyzerTool from "./pages/ArgumentAnalyzerTool";
import FallacyDetectorTool from "./pages/FallacyDetectorTool";
import CounterargumentTool from "./pages/CounterargumentTool";
import LearningResources from "./pages/LearningResources";
import CoachLearners from "./pages/CoachLearners";
import AdminUserManagement from "./pages/AdminUserManagement";
import AIDebateSimulation from "./pages/AIDebateSimulation";
import PresentationAnalysis from "./pages/PresentationAnalysis";
import PerformanceScoresTable from "./pages/PerformanceScoresTable";
import FeedbackCoaching from "./pages/FeedbackCoaching";
import MyNotes from "./pages/MyNotes";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import CoachFallacyReports from "./pages/CoachFallacyReports";
import CoachPresentationReviews from "./pages/CoachPresentationReviews";
import CoachPerformanceAnalytics from "./pages/CoachPerformanceAnalytics";
import CoachSkillGapAnalysis from "./pages/CoachSkillGapAnalysis";
import CoachingPlans from "./pages/CoachingPlans";
import CoachNotifications from "./pages/CoachNotifications";
import HelpSupport from "./pages/HelpSupport";
import EducatorClasses from "./pages/EducatorClasses";
import EducatorLearners from "./pages/EducatorLearners";
import EducatorEvaluationQueue from "./pages/EducatorEvaluationQueue";
import EducatorClassAnalytics from "./pages/EducatorClassAnalytics";
import EducatorPresentationReports from "./pages/EducatorPresentationReports";
import EducatorSkillGapAnalysis from "./pages/EducatorSkillGapAnalysis";
import EducatorAssignments from "./pages/EducatorAssignments";
import EducatorRubrics from "./pages/EducatorRubrics";
import EducatorAnnouncements from "./pages/EducatorAnnouncements";
import EducatorResourceLibrary from "./pages/EducatorResourceLibrary";
import EducatorNotifications from "./pages/EducatorNotifications";
import DebateFormatsInfo from "./pages/DebateFormatsInfo";
import RolePermissionsInfo from "./pages/RolePermissionsInfo";
import AdminTopActiveDebates from "./pages/AdminTopActiveDebates";
import AdminAIServiceUsage from "./pages/AdminAIServiceUsage";
import AdminContentManagement from "./pages/AdminContentManagement";
import AdminNotificationCenter from "./pages/AdminNotificationCenter";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import AdminSystemHealth from "./pages/AdminSystemHealth";
import AdminSecurityCompliance from "./pages/AdminSecurityCompliance";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import Onboarding from "./pages/Onboarding";
import LearningPath from "./pages/LearningPath";
import RecommendedForYou from "./pages/RecommendedForYou";
import { ProtectedRoute } from "./utils/useAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<ProtectedRoute roles={["Learner"]}><Onboarding /></ProtectedRoute>} />
        <Route path="/learning-path" element={<ProtectedRoute roles={["Learner"]}><LearningPath /></ProtectedRoute>} />
        <Route path="/recommended-for-you" element={<ProtectedRoute roles={["Learner"]}><RecommendedForYou /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
        <Route path="/debate-room" element={<ProtectedRoute><DebateRoom /></ProtectedRoute>} />
        <Route path="/skill-tracking" element={<ProtectedRoute><SkillTracking /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={["Debate Coach", "Educator", "Admin"]}><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/my-debates" element={<ProtectedRoute roles={["Learner"]}><MyDebates /></ProtectedRoute>} />
        <Route path="/tools/argument-analyzer" element={<ProtectedRoute roles={["Learner"]}><ArgumentAnalyzerTool /></ProtectedRoute>} />
        <Route path="/tools/fallacy-detector" element={<ProtectedRoute roles={["Learner"]}><FallacyDetectorTool /></ProtectedRoute>} />
        <Route path="/tools/counterargument-generator" element={<ProtectedRoute roles={["Learner"]}><CounterargumentTool /></ProtectedRoute>} />
        <Route path="/learning-resources" element={<ProtectedRoute><LearningResources /></ProtectedRoute>} />

        <Route path="/ai-debate-simulation" element={<ProtectedRoute roles={["Learner"]}><AIDebateSimulation /></ProtectedRoute>} />
        <Route path="/presentation-analysis" element={<ProtectedRoute roles={["Learner"]}><PresentationAnalysis /></ProtectedRoute>} />
        <Route path="/performance-scores" element={<ProtectedRoute roles={["Learner"]}><PerformanceScoresTable /></ProtectedRoute>} />
        <Route path="/feedback-coaching" element={<ProtectedRoute roles={["Learner"]}><FeedbackCoaching /></ProtectedRoute>} />
        <Route path="/my-notes" element={<ProtectedRoute roles={["Learner"]}><MyNotes /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={["Learner"]}><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />

        <Route path="/coach/learners" element={<ProtectedRoute roles={["Debate Coach"]}><CoachLearners /></ProtectedRoute>} />
        <Route path="/coach/fallacy-reports" element={<ProtectedRoute roles={["Debate Coach"]}><CoachFallacyReports /></ProtectedRoute>} />
        <Route path="/coach/presentation-reviews" element={<ProtectedRoute roles={["Debate Coach"]}><CoachPresentationReviews /></ProtectedRoute>} />
        <Route path="/coach/performance-analytics" element={<ProtectedRoute roles={["Debate Coach"]}><CoachPerformanceAnalytics /></ProtectedRoute>} />
        <Route path="/coach/skill-gap-analysis" element={<ProtectedRoute roles={["Debate Coach"]}><CoachSkillGapAnalysis /></ProtectedRoute>} />
        <Route path="/coaching-plans" element={<ProtectedRoute roles={["Debate Coach"]}><CoachingPlans /></ProtectedRoute>} />
        <Route path="/coach/notifications" element={<ProtectedRoute roles={["Debate Coach"]}><CoachNotifications /></ProtectedRoute>} />

        <Route path="/admin/users" element={<ProtectedRoute roles={["Admin"]}><AdminUserManagement /></ProtectedRoute>} />

        <Route path="/educator/classes" element={<ProtectedRoute roles={["Educator"]}><EducatorClasses /></ProtectedRoute>} />
        <Route path="/educator/learners" element={<ProtectedRoute roles={["Educator"]}><EducatorLearners /></ProtectedRoute>} />
        <Route path="/educator/evaluation-queue" element={<ProtectedRoute roles={["Educator"]}><EducatorEvaluationQueue /></ProtectedRoute>} />
        <Route path="/educator/class-analytics" element={<ProtectedRoute roles={["Educator"]}><EducatorClassAnalytics /></ProtectedRoute>} />
        <Route path="/educator/presentation-reports" element={<ProtectedRoute roles={["Educator"]}><EducatorPresentationReports /></ProtectedRoute>} />
        <Route path="/educator/skill-gap-analysis" element={<ProtectedRoute roles={["Educator"]}><EducatorSkillGapAnalysis /></ProtectedRoute>} />
        <Route path="/educator/assignments" element={<ProtectedRoute roles={["Educator"]}><EducatorAssignments /></ProtectedRoute>} />
        <Route path="/educator/rubrics" element={<ProtectedRoute roles={["Educator"]}><EducatorRubrics /></ProtectedRoute>} />
        <Route path="/educator/announcements" element={<ProtectedRoute roles={["Educator"]}><EducatorAnnouncements /></ProtectedRoute>} />
        <Route path="/educator/resources" element={<ProtectedRoute roles={["Educator"]}><EducatorResourceLibrary /></ProtectedRoute>} />
        <Route path="/educator/notifications" element={<ProtectedRoute roles={["Educator"]}><EducatorNotifications /></ProtectedRoute>} />
        <Route path="/debate-formats" element={<ProtectedRoute><DebateFormatsInfo /></ProtectedRoute>} />

        <Route path="/admin/role-permissions" element={<ProtectedRoute roles={["Admin"]}><RolePermissionsInfo /></ProtectedRoute>} />
        <Route path="/admin/top-active-debates" element={<ProtectedRoute roles={["Admin"]}><AdminTopActiveDebates /></ProtectedRoute>} />
        <Route path="/admin/ai-service-usage" element={<ProtectedRoute roles={["Admin"]}><AdminAIServiceUsage /></ProtectedRoute>} />
        <Route path="/admin/content-management" element={<ProtectedRoute roles={["Admin"]}><AdminContentManagement /></ProtectedRoute>} />
        <Route path="/admin/notification-center" element={<ProtectedRoute roles={["Admin"]}><AdminNotificationCenter /></ProtectedRoute>} />
        <Route path="/admin/support-tickets" element={<ProtectedRoute roles={["Admin"]}><AdminSupportTickets /></ProtectedRoute>} />
        <Route path="/admin/system-health" element={<ProtectedRoute roles={["Admin"]}><AdminSystemHealth /></ProtectedRoute>} />
        <Route path="/admin/security-compliance" element={<ProtectedRoute roles={["Admin"]}><AdminSecurityCompliance /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute roles={["Admin"]}><AdminAuditLogs /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
