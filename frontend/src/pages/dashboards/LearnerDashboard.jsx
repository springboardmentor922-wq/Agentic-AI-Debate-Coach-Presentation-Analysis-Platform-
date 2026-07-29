import MainLayout from "../../components/layout/MainLayout";

import WelcomeCard from "../../components/cards/WelcomeCard";
import StatCard from "../../components/cards/StatCard";
import ActionCard from "../../components/cards/ActionCard";
import ActivityCard from "../../components/cards/ActivityCard";

import { useAuth } from "../../context/AuthContext";

import {

    FaBook,

    FaCalendarAlt,

    FaUserCheck,

    FaChartLine,

    FaPlayCircle,

    FaPlusCircle,

    FaUser,

    FaComments

} from "react-icons/fa";

import "./LearnerDashboard.css";

const LearnerDashboard = () => {

    const { user } = useAuth();

    const activities = [

        "Joined Live Debate - Technology vs Society",

        "Completed Practice Session",

        "Updated Profile",

        "Explored Climate Change Topic"

    ];

        // ===========================================
    // Recent Debate History
    // ===========================================

    const debateHistory = [

        {
            topic: "Technology vs Society",
            result: "Won",
            score: "82%",
            date: "May 10"
        },

        {
            topic: "Climate Change",
            result: "Practice",
            score: "76%",
            date: "May 08"
        },

        {
            topic: "AI Ethics",
            result: "Won",
            score: "89%",
            date: "May 04"
        }

    ];

    // ===========================================
    // Recommended Exercises
    // ===========================================

    const recommendedExercises = [

        {
            title: "Public Speaking",
            description: "Improve voice clarity and confidence."
        },

        {
            title: "Logical Reasoning",
            description: "Practice structured argument building."
        },

        {
            title: "Rebuttal Practice",
            description: "Strengthen counter-argument skills."
        },

        {
            title: "Eye Contact Training",
            description: "Improve presentation confidence."
        }

    ];

    // ===========================================
    // AI Coaching Insights
    // ===========================================

    const coachingInsights = [

        "Confidence improved by 8% this week.",

        "Excellent eye contact during practice.",

        "Improve rebuttal quality for stronger arguments.",

        "Ready to attempt Intermediate level debates."

    ];

    return (

        <MainLayout>

            {/* ===========================
                    Welcome
            =========================== */}

            <WelcomeCard user={user} />

            {/* ===========================
                    Statistics
            =========================== */}

            <div className="stats-grid">

                <StatCard

                    title="Debate Sessions"

                    value="8"

                    icon={<FaCalendarAlt />}

                    color="#2563EB"

                />

                <StatCard

                    title="Topics Explored"

                    value="6"

                    icon={<FaBook />}

                    color="#10B981"

                />

                <StatCard

                    title="Profile Completion"

                    value="75%"

                    icon={<FaUserCheck />}

                    color="#F59E0B"

                />

                <StatCard

                    title="Overall Progress"

                    value="60%"

                    icon={<FaChartLine />}

                    color="#8B5CF6"

                />

            </div>

            {/* ===========================
                Middle Section
            =========================== */}

            <div className="dashboard-middle">

                {/* Upcoming Sessions */}

                <div className="dashboard-table">

                    <div className="section-header">

                        <h2>

                            Upcoming Debate Sessions

                        </h2>

                    </div>

                    <table>

                        <thead>

                            <tr>

                                <th>Date</th>

                                <th>Topic</th>

                                <th>Time</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>May 12</td>

                                <td>Technology vs Society</td>

                                <td>05:00 PM</td>

                                <td>

                                    <button className="join-btn">

                                        Join

                                    </button>

                                </td>

                            </tr>

                            <tr>

                                <td>May 14</td>

                                <td>Future of Education</td>

                                <td>04:00 PM</td>

                                <td>

                                    <button className="join-btn">

                                        Join

                                    </button>

                                </td>

                            </tr>

                            <tr>

                                <td>May 16</td>

                                <td>Should AI Replace Humans?</td>

                                <td>06:00 PM</td>

                                <td>

                                    <button className="join-btn">

                                        Join

                                    </button>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

                {/* Recent Activity */}

                <ActivityCard

                    title="Recent Activities"

                    activities={activities}

                />

            </div>

            {/* ===========================
                    Progress
            =========================== */}

            <div className="progress-card">

                <h2>

                    Skill Progress

                </h2>

                <div className="progress-item">

                    <span>Communication</span>

                    <progress value="75" max="100"></progress>

                    <strong>75%</strong>

                </div>

                <div className="progress-item">

                    <span>Confidence</span>

                    <progress value="82" max="100"></progress>

                    <strong>82%</strong>

                </div>

                <div className="progress-item">

                    <span>Logical Reasoning</span>

                    <progress value="64" max="100"></progress>

                    <strong>64%</strong>

                </div>

            </div>

            {/* ===========================
                    Quick Actions
            =========================== */}

            <div className="actions-grid">

                <ActionCard

                    title="Browse Topics"

                    description="Explore debate topics."

                    icon={<FaComments />}

                />

                <ActionCard

                    title="Practice Debate"

                    description="Start a practice debate."

                    icon={<FaPlayCircle />}

                />

                <ActionCard

                    title="Create Session"

                    description="Create a new session."

                    icon={<FaPlusCircle />}

                />

                <ActionCard

                    title="View Profile"

                    description="Manage your profile."

                    icon={<FaUser />}

                />

            </div>
            

            {/* ===========================================
                        Debate History + AI Coaching
                =========================================== */}

            <div className="dashboard-lower">

                <div className="history-card">

                    <h2>

                        Recent Debate History

                    </h2>

                    <table>

                        <thead>

                            <tr>

                                <th>Topic</th>

                                <th>Result</th>

                                <th>Score</th>

                                <th>Date</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                debateHistory.map((item,index)=>(

                                    <tr key={index}>

                                        <td>{item.topic}</td>

                                        <td>{item.result}</td>

                                        <td>{item.score}</td>

                                        <td>{item.date}</td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

                <div className="insights-card">

                    <h2>

                        AI Coaching Insights

                    </h2>

                    <ul>

                        {

                            coachingInsights.map((item,index)=>(

                                <li key={index}>

                                    ✅ {item}

                                </li>

                            ))

                        }

                    </ul>

                </div>

            </div>

            {/* ===========================================
                    Recommended Exercises
            =========================================== */}

            <div className="exercise-section">

                <h2>

                    Recommended Exercises

                </h2>

                <div className="exercise-grid">

                    {

                        recommendedExercises.map((exercise,index)=>(

                            <div

                                key={index}

                                className="exercise-card"

                            >

                                <h3>

                                    {exercise.title}

                                </h3>

                                <p>

                                    {exercise.description}

                                </p>

                            </div>

                        ))

                    }

                </div>

            </div>

            {/* ===========================
                    Footer
            =========================== */}

            <div className="dashboard-footer">

                © 2026 Agentic AI Debate Coach Platform

            </div>

        </MainLayout>

    );

};

export default LearnerDashboard;