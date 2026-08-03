import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FloatingAICoach from "./components/ai/FloatingAICoach";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import DebateTopics from "./pages/DebateTopics";
import DebateSession from "./pages/DebateSession";
import DebateRoom from "./pages/DebateRoom";

import SkillTracking from "./pages/SkillTracking";
import Reports from "./pages/Reports";
import History from "./pages/History";
import Recommendations from "./pages/Recommendations";
import Analytics from "./pages/Analytics";

/* AI Tools */
import ArgumentAnalyzer from "./pages/ArgumentAnalyzer";
import FallacyDetector from "./pages/FallacyDetector";
import CounterargumentGenerator from "./pages/CounterargumentGenerator";
import PresentationUpload from "./pages/PresentationUpload";
import PresentationAnalysis from "./pages/PresentationAnalysis";
import LearningResources from "./pages/LearningResources";
import MyNotes from "./pages/MyNotes";
import ComingSoon from "./pages/ComingSoon";
import PresentationHistory from "./pages/PresentationHistory";
function App() {

  return (

    <>

      <Routes>
        {/* ============================= */}
        {/* PUBLIC ROUTES */}
        {/* ============================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================= */}
        {/* DASHBOARD */}
        {/* ============================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* PROFILE */}
        {/* ============================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* DEBATE */}
        {/* ============================= */}

        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <DebateTopics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <DebateSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/debate/:id"
          element={
            <ProtectedRoute>
              <DebateRoom />
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* AI DEBATE TOOLS */}
        {/* ============================= */}

        <Route
          path="/argument-analyzer"
          element={
            <ProtectedRoute>
              <ArgumentAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fallacy-detector"
          element={
            <ProtectedRoute>
              <FallacyDetector />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counterargument"
          element={
            <ProtectedRoute>
              <CounterargumentGenerator />
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* PERFORMANCE */}
        {/* ============================= */}

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <SkillTracking />
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
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* FALLBACK */}
        {/* ============================= */}
        <Route
          path="/presentation-analysis"
          element={
            <ProtectedRoute>
              <PresentationAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <LearningResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <MyNotes />
            </ProtectedRoute>
          }
        /> <Route
          path="/learners"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evaluation-queue"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/argument-reviews"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/presentation-reviews"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coaching-plans"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-services"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/presentation-reports"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presentation-upload"
          element={
            <ProtectedRoute>
              <PresentationUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rubrics"
          element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presentation-history"
          element={
            <ProtectedRoute>
              <PresentationHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"

          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      <FloatingAICoach />

    </>

  );

}

export default App;

