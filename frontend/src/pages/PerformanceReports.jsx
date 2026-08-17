import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

import {
    FaArrowLeft,
    FaChartLine,
    FaUsers,
    FaTrophy,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaChalkboardTeacher
} from "react-icons/fa";

function PerformanceReports() {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [period, setPeriod] = useState("6w");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8000/educator/dashboard/summary?period=${period}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {

                const errorData =
                    await response.json()
                        .catch(() => ({}));

                throw new Error(
                    errorData.detail ||
                    "Unable to load performance reports."
                );
            }

            const result =
                await response.json();

            setData(result);

        } catch (err) {

            console.error(
                "Performance Reports Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load performance reports."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadReports();

    }, [period]);


    if (loading) {

        return (
            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading performance reports...
                    </h2>

                </div>

            </Layout>
        );

    }


    if (error) {

        return (
            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            padding: "25px",
                            borderRadius: "15px"
                        }}
                    >

                        <h2>
                            Performance Reports Error
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadReports}
                            style={{
                                background: "#5b21b6",
                                color: "white",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </Layout>
        );

    }


    if (!data) {

        return (
            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >
                    No performance data available.
                </div>

            </Layout>
        );

    }


    const learners =
        data.learners ||
        data.learner_performance ||
        [];

    const classes =
        data.classes || [];

    const skills =
        data.skills || {};

    const needsReview =
        data.needs_review || [];

    const weekly =
        data.weekly_performance || [];


    return (

        <Layout>

            <div
                style={{
                    padding: "32px",
                    maxWidth: "1500px",
                    margin: "0 auto"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}
                >

                    <div>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#5b21b6",
                                cursor: "pointer",
                                fontWeight: "600",
                                marginBottom: "10px"
                            }}
                        >

                            <FaArrowLeft />
                            {" "}Back to Dashboard

                        </button>

                        <h1
                            style={{
                                margin: "0 0 8px 0"
                            }}
                        >
                            Performance Reports
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                margin: 0
                            }}
                        >
                            Analyze learner and class
                            performance.
                        </p>

                    </div>


                    {/* PERIOD */}

                    <select
                        value={period}
                        onChange={(e) =>
                            setPeriod(e.target.value)
                        }
                        style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            background: "white",
                            fontSize: "15px",
                            cursor: "pointer"
                        }}
                    >

                        <option value="1w">
                            Last 1 Week
                        </option>

                        <option value="4w">
                            Last 4 Weeks
                        </option>

                        <option value="6w">
                            Last 6 Weeks
                        </option>

                        <option value="3m">
                            Last 3 Months
                        </option>

                        <option value="year">
                            Last 1 Year
                        </option>

                    </select>

                </div>


                {/* SUMMARY CARDS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <SummaryCard
                        icon={<FaUsers />}
                        title="Total Learners"
                        value={
                            data.total_learners || 0
                        }
                    />

                    <SummaryCard
                        icon={<FaChalkboardTeacher />}
                        title="Active Classes"
                        value={
                            data.active_classes || 0
                        }
                    />

                    <SummaryCard
                        icon={<FaClipboardCheck />}
                        title="Evaluations"
                        value={
                            data.debates_conducted || 0
                        }
                    />

                    <SummaryCard
                        icon={<FaChartLine />}
                        title="Average Score"
                        value={
                            `${data.average_class_score || 0}%`
                        }
                    />

                    <SummaryCard
                        icon={<FaTrophy />}
                        title="Top Performer"
                        value={
                            data.top_performer || "No data"
                        }
                        subtitle={
                            `${data.top_performer_score || 0}%`
                        }
                    />

                </div>


                {/* CLASS PERFORMANCE */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        <FaChalkboardTeacher />
                        {" "}Class Performance
                    </h2>

                    {classes.length === 0 ? (

                        <p
                            style={{
                                color: "#64748b"
                            }}
                        >
                            No class performance data
                            available.
                        </p>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px"
                            }}
                        >

                            {classes.map((classItem) => (

                                <div
                                    key={classItem.id}
                                    style={{
                                        border:
                                            "1px solid #e2e8f0",
                                        borderRadius: "14px",
                                        padding: "20px"
                                    }}
                                >

                                    <h3>
                                        {classItem.name}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#64748b"
                                        }}
                                    >
                                        {classItem.description ||
                                            "No description"}
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            marginTop: "15px"
                                        }}
                                    >

                                        <span>
                                            Learners
                                        </span>

                                        <strong>
                                            {
                                                classItem.learner_count ||
                                                0
                                            }
                                        </strong>

                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            marginTop: "10px"
                                        }}
                                    >

                                        <span>
                                            Evaluations
                                        </span>

                                        <strong>
                                            {
                                                classItem.evaluation_count ||
                                                0
                                            }
                                        </strong>

                                    </div>

                                    <div
                                        style={{
                                            marginTop: "15px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                marginBottom: "7px"
                                            }}
                                        >

                                            <strong>
                                                Average Score
                                            </strong>

                                            <strong>
                                                {
                                                    classItem.average_score ||
                                                    0
                                                }%
                                            </strong>

                                        </div>

                                        <ProgressBar
                                            value={
                                                classItem.average_score ||
                                                0
                                            }
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* SKILL PERFORMANCE */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        <FaChartLine />
                        {" "}Skill Performance
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gap: "22px",
                            marginTop: "20px"
                        }}
                    >

                        <Skill
                            name="Grammar"
                            value={skills.grammar}
                        />

                        <Skill
                            name="Logic"
                            value={skills.logic}
                        />

                        <Skill
                            name="Confidence"
                            value={skills.confidence}
                        />

                        <Skill
                            name="Relevance"
                            value={skills.relevance}
                        />

                    </div>

                </div>


                {/* LEARNER PERFORMANCE */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        <FaUsers />
                        {" "}Learner Performance
                    </h2>

                    {learners.length === 0 ? (

                        <p
                            style={{
                                color: "#64748b"
                            }}
                        >
                            No learner performance
                            data available.
                        </p>

                    ) : (

                        <div
                            style={{
                                overflowX: "auto"
                            }}
                        >

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                    marginTop: "15px"
                                }}
                            >

                                <thead>

                                    <tr
                                        style={{
                                            background:
                                                "#f8fafc"
                                        }}
                                    >

                                        <th style={thStyle}>
                                            Learner
                                        </th>

                                        <th style={thStyle}>
                                            Email
                                        </th>

                                        <th style={thStyle}>
                                            Evaluations
                                        </th>

                                        <th style={thStyle}>
                                            Average Score
                                        </th>

                                        <th style={thStyle}>
                                            Performance
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {learners
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                (b.average_score || 0) -
                                                (a.average_score || 0)
                                        )
                                        .map((learner) => {

                                            const score =
                                                learner.average_score ||
                                                0;

                                            return (

                                                <tr
                                                    key={
                                                        learner.id
                                                    }
                                                >

                                                    <td
                                                        style={tdStyle}
                                                    >
                                                        <strong>
                                                            {
                                                                learner.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td
                                                        style={tdStyle}
                                                    >
                                                        {
                                                            learner.email
                                                        }
                                                    </td>

                                                    <td
                                                        style={tdStyle}
                                                    >
                                                        {
                                                            learner.evaluation_count ||
                                                            0
                                                        }
                                                    </td>

                                                    <td
                                                        style={tdStyle}
                                                    >
                                                        <strong>
                                                            {score}%
                                                        </strong>
                                                    </td>

                                                    <td
                                                        style={tdStyle}
                                                    >

                                                        <span
                                                            style={{
                                                                ...badgeStyle,
                                                                background:
                                                                    score >= 80
                                                                        ? "#dcfce7"
                                                                        : score >= 60
                                                                            ? "#fef3c7"
                                                                            : "#fee2e2",
                                                                color:
                                                                    score >= 80
                                                                        ? "#166534"
                                                                        : score >= 60
                                                                            ? "#92400e"
                                                                            : "#b91c1c"
                                                            }}
                                                        >
                                                            {
                                                                score >= 80
                                                                    ? "Excellent"
                                                                    : score >= 60
                                                                        ? "Good"
                                                                        : "Needs Improvement"
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>

                                            );

                                        })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* NEEDS REVIEW */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >

                        <FaExclamationTriangle />

                        Learners Needing Attention

                    </h2>

                    {needsReview.length === 0 ? (

                        <div
                            style={{
                                padding: "20px",
                                background: "#f0fdf4",
                                borderRadius: "12px",
                                color: "#166534"
                            }}
                        >
                            No learners currently
                            require additional review.
                        </div>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gap: "12px"
                            }}
                        >

                            {needsReview.map((item) => (

                                <div
                                    key={
                                        item.evaluation_id
                                    }
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        padding: "16px",
                                        border:
                                            "1px solid #fee2e2",
                                        borderRadius: "12px",
                                        background:
                                            "#fffafa"
                                    }}
                                >

                                    <div>

                                        <strong>
                                            {
                                                item.learner_name
                                            }
                                        </strong>

                                        <div
                                            style={{
                                                color:
                                                    "#64748b",
                                                marginTop:
                                                    "5px"
                                            }}
                                        >
                                            {item.topic}
                                        </div>

                                    </div>

                                    <strong
                                        style={{
                                            color: "#dc2626"
                                        }}
                                    >
                                        {
                                            item.score
                                        }%
                                    </strong>

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* WEEKLY PERFORMANCE */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        <FaChartLine />
                        {" "}Weekly Performance
                    </h2>

                    {weekly.length === 0 ? (

                        <p>
                            No weekly performance
                            data available.
                        </p>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(6, 1fr)",
                                gap: "15px",
                                alignItems: "end",
                                marginTop: "30px"
                            }}
                        >

                            {weekly.map((week, index) => {

                                const score =
                                    week.score || 0;

                                return (

                                    <div
                                        key={index}
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >

                                        <div
                                            style={{
                                                height: "180px",
                                                display: "flex",
                                                alignItems:
                                                    "flex-end",
                                                justifyContent:
                                                    "center"
                                            }}
                                        >

                                            <div
                                                title={`${score}%`}
                                                style={{
                                                    width: "55px",
                                                    height:
                                                        `${Math.max(score, 3)}%`,
                                                    background:
                                                        "#5b2be0",
                                                    borderRadius:
                                                        "8px 8px 0 0",
                                                    minHeight:
                                                        "6px"
                                                }}
                                            />

                                        </div>

                                        <strong>
                                            {score}%
                                        </strong>

                                        <div
                                            style={{
                                                color:
                                                    "#64748b",
                                                fontSize:
                                                    "13px",
                                                marginTop:
                                                    "5px"
                                            }}
                                        >
                                            {
                                                week.label
                                            }
                                        </div>

                                        <div
                                            style={{
                                                color:
                                                    "#94a3b8",
                                                fontSize:
                                                    "12px"
                                            }}
                                        >
                                            {
                                                week.evaluations ||
                                                0
                                            } evaluations
                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </div>


            </div>

        </Layout>

    );

}


/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
    icon,
    title,
    value,
    subtitle
}) {

    return (

        <div
            style={{
                background: "white",
                borderRadius: "16px",
                padding: "22px",
                boxShadow:
                    "0 4px 20px rgba(0,0,0,0.06)"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px"
                }}
            >

                <div
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "12px",
                        background: "#ede9fe",
                        color: "#5b21b6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                    }}
                >
                    {icon}
                </div>

                <div>

                    <p
                        style={{
                            margin: 0,
                            color: "#64748b"
                        }}
                    >
                        {title}
                    </p>

                    <h2
                        style={{
                            margin:
                                "5px 0 0 0"
                        }}
                    >
                        {value}
                    </h2>

                    {subtitle && (

                        <small
                            style={{
                                color: "#64748b"
                            }}
                        >
                            {subtitle}
                        </small>

                    )}

                </div>

            </div>

        </div>

    );

}


/* =========================
   SKILL
========================= */

function Skill({
    name,
    value
}) {

    const score =
        Number(value || 0);

    return (

        <div>

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    marginBottom: "8px"
                }}
            >

                <strong>
                    {name}
                </strong>

                <strong>
                    {score}%
                </strong>

            </div>

            <ProgressBar
                value={score}
            />

        </div>

    );

}


/* =========================
   PROGRESS BAR
========================= */

function ProgressBar({
    value
}) {

    const score = Math.min(
        100,
        Math.max(
            0,
            Number(value || 0)
        )
    );

    return (

        <div
            style={{
                height: "10px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden"
            }}
        >

            <div
                style={{
                    width: `${score}%`,
                    height: "100%",
                    background: "#5b2be0",
                    borderRadius: "20px",
                    transition:
                        "width 0.4s ease"
                }}
            />

        </div>

    );

}


/* =========================
   TABLE STYLES
========================= */

const thStyle = {

    padding: "14px",
    textAlign: "left",
    borderBottom:
        "1px solid #e2e8f0",
    color: "#475569"

};

const tdStyle = {

    padding: "14px",
    borderBottom:
        "1px solid #e2e8f0"

};

const badgeStyle = {

    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"

};


export default PerformanceReports;