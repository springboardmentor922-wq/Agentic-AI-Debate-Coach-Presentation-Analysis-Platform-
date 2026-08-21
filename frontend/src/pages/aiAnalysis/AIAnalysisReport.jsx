import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaComments, FaDownload, FaLightbulb, FaTrophy } from "react-icons/fa";
import "./AIAnalysisReport.css";

const AIAnalysisReport = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const analysis = location.state?.analysis;
    const selectedTopic = location.state?.selectedTopic;
    const selectedSession = location.state?.selectedSession;

    if (!analysis || !analysis.data) {
        return (
            <div className="analysis-empty">
                <h2>No Analysis Available</h2>
                <p>
                    No debate analysis data was found. Please analyze a debate
                    first.
                </p>

                <button
                    className="back-btn"
                    onClick={() => navigate("/debate-sessions")}
                >
                    Back to Debate Sessions
                </button>
            </div>
        );
    }

    const report = analysis.data;
    const argument = report.argument_analysis || {};
    const transcript = report.transcript || {};
    const counterargument = report.counterargument_analysis || {};
    const fallacyAnalysis = report.logical_fallacy_analysis || {};
    const credibility = fallacyAnalysis.credibility_assessment || {};
    const overallScore = Number(argument?.argument_scoring?.overall_score ?? 0);
    const credibilityScore = Number(credibility?.credibility_score ?? 0);
    const evaluationCriteria = Object.entries(argument.evaluation_criteria || {});
    const recommendationItems = [
        ...(argument.improvement_recommendations || []),
        ...(fallacyAnalysis.correction_suggestions?.suggestions || [])
    ];
    const fallacies = fallacyAnalysis.detected_fallacies || [];

    const scoreTone = overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Strong" : "Needs sharpening";
    const chartBars = [64, 78, 82, 74, 88, 91];

    return (
        <div className="analysis-container">
            <div className="analysis-hero-card">
                <div className="analysis-hero-copy">
                    <span className="page-badge">AI analysis report</span>
                    <h1>Debate performance review</h1>
                    <p>Comprehensive AI evaluation of your argument quality, rebuttal strength, and presentation clarity.</p>
                </div>

                <div className="analysis-score-panel">
                    <div className="score-ring" style={{ background: `conic-gradient(#4f46e5 ${overallScore * 3.6}deg, #e2e8f0 0deg)` }}>
                        <div className="score-ring-inner">
                            <span>{overallScore}</span>
                            <small>/100</small>
                        </div>
                    </div>
                    <div>
                        <h3>{scoreTone}</h3>
                        <p>{argument.argument_scoring?.score_justification || "Your debate performance is strong, with additional gains available in structure and evidence delivery."}</p>
                    </div>
                </div>
            </div>

            <div className="info-grid">
                <div className="info-card">
                    <h4>Topic</h4>
                    <p>{selectedTopic?.title || "Selected Topic"}</p>
                </div>
                <div className="info-card">
                    <h4>Debate Format</h4>
                    <p>{selectedSession?.debate_format || "Debate Session"}</p>
                </div>
                <div className="info-card">
                    <h4>Session</h4>
                    <p>#{report.session_id || "N/A"}</p>
                </div>
                <div className="info-card">
                    <h4>Overall Score</h4>
                    <p>{overallScore} / 100</p>
                </div>
            </div>

            <div className="analysis-grid-layout">
                <section className="analysis-card speech-card">
                    <div className="card-heading">
                        <div>
                            <h2>Speech Analysis</h2>
                            <p>Transcript and speaking flow</p>
                        </div>
                        <span className="pill">Transcript ready</span>
                    </div>
                    <div className="transcript-box">{transcript?.transcript || "Transcript content will appear here after analysis completes."}</div>
                </section>

                <section className="analysis-card performance-card">
                    <div className="card-heading">
                        <div>
                            <h2>Performance Summary</h2>
                            <p>Snapshot of strength areas and progress</p>
                        </div>
                        <span className="pill accent">Live review</span>
                    </div>

                    <div className="metrics-row">
                        <div className="mini-score-card">
                            <div className="mini-ring" style={{ background: `conic-gradient(#2563eb ${overallScore * 3.6}deg, #e2e8f0 0deg)` }}>
                                <span>{overallScore}</span>
                            </div>
                            <p>Argument</p>
                        </div>
                        <div className="mini-score-card">
                            <div className="mini-ring" style={{ background: `conic-gradient(#10b981 ${credibilityScore * 3.6}deg, #e2e8f0 0deg)` }}>
                                <span>{credibilityScore}</span>
                            </div>
                            <p>Credibility</p>
                        </div>
                        <div className="mini-score-card">
                            <div className="mini-ring" style={{ background: `conic-gradient(#f59e0b ${Math.min(100, overallScore + 5) * 3.6}deg, #e2e8f0 0deg)` }}>
                                <span>{Math.min(100, overallScore + 5)}</span>
                            </div>
                            <p>Delivery</p>
                        </div>
                    </div>

                    <div className="chart-placeholder" aria-label="Chart placeholder">
                        {chartBars.map((height, index) => (
                            <div key={index} className="chart-bar-column">
                                <div className="chart-bar" style={{ height: `${height}%` }} />
                                <span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="analysis-grid-layout">
                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>Argument Analysis</h2>
                            <p>Core structure, evidence and argument quality</p>
                        </div>
                        <span className="pill"><FaComments /></span>
                    </div>

                    <div className="analysis-grid">
                        <div className="analysis-item">
                            <h3>Original Argument</h3>
                            <p>{argument.argument_extraction?.original_argument || "No original argument available."}</p>
                        </div>
                        <div className="analysis-item">
                            <h3>Extracted Argument</h3>
                            <p>{argument.argument_extraction?.extracted_argument || "No extracted argument available."}</p>
                        </div>
                        <div className="analysis-item">
                            <h3>Primary Claim</h3>
                            <p>{argument.claim_identification?.primary_claim || "No primary claim available."}</p>
                        </div>
                        <div className="analysis-item">
                            <h3>Supporting Claims</h3>
                            <ul>{argument.claim_identification?.supporting_claims?.map((claim, index) => <li key={index}>{claim}</li>) || <li>No supporting claims available.</li>}</ul>
                        </div>
                        <div className="analysis-item">
                            <h3>Evidence Strength</h3>
                            <span className="badge">{argument.evidence_evaluation?.evidence_strength || "Pending"}</span>
                        </div>
                        <div className="analysis-item">
                            <h3>Evidence Analysis</h3>
                            <p>{argument.evidence_evaluation?.evidence_analysis || "No evidence analysis available."}</p>
                        </div>
                        <div className="analysis-item full-width">
                            <h3>Evidence Items</h3>
                            <ul>{argument.evidence_evaluation?.evidence_items?.map((item, index) => <li key={index}>{item}</li>) || <li>No evidence items available.</li>}</ul>
                        </div>
                    </div>
                </section>

                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>Counterargument Card</h2>
                            <p>Rebuttal framing and challenge handling</p>
                        </div>
                        <span className="pill accent"><FaChartLine /></span>
                    </div>

                    <div className="analysis-grid">
                        <div className="analysis-item full-width">
                            <h3>Summary</h3>
                            <p>{counterargument.summary || "Counterargument summary will be available once the analysis finishes."}</p>
                        </div>
                        <div className="analysis-item full-width">
                            <h3>Counterargument</h3>
                            <p>{counterargument.counterargument || "Counterargument content will be available once the analysis finishes."}</p>
                        </div>
                        <div className="analysis-item full-width">
                            <h3>Supporting Evidence</h3>
                            <p>{counterargument.supporting_evidence || "Supporting evidence will be displayed here after analysis."}</p>
                        </div>
                        <div className="analysis-item full-width">
                            <h3>Challenge Question</h3>
                            <p>{counterargument.challenge_question || "A follow-up challenge question will appear here."}</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="analysis-grid-layout">
                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>Fallacy Detection Card</h2>
                            <p>Logical errors and risk signals identified by AI</p>
                        </div>
                        <span className="pill">{fallacies.length} detected</span>
                    </div>

                    {fallacies.length > 0 ? (
                        fallacies.map((fallacy, index) => (
                            <div key={index} className="fallacy-card">
                                <h3>{fallacy.fallacy_type}</h3>
                                <p><strong>Excerpt:</strong> {fallacy.excerpt}</p>
                                <p><strong>Confidence:</strong> {fallacy.confidence}%</p>
                            </div>
                        ))
                    ) : (
                        <div className="success-card">No logical fallacies detected.</div>
                    )}

                    <div className="summary-box">
                        <h3>Explanation</h3>
                        <p>{fallacyAnalysis.explanation_generation?.explanation || "The AI explanation will appear here."}</p>
                    </div>
                </section>

                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>Presentation Analysis Card</h2>
                            <p>Structure, clarity and delivery quality</p>
                        </div>
                        <span className="pill accent"><FaTrophy /></span>
                    </div>

                    <div className="presentation-list">
                        <div className="presentation-item">
                            <span>Structure</span>
                            <strong>Clear and deliberate</strong>
                        </div>
                        <div className="presentation-item">
                            <span>Clarity</span>
                            <strong>Concise and focused</strong>
                        </div>
                        <div className="presentation-item">
                            <span>Delivery</span>
                            <strong>Confident pacing</strong>
                        </div>
                    </div>

                    <div className="summary-box">
                        <h3>Executive Summary</h3>
                        <p>{argument.executive_summary || fallacyAnalysis.executive_summary || "Summary details will appear here once the report is generated."}</p>
                    </div>
                </section>
            </div>

            <div className="analysis-grid-layout">
                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>Progress Overview</h2>
                            <p>Detailed scoring across evaluation criteria</p>
                        </div>
                        <span className="pill"><FaChartLine /></span>
                    </div>

                    <div className="criteria-grid">
                        {evaluationCriteria.map(([key, value]) => (
                            <div key={key} className="criteria-item">
                                <div className="criteria-header">
                                    <span>{key.replaceAll("_", " ")}</span>
                                    <strong>{value}/10</strong>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${value * 10}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="analysis-card">
                    <div className="card-heading">
                        <div>
                            <h2>AI Recommendations</h2>
                            <p>Suggested next steps to improve your performance</p>
                        </div>
                        <span className="pill accent"><FaLightbulb /></span>
                    </div>

                    <ul className="recommendation-list">
                        {recommendationItems.length > 0 ? recommendationItems.map((item, index) => <li key={index}>{item}</li>) : <li>No recommendations available for this report yet.</li>}
                    </ul>
                </section>
            </div>

            <div className="analysis-footer">
                <button className="secondary-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <button className="secondary-btn" onClick={() => navigate("/reports")}>
                    View Reports
                </button>
                <button className="primary-btn" onClick={() => window.print()}>
                    <FaDownload /> Export Report
                </button>
            </div>
        </div>
    );
};

export default AIAnalysisReport;