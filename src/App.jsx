import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminLayout from "./layouts/AdminLayout";
import LearnerDashboard from "./pages/learner/Dashboard";
import CoachDashboard from "./pages/coach/Dashboard";
import EducatorDashboard from "./pages/educator/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProfile from "./pages/admin/AdminProfile";
import Profile from "./pages/learner/Profile";
import DebateSession from "./pages/learner/DebateSession";
import AnalyzeDebate from "./pages/learner/AnalyzeDebate";
import History from "./pages/learner/History";
import Report from "./pages/learner/Report";
import WorkspaceSection from "./components/WorkspaceSection";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/learner"
          element={
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* NEW ROUTE */}
        <Route
          path="/learner/analyze"
          element={
            <ProtectedRoute>
              <AnalyzeDebate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/coach/:section" element={<ProtectedRoute><WorkspaceSection role="Debate Coach" base="coach" /></ProtectedRoute>} />

        <Route
          path="/educator"
          element={
            <ProtectedRoute>
              <EducatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/educator/:section" element={<ProtectedRoute><WorkspaceSection role="Educator" base="educator" /></ProtectedRoute>} />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/:section" element={<ProtectedRoute><WorkspaceSection role="Administrator" base="admin" /></ProtectedRoute>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
  path="/learner/history"
  element={
    <ProtectedRoute>
      <History />
    </ProtectedRoute>
  }
/>

<Route
    path="/learner/report/:id"
    element={
        <ProtectedRoute>
    <Report />
        </ProtectedRoute>
    }
/>

        <Route
          path="/learner/report/latest"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/debate" element={<DebateSession />} />

        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
