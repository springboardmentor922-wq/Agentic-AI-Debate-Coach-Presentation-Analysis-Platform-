import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaEye, FaCheckCircle, FaUser } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { getEnrolledLearners } from "../../services/educatorService";
import { getAllReports } from "../../services/reportService";
import { formatDateTime, toArray } from "../../utils/learnerHelpers";
import { useToast } from "../../context/ToastContext";

import "./EvaluationQueue.css";

const EvaluationQueue = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [learners, setLearners] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            try {
                setLoading(true);
                const [learnersData, reportsData] = await Promise.all([
                    getEnrolledLearners().catch(() => []),
                    getAllReports().catch(() => ({ data: [] })),
                ]);

                if (!active) return;

                const enrolledLearners = toArray(learnersData);
                const learnerIds = new Set(enrolledLearners.map((l) => l.id));
                const allReportsList = Array.isArray(reportsData?.data) ? reportsData.data : toArray(reportsData);

                // Filter reports belonging to enrolled learners in educator's classes
                const filteredReports = allReportsList.filter((r) => learnerIds.size === 0 || learnerIds.has(r.user_id));

                setLearners(enrolledLearners);
                setReports(filteredReports);
                setError("");
            } catch (err) {
                console.error(err);
                if (active) setError("Unable to load evaluation queue.");
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadData();
        return () => { active = false; };
    }, []);

    const handleViewReport = (report) => {
        navigate("/ai-analysis-report", {
            state: {
                analysis: {
                    success: true,
                    message: "Loaded from Educator Evaluation Queue.",
                    data: {
                        session_id: report.session_id,
                        transcript: report.transcript,
                        argument_analysis: report.argument_analysis,
                        logical_fallacy_analysis: report.logical_fallacy_analysis,
                    },
                },
            },
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="eval-queue-page"><div className="empty-state">Loading evaluation queue...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="eval-queue-page">
                <Breadcrumb items={[{ label: "Educator Dashboard", path: "/educator/dashboard" }, { label: "Evaluation Queue" }]} />

                <div className="page-header">
                    <div>
                        <h1>Class Evaluation Queue</h1>
                        <p>Review completed AI debate submissions and reports from your enrolled students.</p>
                    </div>
                    <div className="header-badge"><FaTasks /> {reports.length} Submissions</div>
                </div>

                {error && <div className="empty-state">{error}</div>}

                <div className="eval-queue-card">
                    {reports.length === 0 ? (
                        <div className="empty-state">
                            <FaCheckCircle style={{ fontSize: "32px", color: "#10B981", marginBottom: "12px" }} />
                            <p>No student debate submissions pending evaluation in your enrolled classes.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Session ID</th>
                                        <th>Input Type</th>
                                        <th>Submitted At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => {
                                        const student = learners.find((l) => l.id === r.user_id);
                                        return (
                                            <tr key={r.report_id || r.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <FaUser style={{ color: "#64748B" }} />
                                                        <strong>{student?.full_name || student?.name || `Student #${r.user_id || "--"}`}</strong>
                                                    </div>
                                                </td>
                                                <td>#{r.session_id}</td>
                                                <td><span className="badge">{r.input_type || "Speech"}</span></td>
                                                <td>{formatDateTime(r.created_at || r.updated_at)}</td>
                                                <td>
                                                    <button type="button" className="btn-primary-sm" onClick={() => handleViewReport(r)}>
                                                        <FaEye /> Review Report
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default EvaluationQueue;
