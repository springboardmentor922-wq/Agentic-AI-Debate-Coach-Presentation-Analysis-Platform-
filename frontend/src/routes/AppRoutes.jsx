import { BrowserRouter, Routes, Route } from "react-router-dom";
import Debate from "../pages/learner/Debate";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import DebateHistory from "../pages/learner/DebateHistory";
import LearnerDashboard from "../pages/learner/Dashboard";
import CoachDashboard from "../pages/coach/Dashboard";
import EducatorDashboard from "../pages/educator/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import Profile from "../pages/profile/Profile";
import Unauthorized from "../pages/errors/Unauthorized";
import NotFound from "../pages/errors/NotFound";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Users from "../pages/admin/Users";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes */}
       <Route
  path="/learner/dashboard"
  element={
    <ProtectedRoute>
      <LearnerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/learner/debate"
  element={
    <ProtectedRoute>
      <Debate />
    </ProtectedRoute>
  }
/>

<Route
  path="/learner/history"
  element={
    <ProtectedRoute>
      <DebateHistory />
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
  path="/coach/dashboard"
  element={
    <ProtectedRoute>
      <CoachDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/educator/dashboard"
  element={
    <ProtectedRoute>
      <EducatorDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>
 

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;