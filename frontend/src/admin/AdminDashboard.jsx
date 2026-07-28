import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
    FaUsers,
    FaUserShield,
    FaRobot,
    FaDatabase
} from "react-icons/fa";

export default function AdminDashboard() {

    return (

        <DashboardLayout>

            <h1>Admin Dashboard</h1>

            <p style={{ marginBottom: "30px" }}>
                Manage users, AI models, and overall platform statistics.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
                    gap: "20px"
                }}
            >

                <DashboardCard
                    title="Total Users"
                    value="125"
                    subtitle="Registered users"
                    icon={<FaUsers />}
                    color="#2563eb"
                />

                <DashboardCard
                    title="Admins"
                    value="5"
                    subtitle="System administrators"
                    icon={<FaUserShield />}
                    color="#16a34a"
                />

                <DashboardCard
                    title="AI Models"
                    value="8"
                    subtitle="Models deployed"
                    icon={<FaRobot />}
                    color="#ea580c"
                />

                <DashboardCard
                    title="Database Status"
                    value="Online"
                    subtitle="System health"
                    icon={<FaDatabase />}
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

                <h2>Admin Summary</h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <tbody>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Total Users
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                125
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Active Users
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                112
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                AI Models
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                8
                            </td>
                        </tr>

                        <tr>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Server Status
                            </td>
                            <td style={{ padding: "14px", textAlign: "right", color: "green" }}>
                                Online
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </DashboardLayout>

    );

}