import DashboardLayout from "../layouts/DashboardLayout";

export default function DebateReports() {
    return (
        <DashboardLayout>

            <h1>Debate Reports</h1>

            <hr />

            <br />

            <div
                style={{
                    border: "1px solid gray",
                    borderRadius: "10px",
                    padding: "20px"
                }}
            >
                <h3>Monthly Debate Report</h3>

                <p>Total Debates Conducted: 120</p>
                <p>Average Student Score: 84%</p>
                <p>Best Performing Student: Rahul</p>
                <p>Most Improved Student: Poojitha</p>

            </div>

        </DashboardLayout>
    );
}