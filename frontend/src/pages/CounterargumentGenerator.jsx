import { useState } from "react";
import AppShell from "../layouts/AppShell";


function CounterargumentGenerator() {

    const [argument, setArgument] = useState("");
    const [style, setStyle] = useState("Logical");
    const [result, setResult] = useState(null);


    function generateCounterargument() {

        if (!argument.trim()) {
            return;
        }


        /*
            TEMPORARY RESULT

            Later this will call the Gemini backend.
        */

        setResult({

            counterargument:
                "While the argument presents a valid benefit, it assumes that the proposed solution will work equally well in every situation. Different circumstances may produce different outcomes, so broader evidence should be considered before accepting the claim.",

            rebuttal:
                "A stronger response would acknowledge the limitation while demonstrating that the benefits still outweigh the possible disadvantages.",

            question:
                "What evidence shows that this solution would remain effective across different groups and situations?"

        });

    }


    function clearGenerator() {

        setArgument("");
        setResult(null);

    }


    return (

        <AppShell>

            <div className="tool-page">

                {/* HEADER */}

                <div className="tool-page-header">

                    <div>

                        <h1>Counterargument Generator</h1>

                        <p>
                            Generate strong opposing arguments and prepare
                            better rebuttals for debates.
                        </p>

                    </div>

                    <div className="tool-header-icon">
                        💬
                    </div>

                </div>


                <div className="tool-main-grid">

                    {/* INPUT */}

                    <section className="dashboard-card tool-input-card">

                        <div className="dashboard-card-header">

                            <div>

                                <h3>Your Argument</h3>

                                <p>
                                    Enter your position and generate an
                                    opposing perspective.
                                </p>

                            </div>

                        </div>


                        <textarea
                            className="tool-textarea"
                            placeholder="Example: Artificial Intelligence should be used in education because it can personalize learning for every student..."
                            value={argument}
                            onChange={(e) => setArgument(e.target.value)}
                        />


                        <div className="counter-style-section">

                            <span>
                                Counterargument Style
                            </span>


                            <div className="counter-style-buttons">

                                {[
                                    "Logical",
                                    "Evidence-Based",
                                    "Ethical",
                                    "Policy"
                                ].map((item) => (

                                    <button
                                        key={item}
                                        type="button"
                                        className={
                                            style === item
                                                ? "counter-style active"
                                                : "counter-style"
                                        }
                                        onClick={() => setStyle(item)}
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                        </div>


                        <div className="tool-textarea-footer">

                            <span>
                                Selected: {style}
                            </span>

                            <div className="tool-actions">

                                <button
                                    className="tool-secondary-button"
                                    onClick={clearGenerator}
                                    type="button"
                                >
                                    Clear
                                </button>

                                <button
                                    className="tool-primary-button"
                                    onClick={generateCounterargument}
                                    type="button"
                                >
                                    ✦ Generate
                                </button>

                            </div>

                        </div>

                    </section>


                    {/* GUIDE */}

                    <section className="dashboard-card">

                        <div className="dashboard-card-header">
                            <h3>Why Practice Counterarguments?</h3>
                        </div>


                        <div className="analysis-feature">

                            <span>◇</span>

                            <div>

                                <strong>
                                    Understand Opposition
                                </strong>

                                <p>
                                    See how an opponent may challenge your
                                    position.
                                </p>

                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>◎</span>

                            <div>

                                <strong>
                                    Prepare Rebuttals
                                </strong>

                                <p>
                                    Practice responding before entering a
                                    live debate.
                                </p>

                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>↗</span>

                            <div>

                                <strong>
                                    Strengthen Arguments
                                </strong>

                                <p>
                                    Discover weaknesses in your own
                                    reasoning.
                                </p>

                            </div>

                        </div>


                        <div className="analysis-feature">

                            <span>✦</span>

                            <div>

                                <strong>
                                    Think Critically
                                </strong>

                                <p>
                                    Explore different perspectives on the
                                    same issue.
                                </p>

                            </div>

                        </div>

                    </section>

                </div>


                {result && (

                    <>

                        <div className="tool-section-title">

                            <div>

                                <h2>
                                    Generated Counterargument
                                </h2>

                                <p>
                                    {style} opposing perspective.
                                </p>

                            </div>

                            <span className="analysis-complete-badge">
                                ✦ AI Generated
                            </span>

                        </div>


                        <div className="counter-result-main">

                            <div className="counter-result-label">
                                Opposing Argument
                            </div>

                            <p>
                                {result.counterargument}
                            </p>

                        </div>


                        <div className="tool-result-grid">

                            <section className="dashboard-card">

                                <div className="dashboard-card-header">

                                    <h3>
                                        Suggested Rebuttal Approach
                                    </h3>

                                </div>

                                <p className="result-paragraph">
                                    {result.rebuttal}
                                </p>

                            </section>


                            <section className="dashboard-card">

                                <div className="dashboard-card-header">

                                    <h3>
                                        Question Your Opponent
                                    </h3>

                                </div>

                                <p className="result-paragraph">
                                    “{result.question}”
                                </p>

                            </section>

                        </div>

                    </>

                )}

            </div>

        </AppShell>

    );

}

export default CounterargumentGenerator;