import DashboardLayout from "../layouts/DashboardLayout";

export default function CoachingRecommendations() {
    return (
        <DashboardLayout>

            <h1>Coaching Recommendations</h1>

            <hr />

            <div
                style={{
                    border: "1px solid gray",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "20px"
                }}
            >
                <h3>Confidence Building</h3>
                <p>Practice speaking without reading notes.</p>
            </div>

            <div
                style={{
                    border: "1px solid gray",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "20px"
                }}
            >
                <h3>Communication</h3>
                <p>Maintain eye contact and improve voice clarity.</p>
            </div>

            <div
                style={{
                    border: "1px solid gray",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "20px"
                }}
            >
                <h3>Critical Thinking</h3>
                <p>Support your arguments using facts and examples.</p>
            </div>

            <div
                style={{
                    border: "1px solid gray",
                    padding: "20px",
                    borderRadius: "10px"
                }}
            >
                <h3>Rebuttal Skills</h3>
                <p>Practice responding quickly to opposing arguments.</p>
            </div>

        </DashboardLayout>
    );
}