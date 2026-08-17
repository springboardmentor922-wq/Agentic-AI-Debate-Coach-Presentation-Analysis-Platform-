import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DebateTopics from "./pages/DebateTopics";
import DebateSession from "./pages/DebateSession";
import Recommended from "./pages/Recommended";


import AIFeedback from "./pages/AIFeedback";
import CoachReview from "./pages/CoachReview";
import CoachDashboard from "./pages/CoachDashboard";
import CoachLearners from "./pages/CoachLearners";
import LearnerDetails from "./pages/LearnerDetails";
import AssignedDebates from "./pages/AssignedDebates";
import LearnerAssignedDebates from "./pages/LearnerAssignedDebates";
import AIEvaluationQueue from "./pages/AIEvaluationQueue";
import CoachDebateSessions from "./pages/CoachDebateSessions";
import AIEvaluationReview from "./pages/AIEvaluationReview";
import ArgumentReviews from "./pages/ArgumentReviews";
import ArgumentReviewDetails from "./pages/ArgumentReviewDetails";
import FallacyReports from "./pages/FallacyReports";
import FallacyReportDetails from "./pages/FallacyReportDetails";

import StudentProgress from "./pages/StudentProgress";
import Reports from "./pages/Reports";
import Notes from "./pages/Notes";

import PresentationAnalysis from "./pages/PresentationAnalysis";
import SkillTracking from "./pages/SkillTracking";
import Learning from "./pages/Learning";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ArgumentAnalyzer from "./pages/ArgumentAnalyzer";
import PresentationReviews from "./pages/PresentationReviews";
import PresentationReviewDetails from "./pages/PresentationReviewDetails";
import CoachingPlans from "./components/CoachingPlans";

import CreateDebateSession from "./pages/CreateDebateSession";
import FallacyDetector from "./pages/FallacyDetector";
import CounterArgumentGenerator from "./pages/CounterArgumentGenerator";
import RebuttalGenerator from "./pages/RebuttalGenerator";
import SpeechImprover from "./pages/SpeechImprover";
import MyDebates from "./pages/MyDebates";
import CoachFeedback from "./pages/CoachFeedback";
import CoachFeedbackDetails from "./pages/CoachFeedbackDetails";
import EducatorLearners from "./pages/EducatorLearners";
import EducatorLearnerDetails from "./pages/EducatorLearnerDetails";
import MyClasses from "./pages/MyClasses";
import ClassDetails from "./pages/ClassDetails";


import EducatorEvaluationDetails
    from "./pages/EducatorEvaluationDetails";

import ClassAnalytics from "./pages/ClassAnalytics";
import PerformanceReports from "./pages/PerformanceReports";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import EducatorPresentationReports
    from "./pages/EducatorPresentationReports";

import DebateSessions from "./pages/DebateSessions";
import EducatorDashboard from "./pages/EducatorDashboard";
import Assignments from "./pages/Assignments";
import MyAssignments from "./pages/MyAssignments";
import AssignmentReviews from "./pages/AssignmentReviews";
import EducatorAnnouncements
    from "./pages/EducatorAnnouncements";

import Announcements
    from "./pages/Announcements";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRoles from "./pages/AdminRoles";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
    path="/argument-analyzer"
    element={<ArgumentAnalyzer />}
/>

     <Route
    path="/fallacy-detector"
    element={<FallacyDetector />}
/>
     

     <Route
    path="/counterargument-generator"
    element={<CounterArgumentGenerator />}
/>

     <Route
    path="/rebuttal-generator"
    element={<RebuttalGenerator />}
/>
     
     <Route
    path="/speech-improver"
    element={<SpeechImprover />}
/>
     <Route
    path="/my-debates"
    element={<MyDebates />}
/>
    

        {/* Protected Routes */}

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/topics" element={<DebateTopics />} />


        <Route path="/sessions" element={<DebateSession />} />
        <Route
    path="/create-session"
    element={<CreateDebateSession />}
