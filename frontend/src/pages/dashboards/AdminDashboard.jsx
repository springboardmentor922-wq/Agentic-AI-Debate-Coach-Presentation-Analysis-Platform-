import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaCogs, FaChartLine, FaUserGraduate, FaUserTie, FaUsers } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { getAdminOverview } from "../../services/adminService";
import { getPerformanceOverview } from "../../services/performanceService";
import ChartShell from "../../components/sharedCharts/ChartShell";
import PieDistributionChart from "../../components/sharedCharts/PieDistributionChart";
import LineScoreChart from "../../components/sharedCharts/LineScoreChart";
import BarScoreChart from "../../components/sharedCharts/BarScoreChart";
import { extractReportScore, formatDate, formatDateTime, safeNumber, toArray } from "../../utils/learnerHelpers";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState({
        users: [],
        roles: [],
        analytics: null,
        platformMetrics: { topics: 0, sessions: 0, reports: 0 },
        aiUsage: [],
        systemMonitoring: [],
        reports: [],
    });
    const [performance, setPerformance] = useState(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);

                const [adminData, performanceData] = await Promise.all([
                    getAdminOverview().catch(() => ({
                        users: [],
                        roles: [],
                        analytics: null,
                        platformMetrics: { topics: 0, sessions: 0, reports: 0 },
                        aiUsage: [],
                        systemMonitoring: [],
                        reports: [],
                    })),
                    getPerformanceOverview().catch(() => null),
                ]);

                if (!active) {
                    return;
                }

                setOverview({
                    users: toArray(adminData.users),
                    roles: toArray(adminData.roles),
                    analytics: adminData.analytics || null,
                    platformMetrics: adminData.platformMetrics || { topics: 0, sessions: 0, reports: 0 },
                    aiUsage: toArray(adminData.aiUsage),
                    systemMonitoring: toArray(adminData.systemMonitoring),
                    reports: toArray(adminData.reports),
                });
                setPerformance(performanceData);
                setError("");
            } catch (loadError) {
                console.error("Error loading admin dashboard:", loadError);
                if (active) {
                    setError("Unable to load admin overview right now.");
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

    const stats = useMemo(() => ([
        { title: "Total Users", value: overview.users.length, subtitle: "Loaded from backend", icon: <FaUsers />, color: "#2563EB" },
        { title: "Debate Coaches", value: overview.roles.filter((role) => String(role.role || "").toLowerCase().includes("coach")).length || 0, subtitle: "Role summary", icon: <FaUserTie />, color: "#10B981" },
        { title: "Learners", value: overview.roles.filter((role) => String(role.role || "").toLowerCase().includes("learner")).length || 0, subtitle: "Role summary", icon: <FaUserGraduate />, color: "#F59E0B" },
        { title: "Debate Topics", value: overview.platformMetrics.topics, subtitle: "Available topics", icon: <FaBookOpen />, color: "#8B5CF6" },
        { title: "Debate Sessions", value: overview.platformMetrics.sessions, subtitle: "Total sessions", icon: <FaCalendarAlt />, color: "#EF4444" },
    ]), [overview.platformMetrics, overview.roles, overview.users.length]);

    const activityRows = useMemo(() => {
        return overview.reports.slice(0, 5).map((report, index) => ({
            activity: `Report #${report.report_id || report.id || index + 1}`,
            details: report.topic_title || report.topic_name || `Topic #${report.topic_id || "--"}`,
            date: formatDateTime(report.created_at || report.updated_at) || formatDate(report.created_at || report.updated_at) || "--",
        }));
    }, [overview.reports]);

    const roleSummary = useMemo(() => {
        const counts = new Map();

        overview.roles.forEach((role) => {
            const label = role.role || "Unknown";
            const current = counts.get(label) || { label, value: 0 };
            counts.set(label, { label, value: current.value + safeNumber(role.total || role.count || 0) || current.value + 1 });
        });

        if (counts.size === 0) {
            return [
                { label: "Learners", value: overview.platformMetrics.reports },
                { label: "Topics", value: overview.platformMetrics.topics },
                { label: "Sessions", value: overview.platformMetrics.sessions },
            ];
        }

        return Array.from(counts.values()).slice(0, 6).map((item) => ({
            label: item.label,
            value: safeNumber(item.value),
        }));
    }, [overview.platformMetrics, overview.roles]);

    const trendData = useMemo(() => {
        return overview.reports
            .slice()
            .sort((first, second) => new Date(first.created_at || 0) - new Date(second.created_at || 0))
            .slice(0, 6)
            .map((report, index) => ({
                label: `R${index + 1}`,
                score: extractReportScore(report),
            }));
    }, [overview.reports]);

    const aiUsageData = useMemo(() => {
        return overview.aiUsage.slice(0, 6).map((item, index) => ({
            name: item.name || item.label || `Metric ${index + 1}`,
            value: safeNumber(item.value || item.count || item.score || 0),
        }));
    }, [overview.aiUsage]);

    const systemData = useMemo(() => {
        return overview.systemMonitoring.slice(0, 6).map((item, index) => ({
            label: item.label || item.name || `System ${index + 1}`,
            score: safeNumber(item.value || item.score || item.percent || 0),
        }));
    }, [overview.systemMonitoring]);

    const platformDistribution = useMemo(() => ([
        { name: "Topics", value: overview.platformMetrics.topics },
        { name: "Sessions", value: overview.platformMetrics.sessions },
        { name: "Reports", value: overview.platformMetrics.reports },
    ]), [overview.platformMetrics]);

    const handleNavigate = (path) => navigate(path);

    return (
        <MainLayout>
            <section className="dashboard-banner">
                <div>
                    <h1>Welcome back, {user?.full_name || "Administrator"}</h1>
                    <p>Monitor platform usage, roles, reports, and system signals from the backend.</p>
                </div>
                <div className="banner-icon">
                    <FaCogs />
                </div>
            </section>

            {loading ? (
                <div className="empty-state">Loading admin dashboard...</div>
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
                                <h2>User Overview</h2>
                                <button onClick={() => handleNavigate("/profile")}>View All →</button>
                            </div>
                            {overview.roles.length === 0 ? (
                                <div className="empty-state">Role summary not available from backend.</div>
                            ) : (
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
                                        {overview.roles.map((role, index) => (
                                            <tr key={`${role.role || "role"}-${index}`}>
                                                <td>{role.role || "Unknown"}</td>
                                                <td>{safeNumber(role.total || role.count || 0)}</td>
                                                <td>{safeNumber(role.active || 0)}</td>
                                                <td>{safeNumber(role.inactive || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Recent Activity</h2>
                                <button onClick={() => handleNavigate("/reports")}>View Reports →</button>
                            </div>
                            {activityRows.length === 0 ? (
                                <div className="empty-state">No recent activity records were returned.</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Activity</th>
                                            <th>Details</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityRows.map((item) => (
                                            <tr key={`${item.activity}-${item.date}`}>
                                                <td>{item.activity}</td>
                                                <td>{item.details}</td>
                                                <td>{item.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    <section className="dashboard-row">
                        <ChartShell title="Platform Distribution" description="Topics, sessions, and reports returned by the backend.">
                            <PieDistributionChart data={platformDistribution} />
                        </ChartShell>

                        <ChartShell title="AI / System Activity" description="Operational signals from the current backend response.">
                            <BarScoreChart data={aiUsageData.length > 0 ? aiUsageData.map((item) => ({ label: item.name, score: item.value })) : systemData} color="#2563EB" />
                        </ChartShell>
                    </section>

                    <section className="dashboard-row">
                        <ChartShell title="Report Trend" description="Recent report scores extracted from platform reports.">
                            <LineScoreChart data={trendData} />
                        </ChartShell>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>System Status</h2>
                            </div>
                            {overview.systemMonitoring.length === 0 ? (
                                <div className="empty-state">No system monitoring feed is exposed by the backend.</div>
                            ) : (
                                <ul className="recommendation-list">
                                    {overview.systemMonitoring.map((item, index) => (
                                        <li key={`${item.label || item.name || index}`}>{item.label || item.name || `Metric ${index + 1}`}: {safeNumber(item.value || item.score || item.percent || 0)}%</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section className="dashboard-card recommendation-card">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <section className="quick-actions">
                            <button className="action-card" onClick={() => handleNavigate("/topics")}>
                                <h3>Manage Topics</h3>
                                <p>Open the current topic library.</p>
                            </button>
                            <button className="action-card" onClick={() => handleNavigate("/debate-sessions")}>
                                <h3>Monitor Sessions</h3>
                                <p>Inspect active and completed debate sessions.</p>
                            </button>
                            <button className="action-card" onClick={() => handleNavigate("/reports")}>
                                <h3>Open Reports</h3>
                                <p>Review AI results and report trends.</p>
                            </button>
                            <button className="action-card" onClick={() => handleNavigate("/settings")}>
                                <h3>Platform Settings</h3>
                                <p>Adjust account-level preferences.</p>
                            </button>
                        </section>
                    </section>
                </>
            )}
        </MainLayout>
    );
};

export default AdminDashboard;