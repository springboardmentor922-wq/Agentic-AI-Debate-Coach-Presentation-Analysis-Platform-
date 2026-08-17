import { useLocation, useNavigate } from "react-router-dom";

import {
    FaAward,
    FaBrain,
    FaCheckCircle,
    FaExclamationTriangle,
    FaLightbulb,
    FaArrowLeft,
    FaChartLine,
} from "react-icons/fa";

import Layout from "../components/Layout";


function AIFeedback() {

    const { state } = useLocation();

    const navigate = useNavigate();


    // --------------------------------------------------
    // NO EVALUATION
    // --------------------------------------------------

    if (!state) {

        return (

            <Layout>

                <div className="dashboard-page">

                    <div className="chart-card">

                        <h2>
                            No AI Evaluation Found
                        </h2>

                        <p>
                            Please complete a debate session first.
                        </p>

                        <button
                            className="btn btn-primary mt-3"
                            onClick={() =>
                                navigate("/topics")
                            }
                        >
                            Go to Debate Topics
                        </button>

                    </div>

                </div>

            </Layout>

        );

    }


    // --------------------------------------------------
    // SAFE DATA
    // --------------------------------------------------

    const data = {

        grammar:
            state.grammar || {
                score: 0,
                percentage: "0%",
                remark: "N/A",
            },

        logic:
            state.logic || {
                score: 0,
                percentage: "0%",
                remark: "N/A",
            },

        confidence:
            state.confidence || {
                score: 0,
                percentage: "0%",
                remark: "N/A",
            },

        relevance:
            state.relevance || {
                score: 0,
                percentage: "0%",
                remark: "N/A",
            },

        overall:
            state.overall || {
                score: "0/40",
                percentage: "0%",
                grade: "N/A",
            },

        feedback:
            state.feedback ||
            "No feedback available.",

        strengths:
            Array.isArray(state.strengths)
                ? state.strengths
                : [],

        weaknesses:
            Array.isArray(state.weaknesses)
                ? state.weaknesses
                : [],

        coach_tips:
            Array.isArray(state.coach_tips)
                ? state.coach_tips
                : [],

        logical_fallacies:
            Array.isArray(state.logical_fallacies)
                ? state.logical_fallacies
                : [],

        counter_arguments:
            Array.isArray(state.counter_arguments)
                ? state.counter_arguments
                : [],

        rebuttals:
            Array.isArray(state.rebuttals)
                ? state.rebuttals
                : [],

        improved_argument:
            state.improved_argument || "",

        opening_statement:
            state.opening_statement || "",

        closing_statement:
            state.closing_statement || "",

        real_world_examples:
            Array.isArray(state.real_world_examples)
                ? state.real_world_examples
                : [],

        statistics:
            Array.isArray(state.statistics)
                ? state.statistics
                : [],

        ai_insights:
            state.ai_insights || {},

    };


    // --------------------------------------------------
    // METRICS
    // --------------------------------------------------

    const metrics = [

        {
            title: "Grammar",
            value: data.grammar.score,
            percentage: data.grammar.percentage,
            remark: data.grammar.remark,
        },

        {
            title: "Logic",
            value: data.logic.score,
            percentage: data.logic.percentage,
            remark: data.logic.remark,
        },

        {
            title: "Confidence",
            value: data.confidence.score,
            percentage: data.confidence.percentage,
            remark: data.confidence.remark,
        },

        {
            title: "Relevance",
            value: data.relevance.score,
            percentage: data.relevance.percentage,
            remark: data.relevance.remark,
        },

    ];


    return (

        <Layout>

            <div className="learner-dashboard">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="hero-card">

                    <div>

                        <h2>
                            AI Debate Evaluation Report
                        </h2>

                        <p>
                            Personalized analysis generated by the AI Debate Coach.
                        </p>

                    </div>

                    <FaBrain size={65} />

                </div>


                {/* ==========================================
                    SKILL SCORES
                ========================================== */}

                <div className="stats-grid">

                    {metrics.map((item) => (

                        <div
                            className="stat-card"
                            key={item.title}
                        >

                            <h4>
                                {item.title}
                            </h4>

                            <h2>
                                {item.value}/10
                            </h2>

                            <p>
                                {item.percentage}
                            </p>

                            <small>
                                {item.remark}
                            </small>

                        </div>

                    ))}

                </div>


                {/* ==========================================
                    OVERALL PERFORMANCE + SUMMARY
                ========================================== */}

                <div className="dashboard-grid">


                    <div className="chart-card">

                        <h3>
                            <FaAward /> Overall Performance
                        </h3>

                        <h1
                            style={{
                                fontSize: "60px",
                                color: "#4F46E5",
                                margin: "20px 0",
                            }}
                        >
                            {data.overall.score}
                        </h1>

                        <h3>
                            {data.overall.percentage}
                        </h3>

                        <h3>
                            Grade: {data.overall.grade}
                        </h3>


                        <div
                            style={{
                                marginTop: "15px",
                                display: "inline-block",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                background: "#EEF2FF",
                                color: "#4338CA",
                                fontWeight: "bold",
                            }}
                        >
                            Performance Level: {data.overall.grade}
                        </div>


                        <br />


                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => window.print()}
                        >
                            Download / Print Report
                        </button>

                    </div>


                    <div className="recommendation-card">

                        <h3>
                            <FaLightbulb /> AI Summary
                        </h3>

                        <p>
                            {data.feedback}
                        </p>

                    </div>

                </div>


                {/* ==========================================
                    STRENGTHS + WEAKNESSES
                ========================================== */}

                <div className="insight-grid">


                    <div className="ai-insights">

                        <h3>
                            <FaCheckCircle /> Strengths
                        </h3>

                        {data.strengths.length === 0 ? (

                            <p>
                                No strengths available.
                            </p>

                        ) : (

                            <ul>

                                {data.strengths.map(
                                    (item, index) => (

                                        <li key={index}>
                                            {item}
                                        </li>

                                    )
                                )}

                            </ul>

                        )}

                    </div>


                    <div className="today-card">

                        <h3>
                            <FaExclamationTriangle />
                            Areas for Improvement
                        </h3>

                        {data.weaknesses.length === 0 ? (

                            <p>
                                No weaknesses identified.
                            </p>

                        ) : (

                            <ul>

                                {data.weaknesses.map(
                                    (item, index) => (

                                        <li key={index}>
                                            {item}
                                        </li>

                                    )
                                )}

                            </ul>

                        )}

                    </div>

                </div>


                {/* ==========================================
                    COACH RECOMMENDATIONS
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        <FaLightbulb /> Coach Recommendations
                    </h3>

                    {data.coach_tips.length === 0 ? (

                        <p>
                            No recommendations available.
                        </p>

                    ) : (

                        <ul>

                            {data.coach_tips.map(
                                (tip, index) => (

                                    <li
                                        key={index}
                                        style={{
                                            marginBottom: "10px",
                                        }}
                                    >
                                        {tip}
                                    </li>

                                )
                            )}

                        </ul>

                    )}

                </div>


                {/* ==========================================
                    AI INSIGHTS
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        <FaChartLine /> AI Insights
                    </h3>


                    <div className="dashboard-grid">


                        <div>

                            <strong>
                                Argument Strength
                            </strong>

                            <p>
                                {data.ai_insights.argument_strength || "N/A"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Critical Thinking
                            </strong>

                            <p>
                                {data.ai_insights.critical_thinking || "N/A"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Persuasiveness
                            </strong>

                            <p>
                                {data.ai_insights.persuasiveness || "N/A"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Communication
                            </strong>

                            <p>
                                {data.ai_insights.communication || "N/A"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Evidence Usage
                            </strong>

                            <p>
                                {data.ai_insights.evidence_usage || "N/A"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Speech Clarity
                            </strong>

                            <p>
                                {data.ai_insights.speech_clarity || "N/A"}
                            </p>

                        </div>

                    </div>


                    <hr />

                    <strong>
                        Overall Comment
                    </strong>

                    <p>
                        {data.ai_insights.overall_comment || "N/A"}
                    </p>

                </div>


                {/* ==========================================
                    LOGICAL FALLACIES
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Logical Fallacies
                    </h3>


                    {data.logical_fallacies.length === 0 ? (

                        <p>
                            No logical fallacies detected.
                        </p>

                    ) : (

                        data.logical_fallacies.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "18px",
                                        marginBottom: "20px",
                                    }}
                                >

                                    <h4>
                                        {item.fallacy || "Logical Fallacy"}
                                    </h4>

                                    <strong>
                                        Description
                                    </strong>

                                    <p>
                                        {item.description || "N/A"}
                                    </p>

                                    <strong>
                                        How to Fix
                                    </strong>

                                    <p>
                                        {item.how_to_fix || "N/A"}
                                    </p>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* ==========================================
                    COUNTER ARGUMENTS
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Counter Arguments
                    </h3>


                    {data.counter_arguments.length === 0 ? (

                        <p>
                            No counter arguments generated.
                        </p>

                    ) : (

                        data.counter_arguments.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "18px",
                                        marginBottom: "20px",
                                    }}
                                >

                                    <h4>
                                        {item.title || `Counter Argument ${index + 1}`}
                                    </h4>

                                    <p>
                                        {item.argument || item}
                                    </p>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* ==========================================
                    REBUTTALS
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Suggested Rebuttals
                    </h3>


                    {data.rebuttals.length === 0 ? (

                        <p>
                            No rebuttals generated.
                        </p>

                    ) : (

                        data.rebuttals.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={{
                                        background: "#EEF2FF",
                                        padding: "15px",
                                        borderRadius: "10px",
                                        marginBottom: "12px",
                                    }}
                                >

                                    <strong>
                                        Rebuttal {index + 1}
                                    </strong>

                                    <p>
                                        {item}
                                    </p>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* ==========================================
                    IMPROVED ARGUMENT
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Improved Argument
                    </h3>

                    <p>
                        {data.improved_argument ||
                            "No improved argument generated."}
                    </p>

                </div>


                {/* ==========================================
                    OPENING STATEMENT
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Suggested Opening Statement
                    </h3>

                    <p>
                        {data.opening_statement ||
                            "No opening statement generated."}
                    </p>

                </div>


                {/* ==========================================
                    CLOSING STATEMENT
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Suggested Closing Statement
                    </h3>

                    <p>
                        {data.closing_statement ||
                            "No closing statement generated."}
                    </p>

                </div>


                {/* ==========================================
                    REAL WORLD EXAMPLES
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Real-World Examples
                    </h3>


                    {data.real_world_examples.length === 0 ? (

                        <p>
                            No examples generated.
                        </p>

                    ) : (

                        <ul>

                            {data.real_world_examples.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                )
                            )}

                        </ul>

                    )}

                </div>


                {/* ==========================================
                    STATISTICS
                ========================================== */}

                <div className="chart-card mt-4">

                    <h3>
                        Relevant Statistics
                    </h3>


                    {data.statistics.length === 0 ? (

                        <p>
                            No statistics generated.
                        </p>

                    ) : (

                        <ul>

                            {data.statistics.map(
                                (item, index) => (

                                    <li key={index}>
                                        {item}
                                    </li>

                                )
                            )}

                        </ul>

                    )}

                </div>


                {/* ==========================================
                    BACK BUTTON
                ========================================== */}

                <div
                    style={{
                        marginTop: "30px",
                        marginBottom: "40px",
                    }}
                >

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate("/topics")
                        }
                    >

                        <FaArrowLeft /> Back to Debate Topics

                    </button>

                </div>


            </div>

        </Layout>

    );

}


export default AIFeedback;