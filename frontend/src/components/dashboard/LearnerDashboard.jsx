import { useNavigate } from "react-router-dom";

import StatCard from "../ui/StatCard";


function ProgressBar({ label, value }) {

    return (

        <div className="learner-progress-item">

            <div className="learner-progress-label">

                <span>{label}</span>

                <strong>
                    {value}%
                </strong>

            </div>

            <div className="learner-progress-track">

                <div
                    className="learner-progress-fill"
                    style={{
                        width: `${value}%`
                    }}
                />

            </div>

        </div>

    );

}


function ActivityItem({
    icon,
    title,
    description
}) {

    return (

        <div className="learner-activity">

            <div className="learner-activity-icon">
                {icon}
            </div>

            <div>

                <strong>
                    {title}
                </strong>

                <p>
                    {description}
                </p>

            </div>

        </div>

    );

}


function RecommendationItem({
    icon,
    title,
    description,
    onClick
}) {

    return (

        <button
            className="learner-recommendation"
            onClick={onClick}
            type="button"
        >

            <div className="learner-recommendation-icon">
                {icon}
            </div>

            <div>

                <strong>
                    {title}
                </strong>

                <p>
                    {description}
                </p>

            </div>

            <span className="recommendation-arrow">
                ›
            </span>

        </button>

    );

}


function LearnerDashboard() {

    const navigate = useNavigate();

    const name =
        localStorage.getItem("name") ||
        localStorage.getItem("username") ||
        "Learner";

    return (

        <>

            <section className="dashboard-welcome">

                <div>

                    <h1>
                        Welcome back, {name}! 👋
                    </h1>

                    <p>
                        Keep practicing, keep improving.
                    </p>

                    <p>
                        You're on the path to becoming an excellent communicator!
                    </p>

                </div>

                <div className="dashboard-welcome-icon">
                    🧠
                </div>

            </section>


            <div className="stats-grid">

                <StatCard
                    title="Debates Participated"
                    value="12"
                    icon="♜"
                    trend="20%"
                    subtitle="vs last month"
                />

                <StatCard
                    title="Average Score"
                    value="78.6"
                    icon="↗"
                    trend="12%"
                    subtitle="vs last month"
                />

                <StatCard
                    title="Skills Improved"
                    value="6"
                    icon="☆"
                    trend="2 new"
                    subtitle="this month"
                />

                <StatCard
                    title="Current Streak"
                    value="7 Days"
                    icon="🔥"
                    subtitle="Keep it up!"
                />
                <StatCard
                    title="Presentations Analyzed"
                    value="5"
                    icon="🎤"
                />
            </div>


            <div className="learner-dashboard-main-grid">

                <section className="dashboard-card learner-performance">

                    <div className="dashboard-card-header">

                        <h3>
                            Performance Overview
                        </h3>

                        <button
                            className="dashboard-filter"
                            type="button"
                        >
                            Last 6 Sessions ▾
                        </button>

                    </div>


                    <div className="fake-chart">

                        <div className="chart-lines">

                            <span />
                            <span />
                            <span />
                            <span />

                        </div>


                        <div className="chart-area">

                            <div
                                className="chart-point"
                                style={{
                                    left: "4%",
                                    bottom: "25%"
                                }}
                            />

                            <div
                                className="chart-point"
                                style={{
                                    left: "22%",
                                    bottom: "37%"
                                }}
                            />

                            <div
                                className="chart-point"
                                style={{
                                    left: "40%",
                                    bottom: "43%"
                                }}
                            />

                            <div
                                className="chart-point"
                                style={{
                                    left: "58%",
                                    bottom: "50%"
                                }}
                            />

                            <div
                                className="chart-point"
                                style={{
                                    left: "76%",
                                    bottom: "65%"
                                }}
                            />

                            <div
                                className="chart-point"
                                style={{
                                    left: "94%",
                                    bottom: "76%"
                                }}
                            />

                            <svg
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                className="performance-svg"
                            >

                                <polyline
                                    points="
                                    4,75
                                    22,63
                                    40,57
                                    58,50
                                    76,35
                                    94,24
                                    "
                                />

                            </svg>

                        </div>


                        <div className="chart-labels">

                            <span>Session 1</span>
                            <span>Session 2</span>
                            <span>Session 3</span>
                            <span>Session 4</span>
                            <span>Session 5</span>
                            <span>Session 6</span>

                        </div>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>
                            Skill Progress
                        </h3>

                        <button
                            className="dashboard-link"
                            onClick={() =>
                                navigate("/skills")
                            }
                            type="button"
                        >
                            View All
                        </button>

                    </div>


                    <ProgressBar
                        label="Argument Quality"
                        value={78}
                    />

                    <ProgressBar
                        label="Evidence Usage"
                        value={72}
                    />

                    <ProgressBar
                        label="Logical Consistency"
                        value={76}
                    />

                    <ProgressBar
                        label="Rebuttal Effectiveness"
                        value={70}
                    />

                    <ProgressBar
                        label="Communication"
                        value={82}
                    />

                </section>

            </div>


            <div className="learner-dashboard-bottom-grid">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>
                            Recent Activity
                        </h3>

                        <button
                            className="dashboard-link"
                            onClick={() =>
                                navigate("/history")
                            }
                            type="button"
                        >
                            View All
                        </button>

                    </div>


                    <ActivityItem
                        icon="✓"
                        title="Debate completed"
                        description="Review your latest debate performance."
                    />

                    <ActivityItem
                        icon="◉"
                        title="AI analysis completed"
                        description="Your argument received new feedback."
                    />

                    <ActivityItem
                        icon="△"
                        title="Fallacy analysis available"
                        description="Review logical issues detected by Cortexa."
                    />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>
                            Your Goals
                        </h3>

                        <button
                            className="dashboard-link"
                            type="button"
                        >
                            Edit Goals
                        </button>

                    </div>


                    <ProgressBar
                        label="Improve Argument Quality"
                        value={75}
                    />

                    <ProgressBar
                        label="Stronger Rebuttals"
                        value={60}
                    />

                    <ProgressBar
                        label="Use Better Evidence"
                        value={55}
                    />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>
                            Recommended For You
                        </h3>

                        <button
                            className="dashboard-link"
                            onClick={() =>
                                navigate("/recommendations")
                            }
                            type="button"
                        >
                            View All
                        </button>

                    </div>


                    <RecommendationItem
                        icon="🎯"
                        title="Practice: Counterargument Drills"
                        description="Sharpen your rebuttal skills."
                        onClick={() =>
                            navigate("/session")
                        }
                    />

                    <RecommendationItem
                        icon="△"
                        title="Logical Fallacies"
                        description="Improve logical consistency."
                        onClick={() =>
                            navigate("/fallacy-detector")
                        }
                    />

                    <RecommendationItem
                        icon="🎤"
                        title="AI Debate Practice"
                        description="Practice thinking on your feet."
                        onClick={() =>
                            navigate("/session")
                        }
                    />

                </section>

            </div>

        </>

    );

}

export default LearnerDashboard;