import { useEffect, useState } from "react";
import { getRecentActivity } from "../../services/coachDashboardService";
import "../../styles/recentActivity.css";

function RecentActivity() {

    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadActivities();

    }, []);

    const loadActivities = async () => {

        try {

            const data = await getRecentActivity();

            setActivities(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="recent-card">

            <h2>Recent Learner Activity</h2>

            {loading ? (

                <p>Loading...</p>

            ) : activities.length === 0 ? (

                <p>No learner activity found.</p>

            ) : (

                activities.map((item, index) => (

                    <div
                        className="activity-row"
                        key={index}
                    >

                        <div>

                            <h4>{item.student}</h4>

                            <p>{item.action}</p>

                            <small>{item.topic}</small>

                        </div>

                        <div className="activity-right">

                            <strong>{item.score}</strong>

                            <small>{item.time}</small>

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default RecentActivity;