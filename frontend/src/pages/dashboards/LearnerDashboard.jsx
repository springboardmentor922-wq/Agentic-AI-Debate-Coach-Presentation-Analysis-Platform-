import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/cards/WelcomeCard";
import StatCard from "../../components/cards/StatCard";
import PerformanceChart from "../../components/cards/PerformanceChart";
import { useAuth } from "../../context/AuthContext";
import {
    FaBook,
    FaCalendarAlt,
    FaUserCheck,
    FaChartLine,
    FaClock,
    FaLightbulb,
    FaBrain,
    FaTrophy
} from "react-icons/fa";
import "./LearnerDashboard.css";

const LearnerDashboard = () => {
    const { user } = useAuth();

    const debateHistory = [
        { topic: "Technology vs Society", result: "Won", score: "82%", date: "May 10" },
        { topic: "Climate Change", result: "Practice", score: "76%", date: "May 08" },
        { topic: "AI Ethics", result: "Won", score: "89%", date: "May 04" }
    ];

    const upcomingSessions = [
        { date: "May 12", time: "05:00 PM", topic: "Technology vs Society" },
        { date: "May 14", time: "04:00 PM", topic: "Future of Education" },
        { date: "May 16", time: "06:00 PM", topic: "Should AI Replace Humans?" }
    ];

    const skillProgress = [
        { label: "Communication", value: 75, color: "#2563EB" },
        { label: "Confidence", value: 82, color: "#10B981" },
        { label: "Logical Reasoning", value: 64, color: "#F59E0B" }
    ];

    const recommendations = [
        { title: "Public Speaking", description: "Sharpen your delivery and pacing for live debates." },
        { title: "Rebuttal Practice", description: "Strengthen your counter-argument flow under pressure." },
        { title: "Argument Structuring", description: "Improve how you build a clear claim-evidence-warrant response." }
    ];

    const coachingInsights = [
        "Confidence improved by 8% this week.",
        "Excellent eye contact during practice.",
        "Rebuttal quality is improving and ready for the next level."
    ];

    return (
        <MainLayout>
            <div className="dashboard-shell">
                <WelcomeCard user={user} />

                <div className="stats-grid">
                    <StatCard title="Debate Sessions" value="8" icon={<FaCalendarAlt />} color="#2563EB" />
                    <StatCard title="Topics Explored" value="6" icon={<FaBook />} color="#10B981" />
                    <StatCard title="Profile Completion" value="75%" icon={<FaUserCheck />} color="#F59E0B" />
                    <StatCard title="Overall Progress" value="60%" icon={<FaChartLine />} color="#8B5CF6" />
                </div>

                <div className="dashboard-grid">
                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Recent Debates</h2>
                                <p>Your latest debate results and outcomes</p>
                            </div>
                            <span className="pill">Updated today</span>
                        </div>

                        <ul className="recent-debates-list">
                            {debateHistory.map((item, index) => (
                                <li key={index} className="recent-debates-item">
                                    <div>
                                        <strong>{item.topic}</strong>
                                        <p>{item.date}</p>
                                    </div>
                                    <div className="debate-meta">
                                        <span className={`status-pill ${item.result.toLowerCase()}`}>{item.result}</span>
                                        <span className="score-pill">{item.score}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Upcoming Sessions</h2>
                                <p>Planned live sessions and practice rooms</p>
                            </div>
                            <span className="pill accent">3 this week</span>
                        </div>

                        <ul className="upcoming-list">
                            {upcomingSessions.map((session, index) => (
                                <li key={index} className="upcoming-item">
                                    <div>
                                        <strong>{session.topic}</strong>
                                        <p>{session.date}</p>
                                    </div>
                                    <div className="upcoming-time">
                                        <FaClock />
                                        <span>{session.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="dashboard-grid secondary-grid">
                    <section className="dashboard-panel chart-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Performance Snapshot</h2>
                                <p>Chart placeholder for weekly progress trends</p>
                            </div>
                            <span className="pill">Live view</span>
                        </div>
                        <div className="chart-placeholder">
                            <PerformanceChart />
                        </div>
                    </section>

                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Skill Progress</h2>
                                <p>Areas to keep improving</p>
                            </div>
                            <span className="pill">Focus areas</span>
                        </div>

                        <div className="skill-list">
                            {skillProgress.map((skill) => (
                                <div key={skill.label} className="skill-row">
                                    <div className="skill-meta">
                                        <span>{skill.label}</span>
                                        <strong>{skill.value}%</strong>
                                    </div>
                                    <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${skill.value}%`, background: skill.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="dashboard-grid recommendations-grid">
                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>AI Recommendations</h2>
                                <p>Suggested next steps from your coach</p>
                            </div>
                            <span className="pill accent"><FaLightbulb /></span>
                        </div>

                        <ul className="recommendation-list">
                            {recommendations.map((item, index) => (
                                <li key={index} className="recommendation-item">
                                    <div>
                                        <strong>{item.title}</strong>
                                        <p>{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Coach Insights</h2>
                                <p>Highlights from your recent activity</p>
                            </div>
                            <span className="pill"><FaBrain /></span>
                        </div>

                        <ul className="insight-list">
                            {coachingInsights.map((item, index) => (
                                <li key={index}>
                                    <FaTrophy />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="dashboard-footer">© 2026 Agentic AI Debate Coach Platform</div>
            </div>
        </MainLayout>
    );
};

export default LearnerDashboard;