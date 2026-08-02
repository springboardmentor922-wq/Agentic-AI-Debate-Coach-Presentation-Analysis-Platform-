import { useState } from "react";
import AppShell from "../layouts/AppShell";


function FallacyDetector() {

    const [argument, setArgument] = useState("");
    const [result, setResult] = useState(null);


    function detectFallacies() {

        if (!argument.trim()) {
            return;
        }


        /*
            TEMPORARY RESULT

            Backend AI connection comes later.
        */

        setResult({

            detected: true,

            fallacy: "Hasty Generalization",

            confidence: 84,

            explanation:
                "The argument reaches a broad conclusion without providing enough evidence to support that conclusion.",

            suggestion:
                "Use specific evidence, examples, or statistics instead of making a general conclusion from limited information."

        });

    }


    function clearDetector() {
        setArgument("");
        setResult(null);
    }


    return (

        <AppShell>

            <div className="tool-page">

                {/* HEADER */}

                <div className="tool-page-header">

                    <div>

                        <h1>Fallacy Detector</h1>

                        <p>
                            Detect logical fallacies in your arguments and
                            learn how to correct them.
                        </p>

                    </div>

                    <div className="tool-header-icon warning-icon">
                        △
                    </div>

                </div>


                <div className="tool-main-grid">

                    {/* INPUT */}

                    <section className="dashboard-card tool-input-card">

                        <div className="dashboard-card-header">

                            <div>

                                <h3>Check Your Argument</h3>

                                <p>
                                    Enter an argument and let the AI coach
                                    check it for logical fallacies.
                                </p>

                            </div>

                        </div>


                        <textarea
                            className="tool-textarea"
                            placeholder="Example: Everyone I know uses social media, therefore social media cannot have any negative effects..."
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
                                    onClick={clearDetector}
                                    type="button"
                                >
                                    Clear
                                </button>

                                <button
                                    className="tool-primary-button"
                                    onClick={detectFallacies}
                                    type="button"
                                >
                                    △ Detect Fallacies
                                </button>

                            </div>

                        </div>

                    </section>


                    {/* COMMON FALLACIES */}

                    <section className="dashboard-card">

                        <div className="dashboard-card-header">
                            <h3>Common Fallacies</h3>
                        </div>


                        <div className="fallacy-mini-card">

                            <strong>Ad Hominem</strong>

                            <p>
                                Attacking the person instead of their
                                argument.
                            </p>

                        </div>


                        <div className="fallacy-mini-card">

                            <strong>Straw Man</strong>

                            <p>
                                Misrepresenting an argument to make it
                                easier to attack.
                            </p>

                        </div>


                        <div className="fallacy-mini-card">

                            <strong>False Dilemma</strong>

                            <p>
                                Presenting only two choices when more
                                possibilities exist.
                            </p>

                        </div>


                        <div className="fallacy-mini-card">

                            <strong>Hasty Generalization</strong>

                            <p>
                                Drawing a broad conclusion from insufficient
                                evidence.
                            </p>

                        </div>

                    </section>

                </div>


                {result && (

                    <>

                        <div className="tool-section-title">

                            <div>
                                <h2>Detection Result</h2>

                                <p>
                                    Logical reasoning analysis.
                                </p>
                            </div>

                        </div>


                        <div className="fallacy-result-card">

                            <div className="fallacy-result-header">

                                <div className="fallacy-warning-symbol">
                                    !
                                </div>

                                <div>

                                    <span>
                                        Detected Fallacy
                                    </span>

                                    <h2>
                                        {result.fallacy}
                                    </h2>

                                </div>


                                <div className="fallacy-confidence">

                                    <strong>
                                        {result.confidence}%
                                    </strong>

                                    <span>
                                        Confidence
                                    </span>

                                </div>

                            </div>


                            <div className="fallacy-result-content">

                                <div>

                                    <h3>Why this is a fallacy</h3>

                                    <p>
                                        {result.explanation}
                                    </p>

                                </div>


                                <div>

                                    <h3>How to improve it</h3>

                                    <p>
                                        {result.suggestion}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </AppShell>

    );

}

export default FallacyDetector;