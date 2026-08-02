import AppShell from "../layouts/AppShell";

function LearningResources() {

    const resources = [
        {
            icon: "📘",
            title: "Building Strong Arguments",
            category: "Argumentation",
            description:
                "Learn how to structure claims, evidence and reasoning into convincing arguments."
        },
        {
            icon: "⚠️",
            title: "Common Logical Fallacies",
            category: "Critical Thinking",
            description:
                "Understand common logical fallacies and learn how to avoid them during debates."
        },
        {
            icon: "⚔️",
            title: "Effective Rebuttal Techniques",
            category: "Debating",
            description:
                "Learn how to challenge opposing arguments and construct stronger rebuttals."
        },
        {
            icon: "🎤",
            title: "Speaking With Confidence",
            category: "Communication",
            description:
                "Improve confidence, clarity and persuasive delivery while speaking."
        },
        {
            icon: "🔍",
            title: "Using Evidence Effectively",
            category: "Research",
            description:
                "Learn how statistics, examples and credible sources strengthen an argument."
        },
        {
            icon: "🏆",
            title: "Debate Strategy Guide",
            category: "Debating",
            description:
                "Learn opening statements, rebuttals, cross-examination and closing strategies."
        }
    ];

    return (
        <AppShell>

            <div className="page-header">

                <div>
                    <h1>📚 Learning Resources</h1>

                    <p>
                        Explore guides and learning material designed to
                        improve your debating and communication skills.
                    </p>
                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "22px",
                    marginTop: "30px"
                }}
            >

                {resources.map((resource, index) => (

                    <div
                        className="panel"
                        key={index}
                        style={{
                            transition: ".25s"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "36px",
                                marginBottom: "15px"
                            }}
                        >
                            {resource.icon}
                        </div>

                        <span
                            style={{
                                color: "#a78bfa",
                                fontSize: "13px",
                                fontWeight: "600"
                            }}
                        >
                            {resource.category}
                        </span>

                        <h2
                            style={{
                                marginTop: "8px"
                            }}
                        >
                            {resource.title}
                        </h2>

                        <p
                            style={{
                                color: "#9ca3af",
                                lineHeight: "1.7"
                            }}
                        >
                            {resource.description}
                        </p>

                        <button
                            onClick={() =>
                                alert(
                                    `${resource.title} learning module will be expanded in Milestone 3.`
                                )
                            }
                            style={{
                                marginTop: "15px"
                            }}
                        >
                            Start Learning →
                        </button>

                    </div>

                ))}

            </div>

        </AppShell>
    );
}

export default LearningResources;