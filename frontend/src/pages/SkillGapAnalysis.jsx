import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

import {
    FaArrowLeft,
    FaBullseye,
    FaExclamationTriangle,
    FaCheckCircle,
    FaChartBar,
    FaUsers
} from "react-icons/fa";

function SkillGapAnalysis() {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [period, setPeriod] = useState("6w");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = async () => {

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

                const result =
                    await response.json()
                        .catch(() => ({}));

                throw new Error(
                    result.detail ||
                    "Unable to load skill gap data."
                );
            }

            const result =
                await response.json();

            setData(result);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load skill gap analysis."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadData();

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
                        Loading skill analysis...
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
                            Unable to load skill analysis
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadData}
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


    const skills = data?.skills || {};

    const skillData = [

        {
            key: "grammar",
            name: "Grammar",
            value: Number(
                skills.grammar || 0
            )
        },

        {
            key: "logic",
            name: "Logic",
            value: Number(
                skills.logic || 0
            )
        },

        {
            key: "confidence",
            name: "Confidence",
            value: Number(
                skills.confidence || 0
            )
        },

        {
            key: "relevance",
            name: "Relevance",
            value: Number(
                skills.relevance || 0
            )
        }

    ];


    const sortedSkills =
        [...skillData].sort(
            (a, b) =>
                a.value - b.value
        );


    const weakest =
        sortedSkills[0];

    const strongest =
        sortedSkills[sortedSkills.length - 1];


    const getLevel = (score) => {

        if (score >= 80) {
            return "Strong";
        }

        if (score >= 60) {
            return "Moderate";
        }

        if (score >= 40) {
            return "Needs Improvement";
        }

        return "Critical";
    };


    const getLevelBackground = (score) => {

        if (score >= 80) {
            return "#dcfce7";
        }

        if (score >= 60) {
            return "#fef3c7";
        }

        return "#fee2e2";
    };


    const getLevelColor = (score) => {

        if (score >= 80) {
            return "#166534";
        }

        if (score >= 60) {
            return "#92400e";
        }

        return "#b91c1c";
    };


    return (

        <Layout>

            <div
                style={{
                    padding: "32px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "15px",
                        marginBottom: "30px"
                    }}
                >

                    <div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            style={{
                                border: "none",
                                background:
                                    "transparent",
                                color: "#5b21b6",
                                fontWeight:
                                    "600",
                                cursor:
                                    "pointer",
                                marginBottom:
                                    "10px"
                            }}
                        >

                            <FaArrowLeft />

                            {" "}Back to Dashboard

                        </button>

                        <h1
                            style={{
                                margin:
                                    "0 0 8px 0"
                            }}
                        >
                            Skill Gap Analysis
                        </h1>

                        <p
                            style={{
                                margin: 0,
                                color:
                                    "#64748b"
                            }}
                        >
                            Identify learner weaknesses
                            and prioritize improvement
                            areas.
                        </p>

                    </div>


                    <select
                        value={period}
                        onChange={(e) =>
                            setPeriod(
                                e.target.value
                            )
                        }
                        style={{
                            padding:
                                "12px 16px",
                            borderRadius:
                                "10px",
                            border:
                                "1px solid #d1d5db",
                            background:
                                "white",
                            fontSize:
                                "15px"
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


                {/* KEY INSIGHTS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <InsightCard
                        icon={<FaExclamationTriangle />}
                        title="Weakest Skill"
                        value={
                            weakest?.name ||
                            "No data"
                        }
                        score={
                            weakest?.value || 0
                        }
                        background="#fee2e2"
                        color="#b91c1c"
                    />

                    <InsightCard
                        icon={<FaCheckCircle />}
                        title="Strongest Skill"
                        value={
                            strongest?.name ||
                            "No data"
                        }
                        score={
                            strongest?.value || 0
                        }
                        background="#dcfce7"
                        color="#166534"
                    />

                    <InsightCard
                        icon={<FaUsers />}
                        title="Learners"
                        value={
                            data?.total_learners ||
                            0
                        }
                        score={null}
                        background="#ede9fe"
                        color="#5b21b6"
                    />

                    <InsightCard
                        icon={<FaChartBar />}
                        title="Class Average"
                        value={`${data?.average_class_score || 0}%`}
                        score={null}
                        background="#e0f2fe"
                        color="#0369a1"
                    />

                </div>


                {/* SKILL OVERVIEW */}

                <div
                    style={{
                        background:
                            "white",
                        borderRadius:
                            "18px",
                        padding:
                            "30px",
                        marginBottom:
                            "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        Skill Overview
                    </h2>

                    <p
                        style={{
                            color:
                                "#64748b",
                            marginBottom:
                                "30px"
                        }}
                    >
                        Average performance of
                        learners across the
                        four evaluated skills.
                    </p>


                    <div
                        style={{
                            display:
                                "grid",
                            gap:
                                "28px"
                        }}
                    >

                        {skillData.map(
                            (skill) => {

                                const score =
                                    skill.value;

                                return (

                                    <div
                                        key={
                                            skill.key
                                        }
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                marginBottom:
                                                    "8px"
                                            }}
                                        >

                                            <strong>
                                                {
                                                    skill.name
                                                }
                                            </strong>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "10px",
                                                    alignItems:
                                                        "center"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        padding:
                                                            "5px 10px",
                                                        borderRadius:
                                                            "20px",
                                                        background:
                                                            getLevelBackground(
                                                                score
                                                            ),
                                                        color:
                                                            getLevelColor(
                                                                score
                                                            ),
                                                        fontSize:
                                                            "12px",
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    {
                                                        getLevel(
                                                            score
                                                        )
                                                    }
                                                </span>

                                                <strong>
                                                    {score}%
                                                </strong>

                                            </div>

                                        </div>


                                        <div
                                            style={{
                                                width:
                                                    "100%",
                                                height:
                                                    "14px",
                                                background:
                                                    "#e5e7eb",
                                                borderRadius:
                                                    "20px",
                                                overflow:
                                                    "hidden"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            100,
                                                            Math.max(
                                                                0,
                                                                score
                                                            )
                                                        )}%`,
                                                    height:
                                                        "100%",
                                                    background:
                                                        score >=
                                                        80
                                                            ? "#16a34a"
                                                            : score >=
                                                              60
                                                            ? "#f59e0b"
                                                            : "#dc2626",
                                                    borderRadius:
                                                        "20px",
                                                    transition:
                                                        "width 0.4s ease"
                                                }}
                                            />

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* GAP ANALYSIS */}

                <div
                    style={{
                        background:
                            "white",
                        borderRadius:
                            "18px",
                        padding:
                            "30px",
                        marginBottom:
                            "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        <FaBullseye />
                        {" "}Priority Improvement Areas
                    </h2>

                    <p
                        style={{
                            color:
                                "#64748b"
                        }}
                    >
                        Skills are ranked from
                        weakest to strongest.
                    </p>


                    <div
                        style={{
                            display:
                                "grid",
                            gap:
                                "15px",
                            marginTop:
                                "20px"
                        }}
                    >

                        {sortedSkills.map(
                            (skill, index) => {

                                const gap =
                                    Math.max(
                                        0,
                                        80 -
                                            skill.value
                                    );

                                return (

                                    <div
                                        key={
                                            skill.key
                                        }
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            padding:
                                                "18px",
                                            border:
                                                "1px solid #e2e8f0",
                                            borderRadius:
                                                "12px",
                                            background:
                                                index === 0
                                                    ? "#fff7ed"
                                                    : "white"
                                        }}
                                    >

                                        <div>

                                            <strong>
                                                #{index + 1}{" "}
                                                {
                                                    skill.name
                                                }
                                            </strong>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0 0",
                                                    color:
                                                        "#64748b"
                                                }}
                                            >
                                                {index === 0
                                                    ? "Highest priority for improvement."
                                                    : "Continue practicing this skill."}
                                            </p>

                                        </div>


                                        <div
                                            style={{
                                                textAlign:
                                                    "right"
                                            }}
                                        >

                                            <strong>
                                                {
                                                    skill.value
                                                }%
                                            </strong>

                                            <div
                                                style={{
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "#64748b"
                                                }}
                                            >
                                                Gap to 80%:
                                                {" "}
                                                {gap}%
                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* RECOMMENDATIONS */}

                <div
                    style={{
                        background:
                            "white",
                        borderRadius:
                            "18px",
                        padding:
                            "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2>
                        Recommended Actions
                    </h2>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                            gap:
                                "20px",
                            marginTop:
                                "20px"
                        }}
                    >

                        <Recommendation
                            skill={
                                weakest?.name
                            }
                            text="Assign targeted practice activities and review learner feedback."
                        />

                        <Recommendation
                            skill="Logic"
                            text="Encourage learners to support claims with evidence and address opposing viewpoints."
                        />

                        <Recommendation
                            skill="Confidence"
                            text="Use repeated speaking practice and structured debate sessions."
                        />

                        <Recommendation
                            skill="Relevance"
                            text="Encourage learners to connect arguments directly to the debate topic."
                        />

                    </div>

                </div>

            </div>

        </Layout>
    );
}


/* =========================
   INSIGHT CARD
========================= */

function InsightCard({
    icon,
    title,
    value,
    score,
    background,
    color
}) {

    return (

        <div
            style={{
                background:
                    "white",
                borderRadius:
                    "16px",
                padding:
                    "22px",
                boxShadow:
                    "0 4px 20px rgba(0,0,0,0.06)"
            }}
        >

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "15px"
                }}
            >

                <div
                    style={{
                        width:
                            "50px",
                        height:
                            "50px",
                        borderRadius:
                            "12px",
                        background,
                        color,
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        fontSize:
                            "20px"
                    }}
                >
                    {icon}
                </div>

                <div>

                    <p
                        style={{
                            margin:
                                0,
                            color:
                                "#64748b"
                        }}
                    >
                        {title}
                    </p>

                    <h2
                        style={{
                            margin:
                                "5px 0"
                        }}
                    >
                        {value}
                    </h2>

                    {score !== null && (
                        <small>
                            {score}%
                        </small>
                    )}

                </div>

            </div>

        </div>
    );
}


/* =========================
   RECOMMENDATION
========================= */

function Recommendation({
    skill,
    text
}) {

    return (

        <div
            style={{
                padding:
                    "20px",
                border:
                    "1px solid #e2e8f0",
                borderRadius:
                    "14px"
            }}
        >

            <h3
                style={{
                    marginTop:
                        0
                }}
            >
                {skill}
            </h3>

            <p
                style={{
                    color:
                        "#64748b",
                    lineHeight:
                        "1.6",
                    marginBottom:
                        0
                }}
            >
                {text}
            </p>

        </div>
    );
}


export default SkillGapAnalysis;