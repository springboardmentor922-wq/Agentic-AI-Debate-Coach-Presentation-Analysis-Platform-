import DashboardLayout from "../layouts/DashboardLayout";

export default function Analytics() {
    return (
        <DashboardLayout>

            <h1>Platform Analytics</h1>

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
                    <h3>Total Users</h3>
                    <h2>120</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Total Debates</h3>
                    <h2>560</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Average Score</h3>
                    <h2>85%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Active Users</h3>
                    <h2>98</h2>
                </div>

            </div>

            <br />

            <h2>Platform Summary</h2>

            <p>
                The AI Debate Coach platform is operating efficiently with
                increasing user engagement and consistent debate performance.
            </p>

        </DashboardLayout>
    );
}