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
import MyCoach from "../pages/learner/MyCoach";
import Activities from "../pages/learner/Activities";
import Missions from "../pages/learner/Missions";
import Messages from "../pages/learner/Messages";
import Monitoring from "../pages/educator/Monitoring";
import CoachNotes from "../pages/coach/CoachNotes";
import CoachMessages from "../pages/coach/Messages";
import AIClassSummary from "../pages/educator/AIClassSummary";
import Learners from "../pages/educator/Learners";
import Coaches from "../pages/educator/Coaches";
import ClassPerformance from "../pages/educator/ClassPerformance";
import Reports from "../pages/educator/Reports";
import Leaderboard from "../pages/learner/Leaderboard";
import Progress from "../pages/learner/Progress";
import AdminLearners from "../pages/admin/Learners";
import AdminCoaches from "../pages/admin/Coaches";
import AdminEducators from "../pages/admin/Educators";
import AdminStatistics from "../pages/admin/Statistics";
import SystemManagement from "../pages/admin/SystemManagement";


function AppRoutes() {
  return ( <BrowserRouter>
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
  path="/learner/my-coach"
  element={
    <ProtectedRoute>
      <MyCoach />
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
<Route
  path="/learner/activities"
  element={
    <ProtectedRoute>
      <Activities />
    </ProtectedRoute>
  }
/>
<Route
  path="/learner/missions"
  element={
    <ProtectedRoute>
      <Missions />
    </ProtectedRoute>
  }
/>
<Route
  path="/learner/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/monitoring"
  element={
    <ProtectedRoute>
      <Monitoring />
    </ProtectedRoute>
  }
/>
<Route
  path="/coach/notes"
  element={
    <ProtectedRoute>
      <CoachNotes />
    </ProtectedRoute>
  }
/>
<Route
  path="/coach/messages"
  element={
    <ProtectedRoute>
      <CoachMessages />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/ai-summary"
  element={
    <ProtectedRoute>
      <AIClassSummary />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/learners"
  element={
    <ProtectedRoute>
      <Learners />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/coaches"
  element={
    <ProtectedRoute>
      <Coaches />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/performance"
  element={
    <ProtectedRoute>
      <ClassPerformance />
    </ProtectedRoute>
  }
/>
<Route
  path="/educator/reports"
  element={
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  }
/>
<Route
  path="/learner/leaderboard"
  element={
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/learner/progress"
  element={
    <ProtectedRoute>
      <Progress />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/learners"
  element={
    <ProtectedRoute>
      <AdminLearners />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/coaches"
  element={
    <ProtectedRoute>
      <AdminCoaches />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/educators"
  element={
    <ProtectedRoute>
      <AdminEducators />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/statistics"
  element={
    <ProtectedRoute>
      <AdminStatistics />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/system"
  element={
    <ProtectedRoute>
      <SystemManagement />
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