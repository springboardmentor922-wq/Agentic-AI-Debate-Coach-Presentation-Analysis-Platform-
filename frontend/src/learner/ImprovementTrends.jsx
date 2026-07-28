import DashboardLayout from "../layouts/DashboardLayout";

export default function ImprovementTrends() {
    return (
        <DashboardLayout>

            <h1>Improvement Trends</h1>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
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
                    <h3>Confidence</h3>
                    <h2>⬆ +15%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Speaking Skills</h3>
                    <h2>⬆ +12%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Argument Quality</h3>
                    <h2>⬆ +18%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Rebuttal Skills</h3>
                    <h2>⬆ +8%</h2>
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
                <h2>Trend Summary</h2>

                <p>
                    Your overall debate performance has shown steady improvement
                    over recent sessions.
                </p>

                <p>
                    Your strongest improvement is in Argument Quality.
                </p>

                <p>
                    Continue practicing rebuttal techniques to improve further.
                </p>

            </div>

        </DashboardLayout>
    );
}