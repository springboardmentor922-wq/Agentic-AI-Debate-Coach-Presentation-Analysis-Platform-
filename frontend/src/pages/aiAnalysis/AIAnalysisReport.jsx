import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaBrain, FaLayerGroup, FaBullhorn, FaExclamationTriangle,
    FaShieldAlt, FaUserNinja, FaGraduationCap, FaChartBar,
    FaDownload, FaShareAlt, FaPrint, FaArrowRight, FaPlay
} from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import MultiAgentPipeline from "../../components/aiAnalysis/MultiAgentPipeline";
import ClaimExtractionPanel from "../../components/aiAnalysis/ClaimExtractionPanel";
import EvidenceAnalysisPanel from "../../components/aiAnalysis/EvidenceAnalysisPanel";
import FallacyDetectionPanel from "../../components/aiAnalysis/FallacyDetectionPanel";
import CounterargumentPanel from "../../components/aiAnalysis/CounterargumentPanel";
import CrossExaminationPanel from "../../components/aiAnalysis/CrossExaminationPanel";
import DebateSimulationModal from "../../components/aiAnalysis/DebateSimulationModal";
import CoachFeedbackPanel from "../../components/aiAnalysis/CoachFeedbackPanel";
import PresentationAnalysisPanel from "../../components/aiAnalysis/PresentationAnalysisPanel";
import InteractiveAnalysisCharts from "../../components/aiAnalysis/InteractiveAnalysisCharts";
import { useToast } from "../../context/ToastContext";

import "./AIAnalysisReport.css";

const AIAnalysisReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState("overview");
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [fetchedReport, setFetchedReport] = useState(null);
    const [fetching, setFetching] = useState(false);

    const analysis = location.state?.analysis;
    const reportPayload = location.state?.report;
    const selectedTopic = location.state?.selectedTopic;
    const selectedSession = location.state?.selectedSession;

    const report = analysis?.data || reportPayload || fetchedReport || null;

    useEffect(() => {
        if (!report && !fetching) {
            setFetching(true);
            import("../../services/debateSessionService").then(({ getMySessions }) => {
                return getMySessions();
            }).then((sessions) => {
                if (Array.isArray(sessions) && sessions.length > 0) {
                    const latest = sessions[0];
                    return import("../../services/debateAnalysisService").then(({ getAnalysisReport }) => {
                        return getAnalysisReport(latest.id);
                    }).then((repData) => {
                        if (repData) setFetchedReport(repData?.data || repData);
                    });
                }
            }).catch((err) => {
                console.warn("Auto-fetch latest report failed:", err);
            }).finally(() => {
                setFetching(false);
            });
        }
    }, [report, fetching]);

    if (!report) {
        return (
            <MainLayout>
                <div className="analysis-empty">
                    <h2>{fetching ? "Loading Debate Analysis..." : "No Analysis Available"}</h2>
                    <p>{fetching ? "Retrieving latest session report from database..." : "No debate analysis data was found. Please analyze a debate first."}</p>
                    {!fetching && (
                        <button type="button" className="back-btn" onClick={() => navigate("/debate-sessions")}>
                            Back to Debate Sessions
                        </button>
                    )}
                </div>
            </MainLayout>
        );
    }

    const argument = report.argument_analysis || {};
    const fallacies = report.logical_fallacy_analysis || {};
    const counterargument = report.counterargument || {};
    const opponent = report.ai_debate_opponent || {};
    const coaching = report.coaching || {};
    const transcript = report.transcript?.transcript || "No transcript speech recorded.";
    const overallScore = argument?.argument_scoring?.overall_score ?? report.performance?.overall_score ?? 85;

    const handleDownloadJSON = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `debate_report_session_${report.session_id || "analysis"}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Debate report JSON exported successfully!", "success");
    };

    const handleShareReport = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast("Report URL copied to clipboard!", "info");
        } else {
            showToast("Sharing link ready.", "info");
        }
    };

    return (
        <MainLayout>
            <div className="analysis-container">
                {/* Header */}
                <div className="analysis-header">
                    <div>
                        <h1>AI Multi-Agent Debate Analysis Suite</h1>
                        <p>Comprehensive Agentic AI Evaluation & Interactive Debate Simulation</p>
                    </div>

                    <div className="score-circle">
                        <span>{overallScore}</span>
                        <small>/100</small>
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="info-grid">
                    <div className="info-card">
                        <h4>Topic</h4>
                        <p>{selectedTopic?.title || "Debate Practice"}</p>
                    </div>
                    <div className="info-card">
                        <h4>Format</h4>
                        <p>{selectedSession?.debate_format || report.debate_format || "Public Forum Debate"}</p>
                    </div>
                    <div className="info-card">
                        <h4>Session ID</h4>
                        <p>#{report.session_id || "Live"}</p>
                    </div>
                    <div className="info-card">
                        <h4>Overall Score</h4>
                        <p>{overallScore} / 100</p>
                    </div>
                </div>

                {/* Tabbed Navigation Bar */}
                <div className="report-tabs">
                    <button type="button" className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
                        <FaLayerGroup /> Executive Overview
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === "claims" ? "active" : ""}`} onClick={() => setActiveTab("claims")}>
                        <FaBullhorn /> Claims & Evidence
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === "fallacies" ? "active" : ""}`} onClick={() => setActiveTab("fallacies")}>
                        <FaExclamationTriangle /> Fallacies & Rebuttals
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === "simulation" ? "active" : ""}`} onClick={() => setActiveTab("simulation")}>
                        <FaUserNinja /> Simulation & Q&A
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === "coaching" ? "active" : ""}`} onClick={() => setActiveTab("coaching")}>
                        <FaGraduationCap /> Coach & Delivery
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
                        <FaChartBar /> Analytics & Export
                    </button>
                </div>

                {/* Tab 1: Executive Overview */}
                {activeTab === "overview" && (
                    <>
                        <section className="analysis-card">
                            <h2>Speech Transcript</h2>
                            <blockquote className="transcript-box">{transcript}</blockquote>
                        </section>

                        <section className="analysis-card">
                            <h2>Executive Summary</h2>
                            <p>{argument.executive_summary || "Speech exhibits clear structural claims and logical consistency."}</p>
                        </section>

                        <ClaimExtractionPanel argumentAnalysis={argument} />
                        <CoachFeedbackPanel coachingData={coaching} argumentAnalysis={argument} />
                    </>
                )}

                {/* Tab 3: Claims & Evidence */}
                {activeTab === "claims" && (
                    <>
                        <ClaimExtractionPanel argumentAnalysis={argument} />
                        <EvidenceAnalysisPanel argumentAnalysis={argument} />
                    </>
                )}

                {/* Tab 4: Fallacies & Rebuttals */}
                {activeTab === "fallacies" && (
                    <>
                        <FallacyDetectionPanel fallacyAnalysis={fallacies} />
                        <CounterargumentPanel counterargumentData={counterargument} />
                    </>
                )}

                {/* Tab 5: Simulation & Cross-Exam */}
                {activeTab === "simulation" && (
                    <>
                        <section className="analysis-card highlight-card">
                            <div className="card-section-header">
                                <FaUserNinja /> <h2>Interactive AI Opponent Simulation</h2>
                            </div>
                            <p>Engage in a live multi-round turn simulation against the AI Opponent Agent with per-round Judge evaluation.</p>
                            <button type="button" className="btn-primary" onClick={() => setIsSimModalOpen(true)}>
                                <FaPlay /> Launch Interactive Debate Simulation
                            </button>
                        </section>

                        <CrossExaminationPanel challengeQuestions={counterargument.challenge_questions} />
                    </>
                )}

                {/* Tab 6: Coach & Delivery */}
                {activeTab === "coaching" && (
                    <>
                        <CoachFeedbackPanel coachingData={coaching} argumentAnalysis={argument} />
                        <PresentationAnalysisPanel speechText={transcript} speechMetrics={report.speech_metrics} />
                    </>
                )}

                {/* Tab 7: Analytics & Export */}
                {activeTab === "analytics" && (
                    <>
                        <InteractiveAnalysisCharts argumentAnalysis={argument} fallacyAnalysis={fallacies} />

                        <section className="analysis-card">
                            <h2>Reports & Export Actions</h2>
                            <div className="action-buttons-group">
                                <button type="button" className="btn-primary" onClick={() => navigate("/reports")}>
                                    View All Reports <FaArrowRight />
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => window.print()}>
                                    <FaPrint /> Export PDF Report
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleDownloadJSON}>
                                    <FaDownload /> Download JSON Data
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleShareReport}>
                                    <FaShareAlt /> Share Report
                                </button>
                            </div>
                        </section>
                    </>
                )}

                {/* Bottom Navigation Actions */}
                <div className="analysis-footer">
                    <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>
                        Back
                    </button>
                    <button type="button" className="primary-btn" onClick={() => navigate("/reports")}>
                        Continue to Reports Dashboard →
                    </button>
                </div>

                {/* Simulation Modal */}
                <DebateSimulationModal
                    isOpen={isSimModalOpen}
                    onClose={() => setIsSimModalOpen(false)}
                    opponentData={opponent}
                    topicTitle={selectedTopic?.title || "Practice Session"}
                />
            </div>
        </MainLayout>
    );
};

export default AIAnalysisReport;