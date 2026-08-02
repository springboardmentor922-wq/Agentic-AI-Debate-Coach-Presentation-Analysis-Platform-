import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../ui/StatCard";
import { getLearners } from "../../services/adminService";


function ProgressRow({ label, value }) {
    return (
        <div className="role-progress-row">

            <div className="role-progress-heading">
                <span>{label}</span>
                <strong>{value}%</strong>
            </div>

            <div className="role-progress-track">
                <div
                    className="role-progress-fill"
                    style={{ width: `${value}%` }}
                />
            </div>

        </div>
    );
}


function CoachDashboard() {

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        async function loadUsers() {

            try {
                const data = await getLearners();
                setUsers(data);
            }
            catch (err) {
                console.error(err);
            }

        }

        loadUsers();

    }, []);


    return (
        <>

            <div className="dashboard-header">

                <h1>Coach Dashboard</h1>

                <p>
                    Empower learners. Evaluate performance. Build champions.
                </p>

            </div>


            <div className="stats-grid role-stats-grid">

                <StatCard
                    title="Active Learners"
                    value={users.length}
                    icon="♙"
                    trend="8"
                    subtitle="this month"
                />

                <StatCard
                    title="Sessions Today"
                    value="6"
                    icon="▣"
                    subtitle="View schedule"
                />

                <StatCard
                    title="Pending Evaluations"
                    value="12"
                    icon="◷"
                    subtitle="Needs review"
                />

                <StatCard
                    title="Avg. Class Score"
                    value="74.6"
                    icon="↗"
                    trend="6.4"
                    subtitle="vs last month"
                />

                <StatCard
                    title="Top Performer"
                    value="91.2"
                    icon="♜"
                    subtitle="Highest learner score"
                />

            </div>


            <div className="role-dashboard-grid role-dashboard-grid-three">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Recent Learner Activity</h3>

                        <button
                            className="dashboard-link"
                            onClick={() => navigate("/learners")}
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="role-activity-list">

                        <div className="role-activity-row">
                            <span className="activity-status success">✓</span>

                            <div>
                                <strong>Learner completed a debate</strong>
                                <p>AI regulation debate</p>
                            </div>

                            <span className="activity-score">85/100</span>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status warning">◉</span>

                            <div>
                                <strong>Presentation submitted</strong>
                                <p>Renewable Energy</p>
                            </div>

                            <span className="activity-score warning-score">
                                78/100
                            </span>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status purple">✦</span>

                            <div>
                                <strong>AI feedback generated</strong>
                                <p>Focus: Rebuttal effectiveness</p>
                            </div>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status info">▣</span>

                            <div>
                                <strong>New debate session joined</strong>
                                <p>Policy Debate Practice</p>
                            </div>
                        </div>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Evaluation Queue</h3>

                        <button
                            className="dashboard-link"
                            onClick={() => navigate("/evaluation-queue")}
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="evaluation-list">

                        <div className="evaluation-row">
                            <div>
                                <strong>AI Regulation Debate</strong>
                                <p>Debate Evaluation</p>
                            </div>

                            <span className="priority high">
                                High
                            </span>
                        </div>

                        <div className="evaluation-row">
                            <div>
                                <strong>Renewable Energy</strong>
                                <p>Presentation Review</p>
                            </div>

                            <span className="priority medium">
                                Medium
                            </span>
                        </div>

                        <div className="evaluation-row">
                            <div>
                                <strong>Education Reform</strong>
                                <p>Argument Review</p>
                            </div>

                            <span className="priority medium">
                                Medium
                            </span>
                        </div>

                        <div className="evaluation-row">
                            <div>
                                <strong>Space Exploration</strong>
                                <p>Debate Evaluation</p>
                            </div>

                            <span className="priority low">
                                Low
                            </span>
                        </div>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Performance Trends</h3>

                        <span className="dashboard-small-label">
                            Last 6 Weeks
                        </span>

                    </div>

                    <div className="mini-performance-chart">

                        <div className="mini-chart-grid">
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                className="chart-purple"
                                points="0,70 20,57 40,52 60,42 80,25 100,20"
                            />

                            <polyline
                                className="chart-blue"
                                points="0,82 20,70 40,59 60,55 80,43 100,37"
                            />

                            <polyline
                                className="chart-green"
                                points="0,90 20,81 40,70 60,66 80,54 100,50"
                            />
                        </svg>

                    </div>

                    <div className="chart-legend">
                        <span>● Argument Quality</span>
                        <span>● Communication</span>
                        <span>● Logic</span>
                    </div>

                </section>

            </div>


            <div className="role-dashboard-grid role-dashboard-grid-three">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Skill Gap Analysis</h3>
                    </div>

                    <ProgressRow label="Argument Quality" value={68} />
                    <ProgressRow label="Evidence Usage" value={64} />
                    <ProgressRow label="Logical Consistency" value={60} />
                    <ProgressRow label="Rebuttal Effectiveness" value={55} />
                    <ProgressRow label="Communication Skills" value={72} />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Upcoming Coaching Sessions</h3>

                        <button
                            className="dashboard-link"
                            type="button"
                        >
                            View Calendar
                        </button>
                    </div>

                    <div className="schedule-row">
                        <div className="schedule-date">
                            <strong>24</strong>
                            <span>MAY</span>
                        </div>

                        <div>
                            <strong>Policy Debate Coaching</strong>
                            <p>Argument & rebuttal practice</p>
                        </div>

                        <span className="schedule-badge">
                            In 2 hrs
                        </span>
                    </div>

                    <div className="schedule-row">
                        <div className="schedule-date">
                            <strong>25</strong>
                            <span>MAY</span>
                        </div>

                        <div>
                            <strong>Presentation Workshop</strong>
                            <p>Delivery and confidence</p>
                        </div>

                        <span className="schedule-badge green">
                            Tomorrow
                        </span>
                    </div>

                    <div className="schedule-row">
                        <div className="schedule-date">
                            <strong>26</strong>
                            <span>MAY</span>
                        </div>

                        <div>
                            <strong>Rebuttal Strategies</strong>
                            <p>Counterargument training</p>
                        </div>

                        <span className="schedule-badge">
                            In 2 days
                        </span>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>AI Coaching Recommendations</h3>
                    </div>

                    <div className="coach-recommendation">
                        <span>◎</span>
                        <div>
                            <strong>Focus on Rebuttal Effectiveness</strong>
                            <p>
                                Learners need improvement in constructing
                                strong rebuttals.
                            </p>
                        </div>
                    </div>

                    <div className="coach-recommendation">
                        <span>↗</span>
                        <div>
                            <strong>Practice Evidence Integration</strong>
                            <p>
                                Encourage learners to use more data and
                                credible sources.
                            </p>
                        </div>
                    </div>

                    <div className="coach-recommendation">
                        <span>🎤</span>
                        <div>
                            <strong>Improve Speech Pace</strong>
                            <p>
                                Speaking pace varies across recent
                                presentations.
                            </p>
                        </div>
                    </div>

                </section>

            </div>

        </>
    );
}

export default CoachDashboard;