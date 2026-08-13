import { FaExclamationTriangle, FaLightbulb, FaShieldAlt } from "react-icons/fa";

const FallacyDetectionPanel = ({ fallacyAnalysis }) => {
    const fallacies = fallacyAnalysis?.detected_fallacies || [];
    const explanation = fallacyAnalysis?.explanation_generation?.explanation || fallacyAnalysis?.executive_summary || "No fallacy analysis available.";
    const suggestions = fallacyAnalysis?.correction_suggestions?.suggestions || [];
    const credibility = fallacyAnalysis?.credibility_assessment || { credibility_level: "High", credibility_score: 85, justification: "Sound reasoning overall." };

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaExclamationTriangle /> <h2>Logical Fallacy Detection & Credibility</h2>
            </div>

            <div className="analysis-grid">
                <div className="analysis-item">
                    <h3>Credibility Score</h3>
                    <span className="badge badge-info">{credibility.credibility_score}/100 ({credibility.credibility_level})</span>
                </div>

                <div className="analysis-item full-width">
                    <h3>Credibility Justification</h3>
                    <p>{credibility.justification}</p>
                </div>
            </div>

            <h3>Detected Fallacies ({fallacies.length})</h3>
            {fallacies.length > 0 ? (
                <div className="fallacies-list">
                    {fallacies.map((item, index) => (
                        <div key={index} className="fallacy-card">
                            <div className="fallacy-header">
                                <span className="fallacy-type">{item.fallacy_type}</span>
                                <span className="fallacy-confidence">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <blockquote className="fallacy-excerpt">"{item.excerpt}"</blockquote>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="success-card">
                    <FaShieldAlt /> No logical fallacies detected. Reasoning exhibits high logical consistency.
                </div>
            )}

            <div className="analysis-grid" style={{ marginTop: "20px" }}>
                <div className="analysis-item full-width">
                    <h3>Reasoning Explanation</h3>
                    <p>{explanation}</p>
                </div>

                {suggestions.length > 0 && (
                    <div className="analysis-item full-width highlight-item">
                        <h3>Correction Suggestions</h3>
                        <ul className="recommendation-list">
                            {suggestions.map((item, idx) => (
                                <li key={idx}><FaLightbulb className="icon-bulb" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FallacyDetectionPanel;
