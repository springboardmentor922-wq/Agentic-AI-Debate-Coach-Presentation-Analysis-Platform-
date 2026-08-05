import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaClock, FaRocket, FaUsers } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { getCoachOverview } from "../../services/coachService";
import { getPerformanceOverview } from "../../services/performanceService";
import { extractReportScore, formatDate, formatDateTime, safeNumber, toArray } from "../../utils/learnerHelpers";

import "./CoachDashboard.css";

const CoachDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState({
        assignedLearners: [],
        pendingReviews: [],
        reports: [],
        sessions: [],
        coachingPlans: [],
        studentAnalytics: null,
    });
    const [performance, setPerformance] = useState(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);

                const [coachData, performanceData] = await Promise.all([
                    getCoachOverview().catch(() => ({
                        assignedLearners: [],
                        pendingReviews: [],
                        reports: [],
                        sessions: [],
                        coachingPlans: [],
                        studentAnalytics: null,
                    })),
                    getPerformanceOverview().catch(() => null),
                ]);

                if (!active) {
                    return;
                }

                setOverview({
                    assignedLearners: toArray(coachData.assignedLearners),
                    pendingReviews: toArray(coachData.pendingReviews),
                    reports: toArray(coachData.reports),
                    sessions: toArray(coachData.sessions),
                    coachingPlans: toArray(coachData.coachingPlans),
                    studentAnalytics: coachData.studentAnalytics || null,
                });
                setPerformance(performanceData);
                setError("");
            } catch (loadError) {
                console.error("Error loading coach dashboard:", loadError);
                if (active) {
                    setError("Unable to load coach overview right now.");
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
    }, []);

    const stats = useMemo(() => {
        const completedSessions = overview.sessions.filter((session) => (session.session_status || "").toLowerCase() === "completed").length;
        const scheduledToday = overview.sessions.filter((session) => {
            const scheduledAt = session.scheduled_at || session.date;
            if (!scheduledAt) {
                return false;
            }

            return formatDate(scheduledAt) === formatDate(new Date());
        }).length;

        return [
            {
                title: "Assigned Sessions",
                value: overview.sessions.length,
                subtitle: `${completedSessions} completed`,
                icon: <FaCalendarAlt />,
                color: "#2563EB",
            },
            {
                title: "Active Learners",
                value: overview.assignedLearners.length,
                subtitle: "Loaded from backend",
                icon: <FaUsers />,
                color: "#10B981",
            },
            {
                title: "Evaluations",
                value: performance?.reports?.length || overview.reports.length,
                subtitle: "Report activity",
                icon: <FaBookOpen />,
                color: "#F59E0B",
            },
            {
                title: "Sessions Today",
                value: scheduledToday,
                subtitle: "Scheduled for today",
                icon: <FaClock />,
                color: "#8B5CF6",
            },
        ];
    }, [overview.assignedLearners.length, overview.reports.length, overview.sessions, performance?.reports?.length]);

    const upcomingSessions = useMemo(() => {
        return overview.sessions
            .slice()
            .sort((first, second) => new Date(first.scheduled_at || first.date || 0) - new Date(second.scheduled_at || second.date || 0))
            .slice(0, 5);
    }, [overview.sessions]);

    const learnerItems = useMemo(() => {
        return overview.assignedLearners.slice(0, 5).map((learner) => ({
            name: learner.full_name || learner.name || `Learner #${learner.id || "--"}`,
            level: learner.level || learner.skill_level || learner.role || "Learner",
            progress: safeNumber(learner.progress || learner.completion || learner.performance || learner.score || 0),
        }));
    }, [overview.assignedLearners]);

    const recentEvaluations = useMemo(() => overview.reports.slice(0, 5), [overview.reports]);

    const recommendations = useMemo(() => {
        const items = [];

        if (overview.pendingReviews.length > 0) {
            items.push(`Review ${overview.pendingReviews.length} pending evaluation${overview.pendingReviews.length === 1 ? "" : "s"}.`);
        }

        if (upcomingSessions.length > 0) {
            const nextSession = upcomingSessions[0];
            items.push(`Next session: ${nextSession.topic_title || nextSession.title || `Session #${nextSession.id}`} on ${formatDateTime(nextSession.scheduled_at || nextSession.date) || "scheduled soon"}.`);
        }

        const communicationScore = safeNumber(performance?.summary?.communication_score || overview.studentAnalytics?.communication_score);
        const rebuttalScore = safeNumber(performance?.summary?.argument_score || overview.studentAnalytics?.argument_score);

        if (communicationScore > 0 && communicationScore < 70) {
            items.push("Schedule extra communication practice for low-score learners.");
        }

        if (rebuttalScore > 0 && rebuttalScore < 70) {
            items.push("Add rebuttal drills to the next coaching cycle.");
        }

        if (items.length === 0) {
            items.push("No urgent coaching actions detected. Continue monitoring sessions and feedback.");
        }

        return items.slice(0, 4);
    }, [overview.pendingReviews.length, upcomingSessions, performance?.summary, overview.studentAnalytics]);

    const navigateTo = (path) => navigate(path);

    return (
        <MainLayout>
            <section className="dashboard-banner">
                <div>
                    <h1>Welcome back, {user?.full_name || "Coach"}</h1>
                    <p>Track sessions, reviews, and learner progress from live backend data.</p>
                </div>
                <div className="banner-icon">
                    <FaRocket />
                </div>
            </section>

            {loading ? (
                <div className="empty-state">Loading coach dashboard...</div>
            ) : error ? (
                <div className="empty-state">{error}</div>
            ) : (
                <>
                    <section className="stats-grid">
                        {stats.map((item) => (
                            <div key={item.title} className="stat-card">
                                <div className="stat-icon" style={{ background: item.color }}>{item.icon}</div>
                                <div>
                                    <h2>{item.value}</h2>
                                    <h4>{item.title}</h4>
                                    <p>{item.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="dashboard-row">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Upcoming Debate Sessions</h2>
                                <button onClick={() => navigateTo("/debate-sessions")}>View All →</button>
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
                                            <th>Format</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingSessions.map((session) => (
                                            <tr key={session.id}>
                                                <td>{formatDate(session.scheduled_at || session.date)}</td>
                                                <td>{session.topic_title || session.title || `Session #${session.id}`}</td>
                                                <td>{formatDateTime(session.scheduled_at || session.time) || "--"}</td>
                                                <td>{session.debate_format || session.format || "--"}</td>
                                                <td><span className="status-badge">{session.session_status || session.status || "Scheduled"}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Assigned Learners</h2>
                                <button onClick={() => navigateTo("/profile")}>View All →</button>
                            </div>
                            {learnerItems.length === 0 ? (
                                <div className="empty-state">No assigned learners were returned by the backend.</div>
                            ) : (
                                learnerItems.map((learner) => (
                                    <div key={learner.name} className="learner-item">
                                        <div>
                                            <h4>{learner.name}</h4>
                                            <p>{learner.level}</p>
                                        </div>
                                        <div className="progress-wrapper">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${learner.progress}%` }} />
                                            </div>
                                            <span>{learner.progress}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="dashboard-row">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Recent Debate Evaluations</h2>
                                <button onClick={() => navigateTo("/reports")}>View All →</button>
                            </div>
                            {recentEvaluations.length === 0 ? (
                                <div className="empty-state">No debate evaluations available yet.</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Topic</th>
                                            <th>Score</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentEvaluations.map((report) => {
                                            const score = extractReportScore(report);
                                            return (
                                                <tr key={report.report_id || report.id}>
                                                    <td>{report.topic_title || report.topic_name || `Topic #${report.topic_id || "--"}`}</td>
                                                    <td>{safeNumber(score)}%</td>
                                                    <td>{report.input_type || report.report_type || "Report"}</td>
                                                    <td><span className="status-success">{report.status || "Recorded"}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Skill Gap Analysis</h2>
                            </div>
                            {performance?.summary ? (
                                [
                                    { skill: "Communication", value: performance.summary.communication_score },
                                    { skill: "Confidence", value: performance.summary.confidence_score },
                                    { skill: "Logical Reasoning", value: performance.summary.critical_thinking_score },
                                    { skill: "Rebuttal", value: performance.summary.argument_score },
                                ].map((item) => (
                                    <div key={item.skill} className="skill-item">
                                        <div className="skill-header">
                                            <span>{item.skill}</span>
                                            <span>{safeNumber(item.value)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${safeNumber(item.value)}%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No skill analytics were returned yet.</div>
                            )}
                        </div>
                    </section>

                    <section className="dashboard-card recommendation-card">
                        <div className="card-header">
                            <h2>Coaching Recommendations</h2>
                        </div>
                        <ul className="recommendation-list">
                            {recommendations.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="quick-actions">
                        <button className="action-card" onClick={() => navigateTo("/debate-sessions")}>
                            <h3>View Sessions</h3>
                            <p>Open the active coaching queue.</p>
                        </button>
                        <button className="action-card" onClick={() => navigateTo("/reports")}>
                            <h3>View Reports</h3>
                            <p>Review learner evaluations and scores.</p>
                        </button>
                        <button className="action-card" onClick={() => navigateTo("/topics")}>
                            <h3>Debate Topics</h3>
                            <p>Browse and manage available topics.</p>
                        </button>
                        <button className="action-card" onClick={() => navigateTo("/profile")}>
                            <h3>My Profile</h3>
                            <p>View and update coach details.</p>
                        </button>
                    </section>
                </>
            )}

            <footer className="dashboard-footer">© 2026 Agentic AI Debate Coach Platform</footer>
        </MainLayout>
    );
};

export default CoachDashboard;