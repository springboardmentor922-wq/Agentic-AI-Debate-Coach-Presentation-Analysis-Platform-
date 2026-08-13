import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaClock, FaRocket, FaUsers, FaCheckCircle, FaExclamationCircle, FaFileAlt } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { getCoachOverview, getSubmissionDetails, submitCoachEvaluation, assignPracticeTask } from "../../services/coachService";
import { getPerformanceOverview } from "../../services/performanceService";
import { getAllTopics } from "../../services/debateTopicService";
import { extractReportScore, formatDate, formatDateTime, safeNumber, toArray } from "../../utils/learnerHelpers";


import "./CoachDashboard.css";
import { useToast } from "../../context/ToastContext";

const CoachDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

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
    const [availableTopics, setAvailableTopics] = useState([]);

    // Modals state
    const [selectedLearner, setSelectedLearner] = useState(null);
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [loadingSubmission, setLoadingSubmission] = useState(false);

    // Form inputs
    const [evalForm, setEvalForm] = useState({
        communication_score: 80,
        confidence_score: 75,
        logic_score: 82,
        rebuttal_score: 78,
        evidence_score: 80,
        comments: "",
        recommendations: ""
    });

    const [taskForm, setTaskForm] = useState({
        topic_id: "",
        debate_format: "Oxford Debate",
        difficulty: "Intermediate",
        description: ""
    });

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [coachData, performanceData, topicsRes] = await Promise.all([
                getCoachOverview().catch(() => ({
                    assignedLearners: [],
                    pendingReviews: [],
                    reports: [],
                    sessions: [],
                    coachingPlans: [],
                    studentAnalytics: null,
                })),
                getPerformanceOverview().catch(() => null),
                getAllTopics().catch(() => []),
            ]);

            setOverview({
                assignedLearners: toArray(coachData.assignedLearners),
                pendingReviews: toArray(coachData.pendingReviews),
                reports: toArray(coachData.reports),
                sessions: toArray(coachData.sessions),
                coachingPlans: toArray(coachData.coachingPlans),
                studentAnalytics: coachData.studentAnalytics || null,
            });
            setPerformance(performanceData);
            setAvailableTopics(Array.isArray(topicsRes) ? topicsRes : topicsRes?.data || []);
            setError("");
        } catch (loadError) {
            console.error("Error loading coach dashboard:", loadError);
            setError("Unable to load coach overview right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDashboardData();
    }, []);

    // Compute ready submissions across assigned learners
    const submissionsReady = useMemo(() => {
        const list = [];
        overview.assignedLearners.forEach((learner) => {
            (learner.practice_tasks || []).forEach((t) => {
                if (t.status === "Submitted" || t.status === "AI_Analyzed" || t.status === "Completed") {
                    list.push({
                        learner,
                        task: t
                    });
                }
            });
        });
        return list;
    }, [overview.assignedLearners]);

    const stats = useMemo(() => {
        const completedSessions = overview.sessions.filter((session) => (session.session_status || "").toLowerCase() === "completed").length;
        const pendingCount = submissionsReady.filter((s) => s.task.status === "Submitted" || s.task.status === "AI_Analyzed").length;

        return [
            {
                title: "Assigned Learners",
                value: overview.assignedLearners.length,
                subtitle: "Active mentorship pool",
                icon: <FaUsers />,
                color: "#10B981",
            },
            {
                title: "Submissions Ready",
                value: pendingCount,
                subtitle: `${pendingCount} awaiting review`,
                icon: <FaFileAlt />,
                color: "#F59E0B",
            },
            {
                title: "Assigned Sessions",
                value: overview.sessions.length,
                subtitle: `${completedSessions} completed`,
                icon: <FaCalendarAlt />,
                color: "#2563EB",
            },
            {
                title: "Completed Evaluations",
                value: overview.reports.length,
                subtitle: "Evaluations recorded",
                icon: <FaBookOpen />,
                color: "#8B5CF6",
            },
        ];
    }, [overview.assignedLearners.length, overview.reports.length, overview.sessions, submissionsReady]);

    const upcomingSessions = useMemo(() => {
        return overview.sessions
            .slice()
            .sort((first, second) => new Date(first.scheduled_at || first.date || 0) - new Date(second.scheduled_at || second.date || 0))
            .slice(0, 5);
    }, [overview.sessions]);

    const recentEvaluations = useMemo(() => overview.reports.slice(0, 5), [overview.reports]);

    const recommendations = useMemo(() => {
        const items = [];
        const pendingCount = submissionsReady.filter((s) => s.task.status === "Submitted" || s.task.status === "AI_Analyzed").length;

        if (pendingCount > 0) {
            items.push(`Review ${pendingCount} submitted practice debate${pendingCount === 1 ? "" : "s"} ready in queue.`);
        }

        if (upcomingSessions.length > 0) {
            const nextSession = upcomingSessions[0];
            items.push(`Next session: ${nextSession.topic_title || nextSession.title || `Session #${nextSession.id}`} on ${formatDateTime(nextSession.scheduled_at || nextSession.date) || "scheduled soon"}.`);
        }

        if (items.length === 0) {
            items.push("No urgent coaching actions detected. Continue monitoring sessions and practice submissions.");
        }

        return items.slice(0, 4);
    }, [submissionsReady, upcomingSessions]);

    const navigateTo = (path) => navigate(path);

    const handleOpenReview = async (learner, task) => {
        setSelectedLearner(learner);
        const sessionId = task.session_id || task.id;

        try {
            setLoadingSubmission(true);
            setShowEvalModal(true);
            const data = await getSubmissionDetails(sessionId);
            setSubmissionDetails(data);
            if (data.existing_evaluation) {
                setEvalForm({
                    communication_score: data.existing_evaluation.communication_score || 80,
                    confidence_score: 80,
                    logic_score: data.existing_evaluation.logic_score || 80,
                    rebuttal_score: data.existing_evaluation.rebuttal_score || 80,
                    evidence_score: data.existing_evaluation.evidence_score || 80,
                    comments: data.existing_evaluation.comments || "",
                    recommendations: data.existing_evaluation.recommendations || ""
                });
            } else {
                setEvalForm({
                    communication_score: data.communication_score || 80,
                    confidence_score: 80,
                    logic_score: data.logical_consistency || 80,
                    rebuttal_score: data.rebuttal_effectiveness || 80,
                    evidence_score: data.evidence_usage || 80,
                    comments: "",
                    recommendations: (data.recommendations || []).join(" ")
                });
            }
        } catch (err) {
            console.error("Failed to load submission details:", err);
            showToast("Could not load submission details for review.", "error");
            setShowEvalModal(false);
        } finally {
            setLoadingSubmission(false);
        }
    };

    const handleOpenTask = (learner) => {
        setSelectedLearner(learner);
        const initialTopicId = availableTopics.length > 0 ? availableTopics[0].id : "";
        const initialFormat = availableTopics.length > 0 ? (availableTopics[0].debate_format || "Oxford Debate") : "Oxford Debate";
        setTaskForm({
            topic_id: initialTopicId,
            debate_format: initialFormat,
            difficulty: "Intermediate",
            description: ""
        });
        setShowTaskModal(true);
    };

    const handleSubmitEval = async (e) => {
        e.preventDefault();
        if (!selectedLearner || !submissionDetails?.session_id) {
            showToast("Valid submission session is required for coach evaluation.", "warning");
            return;
        }

        try {
            await submitCoachEvaluation({
                learner_id: selectedLearner.id,
                session_id: submissionDetails.session_id,
                communication_score: Number(evalForm.communication_score),
                confidence_score: Number(evalForm.confidence_score),
                logic_score: Number(evalForm.logic_score),
                rebuttal_score: Number(evalForm.rebuttal_score),
                evidence_score: Number(evalForm.evidence_score),
                comments: evalForm.comments,
                recommendations: evalForm.recommendations
            });
            showToast("Coach evaluation submitted successfully!", "success");
            setShowEvalModal(false);
            setSubmissionDetails(null);
            void loadDashboardData();
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.detail || "Failed to submit evaluation.", "error");
        }
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        if (!selectedLearner || !taskForm.topic_id) {
            showToast("Please select a valid debate topic.", "warning");
            return;
        }

        try {
            await assignPracticeTask({
                learner_id: selectedLearner.id,
                topic_id: Number(taskForm.topic_id),
                debate_format: taskForm.debate_format,
                difficulty: taskForm.difficulty,
                description: taskForm.description
            });
            showToast("Debate practice assigned successfully!", "success");
            setShowTaskModal(false);
            setTaskForm({ topic_id: "", debate_format: "Oxford Debate", difficulty: "Intermediate", description: "" });
            void loadDashboardData();
        } catch (err) {
            console.error(err);
            showToast("Failed to assign debate practice.", "error");
        }
    };

    return (
        <MainLayout>
            <section className="dashboard-banner">
                <div>
                    <h1>Welcome back, {user?.full_name || "Coach"}</h1>
                    <p>Monitor assigned learners, review actual debate submissions, and provide manual evaluations.</p>
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
                        {/* Assigned Learners & Practice Queue */}
                        <div className="dashboard-card" style={{ flex: 1.5 }}>
                            <div className="card-header">
                                <h2>Assigned Learners & Submissions Queue</h2>
                            </div>
                            {overview.assignedLearners.length === 0 ? (
                                <div className="empty-state">No assigned learners were returned by the backend.</div>
                            ) : (
                                overview.assignedLearners.map((learner) => {
                                    const tasks = learner.practice_tasks || [];

                                    return (
                                        <div key={learner.id} className="learner-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px", padding: "14px", borderBottom: "1px solid #E2E8F0" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: "16px" }}>{learner.full_name}</h4>
                                                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>{learner.institution} • {learner.experience_level}</p>
                                                </div>
                                                <button type="button" className="assign-practice-btn" onClick={() => handleOpenTask(learner)}>
                                                    Assign Debate Practice
                                                </button>
                                            </div>

                                            {/* Practice tasks for this learner */}
                                            {tasks.length > 0 ? (
                                                <div style={{ width: "100%", background: "#F8FAFC", padding: "10px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    {tasks.map((task) => {
                                                        const hasSubmitted = task.status === "Submitted" || task.status === "AI_Analyzed" || Boolean(task.session_id);
                                                        const isEvaluated = task.status === "Evaluated" || task.status === "Completed";

                                                        return (
                                                            <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <div>
                                                                    <strong style={{ fontSize: "13px" }}>Topic: {task.topic_title || task.title}</strong>
                                                                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                                                                        Format: {task.debate_format || "Oxford Debate"} • Difficulty: {task.difficulty} • Status: {task.status || "Assigned"}
                                                                    </div>
                                                                    {task.description && (
                                                                        <div style={{ fontSize: "12px", color: "#475569", fontStyle: "italic", marginTop: "2px" }}>Instructions: {task.description}</div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    {!hasSubmitted && !isEvaluated && (
                                                                        <span className="status-badge" style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: "12px", fontSize: "12px" }}>
                                                                            Waiting for Submission
                                                                        </span>
                                                                    )}

                                                                    {hasSubmitted && !isEvaluated && (
                                                                        <button type="button" className="btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={() => handleOpenReview(learner, task)}>
                                                                            Review Submission
                                                                        </button>
                                                                    )}

                                                                    {isEvaluated && (
                                                                        <button type="button" className="view-eval-btn" onClick={() => handleOpenReview(learner, task)}>
                                                                            View Evaluation
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <small style={{ color: "#94A3B8" }}>No active practice tasks assigned.</small>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="dashboard-card" style={{ flex: 1 }}>
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
                                            <th>Format</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingSessions.map((session) => (
                                            <tr key={session.id}>
                                                <td>{formatDate(session.scheduled_at || session.date)}</td>
                                                <td>{session.topic_title || session.title || `Session #${session.id}`}</td>
                                                <td>{session.debate_format || session.format || "--"}</td>
                                                <td><span className="status-badge">{session.session_status || session.status || "Scheduled"}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                </>
            )}

            {/* Submission Review & Evaluation Modal */}
            {showEvalModal && (
                <div className="modal-overlay">
                    <div className="simulation-modal" style={{ maxWidth: "750px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
                            <h3>Submission Review for {selectedLearner?.full_name}</h3>
                            <button type="button" className="btn-secondary" style={{ padding: "2px 8px" }} onClick={() => { setShowEvalModal(false); setSubmissionDetails(null); }}>✕</button>
                        </div>

                        {loadingSubmission ? (
                            <div className="empty-state" style={{ padding: "30px" }}>Loading learner debate submission & AI report...</div>
                        ) : submissionDetails ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                                {/* Submission Metadata */}
                                <div style={{ background: "#F1F5F9", padding: "12px", borderRadius: "8px" }}>
                                    <h4 style={{ margin: 0 }}>Topic: {submissionDetails.topic_title}</h4>
                                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748B" }}>
                                        Format: {submissionDetails.debate_format} • Position: {submissionDetails.position} • Session #{submissionDetails.session_id} • Status: {submissionDetails.session_status}
                                    </p>
                                </div>

                                {/* Learner Actual Submitted Debate Content */}
                                <div>
                                    <h4 style={{ marginBottom: "8px" }}>Learner Submitted Debate Speech / Turns</h4>
                                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px" }}>
                                        {submissionDetails.submitted_turns?.map((turn, idx) => (
                                            <div key={idx} style={{ marginBottom: "10px" }}>
                                                <strong style={{ fontSize: "13px", color: "#2563EB" }}>Turn {turn.turn_number} ({turn.speaker}):</strong>
                                                <p style={{ margin: "4px 0 0", fontSize: "14px", lineHeight: "1.5" }}>"{turn.speech_text}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Analysis Report Summary */}
                                <div>
                                    <h4 style={{ marginBottom: "8px" }}>AI Analysis Report & Scores</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Overall Score</small>
                                            <div><strong>{submissionDetails.overall_score}%</strong></div>
                                        </div>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Argument Quality</small>
                                            <div><strong>{submissionDetails.argument_quality}%</strong></div>
                                        </div>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Logical Consistency</small>
                                            <div><strong>{submissionDetails.logical_consistency}%</strong></div>
                                        </div>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Evidence Usage</small>
                                            <div><strong>{submissionDetails.evidence_usage}%</strong></div>
                                        </div>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Rebuttal Effectiveness</small>
                                            <div><strong>{submissionDetails.rebuttal_effectiveness}%</strong></div>
                                        </div>
                                        <div style={{ background: "#EFF6FF", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                                            <small>Communication</small>
                                            <div><strong>{submissionDetails.communication_score}%</strong></div>
                                        </div>
                                    </div>

                                    {submissionDetails.detected_fallacies?.length > 0 && (
                                        <div style={{ marginBottom: "8px" }}>
                                            <strong style={{ fontSize: "13px", color: "#DC2626" }}>Detected Fallacies:</strong>
                                            <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: "13px" }}>
                                                {submissionDetails.detected_fallacies.map((f, i) => (
                                                    <li key={i}><strong>{f.type}:</strong> "{f.text}" — {f.explanation}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {submissionDetails.counterarguments?.length > 0 && (
                                        <div style={{ marginBottom: "8px" }}>
                                            <strong style={{ fontSize: "13px", color: "#D97706" }}>Generated Counterarguments:</strong>
                                            <ul style={{ margin: "4px 0", paddingLeft: "20px", fontSize: "13px" }}>
                                                {submissionDetails.counterarguments.map((c, i) => (
                                                    <li key={i}>{c.rebuttal}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Coach Evaluation Form */}
                                <form onSubmit={handleSubmitEval} style={{ borderTop: "2px solid #E2E8F0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <h4 style={{ margin: 0 }}>Coach Manual Evaluation</h4>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={{ fontSize: "12px" }}>Communication (0-100):</label>
                                            <input type="number" min="0" max="100" value={evalForm.communication_score} onChange={(e) => setEvalForm({ ...evalForm, communication_score: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px" }}>Logic (0-100):</label>
                                            <input type="number" min="0" max="100" value={evalForm.logic_score} onChange={(e) => setEvalForm({ ...evalForm, logic_score: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px" }}>Rebuttal (0-100):</label>
                                            <input type="number" min="0" max="100" value={evalForm.rebuttal_score} onChange={(e) => setEvalForm({ ...evalForm, rebuttal_score: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px" }}>Evidence (0-100):</label>
                                            <input type="number" min="0" max="100" value={evalForm.evidence_score} onChange={(e) => setEvalForm({ ...evalForm, evidence_score: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px" }}>Confidence (0-100):</label>
                                            <input type="number" min="0" max="100" value={evalForm.confidence_score} onChange={(e) => setEvalForm({ ...evalForm, confidence_score: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "12px" }}>Coach Feedback & Comments:</label>
                                        <textarea rows="3" value={evalForm.comments} onChange={(e) => setEvalForm({ ...evalForm, comments: e.target.value })} placeholder="Enter constructive coaching advice on arguments, fallacies, and delivery..." required />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "12px" }}>Recommendations:</label>
                                        <textarea rows="2" value={evalForm.recommendations} onChange={(e) => setEvalForm({ ...evalForm, recommendations: e.target.value })} placeholder="Actionable practice recommendations..." />
                                    </div>

                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                                        <button type="button" className="btn-secondary" onClick={() => { setShowEvalModal(false); setSubmissionDetails(null); }}>Cancel</button>
                                        <button type="submit" className="btn-primary">Save Evaluation</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="empty-state">No submission content found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Assign Debate Practice Modal */}
            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="simulation-modal" style={{ maxWidth: "550px" }}>
                        <h3>Assign Debate Practice</h3>
                        <form onSubmit={handleSubmitTask} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                            <div>
                                <label style={{ fontSize: "13px", fontWeight: 600 }}>Learner:</label>
                                <input type="text" value={selectedLearner?.full_name || selectedLearner?.name || ""} disabled style={{ background: "#F1F5F9", cursor: "not-allowed" }} />
                            </div>

                            <div>
                                <label style={{ fontSize: "13px", fontWeight: 600 }}>Debate Topic <span style={{ color: "red" }}>*</span>:</label>
                                <select
                                    value={taskForm.topic_id}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const chosen = availableTopics.find((t) => t.id === selectedId);
                                        setTaskForm({
                                            ...taskForm,
                                            topic_id: selectedId,
                                            debate_format: chosen?.debate_format || taskForm.debate_format
                                        });
                                    }}
                                    required
                                >
                                    <option value="">-- Select Debate Topic --</option>
                                    {availableTopics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.title} ({topic.category || "General"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: "13px", fontWeight: 600 }}>Debate Format <span style={{ color: "red" }}>*</span>:</label>
                                <select
                                    value={taskForm.debate_format}
                                    onChange={(e) => setTaskForm({ ...taskForm, debate_format: e.target.value })}
                                    required
                                >
                                    <option value="Oxford Debate">Oxford Debate</option>
                                    <option value="Lincoln-Douglas">Lincoln-Douglas</option>
                                    <option value="Parliamentary Debate">Parliamentary Debate</option>
                                    <option value="Public Forum">Public Forum</option>
                                    <option value="One-on-One Spar">One-on-One Spar</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: "13px", fontWeight: 600 }}>Difficulty <span style={{ color: "red" }}>*</span>:</label>
                                <select
                                    value={taskForm.difficulty}
                                    onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value })}
                                    required
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Master">Master</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: "13px", fontWeight: 600 }}>Instructions (Optional):</label>
                                <textarea
                                    rows="3"
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    placeholder="Optional guidelines or specific points for the learner..."
                                />
                            </div>

                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Assign Debate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <footer className="dashboard-footer">© 2026 Agentic AI Debate Coach Platform</footer>
        </MainLayout>
    );
};

export default CoachDashboard;