import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

    const argument = report.argument_analysis;

    const transcript = report.transcript;

    const overallScore =
        argument?.argument_scoring?.overall_score ?? 0;

    return (
        <div className="analysis-container">

            {/* ===========================================
                Header
            ============================================ */}

            <div className="analysis-header">

                <div>

                    <h1>AI Debate Analysis Report</h1>

                    <p>
                        Comprehensive AI evaluation of your debate
                        performance
                    </p>

                </div>

                <div className="score-circle">

                    <span>{overallScore}</span>

                    <small>/100</small>

                </div>

            </div>

            {/* ===========================================
                Debate Information
            ============================================ */}

            <div className="info-grid">

                <div className="info-card">
                    <h4>Topic</h4>

                    <p>{selectedTopic?.title}</p>
                </div>

                <div className="info-card">
                    <h4>Debate Format</h4>

                    <p>{selectedSession?.debate_format}</p>
                </div>

                <div className="info-card">
                    <h4>Session</h4>

                    <p>#{report.session_id}</p>
                </div>

                <div className="info-card">
                    <h4>Overall Score</h4>

                    <p>{overallScore} / 100</p>
                </div>

            </div>

            {/* ===========================================
                Transcript
            ============================================ */}

            <div className="analysis-card">

                <h2>Speech Transcript</h2>

                <div className="transcript-box">

                    {transcript?.transcript}

                </div>

            </div>

            {/* ===========================================
                Argument Analysis
            ============================================ */}

            <div className="analysis-card">

                <h2>Argument Analysis</h2>

                <div className="analysis-grid">

                    <div className="analysis-item">

                        <h3>Original Argument</h3>

                        <p>

                            {
                                argument.argument_extraction
                                    ?.original_argument
                            }

                        </p>

                    </div>

                    <div className="analysis-item">

                        <h3>Extracted Argument</h3>

                        <p>

                            {
                                argument.argument_extraction
                                    ?.extracted_argument
                            }

                        </p>

                    </div>

                    <div className="analysis-item">

                        <h3>Primary Claim</h3>

                        <p>

                            {
                                argument.claim_identification
                                    ?.primary_claim
                            }

                        </p>

                    </div>

                    <div className="analysis-item">

                        <h3>Supporting Claims</h3>

                        <ul>

                            {argument.claim_identification
                                ?.supporting_claims?.map(
                                    (claim, index) => (

                                        <li key={index}>

                                            {claim}

                                        </li>

                                    )
                                )}

                        </ul>

                    </div>

                </div>

            </div>

            {/* ===========================================
                Evidence Evaluation
            ============================================ */}

            <div className="analysis-card">

                <h2>Evidence Evaluation</h2>

                <div className="analysis-grid">

                    <div className="analysis-item">

                        <h3>Evidence Strength</h3>

                        <span className="badge">

                            {
                                argument.evidence_evaluation
                                    ?.evidence_strength
                            }

                        </span>

                    </div>

                    <div className="analysis-item">

                        <h3>Evidence Analysis</h3>

                        <p>

                            {
                                argument.evidence_evaluation
                                    ?.evidence_analysis
                            }

                        </p>

                    </div>

                    <div className="analysis-item full-width">

                        <h3>Evidence Items</h3>

                        <ul>

                            {argument.evidence_evaluation
                                ?.evidence_items?.map(
                                    (item, index) => (

                                        <li key={index}>

                                            {item}

                                        </li>

                                    )
                                )}

                        </ul>

                    </div>

                </div>

            </div>

                        {/* ===========================================
                Argument Strength Assessment
            ============================================ */}

            <div className="analysis-card">

                <h2>Argument Strength Assessment</h2>

                <div className="analysis-grid">

                    <div className="analysis-item">

                        <h3>Strength Level</h3>

                        <span className="badge">

                            {
                                argument.argument_strength_assessment
                                    ?.strength_level
                            }

                        </span>

                    </div>

                    <div className="analysis-item">

                        <h3>Justification</h3>

                        <p>

                            {
                                argument.argument_strength_assessment
                                    ?.justification
                            }

                        </p>

                    </div>

                </div>

            </div>

            {/* ===========================================
                Reasoning Quality
            ============================================ */}

            <div className="analysis-card">

                <h2>Reasoning Quality</h2>

                <div className="analysis-grid">

                    <div className="analysis-item">

                        <h3>Reasoning Summary</h3>

                        <p>

                            {
                                argument.reasoning_quality_analysis
                                    ?.reasoning_summary
                            }

                        </p>

                    </div>

                    <div className="analysis-item">

                        <h3>Quality</h3>

                        <span className="badge">

                            {
                                argument.reasoning_quality_analysis
                                    ?.reasoning_quality
                            }

                        </span>

                    </div>

                </div>

            </div>

            {/* ===========================================
                Evaluation Criteria
            ============================================ */}

            <div className="analysis-card">

                <h2>Evaluation Criteria</h2>

                <div className="criteria-grid">

                    {Object.entries(
                        argument.evaluation_criteria || {}
                    ).map(([key, value]) => (

                        <div
                            key={key}
                            className="criteria-item"
                        >

                            <div className="criteria-header">

                                <span>

                                    {key.replaceAll("_", " ")}

                                </span>

                                <strong>{value}/10</strong>

                            </div>

                            <div className="progress">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${value * 10}%`,
                                    }}
                                />

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* ===========================================
                Argument Score
            ============================================ */}

            <div className="analysis-card">

                <h2>Overall Argument Score</h2>

                <div className="score-card">

                    <div className="score-value">

                        {
                            argument.argument_scoring
                                ?.overall_score
                        }

                        <small>/100</small>

                    </div>

                    <p>

                        {
                            argument.argument_scoring
                                ?.score_justification
                        }

                    </p>

                </div>

            </div>

            {/* ===========================================
                Improvement Recommendations
            ============================================ */}

            <div className="analysis-card">

                <h2>Improvement Recommendations</h2>

                <ul className="recommendation-list">

                    {argument.improvement_recommendations?.map(
                        (item, index) => (

                            <li key={index}>

                                {item}

                            </li>

                        )
                    )}

                </ul>

            </div>

            {/* ===========================================
                Logical Fallacy Analysis
            ============================================ */}

            <div className="analysis-card">

                <h2>Logical Fallacy Analysis</h2>

                {report.logical_fallacy_analysis
                    ?.detected_fallacies?.length > 0 ? (

                    report.logical_fallacy_analysis.detected_fallacies.map(
                        (fallacy, index) => (

                            <div
                                key={index}
                                className="fallacy-card"
                            >

                                <h3>

                                    {fallacy.fallacy_type}

                                </h3>

                                <p>

                                    <strong>Excerpt:</strong>

                                    {" "}

                                    {fallacy.excerpt}

                                </p>

                                <p>

                                    <strong>Confidence:</strong>

                                    {" "}

                                    {fallacy.confidence}

                                    %

                                </p>

                            </div>

                        )
                    )

                ) : (

                    <div className="success-card">

                        No logical fallacies detected.

                    </div>

                )}

            </div>

            {/* ===========================================
                Fallacy Explanation
            ============================================ */}

            <div className="analysis-card">

                <h2>Explanation</h2>

                <p>

                    {
                        report.logical_fallacy_analysis
                            ?.explanation_generation
                            ?.explanation
                    }

                </p>

            </div>

            {/* ===========================================
                Correction Suggestions
            ============================================ */}

            <div className="analysis-card">

                <h2>Correction Suggestions</h2>

                <ul className="recommendation-list">

                    {report.logical_fallacy_analysis
                        ?.correction_suggestions
                        ?.suggestions?.map(
                            (item, index) => (

                                <li key={index}>

                                    {item}

                                </li>

                            )
                        )}

                </ul>

            </div>

            {/* ===========================================
                Credibility Assessment
            ============================================ */}

            <div className="analysis-card">

                <h2>Credibility Assessment</h2>

                <div className="analysis-grid">

                    <div className="analysis-item">

                        <h3>Credibility Level</h3>

                        <span className="badge">

                            {
                                report.logical_fallacy_analysis
                                    ?.credibility_assessment
                                    ?.credibility_level
                            }

                        </span>

                    </div>

                    <div className="analysis-item">

                        <h3>Credibility Score</h3>

                        <p>

                            {
                                report.logical_fallacy_analysis
                                    ?.credibility_assessment
                                    ?.credibility_score
                            }

                            /100

                        </p>

                    </div>

                    <div className="analysis-item full-width">

                        <h3>Justification</h3>

                        <p>

                            {
                                report.logical_fallacy_analysis
                                    ?.credibility_assessment
                                    ?.justification
                            }

                        </p>

                    </div>

                </div>

            </div>

            {/* ===========================================
                Executive Summaries
            ============================================ */}

            <div className="analysis-card">

                <h2>Executive Summary</h2>

                <div className="summary-box">

                    <h3>Argument Analysis</h3>

                    <p>

                        {argument.executive_summary}

                    </p>

                    <hr />

                    <h3>Logical Fallacy Analysis</h3>

                    <p>

                        {
                            report.logical_fallacy_analysis
                                ?.executive_summary
                        }

                    </p>

                </div>

            </div>

            {/* ===========================================
                Footer
            ============================================ */}

            <div className="analysis-footer">

                <button
                    className="secondary-btn"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>

                <button
                    className="secondary-btn"
                    onClick={() =>
                        navigate("/reports")
                    }
                >
                    View Reports
                </button>

                <button
                    className="primary-btn"
                    onClick={() =>
                        window.print()
                    }
                >
                    Download Report
                </button>

            </div>

        </div>
    );
};

export default AIAnalysisReport;