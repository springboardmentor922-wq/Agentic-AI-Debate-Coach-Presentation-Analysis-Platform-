import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../ui/StatCard";
import { getLearners } from "../../services/adminService";


function SkillRow({ label, value }) {

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


function EducatorDashboard() {

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

                <h1>Educator Dashboard</h1>

                <p>
                    Monitor your learners, review performance and guide
                    them to excel.
                </p>

            </div>


            <div className="stats-grid role-stats-grid">

                <StatCard
                    title="Total Learners"
                    value={users.length}
                    icon="♙"
                    trend="12"
                    subtitle="this month"
                />

                <StatCard
                    title="Active Classes"
                    value="8"
                    icon="♜"
                    subtitle="View all classes"
                />

                <StatCard
                    title="Debates Conducted"
                    value="36"
                    icon="◉"
                    trend="8"
                    subtitle="this month"
                />

                <StatCard
                    title="Avg. Class Score"
                    value="72.4"
                    icon="▥"
                    trend="6.5"
                    subtitle="vs last month"
                />

                <StatCard
                    title="Top Performer"
                    value="91.3"
                    icon="♛"
                    subtitle="Highest score"
                />

            </div>


            <div className="role-dashboard-grid educator-main-grid">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Class Performance Overview</h3>

                        <span className="dashboard-small-label">
                            Last 6 Weeks
                        </span>
                    </div>

                    <div className="mini-performance-chart educator-chart">

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
                                points="0,75 20,52 40,48 60,39 80,27 100,22"
                            />

                            <polyline
                                className="chart-green"
                                points="0,88 20,70 40,60 60,52 80,45 100,34"
                            />

                            <polyline
                                className="chart-orange"
                                points="0,96 20,83 40,70 60,61 80,52 100,40"
                            />
                        </svg>

                    </div>

                    <div className="chart-legend">
                        <span>● Argument Quality</span>
                        <span>● Communication</span>
                        <span>● Logical Consistency</span>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Recent Activities</h3>

                        <button
                            className="dashboard-link"
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="role-activity-list">

                        <div className="role-activity-row">
                            <span className="activity-status info">◉</span>
                            <div>
                                <strong>Debate completed</strong>
                                <p>AI should be regulated</p>
                            </div>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status warning">▧</span>
                            <div>
                                <strong>Presentation analyzed</strong>
                                <p>Renewable Energy</p>
                            </div>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status purple">▤</span>
                            <div>
                                <strong>New assignment created</strong>
                                <p>Policy Debate</p>
                            </div>
                        </div>

                        <div className="role-activity-row">
                            <span className="activity-status success">✓</span>
                            <div>
                                <strong>Feedback provided</strong>
                                <p>Multiple learner evaluations</p>
                            </div>
                        </div>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Class Performance Distribution</h3>
                    </div>

                    <div className="distribution-wrapper">

                        <div className="distribution-circle">

                            <div>
                                <strong>{users.length || 128}</strong>
                                <span>Learners</span>
                            </div>

                        </div>

                        <div className="distribution-legend">

                            <span>
                                <i className="legend-green" />
                                Excellent
                            </span>

                            <span>
                                <i className="legend-blue" />
                                Good
                            </span>

                            <span>
                                <i className="legend-orange" />
                                Average
                            </span>

                            <span>
                                <i className="legend-red" />
                                Needs Improvement
                            </span>

                        </div>

                    </div>

                </section>

            </div>


            <div className="role-dashboard-grid educator-secondary-grid">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>My Classes</h3>

                        <button
                            className="dashboard-link"
                            onClick={() => navigate("/classes")}
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="class-table">

                        <div className="class-table-heading">
                            <span>Class</span>
                            <span>Learners</span>
                            <span>Avg. Score</span>
                        </div>

                        <div className="class-table-row">
                            <strong>B.Tech 3rd Year</strong>
                            <span>32</span>
                            <span>76.8</span>
                        </div>

                        <div className="class-table-row">
                            <strong>B.Tech 2nd Year</strong>
                            <span>28</span>
                            <span>69.3</span>
                        </div>

                        <div className="class-table-row">
                            <strong>MBA 1st Year</strong>
                            <span>24</span>
                            <span>71.5</span>
                        </div>

                        <div className="class-table-row">
                            <strong>BBA Final Year</strong>
                            <span>22</span>
                            <span>68.9</span>
                        </div>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Upcoming Sessions</h3>

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
                            <strong>Policy Debate Practice</strong>
                            <p>B.Tech 3rd Year</p>
                        </div>

                        <span className="schedule-badge">
                            In 2 days
                        </span>

                    </div>

                    <div className="schedule-row">

                        <div className="schedule-date">
                            <strong>25</strong>
                            <span>MAY</span>
                        </div>

                        <div>
                            <strong>Oxford Style Debate</strong>
                            <p>MBA 1st Year</p>
                        </div>

                        <span className="schedule-badge">
                            In 3 days
                        </span>

                    </div>

                    <div className="schedule-row">

                        <div className="schedule-date">
                            <strong>26</strong>
                            <span>MAY</span>
                        </div>

                        <div>
                            <strong>Presentation Evaluation</strong>
                            <p>BBA Final Year</p>
                        </div>

                        <span className="schedule-badge">
                            In 4 days
                        </span>

                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Needs Your Review</h3>
                    </div>

                    <button className="review-item" type="button">
                        <span>◉</span>
                        Debate Recordings to Evaluate
                        <strong>6 ›</strong>
                    </button>

                    <button className="review-item" type="button">
                        <span>▧</span>
                        Presentations to Review
                        <strong>4 ›</strong>
                    </button>

                    <button className="review-item" type="button">
                        <span>▤</span>
                        Assignments to Grade
                        <strong>2 ›</strong>
                    </button>

                </section>

            </div>


            <div className="role-dashboard-grid role-dashboard-grid-three">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Skill Gap Summary</h3>
                    </div>

                    <SkillRow label="Argument Quality" value={72} />
                    <SkillRow label="Evidence Usage" value={65} />
                    <SkillRow label="Logical Consistency" value={60} />
                    <SkillRow label="Rebuttal Effectiveness" value={58} />
                    <SkillRow label="Communication Skills" value={75} />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Top Improvement</h3>
                    </div>

                    <div className="improvement-row">
                        <span className="improvement-rank">1</span>
                        <strong>Learner #1</strong>
                        <span className="improvement-score">+18.5</span>
                    </div>

                    <div className="improvement-row">
                        <span className="improvement-rank">2</span>
                        <strong>Learner #2</strong>
                        <span className="improvement-score">+15.2</span>
                    </div>

                    <div className="improvement-row">
                        <span className="improvement-rank">3</span>
                        <strong>Learner #3</strong>
                        <span className="improvement-score">+13.8</span>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Recent Announcements</h3>
                    </div>

                    <div className="announcement-row">
                        <span>◁</span>
                        <div>
                            <strong>New Debate Topic Added</strong>
                            <p>AI regulation discussion</p>
                        </div>
                    </div>

                    <div className="announcement-row">
                        <span>▤</span>
                        <div>
                            <strong>Presentation Rubric Updated</strong>
                            <p>Review the latest evaluation criteria.</p>
                        </div>
                    </div>

                    <div className="announcement-row">
                        <span>▣</span>
                        <div>
                            <strong>Practice Session Reminder</strong>
                            <p>Policy debate practice this week.</p>
                        </div>
                    </div>

                </section>

            </div>

        </>
    );
}

export default EducatorDashboard;