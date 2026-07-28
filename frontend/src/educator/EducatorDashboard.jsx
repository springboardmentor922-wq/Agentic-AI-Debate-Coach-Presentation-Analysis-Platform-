import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
    FaUsers,
    FaChalkboardTeacher,
    FaChartBar,
    FaClipboardList
} from "react-icons/fa";

export default function EducatorDashboard() {

    return (

        <DashboardLayout>

            <h1>Educator Dashboard</h1>

            <p style={{ marginBottom: "30px" }}>
                Monitor classroom performance and student engagement.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
                    gap: "20px"
                }}
            >

                <DashboardCard
                    title="Students"
                    value="30"
                    subtitle="Enrolled students"
                    icon={<FaUsers />}
                    color="#2563eb"
                />

                <DashboardCard
                    title="Classes"
                    value="5"
                    subtitle="Active classes"
                    icon={<FaChalkboardTeacher />}
                    color="#16a34a"
                />

                <DashboardCard
                    title="Average Score"
                    value="84%"
                    subtitle="Overall class performance"
                    icon={<FaChartBar />}
                    color="#ea580c"
                />

                <DashboardCard
                    title="Reports"
                    value="18"
                    subtitle="Generated reports"
                    icon={<FaClipboardList />}
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

                <h2>Educator Summary</h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <tbody>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Total Students
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                30
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Total Debates
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                120
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Completion Rate
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                92%
                            </td>
                        </tr>

                        <tr>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Reports Generated
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                18
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </DashboardLayout>

    );

}