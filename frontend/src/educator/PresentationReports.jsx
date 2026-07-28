import DashboardLayout from "../layouts/DashboardLayout";

export default function PresentationReports() {
    return (
        <DashboardLayout>

            <h1>Presentation Reports</h1>

            <hr />

            <br />

            <div
                style={{
                    border: "1px solid gray",
                    borderRadius: "10px",
                    padding: "20px"
                }}
            >
                <h3>Presentation Performance Summary</h3>

                <p>Total Presentations: 75</p>
                <p>Average Presentation Score: 86%</p>
                <p>Best Presenter: Rahul</p>
                <p>Needs Improvement: Public Speaking Confidence</p>

            </div>

        </DashboardLayout>
    );
}