import CoachLayout from "../components/coach/CoachLayout";
import CoachStats from "../components/coach/CoachStats";
import RecentActivity from "../components/coach/RecentActivity";

function CoachDashboard() {

    return (

        <CoachLayout>

            <div className="coach-dashboard">

                <div className="coach-dashboard-header">

                    <div>

                        <h1>Coach Dashboard</h1>

                        <p>
                            Empower learners. Evaluate performance.
                        </p>

                    </div>

                    <input
                        type="text"
                        placeholder="Search learners..."
                        className="coach-search"
                    />

                </div>

                <CoachStats />

                <RecentActivity />

            </div>

        </CoachLayout>

    );
}

export default CoachDashboard;