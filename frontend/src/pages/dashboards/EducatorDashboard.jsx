import "./EducatorDashboard.css";

import MainLayout from "../../components/layout/MainLayout";

import {
    FaUsers,
    FaGraduationCap,
    FaBookOpen,
    FaChartLine,
    FaChalkboardTeacher
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const EducatorDashboard = () => {

    const { user } = useAuth();

    // ==========================================
    // Statistics
    // ==========================================

    const stats = [

        {
            title: "Total Students",
            value: 86,
            subtitle: "Students under your institution",
            icon: <FaUsers />,
            color: "#2563EB"
        },

        {
            title: "Active Sessions",
            value: 18,
            subtitle: "Debate sessions currently active",
            icon: <FaGraduationCap />,
            color: "#10B981"
        },

        {
            title: "Debate Topics",
            value: 24,
            subtitle: "Topics created and available",
            icon: <FaBookOpen />,
            color: "#F59E0B"
        },

        {
            title: "Average Performance",
            value: "76%",
            subtitle: "Overall student performance",
            icon: <FaChartLine />,
            color: "#8B5CF6"
        }

    ];

    // ==========================================
    // Recent Debate Sessions
    // ==========================================

    const sessions = [

        {
            date: "May 12",
            topic: "Technology vs Society",
            format: "One-on-One",
            participants: 12,
            status: "Completed"
        },

        {
            date: "May 14",
            topic: "Climate Change",
            format: "Group Debate",
            participants: 16,
            status: "Ongoing"
        },

        {
            date: "May 16",
            topic: "Future of Education",
            format: "Oxford Style",
            participants: 14,
            status: "Scheduled"
        }

    ];

    // ==========================================
    // Student Performance
    // ==========================================

    const students = [

        {
            name: "Rahul Sharma",
            sessions: 8,
            score: 82,
            progress: 85
        },

        {
            name: "Anjali Mehta",
            sessions: 7,
            score: 78,
            progress: 78
        },

        {
            name: "Kiran Patel",
            sessions: 6,
            score: 74,
            progress: 72
        },

        {
            name: "Neha Verma",
            sessions: 7,
            score: 71,
            progress: 69
        },

        {
            name: "Arjun Singh",
            sessions: 5,
            score: 68,
            progress: 63
        }

    ];

    return (

        <MainLayout>

            {/* ======================================
                    Welcome Banner
            ====================================== */}

            <section className="dashboard-banner">

                <div>

                    <h1>

                        Welcome back, {user?.full_name || "Educator"} 👋

                    </h1>

                    <p>

                        Monitor student performance, manage debates, and track learning outcomes.

                    </p>

                </div>

                <div className="banner-icon">

                    <FaChalkboardTeacher />

                </div>

            </section>

            {/* ======================================
                    Statistics
            ====================================== */}

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

            {/* ======================================
                Sessions + Student Performance
            ====================================== */}

            <section className="dashboard-row">

                {/* Recent Sessions */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Recent Debate Sessions

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Date</th>

                                <th>Topic</th>

                                <th>Format</th>

                                <th>Participants</th>

                                <th>Status</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                sessions.map((session,index)=>(

                                    <tr key={index}>

                                        <td>{session.date}</td>

                                        <td>{session.topic}</td>

                                        <td>{session.format}</td>

                                        <td>{session.participants}</td>

                                        <td>

                                            <span className="status-badge">

                                                {session.status}

                                            </span>

                                        </td>

                                        <td>

                                            <button className="table-btn">

                                                View

                                            </button>

                                        </td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

                {/* Student Performance */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Student Performance Overview

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    {

                        students.map((student,index)=>(

                            <div
                                key={index}
                                className="learner-item"
                            >

                                <div>

                                    <h4>

                                        {student.name}

                                    </h4>

                                    <p>

                                        {student.sessions} Sessions • Avg Score {student.score}%

                                    </p>

                                </div>

                                <div className="progress-wrapper">

                                    <div className="progress-bar">

                                        <div

                                            className="progress-fill"

                                            style={{
                                                width:`${student.progress}%`
                                            }}

                                        ></div>

                                    </div>

                                    <span>

                                        {student.progress}%

                                    </span>

                                </div>

                            </div>

                        ))

                    }

                </div>

            </section>

                        {/* ======================================
                Presentation Assessment Reports
            ====================================== */}

            <section className="dashboard-row">

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Presentation Assessment Reports

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Student</th>

                                <th>Presentation</th>

                                <th>Score</th>

                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Rahul Sharma</td>

                                <td>Public Speaking</td>

                                <td>85%</td>

                                <td>

                                    <span className="status-success">

                                        Completed

                                    </span>

                                </td>

                            </tr>

                            <tr>

                                <td>Anjali Mehta</td>

                                <td>Climate Change</td>

                                <td>82%</td>

                                <td>

                                    <span className="status-success">

                                        Completed

                                    </span>

                                </td>

                            </tr>

                            <tr>

                                <td>Kiran Patel</td>

                                <td>AI Ethics</td>

                                <td>79%</td>

                                <td>

                                    <span className="status-warning">

                                        Review

                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

                {/* Important Alerts */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Important Alerts

                        </h2>

                    </div>

                    <ul className="recommendation-list">

                        <li>

                            📅 3 debate sessions scheduled today.

                        </li>

                        <li>

                            👨‍🎓 5 students need educator feedback.

                        </li>

                        <li>

                            📊 Monthly performance report is ready.

                        </li>

                        <li>

                            📢 Review presentation assessments before Friday.

                        </li>

                    </ul>

                </div>

            </section>

            {/* ======================================
                Quick Actions
            ====================================== */}

            <section className="quick-actions">

                <div className="action-card">

                    <h3>

                        Add Student

                    </h3>

                    <p>

                        Add students to your institution.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Create Session

                    </h3>

                    <p>

                        Schedule a new debate session.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Manage Topics

                    </h3>

                    <p>

                        Create and manage debate topics.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        View Reports

                    </h3>

                    <p>

                        Review student performance reports.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        View Students

                    </h3>

                    <p>

                        Monitor all students.

                    </p>

                </div>

            </section>

            {/* ======================================
                    Footer
            ====================================== */}

            <footer className="dashboard-footer">

                © 2026 Agentic AI Debate Coach Platform

            </footer>

        </MainLayout>

    );

};

export default EducatorDashboard;