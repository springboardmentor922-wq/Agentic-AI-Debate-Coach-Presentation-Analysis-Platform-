import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowLeft, FaTrophy, FaTachometerAlt, FaExclamationTriangle,
    FaVolumeUp, FaCheckCircle, FaLightbulb, FaCopy, FaFileAlt, FaChartPie
} from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import presentationService from "../../services/presentationService";
import "./PresentationReport.css";

const PresentationReport = () => {
    const { recordingId } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await presentationService.getRecordingDetails(recordingId);
                if (res.success) {
                    // Also try fetching full report doc
                    try {
                        const reportRes = await presentationService.getRecordingDetails(recordingId);
                        setReport(reportRes.data);
                    } catch (e) {
                        setReport(res.data);
                    }
                }
            } catch (err) {
                console.error("Error loading presentation report:", err);
                setError(err.response?.data?.detail || "Failed to load presentation report.");
            } finally {
                setLoading(false);
            }
        };

        if (recordingId) fetchReport();
    }, [recordingId]);

    const handleCopyTranscript = () => {
        if (report?.transcription_text) {
            navigator.clipboard.writeText(report.transcription_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="report-loading-container">
                <div className="spinner"></div>
                <p>Loading presentation report and speech analytics...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="report-error-container">
                <FaExclamationTriangle className="error-icon" />
                <h3>Report Unavailable</h3>
                <p>{error || "No presentation report data available yet."}</p>
                <button className="btn btn-primary" onClick={() => navigate("/presentation-analysis")}>
                    <FaArrowLeft /> Back to Studio
                </button>
            </div>
        );
    }

    const metrics = [
        { name: "Speech Pace", value: Math.round(report.speech_pace_wpm ? Math.min(100, Math.max(0, report.speech_pace_wpm * 0.7)) : 75), color: "#38bdf8" },
        { name: "Filler Control", value: Math.round(Math.max(0, 100 - (report.filler_words_count || 0) * 10)), color: "#34d399" },
        { name: "Clarity", value: Math.round(report.clarity_score || 0), color: "#a78bfa" },
        { name: "Confidence", value: Math.round(report.confidence_score || 0), color: "#f43f5e" },
        { name: "Engagement", value: Math.round(report.audience_engagement_score || 0), color: "#fbbf24" },
    ];

    const overallScore = Math.round(report.overall_score || 0);

    return (
        <div className="presentation-report-container">
            {/* Header Navigation */}
            <div className="report-top-nav">
                <button className="btn-back" onClick={() => navigate("/presentation-analysis")}>
                    <FaArrowLeft /> Back to Studio
                </button>
                <div className="report-status-badge">
                    STATUS: <span className="status-tag">{report.processing_status}</span>
                </div>
            </div>

            {/* Main Header Card */}
            <div className="report-header-card">
                <div className="header-info">
                    <h2>{report.title || "Speech Presentation Performance Report"}</h2>
                    <p className="subtitle">
                        Recorded on {new Date(report.created_at).toLocaleDateString()} • Duration: {report.audio_duration_seconds || 0} seconds
                    </p>
                </div>

                <div className="overall-score-box">
                    <div className="score-circle">
                        <span className="score-num">{overallScore}</span>
                        <span className="score-label">/ 100</span>
                    </div>
                    <span className="score-title"><FaTrophy /> OVERALL SCORE</span>
                </div>
            </div>

            {/* Metric Score Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="card-top">
                        <FaTachometerAlt className="card-icon blue" />
                        <span>Speech Pace</span>
                    </div>
                    <div className="metric-value">{report.speech_pace_wpm || 0} <span className="unit">WPM</span></div>
                    <p className="metric-desc">Target Range: 130 - 160 WPM</p>
                </div>

                <div className="metric-card">
                    <div className="card-top">
                        <FaExclamationTriangle className="card-icon red" />
                        <span>Filler Words</span>
                    </div>
                    <div className="metric-value">{report.filler_words_count || 0} <span className="unit">words</span></div>
                    <p className="metric-desc">Detects 'um', 'uh', 'like', 'actually'</p>
                </div>

                <div className="metric-card">
                    <div className="card-top">
                        <FaCheckCircle className="card-icon green" />
                        <span>Clarity Score</span>
                    </div>
                    <div className="metric-value">{Math.round(report.clarity_score || 0)}%</div>
                    <p className="metric-desc">Vocabulary diversity & structure</p>
                </div>

                <div className="metric-card">
                    <div className="card-top">
                        <FaVolumeUp className="card-icon yellow" />
                        <span>Confidence Score</span>
                    </div>
                    <div className="metric-value">{Math.round(report.confidence_score || 0)}%</div>
                    <p className="metric-desc">Vocal variance & pacing</p>
                </div>
            </div>

            {/* Visualization Section */}
            <div className="report-section chart-section">
                <h3><FaChartPie /> Performance Breakdown</h3>
                <div className="chart-wrapper" style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff" }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {metrics.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations & Feedback Section */}
            <div className="report-section feedback-section">
                <h3><FaLightbulb /> Actionable Recommendations</h3>
                <div className="feedback-grid">
                    <div className="feedback-box strengths">
                        <h4>Key Strengths</h4>
                        <ul>
                            {overallScore >= 70 ? (
                                <>
                                    <li>Maintained good general speech structure and volume.</li>
                                    <li>Recording stored cleanly in MongoDB GridFS with full transcript.</li>
                                </>
                            ) : (
                                <li>Completed live speech recording and pipeline processing.</li>
                            )}
                        </ul>
                    </div>

                    <div className="feedback-box recommendations">
                        <h4>Areas to Improve</h4>
                        <ul>
                            {report.filler_words_count > 3 && (
                                <li>Reduce filler words (detected {report.filler_words_count} fillers) by introducing deliberate 1-second pauses.</li>
                            )}
                            {report.speech_pace_wpm < 130 && (
                                <li>Increase speaking pace slightly (currently {report.speech_pace_wpm} WPM) to boost audience engagement.</li>
                            )}
                            {report.speech_pace_wpm > 160 && (
                                <li>Slow down speaking tempo (currently {report.speech_pace_wpm} WPM) to give main arguments time to land.</li>
                            )}
                            {(!report.filler_words_count || report.filler_words_count <= 3) && report.speech_pace_wpm >= 130 && report.speech_pace_wpm <= 160 && (
                                <li>Keep practicing vocal inflection and pitch variation to maximize engagement scores.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Whisper Transcript Section */}
            <div className="report-section transcript-section">
                <div className="transcript-header">
                    <h3><FaFileAlt /> Whisper Audio Transcript</h3>
                    <button className="btn-copy" onClick={handleCopyTranscript}>
                        <FaCopy /> {copied ? "Copied!" : "Copy Text"}
                    </button>
                </div>
                <div className="transcript-body">
                    {report.transcription_text ? (
                        <p>{report.transcription_text}</p>
                    ) : (
                        <p className="no-transcript">No transcript text generated yet.</p>
                    )}
                </div>
                <div className="audio-stream-player">
                    <label>Audio Recording:</label>
                    <audio controls src={presentationService.getAudioStreamUrl(report.id)} className="player"></audio>
                </div>
            </div>
        </div>
    );
};

export default PresentationReport;
