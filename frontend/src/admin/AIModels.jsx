import DashboardLayout from "../layouts/DashboardLayout";

export default function AIModels() {
    return (
        <DashboardLayout>

            <h1>AI Model Monitoring</h1>

            <hr />

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
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Model Status</h3>
                    <h2>Active</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Accuracy</h3>
                    <h2>94%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Predictions</h3>
                    <h2>12,540</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Last Updated</h3>
                    <h2>Today</h2>
                </div>

            </div>

            <br />

            <h2>Model Summary</h2>

            <p>
                The AI Debate Evaluation Model is operating normally and
                providing accurate feedback for debate sessions.
            </p>

        </DashboardLayout>
    );
}