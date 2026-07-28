import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
    FaComments,
    FaChartLine,
    FaTrophy,
    FaBullseye
} from "react-icons/fa";

export default function LearnerDashboard() {

    return (

        <DashboardLayout>

            <h1>Learner Dashboard</h1>

            <p style={{ marginBottom: "30px" }}>
                Welcome to your personalized learning dashboard.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px"
                }}
            >

                <DashboardCard
                    title="Debates"
                    value="15"
                    subtitle="Completed sessions"
                    icon={<FaComments />}
                    color="#2563eb"
                />

                <DashboardCard
                    title="Average Score"
                    value="86%"
                    subtitle="Current performance"
                    icon={<FaChartLine />}
                    color="#16a34a"
                />

                <DashboardCard
                    title="Best Score"
                    value="95%"
                    subtitle="Highest achievement"
                    icon={<FaTrophy />}
                    color="#ea580c"
                />

                <DashboardCard
                    title="Goals Achieved"
                    value="4"
                    subtitle="Learning milestones"
                    icon={<FaBullseye />}
                    color="#9333ea"
                />

            </div>

            <div
                style={{
                    marginTop: "40px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h2>Learner Overview</h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <tbody>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>Debates Completed</td>
                            <td style={{ padding: "14px", textAlign: "right" }}>15</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>Average Score</td>
                            <td style={{ padding: "14px", textAlign: "right" }}>86%</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>Current Level</td>
                            <td style={{ padding: "14px", textAlign: "right" }}>Intermediate</td>
                        </tr>

                        <tr>
                            <td style={{ padding: "14px", fontWeight: "600" }}>Next Goal</td>
                            <td style={{ padding: "14px", textAlign: "right" }}>Advanced Speaker</td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </DashboardLayout>

    );

}