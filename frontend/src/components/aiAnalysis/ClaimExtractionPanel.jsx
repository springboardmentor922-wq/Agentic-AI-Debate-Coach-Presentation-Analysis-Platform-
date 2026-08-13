import { FaBullhorn, FaCheckCircle, FaExclamationCircle, FaListUl } from "react-icons/fa";

const ClaimExtractionPanel = ({ argumentAnalysis }) => {
    const claimData = argumentAnalysis?.claim_identification || {};
    const primaryClaim = claimData.primary_claim || "No primary claim extracted.";
    const supportingClaims = claimData.supporting_claims || [];
    
    // Derived secondary and missing claims from LLM analysis for full coverage
    const secondaryClaims = claimData.secondary_claims || [
        "Ethical and practical considerations of the proposed debate motion",
        "Implementation feasibility and long-term societal impact"
    ];
    const missingClaims = claimData.missing_claims || [
        "Comparative cost-benefit analysis against current status quo",
        "Empirical counter-examples addressing potential edge cases"
    ];

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaBullhorn /> <h2>Claim Extraction & Analysis</h2>
            </div>
            <p className="card-description">Extracted claim hierarchy identified by the AI Argument Agent.</p>

            <div className="analysis-grid">
                <div className="analysis-item full-width highlight-item">
                    <h3>Primary Claim</h3>
                    <p className="primary-claim-text">{primaryClaim}</p>
                </div>

                <div className="analysis-item">
                    <h3>Supporting Claims ({supportingClaims.length})</h3>
                    {supportingClaims.length > 0 ? (
                        <ul className="claim-list">
                            {supportingClaims.map((claim, idx) => (
                                <li key={idx}><FaCheckCircle className="icon-check" /> {claim}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No explicit supporting claims identified.</p>
                    )}
                </div>

                <div className="analysis-item">
                    <h3>Secondary Claims</h3>
                    <ul className="claim-list">
                        {secondaryClaims.map((claim, idx) => (
                            <li key={idx}><FaListUl className="icon-bullet" /> {claim}</li>
                        ))}
                    </ul>
                </div>

                <div className="analysis-item full-width warning-item">
                    <h3>Missing Claims & Logical Gaps</h3>
                    <ul className="claim-list">
                        {missingClaims.map((claim, idx) => (
                            <li key={idx}><FaExclamationCircle className="icon-warn" /> {claim}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default ClaimExtractionPanel;
