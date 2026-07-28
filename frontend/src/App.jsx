import { BrowserRouter, Routes, Route } from "react-router-dom";

// Authentication Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// General Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Sessions from "./pages/Sessions";
import SessionDetails from "./pages/SessionDetails";
import Upload from "./pages/Upload";
import CreateSession from "./pages/CreateSession";
import EditSession from "./pages/EditSession";

// ======================
// Learner Pages
// ======================
import LearnerDashboard from "./learner/LearnerDashboard";
import DebateHistory from "./learner/DebateHistory";
import Performance from "./learner/Performance";
import ImprovementTrends from "./learner/ImprovementTrends";
import Recommendations from "./learner/Recommendations";
import CoachingInsights from "./learner/CoachingInsights";

// ======================
// Educator Pages
// ======================
import EducatorDashboard from "./educator/EducatorDashboard";
import ClassAnalytics from "./educator/ClassAnalytics";
import StudentRankings from "./educator/StudentRankings";
import DebateReports from "./educator/DebateReports";
import PresentationReports from "./educator/PresentationReports";

// ======================
// Admin Pages
// ======================
import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/Users";
import Analytics from "./admin/Analytics";
import AIModels from "./admin/AIModels";

// ======================
// Coach Pages
// ======================
import CoachDashboard from "./coach/CoachDashboard";
import StudentsProgress from "./coach/StudentsProgress";
import Evaluations from "./coach/Evaluations";
import SkillGap from "./coach/SkillGap";
import CoachingRecommendations from "./coach/CoachingRecommendations";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ====================== */}
        {/* Authentication */}
        {/* ====================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ====================== */}
        {/* General Pages */}
        {/* ====================== */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/:id" element={<SessionDetails />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/create-session" element={<CreateSession />} />
        <Route path="/edit-session/:id" element={<EditSession />} />

        {/* ====================== */}
        {/* Learner Module */}
        {/* ====================== */}
        <Route path="/learner" element={<LearnerDashboard />} />
        <Route path="/debate-history" element={<DebateHistory />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/improvement-trends" element={<ImprovementTrends />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/coaching-insights" element={<CoachingInsights />} />

        {/* ====================== */}
        {/* Educator Module */}
        {/* ====================== */}
        <Route path="/educator" element={<EducatorDashboard />} />
        <Route path="/class-analytics" element={<ClassAnalytics />} />
        <Route path="/student-rankings" element={<StudentRankings />} />
        <Route path="/debate-reports" element={<DebateReports />} />
        <Route
          path="/presentation-reports"
          element={<PresentationReports />}
        />

        {/* ====================== */}
        {/* Admin Module */}
        {/* ====================== */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-models" element={<AIModels />} />

        {/* ====================== */}
        {/* Coach Module */}
        {/* ====================== */}
        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/students-progress" element={<StudentsProgress />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route
          path="/coaching-recommendations"
          element={<CoachingRecommendations />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;