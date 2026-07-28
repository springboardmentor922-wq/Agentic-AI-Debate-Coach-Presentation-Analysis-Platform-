import DashboardLayout from "../layouts/DashboardLayout";

export default function ClassAnalytics() {
    return (
        <DashboardLayout>

            <h1>Class Analytics</h1>

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
                    <h3>Total Students</h3>
                    <h2>30</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Total Debates</h3>
                    <h2>120</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Average Score</h3>
                    <h2>84%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Completion Rate</h3>
                    <h2>92%</h2>
                </div>

            </div>

            <br />

            <h2>Class Summary</h2>

            <p>
                The class has shown consistent improvement in debate performance.
                Most students actively participate and maintain strong communication skills.
            </p>

        </DashboardLayout>
    );
}