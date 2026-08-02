import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../ui/StatCard";
import { getAllUsers } from "../../services/adminService";


function SystemStatus({ label, value, status = "success" }) {

    return (
        <div className="system-status-row">

            <span>{label}</span>

            <strong className={`system-${status}`}>
                {value}
            </strong>

        </div>
    );
}


function AdminDashboard() {

    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        async function loadUsers() {

            try {
                const data = await getAllUsers();
                setUsers(data);
            }
            catch (err) {
                console.error(err);
            }

        }

        loadUsers();

    }, []);


    const learners = users.filter(
        user => user.role?.toLowerCase() === "learner"
    ).length;

    const coaches = users.filter(
        user => user.role?.toLowerCase() === "coach"
    ).length;

    const educators = users.filter(
        user => user.role?.toLowerCase() === "educator"
    ).length;


    return (
        <>

            <div className="dashboard-header">

                <h1>Admin Dashboard</h1>

                <p>
                    Overview of platform operations and performance.
                </p>

            </div>


            <div className="admin-stats-grid">

                <StatCard
                    title="Total Users"
                    value={users.length}
                    icon="♙"
                    trend="12.4%"
                    subtitle="vs last week"
                />

                <StatCard
                    title="Learners"
                    value={learners}
                    icon="♜"
                    trend="10.2%"
                    subtitle="vs last week"
                />

                <StatCard
                    title="Coaches"
                    value={coaches}
                    icon="♙"
                    trend="8.7%"
                    subtitle="vs last week"
                />

                <StatCard
                    title="Educators"
                    value={educators}
                    icon="♛"
                    trend="6.1%"
                    subtitle="vs last week"
                />

                <StatCard
                    title="Debates Conducted"
                    value="126"
                    icon="▥"
                    trend="14.8%"
                    subtitle="vs last week"
                />

                <StatCard
                    title="Avg. Platform Score"
                    value="74.6"
                    icon="◎"
                    trend="5.3"
                    subtitle="vs last week"
                />

            </div>


            <div className="role-dashboard-grid admin-main-grid">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>User Growth</h3>

                        <span className="dashboard-small-label">
                            This Month
                        </span>

                    </div>

                    <div className="mini-performance-chart admin-chart">

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
                                points="0,55 20,45 40,39 60,32 80,25 100,20"
                            />

                            <polyline
                                className="chart-blue"
                                points="0,72 20,65 40,58 60,52 80,45 100,40"
                            />

                            <polyline
                                className="chart-green"
                                points="0,86 20,82 40,78 60,74 80,68 100,64"
                            />

                            <polyline
                                className="chart-orange"
                                points="0,94 20,91 40,89 60,87 80,85 100,83"
                            />

                        </svg>

                    </div>

                    <div className="chart-legend">
                        <span>● Learners</span>
                        <span>● Coaches</span>
                        <span>● Educators</span>
                        <span>● Admins</span>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Platform Overview</h3>
                    </div>

                    <SystemStatus
                        label="Active Sessions"
                        value="48"
                    />

                    <SystemStatus
                        label="Pending Evaluations"
                        value="12"
                        status="warning"
                    />

                    <SystemStatus
                        label="AI Analyses Completed"
                        value="108"
                    />

                    <SystemStatus
                        label="System Uptime"
                        value="99.8%"
                    />

                    <SystemStatus
                        label="API Status"
                        value="Operational"
                    />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>User Role Distribution</h3>
                    </div>

                    <div className="distribution-wrapper">

                        <div className="distribution-circle admin-distribution">

                            <div>
                                <strong>{users.length}</strong>
                                <span>Total Users</span>
                            </div>

                        </div>

                        <div className="distribution-legend">

                            <span>
                                <i className="legend-purple" />
                                Learners ({learners})
                            </span>

                            <span>
                                <i className="legend-blue" />
                                Coaches ({coaches})
                            </span>

                            <span>
                                <i className="legend-green" />
                                Educators ({educators})
                            </span>

                        </div>

                    </div>

                </section>

            </div>


            <div className="role-dashboard-grid role-dashboard-grid-three">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Recent System Activities</h3>

                        <button
                            className="dashboard-link"
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="role-activity-row">
                        <span className="activity-status success">♙</span>

                        <div>
                            <strong>New user registered</strong>
                            <p>New learner account created</p>
                        </div>
                    </div>

                    <div className="role-activity-row">
                        <span className="activity-status purple">▣</span>

                        <div>
                            <strong>Debate session created</strong>
                            <p>Policy Debate</p>
                        </div>
                    </div>

                    <div className="role-activity-row">
                        <span className="activity-status warning">◉</span>

                        <div>
                            <strong>AI model used</strong>
                            <p>Argument analysis completed</p>
                        </div>
                    </div>

                    <div className="role-activity-row">
                        <span className="activity-status info">☁</span>

                        <div>
                            <strong>System backup completed</strong>
                            <p>Platform data secured</p>
                        </div>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>System Health</h3>
                    </div>

                    <SystemStatus
                        label="Web Server"
                        value="● Operational"
                    />

                    <SystemStatus
                        label="PostgreSQL Database"
                        value="● Operational"
                    />

                    <SystemStatus
                        label="AI Services"
                        value="● Operational"
                    />

                    <SystemStatus
                        label="MongoDB Storage"
                        value="● Operational"
                    />

                    <SystemStatus
                        label="FastAPI Backend"
                        value="● Operational"
                    />

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>AI Service Usage</h3>
                    </div>

                    <div className="role-progress-row">

                        <div className="role-progress-heading">
                            <span>Argument Analysis</span>
                            <strong>78%</strong>
                        </div>

                        <div className="role-progress-track">
                            <div
                                className="role-progress-fill"
                                style={{ width: "78%" }}
                            />
                        </div>

                    </div>

                    <div className="role-progress-row">

                        <div className="role-progress-heading">
                            <span>Fallacy Detection</span>
                            <strong>63%</strong>
                        </div>

                        <div className="role-progress-track">
                            <div
                                className="role-progress-fill"
                                style={{ width: "63%" }}
                            />
                        </div>

                    </div>

                    <div className="role-progress-row">

                        <div className="role-progress-heading">
                            <span>Debate AI</span>
                            <strong>71%</strong>
                        </div>

                        <div className="role-progress-track">
                            <div
                                className="role-progress-fill"
                                style={{ width: "71%" }}
                            />
                        </div>

                    </div>

                    <div className="role-progress-row">

                        <div className="role-progress-heading">
                            <span>Recommendations</span>
                            <strong>68%</strong>
                        </div>

                        <div className="role-progress-track">
                            <div
                                className="role-progress-fill"
                                style={{ width: "68%" }}
                            />
                        </div>

                    </div>

                </section>

            </div>


            <div className="role-dashboard-grid role-dashboard-grid-three">

                <section className="dashboard-card">

                    <div className="dashboard-card-header">

                        <h3>Top Active Debates</h3>

                        <button
                            className="dashboard-link"
                            onClick={() => navigate("/sessions")}
                            type="button"
                        >
                            View All
                        </button>

                    </div>

                    <div className="admin-debate-row">
                        <span>Should social media be regulated?</span>
                        <strong>28</strong>
                    </div>

                    <div className="admin-debate-row">
                        <span>Will AI benefit humanity?</span>
                        <strong>24</strong>
                    </div>

                    <div className="admin-debate-row">
                        <span>Renewable energy transition</span>
                        <strong>19</strong>
                    </div>

                    <div className="admin-debate-row">
                        <span>Online education vs classrooms</span>
                        <strong>17</strong>
                    </div>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Platform Storage</h3>
                    </div>

                    <div className="storage-number">
                        <strong>412 MB</strong>
                        <span>of 1 GB used</span>
                    </div>

                    <div className="role-progress-track storage-track">

                        <div
                            className="role-progress-fill"
                            style={{ width: "41%" }}
                        />

                    </div>

                    <p className="storage-description">
                        Transcript data, user records and AI analysis
                        results.
                    </p>

                </section>


                <section className="dashboard-card">

                    <div className="dashboard-card-header">
                        <h3>Recent Alerts</h3>
                    </div>

                    <div className="admin-alert">
                        <span>△</span>

                        <div>
                            <strong>Pending evaluations</strong>
                            <p>12 items require attention.</p>
                        </div>
                    </div>

                    <div className="admin-alert">
                        <span>▣</span>

                        <div>
                            <strong>Storage usage</strong>
                            <p>Database usage remains healthy.</p>
                        </div>
                    </div>

                    <div className="admin-alert">
                        <span>♢</span>

                        <div>
                            <strong>System status</strong>
                            <p>All core services operational.</p>
                        </div>
                    </div>

                </section>

            </div>

        </>
    );
}

export default AdminDashboard;