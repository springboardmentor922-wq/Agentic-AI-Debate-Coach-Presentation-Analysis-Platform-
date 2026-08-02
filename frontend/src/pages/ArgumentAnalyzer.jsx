import { useState } from "react";
import AppShell from "../layouts/AppShell";


function ArgumentAnalyzer() {

    const [argument, setArgument] = useState("");
    const [result, setResult] = useState(null);


    function analyzeArgument() {

        if (!argument.trim()) {
            return;
        }

        /*
            TEMPORARY FRONTEND ANALYSIS

            We will connect this to the AI backend later.
        */

        setResult({
            claims: 2,
            evidence: "Moderate",
            strength: "Strong",
            reasoning: "Good",
            score: 78
        });

    }


    function clearAnalysis() {
        setArgument("");
        setResult(null);
    }


    return (

        <AppShell>

            <div className="tool-page">

                {/* HEADER */}

                <div className="tool-page-header">

                    <div>

                        <h1>Argument Analyzer</h1>

                        <p>
                            Analyze your argument for claims, evidence,
                            reasoning quality and overall strength.
                        </p>

                    </div>

                    <div className="tool-header-icon">
                        🔎
                    </div>

                </div>


                {/* MAIN GRID */}

                <div className="tool-main-grid">

                    {/* INPUT */}

                    <section className="dashboard-card tool-input-card">

                        <div className="dashboard-card-header">

                            <div>

                                <h3>Your Argument</h3>

                                <p>
                                    Enter an argument you want the AI coach
                                    to evaluate.
                                </p>

                            </div>

                        </div>


                        <textarea
                            className="tool-textarea"
                            placeholder="Example: Artificial Intelligence should be used in education because it can provide personalized learning experiences and help students learn at their own pace..."
                            value={argument}
                            onChange={(e) => setArgument(e.target.value)}
                        />


                        <div className="tool-textarea-footer">

                            <span>
                                {argument.length} characters
                            </span>

                            <div className="tool-actions">

                                <button
                                    className="tool-secondary-button"
                                    onClick={clearAnalysis}
                                    type="button"
                                >
                                    Clear
                                </button>

                                <button
                                    className="tool-primary-button"
                                    onClick={analyzeArgument}
                                    type="button"
                                >
                                    ✦ Analyze Argument
                                </button>

                            </div>

                        </div>

                    </section>


                    {/* GUIDE */}

                    <section className="dashboard-card">

                        <div className="dashboard-card-header">

                            <h3>What We Analyze</h3>

                        </div>


                        <div className="analysis-feature">

                            <span>◎</span>

                            <div>
                                <strong>Claims</strong>

                                <p>
                                    Identifies the main claims and
                                    supporting statements.
                                </p>
                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>▤</span>

                            <div>
                                <strong>Evidence</strong>

                                <p>
                                    Evaluates whether your claims are
                                    properly supported.
                                </p>
                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>◇</span>

                            <div>
                                <strong>Reasoning</strong>

                                <p>
                                    Checks the logical connection between
                                    claims and evidence.
                                </p>
                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>↗</span>

                            <div>
                                <strong>Argument Strength</strong>

                                <p>
                                    Provides an overall assessment and
                                    improvement suggestions.
                                </p>
                            </div>

                        </div>

                    </section>

                </div>


                {/* RESULTS */}

                {result && (

                    <>

                        <div className="tool-section-title">

                            <div>
                                <h2>Analysis Result</h2>

                                <p>
                                    AI evaluation of your submitted argument.
                                </p>
                            </div>

                            <span className="analysis-complete-badge">
                                ✓ Analysis Complete
                            </span>

                        </div>


                        <div className="tool-score-grid">

                            <div className="tool-score-card">

                                <span>Claims Identified</span>

                                <strong>
                                    {result.claims}
                                </strong>

                                <small>
                                    Main argument points
                                </small>

                            </div>


                            <div className="tool-score-card">

                                <span>Evidence</span>

                                <strong>
                                    {result.evidence}
                                </strong>

                                <small>
                                    Supporting evidence quality
                                </small>

                            </div>


                            <div className="tool-score-card">

                                <span>Argument Strength</span>

                                <strong>
                                    {result.strength}
                                </strong>

                                <small>
                                    Overall structure
                                </small>

                            </div>


                            <div className="tool-score-card">

                                <span>Reasoning</span>

                                <strong>
                                    {result.reasoning}
                                </strong>

                                <small>
                                    Logical consistency
                                </small>

                            </div>

                        </div>


                        <div className="tool-result-grid">

                            <section className="dashboard-card">

                                <div className="dashboard-card-header">
                                    <h3>Argument Breakdown</h3>
                                </div>


                                <div className="argument-breakdown-row">

                                    <span className="breakdown-icon purple">
                                        1
                                    </span>

                                    <div>

                                        <strong>Main Claim</strong>

                                        <p>
                                            Your argument clearly presents
                                            a position and explains why the
                                            proposed idea may be beneficial.
                                        </p>

                                    </div>

                                </div>


                                <div className="argument-breakdown-row">

                                    <span className="breakdown-icon blue">
                                        2
                                    </span>

                                    <div>

                                        <strong>Supporting Reason</strong>

                                        <p>
                                            The argument provides relevant
                                            reasoning, but stronger evidence
                                            would make it more convincing.
                                        </p>

                                    </div>

                                </div>

                            </section>


                            <section className="dashboard-card">

                                <div className="dashboard-card-header">
                                    <h3>AI Suggestions</h3>
                                </div>


                                <div className="suggestion-item">
                                    <span>✓</span>

                                    <p>
                                        Your main position is easy to
                                        understand.
                                    </p>
                                </div>


                                <div className="suggestion-item">
                                    <span>↗</span>

                                    <p>
                                        Add statistics or credible sources
                                        to strengthen your evidence.
                                    </p>
                                </div>


                                <div className="suggestion-item">
                                    <span>◎</span>

                                    <p>
                                        Address a possible counterargument
                                        to make your reasoning stronger.
                                    </p>
                                </div>

                            </section>

                        </div>

                    </>

                )}

            </div>

        </AppShell>

    );

}

export default ArgumentAnalyzer;