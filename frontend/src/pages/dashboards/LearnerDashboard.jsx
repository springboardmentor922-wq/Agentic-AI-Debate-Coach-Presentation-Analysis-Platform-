import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/cards/WelcomeCard";
import StatCard from "../../components/cards/StatCard";
import ActionCard from "../../components/cards/ActionCard";
import ActivityCard from "../../components/cards/ActivityCard";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile } from "../../services/profileService";
import { getMySkill } from "../../services/skillService";
import { getMySessions } from "../../services/debateSessionService";
import { getReportsByUser } from "../../services/reportService";
import { getRecommendedTopics, getLearningPath } from "../../services/recommendationService";
import { getNotifications } from "../../services/notificationService";
import { getAllTopics } from "../../services/debateTopicService";
import {
    computeAverageScore,
    computeProfileCompletion,
    extractReportScore,
    formatDate,
    formatDateTime,
    normalizeStatus,
    safeNumber,
    toArray,
} from "../../utils/learnerHelpers";

import {
    FaBook,
    FaCalendarAlt,
    FaChartLine,
    FaComments,
    FaListAlt,
    FaMapSigns,
    FaPlayCircle,
    FaPlusCircle,
    FaUser,
    FaUserCheck,
} from "react-icons/fa";

import "./LearnerDashboard.css";

const LearnerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState(null);
    const [skill, setSkill] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [reports, setReports] = useState([]);
    const [recommendedTopics, setRecommendedTopics] = useState([]);
    const [learningPath, setLearningPath] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [topicsCount, setTopicsCount] = useState(0);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);

                const [profileData, skillData, sessionData, reportData, topicData, recommendationData, learningPathData, notificationData] = await Promise.all([
                    getMyProfile().catch(() => null),
                    getMySkill().catch(() => null),
                    getMySessions().catch(() => []),
                    getReportsByUser(user?.id).catch(() => []),
                    getAllTopics().catch(() => []),
                    getRecommendedTopics().catch(() => []),
                    getLearningPath().catch(() => []),
                    getNotifications().catch(() => []),
                ]);

                if (!active) {
                    return;
                }

                setProfile(profileData);
                setSkill(skillData);
                setSessions(toArray(sessionData));
                setReports(toArray(reportData));
                setTopicsCount(toArray(topicData).length);
                setRecommendedTopics(toArray(recommendationData));
                setLearningPath(toArray(learningPathData));
                setNotifications(toArray(notificationData));
                setError("");
            } catch (dashboardError) {
                console.error(dashboardError);
                if (active) {
                    setError("Unable to load dashboard data right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDashboard();

        return () => {
            active = false;
        };
    }, [user?.id]);

    const profileCompletion = useMemo(
        () => computeProfileCompletion(profile || {}, user || {}),
        [profile, user]
    );

    const overallProgress = useMemo(
        () => computeAverageScore(skill || {}),
        [skill]
    );

    const uniqueTopicsCount = useMemo(() => {
        return new Set(sessions.map((session) => session.topic_id).filter(Boolean)).size;
    }, [sessions]);

    const upcomingSessions = useMemo(() => {
        return [...sessions]
            .filter((session) => normalizeStatus(session.session_status || session.status).includes("scheduled") || normalizeStatus(session.session_status || session.status).includes("active"))
            .sort((firstSession, secondSession) => new Date(firstSession.scheduled_at || firstSession.created_at || 0) - new Date(secondSession.scheduled_at || secondSession.created_at || 0))
            .slice(0, 4);
    }, [sessions]);

    const recentReports = useMemo(() => {
        return [...reports]
            .sort((firstReport, secondReport) => new Date(secondReport.created_at || 0) - new Date(firstReport.created_at || 0))
            .slice(0, 4)
            .map((report) => ({
                topic: `Session #${report.session_id}`,
                result: report.input_type || "Report",
                score: `${extractReportScore(report)}%`,
                date: formatDate(report.created_at || report.updated_at),
            }));
    }, [reports]);

    const activityItems = useMemo(() => {
        return notifications.slice(0, 4).map((notification) => `${notification.title}: ${notification.message}`);
    }, [notifications]);

    const coachingInsights = useMemo(() => {
        const topRecommendations = recommendedTopics.slice(0, 4).map((topic) => topic.learning_goal || `Practice ${topic.title}`);
        const pathInsights = learningPath.slice(0, 2).map((step) => `Focus on ${step.title}`);
        return [...topRecommendations, ...pathInsights].slice(0, 4);
    }, [recommendedTopics, learningPath]);

    const recommendedExercises = useMemo(() => {
        return learningPath.slice(0, 4).map((step) => ({
            title: step.title,
            description: step.learning_goal || `${step.category} practice for ${step.estimated_duration || 20} minutes`,
        }));
    }, [learningPath]);

    const stats = [
        {
            title: "Debate Sessions",
            value: sessions.length,
            icon: <FaCalendarAlt />,
            color: "#2563EB",
        },
        {
            title: "Topics Explored",
            value: uniqueTopicsCount || topicsCount,
            icon: <FaBook />,
            color: "#10B981",
        },
        {
            title: "Profile Completion",
            value: `${profileCompletion}%`,
            icon: <FaUserCheck />,
            color: "#F59E0B",
        },
        {
            title: "Overall Progress",
            value: `${overallProgress}%`,
            icon: <FaChartLine />,
            color: "#8B5CF6",
        },
    ];

    if (loading) {
        return (
            <MainLayout>
                <div className="dashboard-loading">Loading learner dashboard...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {error && <div className="dashboard-error">{error}</div>}

            <WelcomeCard user={profile || user} />

            <div className="stats-grid">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="dashboard-middle">
                <div className="dashboard-table">
                    <div className="section-header">
                        <h2>Upcoming Debate Sessions</h2>
                    </div>

                    {upcomingSessions.length === 0 ? (
                        <div className="empty-state">No upcoming sessions available.</div>
                    ) : (
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
                                {upcomingSessions.map((session) => (
                                    <tr key={session.id}>
                                        <td>{formatDate(session.scheduled_at || session.created_at)}</td>
                                        <td>{session.topic_title || `Session #${session.id}`}</td>
                                        <td>{formatDateTime(session.scheduled_at).split(", ").pop()}</td>
                                        <td>
                                            <button
                                                className="join-btn"
                                                onClick={() => navigate(`/debate-sessions/${session.id}`, { state: { selectedSession: session } })}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <ActivityCard title="Recent Activities" activities={activityItems} />
            </div>

            <div className="progress-card">
                <h2>Skill Progress</h2>

                {[
                    ["Communication", skill?.communication_score],
                    ["Confidence", skill?.confidence_score],
                    ["Logical Reasoning", skill?.critical_thinking_score],
                ].map(([label, value]) => (
                    <div className="progress-item" key={label}>
                        <span>{label}</span>
                        <progress value={safeNumber(value, 0)} max="100" />
                        <strong>{safeNumber(value, 0)}%</strong>
                    </div>
                ))}
            </div>

            <div className="actions-grid">
                <ActionCard title="Browse Topics" description="Explore debate topics." icon={<FaComments />} onClick={() => navigate("/topics")} />
                <ActionCard title="Practice Debate" description="Start a practice debate." icon={<FaPlayCircle />} onClick={() => navigate("/debate-sessions")} />
                <ActionCard title="Create Session" description="Create a new session." icon={<FaPlusCircle />} onClick={() => navigate("/topics")} />
                <ActionCard title="View Profile" description="Manage your profile." icon={<FaUser />} onClick={() => navigate("/profile")} />
            </div>

            <div className="dashboard-lower">
                <div className="history-card">
                    <h2>Recent Debate History</h2>

                    {recentReports.length === 0 ? (
                        <div className="empty-state">No reports available yet.</div>
                    ) : (
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
                                {recentReports.map((item) => (
                                    <tr key={`${item.topic}-${item.date}`}>
                                        <td>{item.topic}</td>
                                        <td>{item.result}</td>
                                        <td>{item.score}</td>
                                        <td>{item.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="insights-card">
                    <h2>AI Coaching Insights</h2>

                    {coachingInsights.length === 0 ? (
                        <div className="empty-state">Complete a session to receive coaching insights.</div>
                    ) : (
                        <ul>
                            {coachingInsights.map((item) => (
                                <li key={item}>✅ {item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="exercise-section">
                <h2>Recommended Learning Path</h2>

                {recommendedExercises.length === 0 ? (
                    <div className="empty-state">No recommended learning path available yet.</div>
                ) : (
                    <div className="exercise-grid">
                        {recommendedExercises.map((exercise) => (
                            <div key={exercise.title} className="exercise-card">
                                <h3>{exercise.title}</h3>
                                <p>{exercise.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="dashboard-footer">© 2026 Agentic AI Debate Coach Platform</div>
        </MainLayout>
    );
};

export default LearnerDashboard;