/>

        <Route path="/ai-feedback" element={<AIFeedback />} />

        <Route
          path="/presentation-analysis"
          element={<PresentationAnalysis />}
        />

        <Route path="/learning" element={<Learning />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/skill-tracking" element={<SkillTracking />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route
    path="/announcements"
    element={<Announcements />}
/>

        <Route
    path="/notes"
    element={<Notes />}
/>

<Route
    path="/recommended"
    element={<Recommended />}
/>
<Route
    path="/debate-sessions"
    element={<DebateSessions />}
/>

        {/* Coach */}

        <Route
    path="/coach/dashboard"
    element={<CoachDashboard />}
/>

<Route
    path="/coach-review/:id"
    element={<CoachReview />}
/>

<Route
    path="/coach/learners"
    element={<CoachLearners />}
/>

<Route
    path="/coach/learner/:id"
    element={<LearnerDetails />}
/>

<Route
    path="/coach-feedback"
    element={<CoachFeedback />}
/>

<Route
    path="/coach-feedback/:id"
    element={<CoachFeedbackDetails />}
/>


<Route
    path="/coach/assigned-debates"
    element={<AssignedDebates />}
/>

<Route

    path="/assigned-debates"

    element={<LearnerAssignedDebates />}

/>
<Route

    path="/coach/ai-queue"

    element={<AIEvaluationQueue/>}

/>



<Route
    path="/coach/ai-queue/:sessionId"
    element={<AIEvaluationReview />}
/>



<Route
    path="/coach/debate-sessions"
    element={<CoachDebateSessions />}
/>


<Route
    path="/coach/argument-reviews"
    element={<ArgumentReviews />}
/>

<Route
    path="/coach/argument-reviews/:id"
    element={<ArgumentReviewDetails />}
/>

<Route
    path="/coach/fallacy-reports"
    element={<FallacyReports />}
/>

<Route
    path="/coach/fallacy-reports/:id"
    element={<FallacyReportDetails />}
/>

<Route
    path="/coach/presentation-reviews"
    element={<PresentationReviews />}
/>

<Route
    path="/coach/presentation-reviews/:id"
    element={<PresentationReviewDetails />}
/>
<Route
    path="/coaching-plans"
    element={
        <Layout>
            <CoachingPlans />
        </Layout>
    }
/>

        {/* Educator */}
        <Route
    path="/dashboard"
    element={<Dashboard />}
/>

<Route
    path="/educator/dashboard"
    element={<EducatorDashboard />}
/>

        <Route
          path="/student-progress"
          element={<StudentProgress />}
        />

        <Route
    path="/educator/learners"
    element={<EducatorLearners />}
/>

      <Route
    path="/educator/learner/:learnerId"
    element={<EducatorLearnerDetails />}
/>

<Route
    path="/educator/classes"
    element={<MyClasses />}
/>
<Route
    path="/educator/classes/:classId"
    element={<ClassDetails />}
/>

<Route
    path="/educator/learners/:learnerId/evaluations/:evaluationId"
    element={<EducatorEvaluationDetails />}
/>

<Route
    path="/educator/class-analytics"
    element={<ClassAnalytics />}
/>
<Route
    path="/educator/performance-reports"
    element={<PerformanceReports />}
/>
<Route
    path="/educator/skill-gap"
    element={<SkillGapAnalysis />}
/>
<Route
    path="/educator/presentation-reports"
    element={<EducatorPresentationReports />}
/>
<Route
    path="/educator/assignments"
    element={<Assignments />}
/>
<Route
    path="/my-assignments"
    element={<MyAssignments />}
/>
<Route
    path="/educator/assignment-reviews"
    element={<AssignmentReviews />}
/>
<Route
    path="/educator/announcements"
    element={<EducatorAnnouncements />}
/>
<Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
/>
<Route
    path="/admin/users"
    element={<AdminUsers />}
/>

<Route
    path="/admin/roles"
    element={<AdminRoles />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;