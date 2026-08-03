import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import LearnerDashboard from "../pages/dashboards/LearnerDashboard";
import CoachDashboard from "../pages/dashboards/CoachDashboard";
import EducatorDashboard from "../pages/dashboards/EducatorDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import UserProfile from "../pages/profile/UserProfile";
import DebateTopics from "../pages/debateTopics/DebateTopics";
import DebateSessions from "../pages/debateSessions/DebateSessions";
import SessionDetails from "../pages/debateSessions/SessionDetails";
import DebateRoom from "../pages/debateSessions/DebateRoom";
import AIAnalysisReport from "../pages/aiAnalysis/AIAnalysisReport";
import MainLayout from "../components/layout/MainLayout";

const AppRoutes = () => {

    return (

        <Routes>

            {/* ================================= */}
            {/* Default Route */}
            {/* ================================= */}

            <Route

                path="/"

                element={<Navigate to="/login" replace />}

            />

            {/* ================================= */}
            {/* Authentication */}
            {/* ================================= */}

            <Route

                path="/login"

                element={<Login />}

            />

            <Route

                path="/register"

                element={<Register />}

            />

            {/* ================================= */}
            {/* Learner */}
            {/* ================================= */}

            <Route

                path="/learner/dashboard"

                element={<LearnerDashboard />}

            />

            {/* ================================= */}
            {/* Debate Coach */}
            {/* ================================= */}

            <Route

                path="/coach/dashboard"

                element={<CoachDashboard />}

            />

            {/* ================================= */}
            {/* Educator */}
            {/* ================================= */}

            <Route

                path="/educator/dashboard"

                element={<EducatorDashboard />}

            />

            {/* ================================= */}
            {/* Administrator */}
            {/* ================================= */}

            <Route

                path="/admin/dashboard"

                element={< AdminDashboard />}

            />


            {/* ================================= */}
            {/* UserProfile*/}
            {/* ================================= */}

            <Route

                path="/profile"

                element={<UserProfile />}

            />

            {/* ================================= */}
            {/* Debate topics*/}
            {/* ================================= */}

            <Route
                    path="/topics"
                    element={<DebateTopics />}
                />

            {/* ================================= */}
            {/* Unauthorized */}
            {/* ================================= */}

            <Route

                path="/unauthorized"

                element={<h1>Unauthorized</h1>}

            />

            <Route
                path="/debate-sessions"
                element={<DebateSessions />}
            />

            <Route
                path="/debate-sessions/topic/:topicId"
                element={<DebateSessions />}
            />

            <Route

                path="/debate-sessions/:sessionId"

                element={<SessionDetails />}

            />

            <Route
                path="/my-topics/:topicId"
                element={<SessionDetails />}
            />

            <Route

                path="/debate-room/:sessionId"

                element={<DebateRoom />}

            />

            <Route
path="/ai-analysis-report"
element={
    <MainLayout>

        <AIAnalysisReport/>

    </MainLayout>
}
/>

            {/* ================================= */}
            {/* 404 */}
            {/* ================================= */}

            <Route

                path="*"

                element={<h1>404 - Page Not Found</h1>}

            />

        </Routes>

    );

};

export default AppRoutes;