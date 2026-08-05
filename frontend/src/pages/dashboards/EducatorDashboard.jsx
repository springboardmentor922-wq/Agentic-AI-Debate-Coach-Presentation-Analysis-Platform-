import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaChartLine, FaChalkboardTeacher, FaGraduationCap, FaUsers } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { getEducatorOverview } from "../../services/educatorService";
import { getPerformanceOverview } from "../../services/performanceService";
import ChartShell from "../../components/sharedCharts/ChartShell";
import BarScoreChart from "../../components/sharedCharts/BarScoreChart";
import RadarScoreChart from "../../components/sharedCharts/RadarScoreChart";
import LineScoreChart from "../../components/sharedCharts/LineScoreChart";
import { extractReportScore, formatDate, safeNumber, toArray } from "../../utils/learnerHelpers";

import "./EducatorDashboard.css";

const EducatorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState({
        classes: [],
        assignments: [],
        learners: [],
        reports: [],
        rankings: [],
        analytics: null,
    });
    const [performance, setPerformance] = useState(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                const [educatorData, performanceData] = await Promise.all([
                    getEducatorOverview().catch(() => ({ classes: [], assignments: [], learners: [], reports: [], rankings: [], analytics: null })),
                    getPerformanceOverview().catch(() => null),
                ]);

                if (!active) {
                    return;
                }

                setOverview({
                    classes: toArray(educatorData.classes),
                    assignments: toArray(educatorData.assignments),
                    learners: toArray(educatorData.learners),
                    reports: toArray(educatorData.reports),
                    rankings: toArray(educatorData.rankings),
                    analytics: educatorData.analytics || null,
                });
                setPerformance(performanceData);
                setError("");
            } catch (loadError) {
                console.error("Error loading educator dashboard:", loadError);
                if (active) {
                    setError("Unable to load educator overview right now.");
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
        const activeSessions = overview.assignments.filter((session) => !["completed", "cancelled"].includes((session.session_status || session.status || "").toLowerCase())).length;
        const averagePerformance = safeNumber(performance?.summary?.communication_score || overview.analytics?.communication_score || 0);

        return [
            { title: "Total Students", value: overview.learners.length, subtitle: "Loaded from backend", icon: <FaUsers />, color: "#2563EB" },
            { title: "Active Sessions", value: activeSessions, subtitle: "Current assignments", icon: <FaGraduationCap />, color: "#10B981" },
            { title: "Debate Topics", value: overview.rankings.length, subtitle: "Available topics", icon: <FaBookOpen />, color: "#F59E0B" },
            { title: "Average Performance", value: `${averagePerformance}%`, subtitle: "Overall skill signal", icon: <FaChartLine />, color: "#8B5CF6" },
        ];
    }, [overview.analytics, overview.assignments, overview.learners.length, overview.rankings.length, performance?.summary?.communication_score]);

    const recentSessions = useMemo(() => {
        return overview.assignments
            .slice()
            .sort((first, second) => new Date(second.scheduled_at || second.date || 0) - new Date(first.scheduled_at || first.date || 0))
            .slice(0, 5);
    }, [overview.assignments]);

    const performanceData = useMemo(() => {
        return overview.learners.slice(0, 6).map((learner, index) => ({
            label: learner.full_name || learner.name || `Student ${index + 1}`,
            score: safeNumber(learner.score || learner.progress || learner.performance || 0),
        }));
    }, [overview.learners]);

    const radarData = useMemo(() => {
        const analytics = performance?.summary || overview.analytics || {};
        return [
            { label: "Communication", score: safeNumber(analytics.communication_score) },
            { label: "Confidence", score: safeNumber(analytics.confidence_score) },
            { label: "Reasoning", score: safeNumber(analytics.critical_thinking_score) },
            { label: "Argument", score: safeNumber(analytics.argument_score) },
            { label: "Presentation", score: safeNumber(analytics.presentation_score) },
        ];
    }, [overview.analytics, performance?.summary]);

    const sessionTrend = useMemo(() => {
        return overview.assignments
            .slice()
            .sort((first, second) => new Date(first.scheduled_at || first.date || 0) - new Date(second.scheduled_at || second.date || 0))
            .slice(0, 6)
            .map((session, index) => ({
                label: `S${index + 1}`,
                score: extractReportScore(session),
            }));
    }, [overview.assignments]);

    const topicCoverage = useMemo(() => {
        return overview.rankings.slice(0, 8).map((topic, index) => ({
            label: topic.title || `Topic ${index + 1}`,
            score: safeNumber(topic.score || topic.available_sessions || 0),
        }));
    }, [overview.rankings]);

    const handleNavigate = (path) => navigate(path);

    return (
        <MainLayout>
            <section className="dashboard-banner">
                <div>
                    <h1>Welcome back, {user?.full_name || "Educator"}</h1>
                    <p>Monitor student performance, live debate sessions, and topic coverage from backend data.</p>
                </div>
                <div className="banner-icon">
                    <FaChalkboardTeacher />
                </div>
            </section>

            {loading ? (
                <div className="empty-state">Loading educator dashboard...</div>
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
                                <h2>Recent Debate Sessions</h2>
                                <button onClick={() => handleNavigate("/debate-sessions")}>View All →</button>
                            </div>
                            {recentSessions.length === 0 ? (
                                <div className="empty-state">No recent sessions were returned.</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Topic</th>
                                            <th>Format</th>
                                            <th>Participants</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSessions.map((session) => (
                                            <tr key={session.id}>
                                                <td>{formatDate(session.scheduled_at || session.date)}</td>
                                                <td>{session.topic_title || session.title || `Session #${session.id}`}</td>
                                                <td>{session.debate_format || session.format || "--"}</td>
                                                <td>{session.participant_count ?? session.participants ?? 0}</td>
                                                <td><span className="status-badge">{session.session_status || session.status || "Scheduled"}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Student Performance Overview</h2>
                                <button onClick={() => handleNavigate("/reports")}>View Reports →</button>
                            </div>
                            {performanceData.length === 0 ? (
                                <div className="empty-state">No learner performance data available.</div>
                            ) : (
                                performanceData.map((student) => (
                                    <div key={student.label} className="learner-item">
                                        <div>
                                            <h4>{student.label}</h4>
                                            <p>Backend summary score</p>
                                        </div>
                                        <div className="progress-wrapper">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${student.score}%` }} />
                                            </div>
                                            <span>{student.score}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="dashboard-row">
                        <ChartShell title="Topic Coverage" description="How the current topic set is distributed.">
                            <BarScoreChart data={topicCoverage} color="#F59E0B" />
                        </ChartShell>

                        <ChartShell title="Learner Radar" description="Core skill signals from the backend summary.">
                            <RadarScoreChart data={radarData} />
                        </ChartShell>
                    </section>

                    <section className="dashboard-row">
                        <ChartShell title="Session Trend" description="Recent session analysis scores.">
                            <LineScoreChart data={sessionTrend} />
                        </ChartShell>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Instructional Notes</h2>
                            </div>
                            <ul className="recommendation-list">
                                <li>Use reports to track session outcomes and reassign weak topics.</li>
                                <li>Focus coaching time on the lowest radar scores first.</li>
                                <li>Review the learner performance chart before creating new sessions.</li>
                            </ul>
                        </div>
                    </section>
                </>
            )}
        </MainLayout>
    );
};

export default EducatorDashboard;