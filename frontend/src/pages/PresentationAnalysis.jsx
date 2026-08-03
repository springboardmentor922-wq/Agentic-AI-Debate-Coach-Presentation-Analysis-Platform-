import AppShell from "../layouts/AppShell";

function PresentationAnalysis() {

    const data = JSON.parse(
        localStorage.getItem("presentation_result")
    );

    if (!data) {

        return (

            <AppShell>

                <h1>Presentation Analysis</h1>

                <br />

                <div className="panel">

                    <h2>No Presentation Analysis Found</h2>

                    <p>

                        Analyze a presentation first.

                    </p>

                </div>

            </AppShell>

        );

    }

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>🎤 Presentation Analysis</h1>

                    <p>

                        AI-powered communication analysis.

                    </p>

                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "24px",
                    marginTop: "30px"
                }}
            >

                <div className="panel">

                    <h2>Overall Score</h2>

                    <h1
                        style={{
                            color: "#8b5cf6",
                            fontSize: "48px"
                        }}
                    >
                        {data.overall_score}/100
                    </h1>

                    <hr />

                    <br />

                    <p>

                        <strong>Clarity:</strong>

                        {" "}

                        {data.clarity}%

                    </p>

                    <br />

                    <progress
                        value={data.clarity}
                        max="100"
                        style={{ width: "100%" }}
                    />

                    <br /><br />

                    <p>

                        <strong>Confidence:</strong>

                        {" "}

                        {data.confidence}%

                    </p>

                    <br />

                    <progress
                        value={data.confidence}
                        max="100"
                        style={{ width: "100%" }}
                    />

                    <br /><br />

                    <p>

                        <strong>Speaking Speed:</strong>

                        {" "}

                        {data.speaking_speed}

                    </p>

                </div>

                <div className="panel">

                    <h2>AI Coach</h2>

                    <p>

                        {data.feedback}

                    </p>

                </div>

            </div>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px"
                }}
            >

                <div className="panel">

                    <h2>💪 Strengths</h2>

                    <ul>

                        {data.strengths.map((item, index) => (

                            <li key={index}>{item}</li>

                        ))}

                    </ul>

                </div>

                <div className="panel">

                    <h2>⚠ Weaknesses</h2>

                    <ul>

                        {data.weaknesses.map((item, index) => (

                            <li key={index}>{item}</li>

                        ))}

                    </ul>

                </div>

            </div>

            <br />

            <div className="panel">

                <h2>Detected Filler Words</h2>

                <ul>

                    {data.filler_words.map((item, index) => (

                        <li key={index}>{item}</li>

                    ))}

                </ul>

            </div>

        </AppShell>

    );

}

export default PresentationAnalysis;