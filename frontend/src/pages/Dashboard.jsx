import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaComments,
    FaStar,
    FaCheckCircle,
    FaTrophy
} from "react-icons/fa";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total_debates: 0,
        average_score: 0,
        completed_sessions: 0,
        current_level: ""
    });

    const [chartData, setChartData] = useState([]);

    const [activities, setActivities] = useState([]);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        Promise.all([
            fetch("http://127.0.0.1:8000/dashboard/stats").then(res => res.json()),
            fetch("http://127.0.0.1:8000/dashboard/performance").then(res => res.json()),
            fetch("http://127.0.0.1:8000/dashboard/recent-activity").then(res => res.json())
        ])
            .then(([statsData, performanceData, activityData]) => {
                setStats(statsData);
                setChartData(performanceData);
                setActivities(activityData);
            })
            .catch(error => {
                console.error("Error loading dashboard:", error);
            });

    }, [navigate]);

    return (
        <DashboardLayout>

            <h1>Dashboard</h1>

            <p style={{ marginBottom: "30px" }}>
                Welcome to AI Debate Coach!
            </p>

            {/* Dashboard Cards */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px"
                }}
            >

                <DashboardCard
                    title="Total Debates"
                    value={stats.total_debates}
                    subtitle="Completed debate sessions"
                    icon={<FaComments />}
                    color="#2563eb"
                />

                <DashboardCard
                    title="Average Score"
                    value={`${stats.average_score}%`}
                    subtitle="Overall performance"
                    icon={<FaStar />}
                    color="#16a34a"
                />

                <DashboardCard
                    title="Completed Sessions"
                    value={stats.completed_sessions}
                    subtitle="Successfully finished"
                    icon={<FaCheckCircle />}
                    color="#ea580c"
                />

                <DashboardCard
                    title="Current Level"
                    value={stats.current_level}
                    subtitle="Keep improving"
                    icon={<FaTrophy />}
                    color="#9333ea"
                />

            </div>

            {/* Recent Activity */}

            <div
                style={{
                    marginTop: "40px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h2 style={{ marginBottom: "20px" }}>
                    📊 Recent Activity
                </h2>

                {activities.map((item, index) => (

                    <div
                        key={index}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 0",
                            borderBottom:
                                index !== activities.length - 1
                                    ? "1px solid #e5e7eb"
                                    : "none"
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    fontWeight: "600",
                                    fontSize: "16px"
                                }}
                            >
                                {item.activity}
                            </div>

                            <div
                                style={{
                                    color: "#6b7280",
                                    fontSize: "14px",
                                    marginTop: "4px"
                                }}
                            >
                                {item.time}
                            </div>

                        </div>

                        <div
                            style={{
                                fontSize: "22px"
                            }}
                        >
                            ✅
                        </div>

                    </div>

                ))}

            </div>

            {/* Performance Chart */}

            <div
                style={{
                    marginTop: "40px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h2 style={{ marginBottom: "20px" }}>
                    📈 Monthly Performance
                </h2>

                <div style={{ width: "100%", height: "320px" }}>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="score"
                                fill="#2563eb"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                </div>

            </div>

        </DashboardLayout>
    );
}