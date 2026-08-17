import {
    useEffect,
    useState
} from "react";

import {
    FaUsers,
    FaChalkboardTeacher,
    FaMicrophone,
    FaChartBar,
    FaTrophy,
    FaArrowUp,
    FaArrowDown,
    FaExclamationTriangle,
    FaCheckCircle,
    FaBrain,
    FaClock,
    FaBookOpen,
    FaEye
} from "react-icons/fa";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import "../styles/educatorDashboard.css";

import Layout from "../components/Layout";
function EducatorDashboard() {
   
    const navigate = useNavigate();


    const user = JSON.parse(
        localStorage.getItem("user")
    );


    const [
        summary,
        setSummary
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        period,
        setPeriod
    ] = useState("6w");


    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    useEffect(() => {

        loadDashboard();

    }, [period]);


    async function loadDashboard() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/educator/dashboard/summary",
                    {
                        params: {
                            period: period
                        }
                    }
                );


            console.log(
                "EDUCATOR DASHBOARD DATA:",
                response.data
            );


            setSummary(
                response.data
            );

        }

        catch (err) {

            console.error(
                "Failed to load educator dashboard:",
                err
            );


            setError(
                err?.response?.data?.detail ||
                "Unable to load educator dashboard data."
            );

        }

        finally {

            setLoading(false);

        }

    }


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <Layout>

                <div
                    className="educator-dashboard"
                    style={{
                        padding: "40px"
                    }}
                >

                <div
                    className="educator-card"
                    style={{
                        padding: "40px",
                        textAlign: "center"
                    }}
                >

                    <h2>
                        Loading Dashboard...
                    </h2>

                    <p>
                        Fetching your latest educator statistics.
                    </p>

                </div>

            </div>

            </Layout>

        );

    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <Layout>

                <div
                    className="educator-dashboard"
                    style={{
                        padding: "40px"
                    }}
                >

                <div
                    className="educator-card"
                    style={{
                        padding: "30px"
                    }}
                >

                    <h3>
                        Dashboard Error
                    </h3>

                    <p>
                        {error}
                    </p>


                    <button
                        className="small-btn"
                        onClick={
                            loadDashboard
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

            </Layout>

        );

    }


    const distribution =
        summary?.distribution || {};


    const skills =
        summary?.skills || {};


    const classes =
        summary?.classes || [];


    const recentActivities =
        summary?.recent_activities || [];


    const needsReview =
        summary?.needs_review || [];


    const weeklyPerformance =
        summary?.weekly_performance || [];


    const totalDistribution =
        (distribution.excellent || 0) +
        (distribution.good || 0) +
        (distribution.average || 0) +
        (distribution.needs_improvement || 0);


    const weakestSkill =
        summary?.weakest_skill ||
        "No data";


    const weakestSkillScore =
        summary?.weakest_skill_score ||
        0;


    // ========================================================
    // DISTRIBUTION CHART
    // ========================================================

    const excellent =
        distribution.excellent || 0;

    const good =
        distribution.good || 0;

    const average =
        distribution.average || 0;

    const needsImprovement =
        distribution.needs_improvement || 0;


    const excellentPercent =
        totalDistribution
            ? (excellent / totalDistribution) * 100
            : 0;

    const goodPercent =
        totalDistribution
            ? (good / totalDistribution) * 100
            : 0;

    const averagePercent =
        totalDistribution
            ? (average / totalDistribution) * 100
            : 0;


    const excellentEnd =
        excellentPercent;


    const goodEnd =
        excellentEnd + goodPercent;


    const averageEnd =
        goodEnd + averagePercent;


    const donutBackground =
        totalDistribution
            ? `conic-gradient(
                #16a34a 0% ${excellentEnd}%,
                #3b82f6 ${excellentEnd}% ${goodEnd}%,
                #f97316 ${goodEnd}% ${averageEnd}%,
                #ef4444 ${averageEnd}% 100%
            )`
            : "#e5e7eb";


    return (

        <Layout>

            <div
                className="educator-dashboard"
                style={{
                    padding: "32px"
                }}
            >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="educator-header"
                style={{
                    marginBottom: "25px"
                }}
            >

                <div>

                    <h1>
                        Welcome back,{" "}
                        <span
                            style={{
                                color: "#4f46e5"
                            }}
                        >
                            {user?.full_name ||
                                "Educator"}
                        </span>{" "}
                        👋
                    </h1>

                    <p>
                        Monitor your learners,
                        review their performance
                        and help them improve.
                    </p>

                </div>

            </div>


            {/* =================================================
                TOP STATISTICS
            ================================================= */}

            <div
                className="educator-stats-grid"
            >

                {/* TOTAL LEARNERS */}

                <StatCard
                    icon={<FaUsers />}
                    color="purple"
                    title="Total Learners"
                    value={
                        summary?.total_learners ??
                        0
                    }
                    subtitle="Learners in your classes"
                />


                {/* ACTIVE CLASSES */}

                <StatCard
                    icon={
                        <FaChalkboardTeacher />
                    }
                    color="green"
                    title="Active Classes"
                    value={
                        summary?.active_classes ??
                        0
                    }
                    subtitle="Classes managed by you"
                />


                {/* DEBATES */}

                <StatCard
                    icon={<FaMicrophone />}
                    color="blue"
                    title="Debates Conducted"
                    value={
                        summary?.debates_conducted ??
                        0
                    }
                    subtitle={
                        period === "6w"
                            ? "Last 6 weeks"
                            : period === "3m"
                                ? "Last 3 months"
                                : "This year"
                    }
                />


                {/* AVERAGE SCORE */}

                <StatCard
                    icon={<FaChartBar />}
                    color="orange"
                    title="Avg. Class Score"
                    value={
                        `${summary?.average_class_score ?? 0}`
                    }
                    suffix="/100"
                    subtitle="Based on evaluations"
                />


                {/* TOP PERFORMER */}

                <div
                    className="educator-stat-card"
                >

                    <div
                        className="educator-stat-icon trophy"
                    >
                        <FaTrophy />
                    </div>


                    <div>

                        <p>
                            Top Performer
                        </p>

                        <h3>
                            {
                                summary?.top_performer ||
                                "No learner data"
                            }
                        </h3>

                        <strong>

                            {
                                summary?.top_performer_score ??
                                0
                            }

                            /100

                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN DASHBOARD
            ================================================= */}

            <div
                className="educator-main-grid"
            >

                {/* =================================================
                    CLASS PERFORMANCE
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            Class Performance Overview
                        </h3>


                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(
                                    e.target.value
                                )
                            }
                            style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border:
                                    "1px solid #d1d5db"
                            }}
                        >

                            <option value="6w">
                                Last 6 Weeks
                            </option>

                            <option value="3m">
                                Last 3 Months
                            </option>

                            <option value="year">
                                This Year
                            </option>

                        </select>

                    </div>


                    {/* WEEKLY CHART */}

                    {weeklyPerformance.length >
                    0 ? (

                        <div
                            style={{
                                marginTop: "25px"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "flex-end",
                                    gap: "12px",
                                    height: "190px",
                                    padding:
                                        "10px 0"
                                }}
                            >

                                {
                                    weeklyPerformance.map(
                                        (item, index) => {

                                            const height =
                                                Math.max(
                                                    item.score,
                                                    5
                                                );


                                            return (

                                                <div
                                                    key={index}
                                                    style={{
                                                        flex: 1,
                                                        height:
                                                            "100%",
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        justifyContent:
                                                            "flex-end",
                                                        alignItems:
                                                            "center"
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "11px",
                                                            fontWeight:
                                                                "600",
                                                            marginBottom:
                                                                "5px"
                                                        }}
                                                    >
                                                        {
                                                            item.score
                                                        }%
                                                    </span>


                                                    <div
                                                        title={`${item.score}%`}
                                                        style={{
                                                            width:
                                                                "70%",
                                                            height:
                                                                `${height}%`,
                                                            minHeight:
                                                                "8px",
                                                            background:
                                                                "linear-gradient(180deg,#6366f1,#7c3aed)",
                                                            borderRadius:
                                                                "8px 8px 3px 3px",
                                                            transition:
                                                                "height .3s ease"
                                                        }}
                                                    />


                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "10px",
                                                            color:
                                                                "#64748b",
                                                            marginTop:
                                                                "7px"
                                                        }}
                                                    >
                                                        {
                                                            item.label
                                                        }
                                                    </span>

                                                </div>

                                            );

                                        }
                                    )
                                }

                            </div>


                            <p
                                style={{
                                    color:
                                        "#64748b",
                                    marginTop:
                                        "10px"
                                }}
                            >
                                Average learner evaluation
                                score by week.
                            </p>

                        </div>

                    ) : (

                        <EmptyState
                            icon={
                                <FaChartBar
                                    size={35}
                                />
                            }
                            text="No evaluation data available yet."
                        />

                    )}


                    {/* CLASS LIST */}

                    <div
                        style={{
                            marginTop: "25px"
                        }}
                    >

                        <h4>
                            Class-wise Performance
                        </h4>


                        {classes.length === 0 ? (

                            <EmptyState
                                text="No classes created yet."
                            />

                        ) : (

                            <div>

                                {
                                    classes.map(
                                        (classItem) => (

                                            <div
                                                key={
                                                    classItem.id
                                                }
                                                style={{
                                                    marginBottom:
                                                        "15px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        marginBottom:
                                                            "6px"
                                                    }}
                                                >

                                                    <strong>
                                                        {
                                                            classItem.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            classItem.average_score
                                                        }%
                                                    </span>

                                                </div>


                                                <div
                                                    style={{
                                                        height:
                                                            "9px",
                                                        background:
                                                            "#e5e7eb",
                                                        borderRadius:
                                                            "10px",
                                                        overflow:
                                                            "hidden"
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            width:
                                                                `${Math.min(
                                                                    classItem.average_score ||
                                                                    0,
                                                                    100
                                                                )}%`,
                                                            height:
                                                                "100%",
                                                            background:
                                                                "#5b2be0",
                                                            borderRadius:
                                                                "10px"
                                                        }}
                                                    />

                                                </div>


                                                <small
                                                    style={{
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >
                                                    {
                                                        classItem.learner_count
                                                    }{" "}
                                                    learners •{" "}
                                                    {
                                                        classItem.evaluation_count
                                                    }{" "}
                                                    evaluations
                                                </small>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    RECENT ACTIVITIES
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            Recent Activities
                        </h3>

                    </div>


                    {
                        recentActivities.length === 0 ? (

                            <EmptyState
                                icon={
                                    <FaClock
                                        size={30}
                                    />
                                }
                                text="No recent evaluations available."
                            />

                        ) : (

                            <div>

                                {
                                    recentActivities.map(
                                        (
                                            activity,
                                            index
                                        ) => (

                                            <div
                                                key={index}
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "12px",
                                                    padding:
                                                        "14px 0",
                                                    borderBottom:
                                                        "1px solid #eef2f7"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            "40px",
                                                        height:
                                                            "40px",
                                                        borderRadius:
                                                            "50%",
                                                        background:
                                                            "#eef2ff",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        color:
                                                            "#4f46e5",
                                                        flexShrink:
                                                            0
                                                    }}
                                                >

                                                    <FaMicrophone />

                                                </div>


                                                <div
                                                    style={{
                                                        minWidth:
                                                            0
                                                    }}
                                                >

                                                    <strong>
                                                        {
                                                            activity.learner_name
                                                        }
                                                    </strong>


                                                    <p
                                                        style={{
                                                            margin:
                                                                "3px 0",
                                                            fontSize:
                                                                "13px",
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Evaluation:
                                                        {" "}
                                                        {
                                                            activity.topic
                                                        }
                                                    </p>


                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        Score:{" "}
                                                        {
                                                            activity.score
                                                        }/100
                                                        {" • "}
                                                        {
                                                            activity.grade
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )
                    }

                </div>


                {/* =================================================
                    PERFORMANCE DISTRIBUTION
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            Learner Performance Distribution
                        </h3>

                    </div>


                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            gap:
                                "35px",
                            flexWrap:
                                "wrap",
                            marginTop:
                                "20px"
                        }}
                    >

                        <div
                            style={{
                                width:
                                    "180px",
                                height:
                                    "180px",
                                borderRadius:
                                    "50%",
                                background:
                                    donutBackground,
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                position:
                                    "relative"
                            }}
                        >

                            <div
                                style={{
                                    width:
                                        "105px",
                                    height:
                                        "105px",
                                    background:
                                        "white",
                                    borderRadius:
                                        "50%",
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    fontWeight:
                                        "700"
                                }}
                            >

                                <span
                                    style={{
                                        fontSize:
                                            "28px"
                                    }}
                                >
                                    {
                                        totalDistribution
                                    }
                                </span>

                                <small>
                                    Learners
                                </small>

                            </div>

                        </div>


                        <div
                            style={{
                                minWidth:
                                    "190px"
                            }}
                        >

                            <DistributionItem
                                label="Excellent"
                                count={
                                    excellent
                                }
                                color="#16a34a"
                            />

                            <DistributionItem
                                label="Good"
                                count={
                                    good
                                }
                                color="#3b82f6"
                            />

                            <DistributionItem
                                label="Average"
                                count={
                                    average
                                }
                                color="#f97316"
                            />

                            <DistributionItem
                                label="Needs Improvement"
                                count={
                                    needsImprovement
                                }
                                color="#ef4444"
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                LOWER DASHBOARD
            ================================================= */}

            <div
                className="educator-lower-grid"
            >

                {/* =================================================
                    MY CLASSES
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            My Classes
                        </h3>

                        <button
                            className="small-btn"
                            onClick={() =>
                                navigate(
                                    "/educator/classes"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {classes.length === 0 ? (

                        <EmptyState
                            icon={
                                <FaChalkboardTeacher
                                    size={30}
                                />
                            }
                            text="No classes created yet."
                        />

                    ) : (

                        <div>

                            {
                                classes.slice(
                                    0,
                                    4
                                ).map(
                                    (classItem) => (

                                        <div
                                            key={
                                                classItem.id
                                            }
                                            style={{
                                                padding:
                                                    "13px 0",
                                                borderBottom:
                                                    "1px solid #eef2f7"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between"
                                                }}
                                            >

                                                <strong>
                                                    {
                                                        classItem.name
                                                    }
                                                </strong>

                                                <span
                                                    style={{
                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >
                                                    {
                                                        classItem.average_score
                                                    }%
                                                </span>

                                            </div>


                                            <small
                                                style={{
                                                    color:
                                                        "#64748b"
                                                }}
                                            >
                                                {
                                                    classItem.learner_count
                                                }{" "}
                                                learners
                                            </small>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    )}

                </div>


                {/* =================================================
                    UPCOMING SESSIONS
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            Upcoming Sessions
                        </h3>

                    </div>


                    <EmptyState
                        icon={
                            <FaClock
                                size={30}
                            />
                        }
                        text="No scheduled sessions available."
                        subtext="Session scheduling can be connected when scheduled debate sessions are added."
                    />

                </div>


                {/* =================================================
                    NEEDS REVIEW
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <div
                        className="card-header"
                    >

                        <h3>
                            Needs Your Review
                        </h3>

                    </div>


                    {needsReview.length === 0 ? (

                        <EmptyState
                            icon={
                                <FaCheckCircle
                                    size={30}
                                />
                            }
                            text="No low-scoring evaluations need attention."
                        />

                    ) : (

                        <div>

                            {
                                needsReview.map(
                                    (item) => (

                                        <div
                                            key={
                                                item.evaluation_id
                                            }
                                            style={{
                                                padding:
                                                    "13px 0",
                                                borderBottom:
                                                    "1px solid #eef2f7"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap:
                                                        "10px"
                                                }}
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            item.learner_name
                                                        }
                                                    </strong>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "4px 0",
                                                            fontSize:
                                                                "13px",
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        {
                                                            item.topic
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    style={{
                                                        color:
                                                            "#dc2626",
                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >
                                                    {
                                                        item.score
                                                    }%
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                BOTTOM DASHBOARD
            ================================================= */}

            <div
                className="educator-bottom-grid"
            >

                {/* =================================================
                    SKILL GAP SUMMARY
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <h3>
                        Skill Gap Summary
                    </h3>


                    <p
                        style={{
                            color:
                                "#64748b",
                            fontSize:
                                "14px"
                        }}
                    >
                        Average performance across
                        learner evaluations.
                    </p>


                    <SkillBar
                        title="Grammar"
                        value={
                            skills.grammar || 0
                        }
                    />


                    <SkillBar
                        title="Logic"
                        value={
                            skills.logic || 0
                        }
                    />


                    <SkillBar
                        title="Confidence"
                        value={
                            skills.confidence || 0
                        }
                    />


                    <SkillBar
                        title="Relevance"
                        value={
                            skills.relevance || 0
                        }
                    />

                </div>


                {/* =================================================
                    TOP IMPROVEMENT
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <h3>
                        Top Improvement Area
                    </h3>


                    <div
                        style={{
                            marginTop:
                                "20px",
                            padding:
                                "20px",
                            background:
                                "#fff7ed",
                            borderRadius:
                                "14px"
                        }}
                    >

                        <FaExclamationTriangle
                            size={28}
                            style={{
                                marginBottom:
                                    "10px"
                            }}
                        />


                        <h2>
                            {
                                weakestSkill
                            }
                        </h2>


                        <p>
                            Current average:
                            {" "}
                            <strong>
                                {
                                    weakestSkillScore
                                }%
                            </strong>
                        </p>


                        <small
                            style={{
                                color:
                                    "#64748b"
                            }}
                        >
                            This is the weakest
                            skill across the selected
                            evaluation period.
                        </small>

                    </div>

                </div>


                {/* =================================================
                    DASHBOARD INSIGHTS
                ================================================= */}

                <div
                    className="educator-card"
                    style={{
                        padding: "25px"
                    }}
                >

                    <h3>
                        Dashboard Insights
                    </h3>


                    <div
                        style={{
                            marginTop:
                                "15px"
                        }}
                    >

                        <InsightRow
                            icon={
                                <FaUsers />
                            }
                            title="Learners"
                            value={
                                summary?.total_learners ??
                                0
                            }
                            text="assigned to your classes"
                        />


                        <InsightRow
                            icon={
                                <FaBookOpen />
                            }
                            title="Topics"
                            value={
                                summary?.topics_covered ??
                                0
                            }
                            text="debate topics evaluated"
                        />


                        <InsightRow
                            icon={
                                <FaMicrophone />
                            }
                            title="Evaluations"
                            value={
                                summary?.debates_conducted ??
                                0
                            }
                            text="in selected period"
                        />


                        <InsightRow
                            icon={
                                <FaTrophy />
                            }
                            title="Top Score"
                            value={
                                `${summary?.top_performer_score ?? 0}%`
                            }
                            text={
                                summary?.top_performer ||
                                "No data"
                            }
                        />

                    </div>

                </div>

            </div>

        </div>

        </Layout>

    );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    icon,
    color,
    title,
    value,
    suffix,
    subtitle
}) {

    return (

        <div
            className="educator-stat-card"
        >

            <div
                className={
                    `educator-stat-icon ${color}`
                }
            >
                {icon}
            </div>


            <div>

                <p>
                    {title}
                </p>


                <h2>

                    {value}

                    {suffix && (

                        <small>
                            {suffix}
                        </small>

                    )}

                </h2>


                <span
                    className="stat-link"
                >
                    {subtitle}
                </span>

            </div>

        </div>

    );

}


// ============================================================
// DISTRIBUTION ITEM
// ============================================================

function DistributionItem({
    label,
    count,
    color
}) {

    return (

        <p
            style={{
                display:
                    "flex",
                alignItems:
                    "center",
                justifyContent:
                    "space-between",
                gap:
                    "15px",
                margin:
                    "12px 0"
            }}
        >

            <span
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "8px"
                }}
            >

                <span
                    style={{
                        width:
                            "10px",
                        height:
                            "10px",
                        borderRadius:
                            "50%",
                        background:
                            color
                    }}
                />

                {label}

            </span>


            <strong>
                {count}
            </strong>

        </p>

    );

}


// ============================================================
// SKILL BAR
// ============================================================

function SkillBar({
    title,
    value
}) {

    const safeValue =
        Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            100
        );


    return (

        <div
            style={{
                marginBottom:
                    "18px"
            }}
        >

            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    marginBottom:
                        "7px"
                }}
            >

                <strong>
                    {title}
                </strong>


                <span>
                    {safeValue}%
                </span>

            </div>


            <div
                style={{
                    width:
                        "100%",
                    height:
                        "9px",
                    background:
                        "#e5e7eb",
                    borderRadius:
                        "10px",
                    overflow:
                        "hidden"
                }}
            >

                <div
                    style={{
                        width:
                            `${safeValue}%`,
                        height:
                            "100%",
                        background:
                            "#5b2be0",
                        borderRadius:
                            "10px"
                    }}
                />

            </div>

        </div>

    );

}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
    icon,
    text,
    subtext
}) {

    return (

        <div
            style={{
                padding:
                    "35px 15px",
                textAlign:
                    "center",
                color:
                    "#94a3b8"
            }}
        >

            {icon && (

                <div
                    style={{
                        marginBottom:
                            "12px"
                    }}
                >
                    {icon}
                </div>

            )}


            <p
                style={{
                    fontWeight:
                        "600"
                }}
            >
                {text}
            </p>


            {subtext && (

                <small>
                    {subtext}
                </small>

            )}

        </div>

    );

}


// ============================================================
// INSIGHT ROW
// ============================================================

function InsightRow({
    icon,
    title,
    value,
    text
}) {

    return (

        <div
            style={{
                display:
                    "flex",
                alignItems:
                    "center",
                gap:
                    "12px",
                padding:
                    "12px 0",
                borderBottom:
                    "1px solid #eef2f7"
            }}
        >

            <div
                style={{
                    width:
                        "38px",
                    height:
                        "38px",
                    borderRadius:
                        "10px",
                    background:
                        "#eef2ff",
                    color:
                        "#4f46e5",
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center"
                }}
            >
                {icon}
            </div>


            <div
                style={{
                    flex:
                        1
                }}
            >

                <strong>
                    {title}
                </strong>

                <div
                    style={{
                        fontSize:
                            "13px",
                        color:
                            "#64748b"
                    }}
                >
                    {text}
                </div>

            </div>


            <strong>
                {value}
            </strong>

        </div>

    );

}


export default EducatorDashboard;