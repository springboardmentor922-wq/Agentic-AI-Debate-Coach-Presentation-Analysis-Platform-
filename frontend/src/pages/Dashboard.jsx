import React from "react";
import Layout from "../components/Layout";
import { getUser } from "../utils/useAuth";

import LearnerDashboard from "./dashboards/LearnerDashboard";
import CoachDashboard from "./dashboards/CoachDashboard";
import EducatorDashboard from "./dashboards/EducatorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function Dashboard() {
  const user = getUser();
  const role = user?.role?.toLowerCase() || "learner";

  let content;
  if (role === "learner") content = <LearnerDashboard />;
  else if (role === "debate coach") content = <CoachDashboard />;
  else if (role === "educator") content = <EducatorDashboard />;
  else if (role === "admin") content = <AdminDashboard />;
  else content = <p>Unknown role.</p>;

  return <Layout>{content}</Layout>;
}

export default Dashboard;
