import { useState } from "react";

import Layout from "../components/Layout";

import {
    analyzePresentation
} from "../services/presentationService";


function PresentationAnalysis() {

    const [presentation, setPresentation] =
        useState("");

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    const handleAnalyze = async () => {

        if (!presentation.trim()) {

            alert(
                "Please enter your presentation."
            );

            return;
        }

        try {

            setLoading(true);

            const response =
                await analyzePresentation(
                    presentation
                );

            setResult(response.data);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Presentation analysis failed."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>
                        Presentation Analysis
                    </h2>

                    <p>
                        Analyze your presentation skills with AI.
                    </p>

                    <textarea
                        className="form-control"
                        rows="10"
                        placeholder="Enter your presentation here..."
                        value={presentation}
                        onChange={(e) =>
                            setPresentation(
                                e.target.value
                            )
                        }
                    />

                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading
                            ? "Analyzing..."
                            : "Analyze Presentation"}
                    </button>

                </div>


                {result && (

                    <div className="chart-card mt-4">

                        <h2>
                            AI Presentation Analysis
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(5, 1fr)",
                                gap: "15px",
                                marginTop: "20px"
                            }}
                        >

                            <Score
                                title="Clarity"
                                score={result.clarity}
                            />

                            <Score
                                title="Confidence"
                                score={result.confidence}
                            />

                            <Score
                                title="Communication"
                                score={
                                    result.communication
                                }
                            />

                            <Score
                                title="Structure"
                                score={
                                    result.structure
                                }
                            />

                            <Score
                                title="Overall"
                                score={result.overall}
                            />

                        </div>


                        <hr />


                        <h3>
                            Strengths
                        </h3>

                        <ul>

                            {result.strengths?.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                )
                            )}

                        </ul>


                        <h3>
                            Areas for Improvement
                        </h3>

                        <ul>

                            {result.weaknesses?.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                )
                            )}

                        </ul>


                        <h3>
                            Suggestions
                        </h3>

                        <ul>

                            {result.suggestions?.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                )
                            )}

                        </ul>

                    </div>

                )}

            </div>

        </Layout>

    );
}


function Score({
    title,
    score
}) {

    return (

        <div
            style={{
                padding: "18px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                textAlign: "center"
            }}
        >

            <h4>
                {title}
            </h4>

            <div
                style={{
                    fontSize: "28px",
                    fontWeight: "700"
                }}
            >
                {score}/10
            </div>

        </div>

    );

}


export default PresentationAnalysis;