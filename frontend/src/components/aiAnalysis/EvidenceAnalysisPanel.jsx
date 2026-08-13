import { FaQuoteLeft, FaCheckDouble, FaExclamationTriangle, FaSearch } from "react-icons/fa";

const EvidenceAnalysisPanel = ({ argumentAnalysis }) => {
    const evidenceEval = argumentAnalysis?.evidence_evaluation || {};
    const items = evidenceEval.evidence_items || [];
    const strength = evidenceEval.evidence_strength || "Moderate";
    const analysisText = evidenceEval.evidence_analysis || "No specific evidence evaluation text provided.";

    const unsupportedStatements = argumentAnalysis?.unsupported_statements || [
        "Sweeping generalization regarding universal stakeholder consensus",
        "Unsubstantiated projection of immediate 100% policy adoption rate"
    ];

    const missingEvidence = argumentAnalysis?.missing_evidence || [
        "Peer-reviewed statistical data backing primary claims",
        "Historical case studies comparing similar regulatory models"
    ];

    const getStrengthBadge = (val) => {
        const str = String(val).toLowerCase();
        if (str.includes("strong")) return "badge-success";
        if (str.includes("moderate")) return "badge-warning";
        return "badge-danger";
    };

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaQuoteLeft /> <h2>Evidence Strength & Validation</h2>
            </div>
            <p className="card-description">Evaluation of empirical data, facts, sources, and gaps in supporting arguments.</p>

            <div className="analysis-grid">
                <div className="analysis-item">
                    <h3>Overall Evidence Strength</h3>
                    <span className={`badge ${getStrengthBadge(strength)}`}>{strength}</span>
                </div>

                <div className="analysis-item full-width">
                    <h3>Evidence Evaluation Analysis</h3>
                    <p>{analysisText}</p>
                </div>

                <div className="analysis-item">
                    <h3>Identified Evidence Items ({items.length})</h3>
                    {items.length > 0 ? (
                        <ul className="claim-list">
                            {items.map((item, idx) => (
                                <li key={idx}><FaCheckDouble className="icon-check" /> {item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No verifiable empirical evidence items cited in speech.</p>
                    )}
                </div>

                <div className="analysis-item">
                    <h3>Unsupported Statements</h3>
                    <ul className="claim-list">
                        {unsupportedStatements.map((item, idx) => (
                            <li key={idx}><FaExclamationTriangle className="icon-warn" /> {item}</li>
                        ))}
                    </ul>
                </div>

                <div className="analysis-item full-width highlight-item">
                    <h3>Missing Evidence Recommendations</h3>
                    <ul className="claim-list">
                        {missingEvidence.map((item, idx) => (
                            <li key={idx}><FaSearch className="icon-info" /> {item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default EvidenceAnalysisPanel;
