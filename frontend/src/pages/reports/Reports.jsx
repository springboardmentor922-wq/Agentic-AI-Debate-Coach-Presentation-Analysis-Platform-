import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartPie, FaFileAlt, FaEye, FaFilter } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import ChartShell from "../../components/sharedCharts/ChartShell";
import PieDistributionChart from "../../components/sharedCharts/PieDistributionChart";
import LineScoreChart from "../../components/sharedCharts/LineScoreChart";
import { useAuth } from "../../hooks/useAuth";
import { getReportsByUser } from "../../services/reportService";
import { getMySessions } from "../../services/debateSessionService";
import { getAllTopics } from "../../services/debateTopicService";
import { extractReportScore, formatDateTime, groupReportsByInputType, safeNumber, toArray } from "../../utils/learnerHelpers";

import "./Reports.css";

const Reports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        let active = true;

        const loadReports = async () => {
            try {
                setLoading(true);
                const [reportData, sessionData, topicData] = await Promise.all([
                    getReportsByUser(user?.id).catch(() => []),
                    getMySessions().catch(() => []),
                    getAllTopics().catch(() => []),
                ]);

                if (!active) return;

                setReports(toArray(reportData));
                setSessions(toArray(sessionData));
                setTopics(toArray(topicData));
                setSelectedReportId(toArray(reportData)[0]?.report_id || toArray(reportData)[0]?.id || null);
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load debate reports right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadReports();
        return () => { active = false; };
    }, [user?.id]);

    const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
    const sessionMap = useMemo(() => new Map(sessions.map((session) => [session.id, session])), [sessions]);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (statusFilter === "all") {
                return true;
            }

            return String(report.input_type || "").toLowerCase() === statusFilter;
        });
    }, [reports, statusFilter]);

    const chartData = useMemo(() => groupReportsByInputType(reports), [reports]);

    const lineData = useMemo(() => {
        return reports
            .slice()
            .sort((first, second) => new Date(first.created_at || 0) - new Date(second.created_at || 0))
            .map((report, index) => ({
                label: `R${index + 1}`,
                score: extractReportScore(report),
            }));
    }, [reports]);

    const selectedReport = reports.find((report) => (report.report_id || report.id) === selectedReportId) || reports[0];

    const selectedSession = selectedReport ? sessionMap.get(selectedReport.session_id) : null;
    const selectedTopic = selectedReport?.topic_id ? topicMap.get(selectedReport.topic_id) : null;

    if (loading) {
        return (
            <MainLayout>
                <div className="reports-page"><div className="empty-state">Loading reports...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="reports-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "Reports" }]} />

                <div className="reports-header">
                    <div>
                        <h1>Debate Reports</h1>
                        <p>Review AI analysis outcomes from submitted debate sessions.</p>
                    </div>
                    <div className="reports-header-icon"><FaChartPie /></div>
                </div>

                {error && <div className="empty-state">{error}</div>}

                <div className="reports-toolbar">
                    <div className="reports-count">
                        <FaFileAlt /> {filteredReports.length} Reports
                    </div>
                    <label className="reports-filter">
                        <FaFilter />
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">All Inputs</option>
                            <option value="speech">Speech</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                        </select>
                    </label>
                </div>

                <div className="reports-layout">
                    <div className="reports-main">
                        <ChartShell title="Report Composition" description="Backend report distribution by input type.">
                            <PieDistributionChart data={chartData} />
                        </ChartShell>

                        <ChartShell title="Report Score Trend" description="AI overall score extracted from recent reports.">
                            <LineScoreChart data={lineData} />
                        </ChartShell>

                        <section className="reports-list-card">
                            <div className="section-header">
                                <h2>Recent Reports</h2>
                            </div>

                            <div className="reports-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Session</th>
                                            <th>Topic</th>
                                            <th>Input</th>
                                            <th>Score</th>
                                            <th>Created</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((report) => {
                                            const reportKey = report.report_id || report.id;
                                            const score = extractReportScore(report);
                                            const reportTopic = topicMap.get(report.topic_id);
                                            return (
                                                <tr key={reportKey}>
                                                    <td>#{report.session_id}</td>
                                                    <td>{reportTopic?.title || `Topic #${report.topic_id || "--"}`}</td>
                                                    <td>{report.input_type || "Unknown"}</td>
                                                    <td>{safeNumber(score)}%</td>
                                                    <td>{formatDateTime(report.created_at || report.updated_at)}</td>
                                                    <td>
                                                        <button type="button" className="join-btn" onClick={() => setSelectedReportId(reportKey)}>
                                                            <FaEye /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <aside className="reports-side">
                        <section className="reports-detail-card">
                            <h2>Selected Report</h2>
                            {selectedReport ? (
                                <>
                                    <p><strong>Session:</strong> #{selectedReport.session_id}</p>
                                    <p><strong>Topic:</strong> {selectedTopic?.title || `Topic #${selectedReport.topic_id || "--"}`}</p>
                                    <p><strong>Input Type:</strong> {selectedReport.input_type || "Unknown"}</p>
                                    <p><strong>Score:</strong> {safeNumber(extractReportScore(selectedReport))}%</p>
                                    <p><strong>Transcript:</strong> {selectedReport.transcript?.transcript || "No transcript returned."}</p>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => navigate("/ai-analysis-report", {
                                            state: {
                                                analysis: {
                                                    success: true,
                                                    message: "Loaded from report history.",
                                                    data: {
                                                        session_id: selectedReport.session_id,
                                                        transcript: selectedReport.transcript,
                                                        argument_analysis: selectedReport.argument_analysis,
                                                        logical_fallacy_analysis: selectedReport.logical_fallacy_analysis,
                                                    },
                                                },
                                                selectedTopic,
                                                selectedSession,
                                            },
                                        })}
                                    >
                                        Open Analysis
                                    </button>
                                </>
                            ) : (
                                <div className="empty-state">No report selected.</div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
};

export default Reports;
