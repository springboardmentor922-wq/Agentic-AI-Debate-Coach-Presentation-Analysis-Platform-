import React from "react";
import { FaMicrophone, FaTachometerAlt, FaVolumeUp, FaPause, FaVideo, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const PresentationAnalysisPanel = ({ speechText = "", speechMetrics = null }) => {
    const metrics = speechMetrics || null;

    if (!metrics && !speechText) {
        return (
            <section className="analysis-card">
                <div className="card-section-header">
                    <FaMicrophone /> <h2>Presentation & Speech Delivery Analysis</h2>
                </div>
                <div style={{ background: "#f8fafc", color: "#64748b", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                    <FaExclamationCircle style={{ fontSize: "24px", color: "#94a3b8", marginBottom: "8px" }} />
                    <p style={{ margin: 0 }}>Presentation delivery metrics are generated when audio/video is recorded or uploaded.</p>
                </div>
            </section>
        );
    }

    const wpm = metrics?.speech_pace_wpm ?? (speechText ? Math.round(speechText.split(/\s+/).filter(Boolean).length / 1.0) : 0);
    const fillerCount = metrics?.filler_words_count ?? 0;
    const confidenceScore = metrics?.confidence_score ?? 0;
    const clarityScore = metrics?.clarity_score ?? 0;
    const engagementScore = metrics?.audience_engagement_score ?? 0;
    const pitchVariance = metrics?.prosody_pitch_variance ?? 0;
    const pauseCount = metrics?.pause_count ?? 0;
    const overallScore = metrics?.overall_presentation_score ?? 0;

    const fillerDetails = metrics?.filler_words_details;
    const fillerBreakdown = typeof fillerDetails === "object" && fillerDetails !== null
        ? Object.entries(fillerDetails).map(([w, c]) => `'${w}' (${c})`).join(", ")
        : null;

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaMicrophone /> <h2>Presentation & Speech Delivery Analysis</h2>
            </div>
            <p className="card-description">
                {metrics ? "Real presentation analytics calculated from MongoDB GridFS binary audio & Whisper transcription." : "Speech metrics derived from typed argument text."}
            </p>

            {metrics && (
                <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#ffffff", padding: "16px 20px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#93c5fd", fontWeight: 700 }}>Overall Presentation Score</span>
                        <h3 style={{ margin: "4px 0 0", fontSize: "24px", color: "#ffffff" }}>{overallScore} / 100</h3>
                    </div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
                        <span><strong>Duration:</strong> {metrics.audio_duration_seconds ? `${metrics.audio_duration_seconds} sec` : "N/A"}</span> • <span><strong>Status:</strong> {metrics.processing_status || "COMPLETED"}</span>
                    </div>
                </div>
            )}

            <div className="analysis-grid">
                <div className="analysis-item">
                    <h3><FaTachometerAlt /> Speaking Pace (WPM)</h3>
                    <span className="badge badge-info">{wpm > 0 ? `${wpm} Words / Min` : "N/A"}</span>
                    <p className="item-note">
                        {wpm >= 130 && wpm <= 160 ? "Excellent speaking pace within ideal public speaking range (130-160 WPM)." : wpm < 130 && wpm > 0 ? "Slower speaking pace." : wpm > 160 ? "Faster speaking pace." : "Not available"}
                    </p>
                </div>

                <div className="analysis-item">
                    <h3><FaPause /> Filler Words Detected</h3>
                    <span className={`badge ${fillerCount <= 2 ? "badge-success" : "badge-warning"}`}>{metrics ? `${fillerCount} Fillers` : "N/A"}</span>
                    <p className="item-note">{fillerBreakdown ? `Fillers: ${fillerBreakdown}` : fillerCount === 0 && metrics ? "Zero filler hesitation words detected!" : "Filler detection performed on speech audio."}</p>
                </div>

                <div className="analysis-item">
                    <h3><FaVolumeUp /> Vocal Confidence</h3>
                    <span className="badge badge-success">{metrics ? `${confidenceScore}% Score` : "N/A"}</span>
                    <p className="item-note">{metrics ? "Calculated from filler density and speaking pace." : "Vocal projection analysis requires audio input."}</p>
                </div>

                <div className="analysis-item">
                    <h3><FaCheckCircle /> Speech Clarity Score</h3>
                    <span className="badge badge-info">{metrics ? `${clarityScore}% Score` : "N/A"}</span>
                    <p className="item-note">{metrics ? `Audience engagement: ${engagementScore}%` : "Vocabulary diversity and linguistic structure assessment."}</p>
                </div>

                <div className="analysis-item full-width highlight-item">
                    <h3><FaVideo /> Prosody & Acoustic Pitch Variance</h3>
                    <p>{metrics ? `Pitch Variance: ${pitchVariance} • Pause Patterns Detected: ${pauseCount}` : "GridFS audio prosody analytics ready for live speech recordings."}</p>
                </div>
            </div>
        </section>
    );
};

export default PresentationAnalysisPanel;
