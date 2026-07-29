import "./CoachDashboard.css";

import MainLayout from "../../components/layout/MainLayout";

import {
    FaCalendarAlt,
    FaUsers,
    FaBookOpen,
    FaClock,
    FaRocket
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const CoachDashboard = () => {

    const { user } = useAuth();

    // ==========================================
    // Statistics
    // ==========================================

    const stats = [

        {
            title: "Assigned Sessions",
            value: 12,
            subtitle: "Total sessions assigned",
            icon: <FaCalendarAlt />,
            color: "#2563EB"
        },

        {
            title: "Active Learners",
            value: 48,
            subtitle: "Currently under coaching",
            icon: <FaUsers />,
            color: "#10B981"
        },

        {
            title: "Debate Topics",
            value: 15,
            subtitle: "Available topics",
            icon: <FaBookOpen />,
            color: "#F59E0B"
        },

        {
            title: "Sessions Today",
            value: 3,
            subtitle: "Scheduled today",
            icon: <FaClock />,
            color: "#8B5CF6"
        }

    ];

    // ==========================================
    // Upcoming Sessions
    // ==========================================

    const sessions = [

        {
            date: "May 12",
            topic: "Technology vs Society",
            time: "05:00 PM",
            format: "One-on-One",
            status: "Scheduled"
        },

        {
            date: "May 13",
            topic: "Climate Change",
            time: "03:00 PM",
            format: "Practice",
            status: "Scheduled"
        },

        {
            date: "May 15",
            topic: "Public Speaking",
            time: "11:00 AM",
            format: "Practice",
            status: "Scheduled"
        }

    ];

    // ==========================================
    // Assigned Learners
    // ==========================================

    const learners = [

        {
            name: "Rahul Sharma",
            level: "Beginner",
            progress: 65
        },

        {
            name: "Anjali Mehta",
            level: "Intermediate",
            progress: 82
        },

        {
            name: "Kiran Patel",
            level: "Beginner",
            progress: 55
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

                        Welcome back, {user?.full_name || "Coach"} 👋

                    </h1>

                    <p>

                        Guide learners and manage debate sessions efficiently.

                    </p>

                </div>

                <div className="banner-icon">

                    <FaRocket />

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
                Sessions + Learners
            ====================================== */}

            <section className="dashboard-row">

                {/* Sessions */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Upcoming Debate Sessions

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

                                <th>Time</th>

                                <th>Format</th>

                                <th>Status</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                sessions.map((session,index)=>(

                                    <tr key={index}>

                                        <td>

                                            {session.date}

                                        </td>

                                        <td>

                                            {session.topic}

                                        </td>

                                        <td>

                                            {session.time}

                                        </td>

                                        <td>

                                            {session.format}

                                        </td>

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

                {/* Learners */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Assigned Learners

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    {

                        learners.map((learner,index)=>(

                            <div
                                key={index}
                                className="learner-item"
                            >

                                <div>

                                    <h4>

                                        {learner.name}

                                    </h4>

                                    <p>

                                        {learner.level}

                                    </p>

                                </div>

                                <div className="progress-wrapper">

                                    <div className="progress-bar">

                                        <div

                                            className="progress-fill"

                                            style={{
                                                width:`${learner.progress}%`
                                            }}

                                        ></div>

                                    </div>

                                    <span>

                                        {learner.progress}%

                                    </span>

                                </div>

                            </div>

                        ))

                    }

                </div>

            </section>

                        {/* ======================================
                Debate Evaluations + Skill Gap
            ====================================== */}

            <section className="dashboard-row">

                {/* Debate Evaluations */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Recent Debate Evaluations

                        </h2>

                        <button>

                            View All →

                        </button>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Learner</th>

                                <th>Topic</th>

                                <th>Score</th>

                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Rahul Sharma</td>

                                <td>Technology vs Society</td>

                                <td>82%</td>

                                <td>

                                    <span className="status-success">

                                        Excellent

                                    </span>

                                </td>

                            </tr>

                            <tr>

                                <td>Anjali Mehta</td>

                                <td>Climate Change</td>

                                <td>76%</td>

                                <td>

                                    <span className="status-warning">

                                        Good

                                    </span>

                                </td>

                            </tr>

                            <tr>

                                <td>Kiran Patel</td>

                                <td>Public Speaking</td>

                                <td>68%</td>

                                <td>

                                    <span className="status-info">

                                        Improving

                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

                {/* Skill Gap */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <h2>

                            Skill Gap Analysis

                        </h2>

                    </div>

                    {

                        [

                            {
                                skill:"Communication",
                                value:82
                            },

                            {
                                skill:"Confidence",
                                value:70
                            },

                            {
                                skill:"Logical Reasoning",
                                value:61
                            },

                            {
                                skill:"Rebuttal",
                                value:56
                            }

                        ].map((item,index)=>(

                            <div
                                key={index}
                                className="skill-item"
                            >

                                <div className="skill-header">

                                    <span>

                                        {item.skill}

                                    </span>

                                    <span>

                                        {item.value}%

                                    </span>

                                </div>

                                <div className="progress-bar">

                                    <div

                                        className="progress-fill"

                                        style={{
                                            width:`${item.value}%`
                                        }}

                                    ></div>

                                </div>

                            </div>

                        ))

                    }

                </div>

            </section>

            {/* ======================================
                Coaching Recommendations
            ====================================== */}

            <section className="dashboard-card recommendation-card">

                <div className="card-header">

                    <h2>

                        Coaching Recommendations

                    </h2>

                </div>

                <ul className="recommendation-list">

                    <li>

                        ✅ Schedule extra practice for beginner learners.

                    </li>

                    <li>

                        ✅ Rahul Sharma is ready for Intermediate debates.

                    </li>

                    <li>

                        ✅ Improve rebuttal practice across current sessions.

                    </li>

                    <li>

                        ✅ Review today's completed evaluations.

                    </li>

                </ul>

            </section>

            {/* ======================================
                Quick Actions
            ====================================== */}

            <section className="quick-actions">

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

                        View Learners

                    </h3>

                    <p>

                        Manage assigned learners.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        Debate Topics

                    </h3>

                    <p>

                        Browse available topics.

                    </p>

                </div>

                <div className="action-card">

                    <h3>

                        My Profile

                    </h3>

                    <p>

                        View and update profile.

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

export default CoachDashboard;