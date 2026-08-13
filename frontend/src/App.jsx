import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import TopicSelection from "./pages/TopicSelection";
import Practice from "./pages/Practice";
import SessionManagement from "./pages/SessionManagement";
import Schedule from "./pages/Schedule";
import DebateRoom from "./pages/DebateRoom";
import OpponentSelection from "./pages/OpponentSelection";
import Reports from "./pages/Reports";
import UserActivityDetail from "./pages/UserActivityDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import FormatSelection from "./pages/FormatSelection";
import DebateReport from "./pages/DebateReport";
import ChatAssistant from "./pages/ChatAssistant";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* LandingPage links to "/signup" — alias it to the real register route
              rather than renaming Register everywhere it's already referenced. */}
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debate/new/format"
            element={
              <ProtectedRoute>
                <FormatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <TopicSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <RoleGate allow={["debate_coach", "educator", "administrator"]}>
                  <SessionManagement />
                </RoleGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debate-room/:sessionId"
            element={
              <ProtectedRoute>
                <DebateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debate/new/:sessionId/opponent"
            element={
              <ProtectedRoute>
                <OpponentSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/user/:userId"
            element={
              <ProtectedRoute>
                <UserActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGate allow={["administrator"]}>
                  <Admin />
                </RoleGate>
              </ProtectedRoute>
            }
          />
          <Route
           path="/judge/:sessionId"
            element={
             <ProtectedRoute>
               <DebateReport />
             </ProtectedRoute>
             }
           />
           <Route
            path="/assistant"
             element={
              <ProtectedRoute>
                <ChatAssistant />
              </ProtectedRoute>
             }
           />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
