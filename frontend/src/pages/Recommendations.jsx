import AppShell from "../layouts/AppShell";

function Recommendations() {

    const recommendations = [

        {
            title: "Counterargument Drills",
            level: "Intermediate",
            category: "Practice",
            description:
                "Improve your rebuttal skills by responding to AI-generated opposing arguments."
        },

        {
            title: "Logical Fallacies 101",
            level: "Beginner",
            category: "Lesson",
            description:
                "Understand common logical fallacies with real debate examples."
        },

        {
            title: "Evidence-Based Debating",
            level: "Advanced",
            category: "Course",
            description:
                "Learn how to support every claim with strong statistics and credible research."
        },

        {
            title: "Public Speaking Practice",
            level: "Intermediate",
            category: "Exercise",
            description:
                "Boost confidence, speaking pace and audience engagement."
        },

        {
            title: "Opening Statement Workshop",
            level: "Beginner",
            category: "Workshop",
            description:
                "Master powerful introductions that grab attention within the first 30 seconds."
        },

        {
            title: "Cross Examination Practice",
            level: "Advanced",
            category: "Simulation",
            description:
                "Practice answering difficult questions under pressure using AI."
        }

    ];

    const levelColor = {

        Beginner: "#16a34a",
        Intermediate: "#2563eb",
        Advanced: "#dc2626"

    };

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>⭐ Recommended For You</h1>

                    <p>

                        Personalized AI recommendations based on your
                        debate performance and learning progress.

                    </p>

                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(340px,1fr))",
                    gap: "22px",
                    marginTop: "30px"
                }}
            >

                {

                    recommendations.map((item) => (

                        <div
                            key={item.title}
                            className="panel"
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >

                                <span
                                    style={{
                                        color: "#a78bfa",
                                        fontWeight: 700
                                    }}
                                >
                                    {item.category}
                                </span>

                                <span
                                    style={{
                                        background:
                                            levelColor[item.level],
                                        color: "white",
                                        padding: "5px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px"
                                    }}
                                >
                                    {item.level}
                                </span>

                            </div>

                            <h2
                                style={{
                                    marginTop: "18px"
                                }}
                            >
                                {item.title}
                            </h2>

                            <p
                                style={{
                                    color: "#9ca3af",
                                    lineHeight: "1.8",
                                    marginTop: "10px"
                                }}
                            >
                                {item.description}
                            </p>

                            <button
                                style={{
                                    marginTop: "22px"
                                }}
                                onClick={() =>
                                    alert(
                                        `${item.title} will become interactive in Milestone 3.`
                                    )
                                }
                            >
                                ▶ Start Practice
                            </button>

                        </div>

                    ))

                }

            </div>

        </AppShell>

    );

}

export default Recommendations;