import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import LearnerDashboard from "./pages/learner/Dashboard";
import CoachDashboard from "./pages/coach/Dashboard";
import EducatorDashboard from "./pages/educator/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

import Profile from "./pages/learner/Profile";
import DebateSession from "./pages/learner/DebateSession";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/learner" element={<LearnerDashboard />} />

        <Route path="/coach" element={<CoachDashboard />} />

        <Route path="/educator" element={<EducatorDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/debate" element={<DebateSession />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;