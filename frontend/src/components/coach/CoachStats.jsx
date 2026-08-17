import { useEffect, useState } from "react";

import {
    FaUsers,
    FaCalendarAlt,
    FaClock,
    FaChartLine,
    FaTrophy,
} from "react-icons/fa";

import { getCoachDashboardSummary } from "../../services/coachDashboardService";

function CoachStats() {

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const data = await getCoachDashboardSummary();

            setSummary(data);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return <h3>Loading Dashboard...</h3>;

    }

    const stats = [

        {
            title: "Active Learners",
            value: summary.active_learners,
            icon: <FaUsers />,
            color: "#7C3AED",
        },

        {
            title: "Sessions Today",
            value: summary.sessions_today,
            icon: <FaCalendarAlt />,
            color: "#2563EB",
        },

        {
            title: "Pending Reviews",
            value: summary.pending_reviews,
            icon: <FaClock />,
            color: "#EA580C",
        },

        {
            title: "Average Score",
            value: summary.average_score.toFixed(2),
            icon: <FaChartLine />,
            color: "#16A34A",
        },

        {
            title: "Top Performer",
            value: summary.top_performer.name,
            icon: <FaTrophy />,
            color: "#9333EA",
        },

    ];

    return (

        <div className="coach-stats-grid">

            {stats.map((item) => (

                <div
                    className="coach-stat-card"
                    key={item.title}
                >

                    <div
                        className="coach-stat-icon"
                        style={{
                            background: item.color,
                        }}
                    >
                        {item.icon}
                    </div>

                    <div>

                        <h5>{item.title}</h5>

                        <h2>{item.value}</h2>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default CoachStats;