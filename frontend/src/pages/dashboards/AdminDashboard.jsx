import "./AdminDashboard.css";

import MainLayout from "../../components/layout/MainLayout";

import {
    FaUsers,
    FaUserTie,
    FaUserGraduate,
    FaBookOpen,
    FaCalendarAlt,
    FaCogs
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {

    const { user } = useAuth();

    // =====================================================
    // Dashboard Statistics
    // =====================================================

    const stats = [

        {
            title: "Total Users",
            value: 256,
            subtitle: "All registered users",
            icon: <FaUsers />,
            color: "#2563EB"
        },

        {
            title: "Debate Coaches",
            value: 42,
            subtitle: "Active coaches",
            icon: <FaUserTie />,
            color: "#10B981"
        },

        {
            title: "Learners",
            value: 186,
            subtitle: "Active learners",
            icon: <FaUserGraduate />,
            color: "#F59E0B"
        },

        {
            title: "Debate Topics",
            value: 38,
            subtitle: "Available topics",
            icon: <FaBookOpen />,
            color: "#8B5CF6"
        },

        {
            title: "Debate Sessions",
            value: 67,
            subtitle: "Total sessions",
            icon: <FaCalendarAlt />,
            color: "#EF4444"
        }

    ];

    // =====================================================
    // User Overview
    // =====================================================

    const userOverview = [

        {
            role: "Administrators",
            total: 3,
            active: 3,
            inactive: 0
        },

        {
            role: "Educators",
            total: 25,
            active: 22,
            inactive: 3
        },

        {
            role: "Debate Coaches",
            total: 42,
            active: 38,
            inactive: 4
        },

        {
            role: "Learners",
            total: 186,
            active: 154,
            inactive: 32
        }

    ];

    // =====================================================
    // Recent Activity
    // =====================================================

    const activities = [

        {
            activity: "New User Registered",
            details: "Rahul Sharma (Learner)",
            date: "May 10, 2026"
        },

        {
            activity: "New Session Created",
            details: "Technology Debate",
            date: "May 10, 2026"
        },

        {
            activity: "New Topic Added",
            details: "Future of AI",
            date: "May 09, 2026"
        },

        {
            activity: "User Role Updated",
            details: "Anjali → Debate Coach",
            date: "May 09, 2026"
        },

        {
            activity: "System Settings Updated",
            details: "General Settings",
            date: "May 09, 2026"
        }

    ];

    return (

        <MainLayout>

            {/* ===========================================
                    Welcome Banner
            =========================================== */}

            <section className="dashboard-banner">

                <div>

                    <h1>

                        Welcome back, {user?.full_name || "Administrator"} 👋

                    </h1>

                    <p>

                        Monitor and manage the platform efficiently.

                    </p>

                </div>

                <div className="banner-icon">

                    <FaCogs />

                </div>

            </section>

            {/* ===========================================
                    Statistics
            =========================================== */}

            <section className="stats-grid">

                {

                    stats.map((item,index)=>(

                        <div
                            key={index}
                            className="stat-card"
                        >

                            <div
                                className="stat-icon"
                                style={{
                                    background:item.color
                                }}
                            >

                                {item.icon}

                            </div>

                            <div>

                                <h2>

                                    {item.value}

                                </h2>

                                <h4>

                                    {item.title}

                                </h4>

                                <p>

                                    {item.subtitle}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </section>

            {/* ===========================================
                    User Overview
                    Recent Activity
            =========================================== */}

            <section className="dashboard-row">

                {/* User Overview */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            User Overview

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Role</th>

                                <th>Total Users</th>

                                <th>Active Users</th>

                                <th>Inactive Users</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                userOverview.map((role,index)=>(

                                    <tr key={index}>

                                        <td>{role.role}</td>

                                        <td>{role.total}</td>

                                        <td>{role.active}</td>

                                        <td>{role.inactive}</td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

                {/* Recent Activity */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Recent Activity

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Activity</th>

                                <th>Details</th>

                                <th>Date</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                activities.map((item,index)=>(

                                    <tr key={index}>

                                        <td>{item.activity}</td>

                                        <td>{item.details}</td>

                                        <td>{item.date}</td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

            </section>

                        {/* ===========================================
                    Platform Analytics + System Status
            =========================================== */}

            <section className="dashboard-row">

                {/* Platform Analytics */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Platform Analytics

                        </h2>

                    </div>

                    <div className="analytics-grid">

                        <div className="analytics-card">

                            <h3>24</h3>

                            <p>New Users This Month</p>

                        </div>

                        <div className="analytics-card">

                            <h3>18</h3>

                            <p>Active Sessions</p>

                        </div>

                        <div className="analytics-card">

                            <h3>145</h3>

                            <p>Reports Generated</p>

                        </div>

                        <div className="analytics-card">

                            <h3>72%</h3>

                            <p>Platform Usage</p>

                        </div>

                    </div>

                </div>

                {/* System Status */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            System Status

                        </h2>

                    </div>

                    <div className="system-status">

                        <div className="status-item">

                            <span>Database Connection</span>

                            <span className="status-online">

                                ● Online

                            </span>

                        </div>

                        <div className="status-item">

                            <span>API Services</span>

                            <span className="status-online">

                                ● Online

                            </span>

                        </div>

                        <div className="status-item">

                            <span>Storage Usage</span>

                            <span className="status-warning">

                                ● 62%

                            </span>

                        </div>

                        <div className="status-item">

                            <span>Server Status</span>

                            <span className="status-online">

                                ● Healthy

                            </span>

                        </div>

                        <div className="status-item">

                            <span>Backup Status</span>

                            <span className="status-online">

                                ● Up to Date

                            </span>

                        </div>

                    </div>

                </div>

            </section>

            {/* ===========================================
                    Quick Actions
            =========================================== */}

            <section className="quick-actions">

                <div className="action-card">

                    <h3>

                        Add User

                    </h3>

                    <p>

                        Register a new platform user.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Manage Roles

                    </h3>

                    <p>

                        Create or update user roles.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Manage Topics

                    </h3>

                    <p>

                        Add or edit debate topics.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Manage Sessions

                    </h3>

                    <p>

                        View and manage all sessions.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        View Reports

                    </h3>

                    <p>

                        Generate platform reports.

                    </p>

                </div>

            </section>

            {/* ===========================================
                    Footer
            =========================================== */}

            <footer className="dashboard-footer">

                © 2026 Agentic AI Debate Coach Platform

            </footer>

        </MainLayout>

    );

};

export default AdminDashboard;