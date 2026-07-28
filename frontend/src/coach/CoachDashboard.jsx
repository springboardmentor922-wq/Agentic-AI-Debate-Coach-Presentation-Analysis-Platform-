import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

import {
    FaUserGraduate,
    FaClipboardCheck,
    FaChartLine,
    FaLightbulb
} from "react-icons/fa";

export default function CoachDashboard() {

    return (

        <DashboardLayout>

            <h1>Coach Dashboard</h1>

            <p style={{ marginBottom: "30px" }}>
                Monitor student progress and provide personalized coaching.
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
                    value="25"
                    subtitle="Active learners"
                    icon={<FaUserGraduate />}
                    color="#2563eb"
                />

                <DashboardCard
                    title="Evaluations"
                    value="48"
                    subtitle="Completed reviews"
                    icon={<FaClipboardCheck />}
                    color="#16a34a"
                />

                <DashboardCard
                    title="Average Progress"
                    value="84%"
                    subtitle="Overall improvement"
                    icon={<FaChartLine />}
                    color="#ea580c"
                />

                <DashboardCard
                    title="Recommendations"
                    value="12"
                    subtitle="Pending coaching tips"
                    icon={<FaLightbulb />}
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

                <h2>Coach Summary</h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <tbody>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Students Monitored
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                25
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Debates Reviewed
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                48
                            </td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Skill Gaps Identified
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                18
                            </td>
                        </tr>

                        <tr>
                            <td style={{ padding: "14px", fontWeight: "600" }}>
                                Recommendations Sent
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                                32
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </DashboardLayout>

    );

}