import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getLearnerEvaluationDetail
} from "../services/educatorClassService";

import {
    FaArrowLeft,
    FaAward,
    FaBrain,
    FaCheckCircle,
    FaExclamationTriangle,
    FaLightbulb,
    FaBalanceScale,
    FaComments,
    FaChartLine,
    FaQuoteLeft,
    FaBookOpen
} from "react-icons/fa";

import "../styles/educatorEvaluationDetails.css";


function EducatorEvaluationDetails() {

    const {
        learnerId,
        evaluationId
    } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadEvaluation();

    }, [learnerId, evaluationId]);


    const loadEvaluation = async () => {

        try {

            setLoading(true);

            setError("");

            const result =
                await getLearnerEvaluationDetail(
                    learnerId,
                    evaluationId
                );

            setData(result);

        } catch (err) {

            console.error(
                "Evaluation details error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load evaluation."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <Layout>

                <div className="evaluation-loading">

                    <h2>
                        Loading evaluation...
                    </h2>

                </div>

            </Layout>

        );

    }


    /* =========================
       ERROR
    ========================= */

    if (error || !data) {

        return (

            <Layout>

                <div className="evaluation-page">

                    <button
                        className="evaluation-back-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <FaArrowLeft />

                        Back

                    </button>


                    <div className="evaluation-error">

                        {error ||
                            "Evaluation not found."}

                    </div>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div className="evaluation-page">


                {/* =========================
                    BACK
                ========================= */}

                <button
                    className="evaluation-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <FaArrowLeft />

                    Back to Learner

                </button>


                {/* =========================
                    HEADER
                ========================= */}

                <div className="evaluation-header">

                    <div>

                        <div className="evaluation-label">

                            <FaBookOpen />

                            Debate Evaluation

                        </div>

                        <h1>
                            {data.topic ||
                                "Untitled Debate"}
                        </h1>

                        <p>
                            Complete performance
                            analysis and AI feedback
                        </p>

                    </div>

                </div>


                {/* =========================
                    OVERALL SCORE
                ========================= */}

                <div className="overall-card">

                    <div className="overall-icon">

                        <FaAward />

                    </div>


                    <div className="overall-info">

                        <span>
                            Overall Performance
                        </span>

                        <strong>
                            {data.overall?.percentage ?? 0}%
                        </strong>

                        <p>
                            Grade:{" "}
                            <b>
                                {data.overall?.grade ||
                                    "N/A"}
                            </b>
                        </p>

                    </div>


                    <div className="overall-score">

                        <span>
                            Score
                        </span>

                        <strong>
                            {data.overall?.score ?? 0}
                        </strong>

                    </div>

                </div>


                {/* =========================
                    SKILL PERFORMANCE
                ========================= */}

                <SectionTitle
                    icon={<FaChartLine />}
                    title="Skill Performance"
                />


                <div className="metric-grid">

                    <MetricCard
                        title="Grammar"
                        data={data.grammar}
                    />

                    <MetricCard
                        title="Logic"
                        data={data.logic}
                    />

                    <MetricCard
                        title="Confidence"
                        data={data.confidence}
                    />

                    <MetricCard
                        title="Relevance"
                        data={data.relevance}
                    />

                </div>


                {/* =========================
                    ORIGINAL ARGUMENT
                ========================= */}

                <Section
                    icon={<FaQuoteLeft />}
                    title="Original Argument"
                >

                    <TextContent
                        text={data.argument}
                        empty="No argument recorded."
                    />

                </Section>


                {/* =========================
                    AI FEEDBACK
                ========================= */}

                <Section
                    icon={<FaBrain />}
                    title="AI Feedback"
                >

                    <TextContent
                        text={data.feedback}
                        empty="No AI feedback available."
                    />

                </Section>


                {/* =========================
                    STRENGTHS
                ========================= */}

                <Section
                    icon={<FaCheckCircle />}
                    title="Strengths"
                    variant="success"
                >

                    <TextContent
                        text={data.strengths}
                        empty="No strengths recorded."
                    />

                </Section>


                {/* =========================
                    WEAKNESSES
                ========================= */}

                <Section
                    icon={<FaExclamationTriangle />}
                    title="Areas for Improvement"
                    variant="warning"
                >

                    <TextContent
                        text={data.weaknesses}
                        empty="No weaknesses recorded."
                    />

                </Section>


                {/* =========================
                    COACH TIPS
                ========================= */}

                <Section
                    icon={<FaLightbulb />}
                    title="Coach Recommendations"
                    variant="tip"
                >

                    <TextContent
                        text={data.coach_tips}
                        empty="No coach recommendations recorded."
                    />

                </Section>


                {/* =========================
                    ARGUMENT ANALYSIS
                ========================= */}

                <SectionTitle
                    icon={<FaBalanceScale />}
                    title="Argument Analysis"
                />


                <div className="analysis-grid">

                    <AnalysisCard
                        title="Logical Fallacies"
                        text={data.logical_fallacies}
                        empty="No logical fallacies detected."
                    />


                    <AnalysisCard
                        title="Counter Arguments"
                        text={data.counter_arguments}
                        empty="No counter arguments generated."
                    />


                    <AnalysisCard
                        title="AI Rebuttals"
                        text={data.rebuttals}
                        empty="No rebuttals generated."
                    />

                </div>


                {/* =========================
                    IMPROVED CONTENT
                ========================= */}

                <SectionTitle
                    icon={<FaComments />}
                    title="AI-Generated Improvements"
                />


                <div className="analysis-grid">

                    <AnalysisCard
                        title="Opening Statement"
                        text={data.opening_statement}
                        empty="No improved opening statement available."
                    />


                    <AnalysisCard
                        title="Closing Statement"
                        text={data.closing_statement}
                        empty="No improved closing statement available."
                    />


                    <AnalysisCard
                        title="Improved Argument"
                        text={data.improved_argument}
                        empty="No improved argument available."
                    />

                </div>


                {/* =========================
                    SUPPORTING INFORMATION
                ========================= */}

                <SectionTitle
                    icon={<FaBookOpen />}
                    title="Supporting Information"
                />


                <div className="analysis-grid">

                    <AnalysisCard
                        title="Real-World Examples"
                        text={data.real_world_examples}
                        empty="No real-world examples available."
                    />


                    <AnalysisCard
                        title="Statistics"
                        text={data.statistics}
                        empty="No statistics available."
                    />


                    <AnalysisCard
                        title="AI Insights"
                        text={data.ai_insights}
                        empty="No additional AI insights available."
                    />

                </div>


                {/* =========================
                    DATE
                ========================= */}

                {data.created_at && (

                    <div className="evaluation-date">

                        Evaluation created on{" "}

                        {formatDate(
                            data.created_at
                        )}

                    </div>

                )}

            </div>

        </Layout>

    );

}


/* ==========================================
   SECTION TITLE
========================================== */

function SectionTitle({
    icon,
    title
}) {

    return (

        <div className="evaluation-section-title">

            <span>
                {icon}
            </span>

            <h2>
                {title}
            </h2>

        </div>

    );

}


/* ==========================================
   METRIC CARD
========================================== */

function MetricCard({
    title,
    data
}) {

    const score =
        Number(data?.score) || 0;

    const percentage =
        Number(data?.percentage) || 0;


    return (

        <div className="metric-card">

            <div className="metric-top">

                <h3>
                    {title}
                </h3>

                <span>
                    {percentage}%
                </span>

            </div>


            <div className="metric-score">

                {score}

                <small>
                    /10
                </small>

            </div>


            <div className="metric-progress">

                <div
                    style={{
                        width:
                            `${Math.min(
                                Math.max(
                                    percentage,
                                    0
                                ),
                                100
                            )}%`
                    }}
                />

            </div>


            <p>

                {data?.remark ||
                    "No remark available."}

            </p>

        </div>

    );

}


/* ==========================================
   SECTION
========================================== */

function Section({
    icon,
    title,
    children,
    variant = ""
}) {

    return (

        <div
            className={`evaluation-section ${variant}`}
        >

            <div className="section-heading">

                <span>
                    {icon}
                </span>

                <h2>
                    {title}
                </h2>

            </div>


            <div className="section-content">

                {children}

            </div>

        </div>

    );

}


/* ==========================================
   ANALYSIS CARD
========================================== */

function AnalysisCard({
    title,
    text,
    empty
}) {

    return (

        <div className="analysis-card">

            <h3>
                {title}
            </h3>

            <div className="analysis-content">

                <TextContent
                    text={text}
                    empty={empty}
                />

            </div>

        </div>

    );

}


/* ==========================================
   TEXT CONTENT
========================================== */

function TextContent({
    text,
    empty
}) {

    if (!text) {

        return (

            <p className="empty-text">
                {empty}
            </p>

        );

    }


    /*
      Some AI fields may contain multiple
      lines. Preserve those line breaks.
    */

    return (

        <div className="text-content">

            {String(text)
                .split("\n")
                .map((line, index) => (

                    <p key={index}>

                        {line || "\u00A0"}

                    </p>

                ))}

        </div>

    );

}


/* ==========================================
   DATE
========================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


export default EducatorEvaluationDetails;