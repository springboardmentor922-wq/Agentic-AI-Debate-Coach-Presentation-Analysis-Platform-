import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LearnerDashboard from "../pages/dashboards/LearnerDashboard";
import CoachDashboard from "../pages/dashboards/CoachDashboard";
import EducatorDashboard from "../pages/dashboards/EducatorDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import UserProfile from "../pages/profile/UserProfile";
import DebateTopics from "../pages/debateTopics/DebateTopics";
import TopicDetails from "../pages/debateTopics/TopicDetails";
import DebateSessions from "../pages/debateSessions/DebateSessions";
import SessionDetails from "../pages/debateSessions/SessionDetails";
import DebateRoom from "../pages/debateSessions/DebateRoom";
import AIDebateSimulation from "../pages/debateSessions/AIDebateSimulation";
import AIAnalysisReport from "../pages/aiAnalysis/AIAnalysisReport";
import Reports from "../pages/reports/Reports";
import SkillTracking from "../pages/skills/SkillTracking";
import Notifications from "../pages/notifications/Notifications";
import Settings from "../pages/settings/Settings";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRedirect from "./RoleRedirect";
import { ROLES } from "../utils/roleRoutes";

import EvaluationQueue from "../pages/educator/EvaluationQueue";
import ResourceLibrary from "../pages/educator/ResourceLibrary";
import PresentationAnalysis from "../pages/presentation/PresentationAnalysis";
import PresentationReport from "../pages/presentation/PresentationReport";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RoleRedirect fallback="/login" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route
                path="/learner/dashboard"
                element={<ProtectedRoute allowedRoles={["Learner"]}><LearnerDashboard /></ProtectedRoute>}
            />
            <Route
                path="/coach/dashboard"
                element={<ProtectedRoute allowedRoles={["Debate Coach"]}><CoachDashboard /></ProtectedRoute>}
            />
            <Route
                path="/educator/dashboard"
                element={<ProtectedRoute allowedRoles={["Educator"]}><EducatorDashboard /></ProtectedRoute>}
            />
            <Route
                path="/educator/evaluation-queue"
                element={<ProtectedRoute allowedRoles={["Educator"]}><EvaluationQueue /></ProtectedRoute>}
            />
            <Route
                path="/educator/resource-library"
                element={<ProtectedRoute allowedRoles={["Educator", "Administrator", "Debate Coach"]}><ResourceLibrary /></ProtectedRoute>}
            />
            <Route
                path="/admin/dashboard"
                element={<ProtectedRoute allowedRoles={["Administrator"]}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
                path="/users"
                element={<ProtectedRoute allowedRoles={["Administrator"]}><UserManagement /></ProtectedRoute>}
            />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={ROLES}><UserProfile /></ProtectedRoute>} />
            <Route path="/topics" element={<ProtectedRoute allowedRoles={ROLES}><DebateTopics /></ProtectedRoute>} />
            <Route path="/topics/:topicId" element={<ProtectedRoute allowedRoles={ROLES}><TopicDetails /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
            <Route path="/debate-sessions" element={<ProtectedRoute allowedRoles={ROLES}><DebateSessions /></ProtectedRoute>} />
            <Route path="/debate-sessions/topic/:topicId" element={<ProtectedRoute allowedRoles={ROLES}><DebateSessions /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute allowedRoles={ROLES}><SkillTracking /></ProtectedRoute>} />
            <Route path="/ai-simulation" element={<ProtectedRoute allowedRoles={ROLES}><AIDebateSimulation /></ProtectedRoute>} />
            <Route path="/presentation-analysis" element={<ProtectedRoute allowedRoles={ROLES}><MainLayout><PresentationAnalysis /></MainLayout></ProtectedRoute>} />
            <Route path="/presentation-reports/:recordingId" element={<ProtectedRoute allowedRoles={ROLES}><MainLayout><PresentationReport /></MainLayout></ProtectedRoute>} />

            <Route path="/reports" element={<ProtectedRoute allowedRoles={ROLES}><Reports /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={ROLES}><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={ROLES}><Settings /></ProtectedRoute>} />
            <Route path="/debate-sessions/:sessionId" element={<ProtectedRoute allowedRoles={ROLES}><SessionDetails /></ProtectedRoute>} />
            <Route path="/my-topics/:topicId" element={<ProtectedRoute allowedRoles={ROLES}><TopicDetails /></ProtectedRoute>} />
            <Route path="/debate-room/:sessionId" element={<ProtectedRoute allowedRoles={ROLES}><DebateRoom /></ProtectedRoute>} />
            <Route
                path="/ai-analysis-report"
                element={
                    <ProtectedRoute allowedRoles={ROLES}>
                        <MainLayout>
                            <AIAnalysisReport />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/dashboard" element={<RoleRedirect fallback="/login" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );

};


export default AppRoutes;