import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBook,
    FaCalendarAlt,
    FaChartLine,
    FaComments,
    FaGraduationCap,
    FaPlayCircle,
    FaPlusCircle,
    FaUser,
    FaUserCheck,
    FaExclamationCircle,
    FaLightbulb,
    FaBullseye,
    FaChartPie,
    FaHistory
} from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import WelcomeCard from "../../components/cards/WelcomeCard";
import StatCard from "../../components/cards/StatCard";
import ActionCard from "../../components/cards/ActionCard";
import ActivityCard from "../../components/cards/ActivityCard";
import InteractiveAnalysisCharts from "../../components/aiAnalysis/InteractiveAnalysisCharts";

import { useAuth } from "../../hooks/useAuth";
import { getMyProfile } from "../../services/profileService";
import { getMySkill } from "../../services/skillService";
import { getMySessions, createSession } from "../../services/debateSessionService";
import { getReportsByUser } from "../../services/reportService";
import { getRecommendedTopics, getLearningPath } from "../../services/recommendationService";
import { getNotifications } from "../../services/notificationService";
import { getAllTopics } from "../../services/debateTopicService";
import { getPerformanceMetrics } from "../../services/performanceService";

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

import "./LearnerDashboard.css";

import DebateSimulationModal from "../../components/aiAnalysis/DebateSimulationModal";
import { getMyAssignedCoach, updatePracticeTaskStatus } from "../../services/coachService";
import { useToast } from "../../context/ToastContext";


const LearnerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

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
    const [performance, setPerformance] = useState(null);
    const [coachInfo, setCoachInfo] = useState(null);
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);

                const [profileData, skillData, sessionData, reportData, topicData, recommendationData, learningPathData, notificationData, perfData, coachData] = await Promise.all([
                    getMyProfile().catch(() => null),
                    getMySkill().catch(() => null),
                    getMySessions().catch(() => []),
                    getReportsByUser(user?.id).catch(() => []),
                    getAllTopics().catch(() => []),
                    getRecommendedTopics().catch(() => []),
                    getLearningPath().catch(() => []),
                    getNotifications().catch(() => []),
                    getPerformanceMetrics().catch(() => null),
                    getMyAssignedCoach().catch(() => null),
                ]);

                if (!active) return;

                setProfile(profileData);
                setSkill(skillData);
                setSessions(toArray(sessionData));
                setReports(toArray(reportData));
                setTopicsCount(toArray(topicData).length);
                setRecommendedTopics(toArray(recommendationData));
                setLearningPath(toArray(learningPathData));
                setNotifications(toArray(notificationData));
                setPerformance(perfData);
                setCoachInfo(coachData);
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
            .sort((firstSession, secondSession) => new Date(firstSession.scheduled_at || firstSession.created_at || 0) - new Date(firstSession.scheduled_at || firstSession.created_at || 0))
            .slice(0, 4);
    }, [sessions]);

    const recentReports = useMemo(() => {
        return [...reports]
            .sort((firstReport, secondReport) => new Date(secondReport.created_at || 0) - new Date(firstReport.created_at || 0))
            .slice(0, 4)
            .map((report) => ({
                id: report.id || report.session_id,
                topic: `Session #${report.session_id}`,
                result: report.input_type || "Report",
                score: `${extractReportScore(report)}%`,
                date: formatDate(report.created_at || report.updated_at),
                rawReport: report,
            }));
    }, [reports]);

    const activityItems = useMemo(() => {
        return notifications.slice(0, 4).map((notification) => `${notification.title}: ${notification.message}`);
    }, [notifications]);

    // Skill breakdown into Weak and Strong
    const skillBreakdown = useMemo(() => {
        const skillsList = [
            { name: "Communication", score: safeNumber(skill?.communication_score, 75) },
            { name: "Confidence", score: safeNumber(skill?.confidence_score, 76) },
            { name: "Logical Reasoning", score: safeNumber(skill?.critical_thinking_score, 70) },
            { name: "Argument Strength", score: safeNumber(skill?.argument_score, 74) },
            { name: "Presentation", score: safeNumber(skill?.presentation_score, 72) },
        ];
        return {
            strong: skillsList.filter((s) => s.score >= 75),
            weak: skillsList.filter((s) => s.score < 75),
        };
    }, [skill]);

    const stats = [
        {
            title: "Total Debates",
            value: skill?.total_debates || sessions.length,
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
            title: "Overall Skill Score",
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
            <div className="learner-dashboard-page">
                {error && <div className="dashboard-error">{error}</div>}

                <WelcomeCard user={profile || user} />

                {/* Statistics Cards */}
                <div className="stats-grid">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                {/* Performance Dashboard Charts */}
                <InteractiveAnalysisCharts
                    argumentAnalysis={{
                        evaluation_criteria: {
                            clarity: Math.round((skill?.communication_score || 75) / 10),
                            relevance: Math.round((skill?.confidence_score || 76) / 10),
                            evidence_strength: Math.round((skill?.argument_score || 74) / 10),
                            logical_consistency: Math.round((skill?.critical_thinking_score || 70) / 10),
                            persuasiveness: Math.round((skill?.presentation_score || 72) / 10),
                        },
                        argument_scoring: { overall_score: overallProgress },
                    }}
                />

                {/* Assigned Practice Card Section */}
                {coachInfo?.practice_tasks?.length > 0 && (
                    <div className="dashboard-middle" style={{ marginTop: "20px" }}>
                        <div className="skill-analysis-card" style={{ flex: 1 }}>
                            <h2><FaBullseye /> Assigned Debate Practice</h2>
                            <div className="practice-tasks-list">
                                {coachInfo.practice_tasks.map((task) => {
                                    const statusVal = task.status || "Assigned";
                                    const isAssigned = statusVal === "Assigned";
                                    const isInProgress = statusVal === "In Progress";
                                    const isSubmitted = statusVal === "Submitted";
                                    const isAiAnalyzed = statusVal === "AI_Analyzed";
                                    const isEvaluated = statusVal === "Evaluated" || statusVal === "Coach Evaluated" || statusVal === "Completed";

                                    return (
                                        <div key={task.id} style={{ padding: "14px", borderBottom: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <h4 style={{ margin: 0, fontSize: "15px", color: "#1E293B" }}>Topic: {task.topic_title || task.title}</h4>
                                                <span className="status-badge" style={{
                                                    padding: "3px 10px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    background: isEvaluated ? "#DCFCE7" : isAiAnalyzed ? "#E0F2FE" : isSubmitted ? "#FEF3C7" : isInProgress ? "#FFEDD5" : "#F1F5F9",
                                                    color: isEvaluated ? "#166534" : isAiAnalyzed ? "#0369A1" : isSubmitted ? "#92400E" : isInProgress ? "#C2410C" : "#475569"
                                                }}>
                                                    {statusVal}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: "13px", color: "#475569", display: "flex", flexWrap: "wrap", gap: "14px" }}>
                                                <span><strong>Format:</strong> {task.debate_format || "Oxford Debate"}</span>
                                                <span><strong>Difficulty:</strong> {task.difficulty}</span>
                                                <span><strong>Coach:</strong> {task.coach_name || coachInfo.coach?.full_name || "Debate Coach"}</span>
                                            </div>

                                            {task.description && (
                                                <div style={{ fontSize: "13px", color: "#64748B", fontStyle: "italic", background: "#F8FAFC", padding: "8px 12px", borderRadius: "6px", borderLeft: "3px solid #3B82F6" }}>
                                                    <strong>Instructions:</strong> {task.description}
                                                </div>
                                            )}

                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                                {isAssigned && (
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}
                                                        onClick={async () => {
                                                            try {
                                                                const newSession = await createSession({
                                                                    topic_id: task.topic_id,
                                                                    debate_format: task.debate_format || "Oxford Debate",
                                                                    debate_position: "Affirmative",
                                                                    scheduled_at: new Date().toISOString(),
                                                                    practice_assignment_id: task.id,
                                                                });
                                                                navigate(`/debate-room/${newSession.id}`, {
                                                                    state: {
                                                                        assignmentId: task.id,
                                                                        coachId: coachInfo.coach?.id,
                                                                        coachName: task.coach_name || coachInfo.coach?.full_name,
                                                                        topicId: task.topic_id,
                                                                        topicTitle: task.topic_title || task.title,
                                                                        debateFormat: task.debate_format || "Oxford Debate",
                                                                        difficulty: task.difficulty,
                                                                        instructions: task.description,
                                                                        selectedSession: newSession
                                                                    }
                                                                });
                                                            } catch (err) {
                                                                console.error("Start Debate Error:", err);
                                                                showToast?.("Failed to initialize debate session.", "error");
                                                            }
                                                        }}
                                                    >
                                                        <FaPlayCircle /> Start Debate
                                                    </button>
                                                )}

                                                {isInProgress && (
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", background: "#D97706" }}
                                                        onClick={async () => {
                                                            console.log("Continue Debate clicked:", {
                                                                assignment_id: task.id,
                                                                session_id: task.session_id,
                                                                topic_id: task.topic_id,
                                                                format: task.debate_format,
                                                                status: task.status
                                                            });

                                                            let activeSessionId = task.session_id;

                                                            if (!activeSessionId) {
                                                                try {
                                                                    const newSession = await createSession({
                                                                        topic_id: task.topic_id,
                                                                        debate_format: task.debate_format || "Oxford Debate",
                                                                        debate_position: "Affirmative",
                                                                        scheduled_at: new Date().toISOString(),
                                                                        practice_assignment_id: task.id,
                                                                    });
                                                                    activeSessionId = newSession?.id;
                                                                } catch (err) {
                                                                    console.error("Failed to link or retrieve practice debate session:", err);
                                                                }
                                                            }

                                                            if (activeSessionId) {
                                                                navigate(`/debate-room/${activeSessionId}`, {
                                                                    state: {
                                                                        assignmentId: task.id,
                                                                        coachId: coachInfo.coach?.id,
                                                                        coachName: task.coach_name || coachInfo.coach?.full_name,
                                                                        topicId: task.topic_id,
                                                                        topicTitle: task.topic_title || task.title,
                                                                        debateFormat: task.debate_format || "Oxford Debate",
                                                                        difficulty: task.difficulty,
                                                                        instructions: task.description
                                                                    }
                                                                });
                                                            } else {
                                                                showToast?.("Could not find an active debate session for this practice assignment. Please contact your coach.", "error");
                                                            }
                                                        }}
                                                    >
                                                        <FaPlayCircle /> Continue Debate
                                                    </button>
                                                )}

                                                {isSubmitted && (
                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        disabled
                                                        style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "6px", opacity: 0.8, cursor: "not-allowed", background: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}
                                                    >
                                                        <FaClock /> AI Analysis in Progress
                                                    </button>
                                                )}

                                                {isAiAnalyzed && (
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px", background: "#0284C7" }}
                                                        onClick={() => navigate(task.session_id ? `/debate-sessions/${task.session_id}` : "/reports")}
                                                    >
                                                        <FaBook /> View AI Report
                                                    </button>
                                                )}

                                                {isEvaluated && (
                                                    <button
                                                        type="button"
                                                        className="view-coach-feedback-btn"
                                                        onClick={() => {
                                                            const evalEl = document.querySelector(".coach-details-box");
                                                            if (evalEl) evalEl.scrollIntoView({ behavior: "smooth" });
                                                            else navigate("/reports");
                                                        }}
                                                    >
                                                        <FaUserCheck /> View Coach Feedback
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Weak Skills & Strong Skills Breakdown */}
                <div className="dashboard-middle">
                    <div className="skill-analysis-card">
                        <h2><FaBullseye /> Skill Strengths & Weaknesses</h2>
                        <div className="skill-split-grid">
                            <div className="skill-box strong-box">
                                <h3>Strong Skills (≥75%)</h3>
                                {skillBreakdown.strong.map((s) => (
                                    <div key={s.name} className="skill-pill-item">
                                        <span>{s.name}</span>
                                        <strong>{s.score}%</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="skill-box weak-box">
                                <h3>Focus Areas / Weak Skills (&lt;75%)</h3>
                                {skillBreakdown.weak.length > 0 ? (
                                    skillBreakdown.weak.map((s) => (
                                        <div key={s.name} className="skill-pill-item">
                                            <span><FaExclamationCircle className="icon-warn" /> {s.name}</span>
                                            <strong>{s.score}%</strong>
                                        </div>
                                    ))
                                ) : (
                                    <p>All core skills are performing above threshold!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <ActivityCard title="Recent Activities" activities={activityItems} />
                </div>

                {/* Upcoming Debate Sessions & Action Cards */}
                <div className="dashboard-middle">
                    <div className="dashboard-table">
                        <div className="section-header">
                            <h2>Upcoming Debate Sessions</h2>
                        </div>

                        {upcomingSessions.length === 0 ? (
                            <div className="empty-state">No upcoming sessions. Click 'Practice Debate' below to start one.</div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Topic</th>
                                        <th>Format</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingSessions.map((session) => (
                                        <tr key={session.id}>
                                            <td>{formatDate(session.scheduled_at || session.created_at)}</td>
                                            <td>{session.topic_title || `Session #${session.id}`}</td>
                                            <td>{session.debate_format || "Oxford Debate"}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="join-btn"
                                                    onClick={() => navigate(`/debate-sessions/${session.id}`, { state: { selectedSession: session } })}
                                                >
                                                    View Lobby
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Assigned Coach & Mentorship Section */}
                {coachInfo?.assigned && (
                    <div className="dashboard-middle">
                        <div className="skill-analysis-card" style={{ flex: 1 }}>
                            <h2><FaUserCheck /> My Assigned Debate Coach</h2>
                            <div className="coach-details-box" style={{ background: "rgba(37, 99, 235, 0.05)", padding: "16px", borderRadius: "12px" }}>
                                <h3>{coachInfo.coach?.full_name}</h3>
                                <p style={{ color: "#64748B", marginBottom: "8px" }}>{coachInfo.coach?.institution} • {coachInfo.coach?.email}</p>
                                <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{coachInfo.coach?.bio}</p>
                            </div>

                            {coachInfo.evaluations?.length > 0 && (
                                <div style={{ marginTop: "16px" }}>
                                    <h4>Latest Coach Evaluation</h4>
                                    <div style={{ padding: "12px", borderLeft: "4px solid #10B981", background: "#F8FAFC", borderRadius: "4px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <strong>Score: {coachInfo.evaluations[0].overall_score}%</strong>
                                            <span style={{ fontSize: "12px", color: "#64748B" }}>{formatDate(coachInfo.evaluations[0].created_at)}</span>
                                        </div>
                                        <p style={{ marginTop: "4px", fontSize: "13px" }}>"{coachInfo.evaluations[0].comments}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="actions-grid">
                    <ActionCard title="Browse Topics" description="Explore debate topics." icon={<FaComments />} onClick={() => navigate("/topics")} />
                    <ActionCard title="Practice Debate" description="Start a practice debate." icon={<FaPlayCircle />} onClick={() => navigate("/debate-sessions")} />
                    <ActionCard title="AI Simulation" description="Start multi-turn AI debate." icon={<FaPlayCircle />} onClick={() => setIsSimModalOpen(true)} />
                    <ActionCard title="Skill Tracking" description="View skill metrics." icon={<FaChartLine />} onClick={() => navigate("/skills")} />
                    <ActionCard title="My Profile" description="Manage profile & goals." icon={<FaUser />} onClick={() => navigate("/profile")} />
                </div>

                {/* History & Learning Path */}
                <div className="dashboard-lower">
                    <div className="history-card">
                        <h2><FaHistory /> Recent Debate History</h2>
                        {recentReports.length === 0 ? (
                            <div className="empty-state">No debate reports completed yet.</div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Session</th>
                                        <th>Type</th>
                                        <th>Score</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReports.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.topic}</td>
                                            <td>{item.result}</td>
                                            <td><strong>{item.score}</strong></td>
                                            <td>{item.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="insights-card">
                        <h2><FaGraduationCap /> Learning Path & Recommendations</h2>
                        {learningPath.length === 0 ? (
                            <div className="empty-state">Complete debates to build your personal learning path.</div>
                        ) : (
                            <ul className="learning-path-list">
                                {learningPath.slice(0, 4).map((step, idx) => (
                                    <li key={idx}>
                                        <FaLightbulb className="icon-bulb" />
                                        <div>
                                            <strong>{step.title || step.milestones?.[0] || "Practice Goal"}</strong>
                                            <p>{step.learning_goal || step.description || "Improve debate reasoning"}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <DebateSimulationModal
                    isOpen={isSimModalOpen}
                    onClose={() => setIsSimModalOpen(false)}
                    topicTitle="AI Opponent Practice Session"
                />

                <div className="dashboard-footer">© 2026 Agentic AI Debate Coach Platform</div>
            </div>
        </MainLayout>
    );
};

export default LearnerDashboard;