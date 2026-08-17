import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    FaArrowLeft,
    FaChartBar,
    FaVideo,
    FaCheckCircle,
    FaExclamationTriangle,
    FaUsers
} from "react-icons/fa";

import {
    getPresentationReviews
} from "../services/presentationService";


function EducatorPresentationReports() {

    const navigate = useNavigate();

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD REPORTS
    // ==========================================

    useEffect(() => {

        loadReports();

    }, []);


    const loadReports = async () => {

        try {

            setLoading(true);

            setError("");

            const result =
                await getPresentationReviews();

            console.log(
                "Presentation reports:",
                result
            );


            if (Array.isArray(result)) {

                setReports(result);

            } else if (
                Array.isArray(result?.reviews)
            ) {

                setReports(result.reviews);

            } else {

                setReports([]);

            }

        } catch (err) {

            console.error(
                "Presentation reports error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load presentation reports."
            );

            setReports([]);

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // SCORE
    // ==========================================

    const getScore = (report) => {

        const value =
            report?.overall ??
            report?.overall_score ??
            report?.overall_percentage ??
            report?.score ??
            report?.percentage ??
            0;

        const number = Number(value) || 0;


        // Presentation overall is stored out of 10

        if (
            number >= 0 &&
            number <= 10
        ) {

            return Math.round(
                number * 10
            );

        }

        return Math.round(number);

    };


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalReports =
        reports.length;


    const averageScore =
        totalReports > 0
            ? Math.round(
                reports.reduce(
                    (sum, report) => {

                        return (
                            sum +
                            getScore(report)
                        );

                    },
                    0
                ) / totalReports
            )
            : 0;


    const strongPresentations =
        reports.filter(
            (report) =>
                getScore(report) >= 80
        ).length;


    const needsImprovement =
        reports.filter(
            (report) =>
                getScore(report) < 60
        ).length;


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading presentation reports...
                    </h2>

                </div>

            </Layout>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <Layout>

            <div
                style={{
                    padding: "32px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >


                {/* =================================
                    HEADER
                ================================= */}

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
                                fontWeight: "600",
                                cursor: "pointer",
                                marginBottom: "10px",
                                fontSize: "16px"
                            }}
                        >

                            <FaArrowLeft />

                            {" "}Back to Dashboard

                        </button>


                        <h1
                            style={{
                                margin: "0 0 8px"
                            }}
                        >
                            Presentation Reports
                        </h1>


                        <p
                            style={{
                                margin: 0,
                                color: "#64748b"
                            }}
                        >
                            Review learner presentation
                            performance and identify
                            areas for improvement.
                        </p>

                    </div>


                    <button
                        onClick={loadReports}
                        style={{
                            border: "none",
                            background: "#5b21b6",
                            color: "white",
                            padding: "12px 20px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "15px"
                        }}
                    >

                        Refresh Reports

                    </button>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            padding: "18px",
                            borderRadius: "12px",
                            marginBottom: "25px"
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* =================================
                    SUMMARY CARDS
                ================================= */}

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
                        icon={<FaVideo />}
                        title="Total Reports"
                        value={totalReports}
                        background="#ede9fe"
                        color="#5b21b6"
                    />


                    <SummaryCard
                        icon={<FaChartBar />}
                        title="Average Score"
                        value={`${averageScore}%`}
                        background="#e0f2fe"
                        color="#0369a1"
                    />


                    <SummaryCard
                        icon={<FaCheckCircle />}
                        title="Strong Presentations"
                        value={strongPresentations}
                        background="#dcfce7"
                        color="#166534"
                    />


                    <SummaryCard
                        icon={
                            <FaExclamationTriangle />
                        }
                        title="Needs Improvement"
                        value={needsImprovement}
                        background="#fee2e2"
                        color="#b91c1c"
                    />

                </div>


                {/* =================================
                    LEARNER REPORTS
                ================================= */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "28px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "20px"
                        }}
                    >

                        <FaUsers />

                        <h2
                            style={{
                                margin: 0
                            }}
                        >
                            Learner Reports
                        </h2>

                    </div>


                    {reports.length === 0 ? (

                        <div
                            style={{
                                textAlign: "center",
                                padding: "50px 20px",
                                color: "#64748b"
                            }}
                        >

                            <FaVideo size={40} />

                            <h3>
                                No presentation
                                reports available
                            </h3>

                            <p>
                                Presentation evaluations
                                will appear here once
                                learners complete
                                presentations.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gap: "15px"
                            }}
                        >

                            {reports.map(
                                (report, index) => {

                                    const score =
                                        getScore(report);


                                    const learnerName =
                                        report?.learner_name ||
                                        report?.user_name ||
                                        report?.student_name ||
                                        report?.name ||
                                        `Learner ${report?.learner_id || ""}`;


                                    const presentation =
                                        report?.presentation ||
                                        "Presentation";


                                    const id =
                                        report?.id ||
                                        report?.review_id;


                                    return (

                                        <div
                                            key={
                                                id ||
                                                index
                                            }
                                            style={{
                                                border:
                                                    "1px solid #e2e8f0",
                                                borderRadius:
                                                    "14px",
                                                padding:
                                                    "20px",
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "20px",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >


                                            {/* LEFT */}

                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth:
                                                        "250px"
                                                }}
                                            >

                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 6px"
                                                    }}
                                                >
                                                    {
                                                        learnerName
                                                    }
                                                </h3>


                                                <p
                                                    style={{
                                                        margin:
                                                            "0 0 8px",
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >

                                                    Presentation

                                                </p>


                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color:
                                                            "#475569",
                                                        maxWidth:
                                                            "700px",
                                                        overflow:
                                                            "hidden",
                                                        display:
                                                            "-webkit-box",
                                                        WebkitLineClamp:
                                                            2,
                                                        WebkitBoxOrient:
                                                            "vertical"
                                                    }}
                                                >

                                                    {
                                                        presentation
                                                    }

                                                </p>

                                            </div>


                                            {/* RIGHT */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "20px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >

                                                    <strong
                                                        style={{
                                                            fontSize:
                                                                "24px"
                                                        }}
                                                    >

                                                        {
                                                            score
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
                                                        Score
                                                    </div>

                                                </div>


                                                {id && (

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/coach/presentation-reviews/${id}`
                                                            )
                                                        }
                                                        style={{
                                                            border:
                                                                "none",
                                                            background:
                                                                "#5b21b6",
                                                            color:
                                                                "white",
                                                            padding:
                                                                "10px 15px",
                                                            borderRadius:
                                                                "9px",
                                                            cursor:
                                                                "pointer",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >

                                                        View

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

        </Layout>

    );

}


// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
    icon,
    title,
    value,
    background,
    color
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
                        background,
                        color,
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
                            margin: "5px 0 0"
                        }}
                    >
                        {value}
                    </h2>

                </div>

            </div>

        </div>

    );

}


export default EducatorPresentationReports;