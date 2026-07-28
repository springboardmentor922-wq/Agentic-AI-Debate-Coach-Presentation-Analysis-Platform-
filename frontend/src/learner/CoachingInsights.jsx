import DashboardLayout from "../layouts/DashboardLayout";

export default function CoachingInsights() {
    return (
        <DashboardLayout>

            <h1>Coaching Insights</h1>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
                    gap: "20px"
                }}
            >

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>🎯 Confidence</h3>
                    <p>Good progress. Continue speaking without hesitation.</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>🗣 Communication</h3>
                    <p>Maintain eye contact and improve voice modulation.</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>🧠 Critical Thinking</h3>
                    <p>Support your arguments with stronger evidence.</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>⚡ Rebuttal Skills</h3>
                    <p>Respond more quickly to opposing arguments.</p>
                </div>

            </div>

            <br />

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "20px"
                }}
            >
                <h2>Personalized Coaching Feedback</h2>

                <ul>
                    <li>Practice debate sessions at least three times per week.</li>
                    <li>Improve rebuttal speed and clarity.</li>
                    <li>Use real-world examples to strengthen your arguments.</li>
                    <li>Reduce filler words during presentations.</li>
                    <li>Continue building confidence through regular practice.</li>
                </ul>

            </div>

        </DashboardLayout>
    );
}