import AppShell from "../layouts/AppShell";

function Reports() {

    const feedback = [

        {
            title: "Argument Quality",
            score: 84,
            coach: "Strong claim. Add more evidence from credible sources."
        },

        {
            title: "Evidence Usage",
            score: 76,
            coach: "Use statistics or real-world examples to strengthen credibility."
        },

        {
            title: "Logical Consistency",
            score: 88,
            coach: "Reasoning is clear. Avoid making unsupported assumptions."
        },

        {
            title: "Rebuttal Effectiveness",
            score: 71,
            coach: "Respond directly to your opponent's strongest point before introducing new ideas."
        }

    ];

    const tips = [

        "Practice opening statements daily.",
        "Avoid Strawman and Ad Hominem fallacies.",
        "Use evidence before opinions.",
        "Keep eye contact during presentations.",
        "Slow down your speaking pace."

    ];

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>💬 Feedback & Coaching</h1>

                    <p>

                        Personalized AI coaching based on your debate performances.

                    </p>

                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "25px",
                    marginTop: "30px"
                }}
            >

                <div>

                    {feedback.map((item) => (

                        <div
                            key={item.title}
                            className="panel"
                            style={{ marginBottom: "20px" }}
                        >

                            <h2>{item.title}</h2>

                            <h1
                                style={{
                                    color: "#8b5cf6",
                                    margin: "10px 0"
                                }}
                            >
                                {item.score}/100
                            </h1>

                            <p
                                style={{
                                    color: "#9ca3af"
                                }}
                            >
                                {item.coach}
                            </p>

                        </div>

                    ))}

                </div>

                <div>

                    <div className="panel">

                        <h2>🎯 AI Coaching Tips</h2>

                        <ul
                            style={{
                                marginTop: "20px",
                                lineHeight: "2"
                            }}
                        >

                            {tips.map((tip) => (

                                <li key={tip}>
                                    {tip}
                                </li>

                            ))}

                        </ul>

                    </div>

                </div>

            </div>

        </AppShell>

    );

}

export default Reports;