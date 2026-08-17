import Layout from "../components/Layout";

import LearnerDashboard from "../components/dashboards/LearnerDashboard";
import CoachDashboard from "../components/dashboards/CoachDashboard";
import EducatorDashboard from "./EducatorDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";

import "../styles/dashboard.css";

function Dashboard() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const renderDashboard = () => {

        switch (user?.role) {

            case "Learner":
                return <LearnerDashboard />;

            case "Debate Coach":
                return <CoachDashboard />;

            case "Educator":
                return <EducatorDashboard />;

            case "Administrator":
                return <AdminDashboard />;

            default:
                return <LearnerDashboard />;
        }
    };

    return (
        <Layout>

            <div className="dashboard-page">

                {renderDashboard()}

            </div>

        </Layout>
    );
}

export default Dashboard;