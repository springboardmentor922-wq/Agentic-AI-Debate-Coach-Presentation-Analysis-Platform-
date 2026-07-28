import DashboardLayout from "../layouts/DashboardLayout";

export default function Recommendations() {
    return (
        <DashboardLayout>

            <h1>Recommended Exercises</h1>

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
                    <h3>🎤 Voice Modulation</h3>

                    <p>Practice speaking with different tones and emphasis.</p>

                    <p><strong>Duration:</strong> 15 Minutes</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>🧠 Rebuttal Practice</h3>

                    <p>Respond to opposing arguments with strong evidence.</p>

                    <p><strong>Duration:</strong> 20 Minutes</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>📚 Critical Thinking</h3>

                    <p>Analyze debate topics from multiple perspectives.</p>

                    <p><strong>Duration:</strong> 25 Minutes</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>💬 Public Speaking</h3>

                    <p>Improve confidence while presenting arguments.</p>

                    <p><strong>Duration:</strong> 30 Minutes</p>
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
                <h2>AI Recommendation</h2>

                <p>
                    Based on your recent debate sessions, we recommend focusing on:
                </p>

                <ul>
                    <li>Improving rebuttal techniques.</li>
                    <li>Building stronger evidence-based arguments.</li>
                    <li>Practicing voice modulation.</li>
                    <li>Increasing confidence during presentations.</li>
                </ul>

            </div>

        </DashboardLayout>
    );
}