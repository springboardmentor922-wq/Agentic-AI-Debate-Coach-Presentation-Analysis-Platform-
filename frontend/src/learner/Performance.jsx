import DashboardLayout from "../layouts/DashboardLayout";

export default function Performance() {
    return (
        <DashboardLayout>

            <h1>Performance Scores</h1>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                    <h3>Total Debates</h3>
                    <h2>2</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Average Score</h3>
                    <h2>82%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Highest Score</h3>
                    <h2>90%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Lowest Score</h3>
                    <h2>75%</h2>
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
                <h2>Performance Summary</h2>

                <p>
                    Your debate performance is steadily improving.
                </p>

                <p>
                    Continue practicing rebuttal techniques, confidence,
                    and evidence-based arguments to improve your overall score.
                </p>
            </div>

        </DashboardLayout>
    );
}