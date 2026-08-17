import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getDashboardSummary,
} from "../services/dashboardService";


function Recommended() {

    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadRecommendations();

    }, []);


    async function loadRecommendations() {

        try {

            const data =
                await getDashboardSummary();

            setSummary(data);

        } catch (error) {

            console.error(
                "Failed to load recommendations:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <Layout>

                <div className="dashboard-page">

                    <div className="chart-card">

                        <h2>
                            Recommended For You
                        </h2>

                        <p>
                            Analyzing your performance...
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    const recommendations = [];


    // ---------------------------------------------
    // LOGIC
    // ---------------------------------------------

    if (
        summary &&
        Number(summary.average_logic) < 7
    ) {

        recommendations.push({

            title: "Improve Logical Reasoning",

            description:
                "Practice building stronger claims and supporting them with clear evidence.",

            action: "Practice Argument Analysis",

            path: "/argument-analyzer",

        });

    }


    // ---------------------------------------------
    // CONFIDENCE
    // ---------------------------------------------

    if (
        summary &&
        Number(summary.average_confidence) < 7
    ) {

        recommendations.push({

            title: "Improve Speaking Confidence",

            description:
                "Practice speaking clearly and confidently while reducing hesitation and filler words.",

            action: "Practice Speech",

            path: "/speech-improver",

        });

    }


    // ---------------------------------------------
    // GRAMMAR
    // ---------------------------------------------

    if (
        summary &&
        Number(summary.average_grammar) < 7
    ) {

        recommendations.push({

            title: "Improve Grammar",

            description:
                "Work on sentence structure and grammatical accuracy during debates.",

            action: "Practice Debate",

            path: "/topics",

        });

    }


    // ---------------------------------------------
    // RELEVANCE
    // ---------------------------------------------

    if (
        summary &&
        Number(summary.average_relevance) < 7
    ) {

        recommendations.push({

            title: "Improve Argument Relevance",

            description:
                "Focus on staying directly connected to the debate topic and supporting your position with relevant points.",

            action: "Analyze an Argument",

            path: "/argument-analyzer",

        });

    }


    // ---------------------------------------------
    // IF ALL SKILLS ARE GOOD
    // ---------------------------------------------

    if (recommendations.length === 0) {

        recommendations.push({

            title: "Try Advanced Debate Topics",

            description:
                "Your current performance is strong. Challenge yourself with harder topics and more complex arguments.",

            action: "Explore Topics",

            path: "/topics",

        });

    }


    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="hero-card">

                    <div>

                        <h2>
                            Recommended For You
                        </h2>

                        <p>
                            Personalized recommendations based on your debate performance.
                        </p>

                    </div>

                </div>


                {/* PERFORMANCE SUMMARY */}

                {summary && (

                    <div className="chart-card">

                        <h3>
                            Your Current Performance
                        </h3>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: "15px",
                                marginTop: "20px",
                            }}
                        >

                            <PerformanceItem
                                title="Grammar"
                                value={summary.average_grammar}
                            />

                            <PerformanceItem
                                title="Logic"
                                value={summary.average_logic}
                            />

                            <PerformanceItem
                                title="Confidence"
                                value={summary.average_confidence}
                            />

                            <PerformanceItem
                                title="Relevance"
                                value={summary.average_relevance}
                            />

                        </div>

                    </div>

                )}


                {/* RECOMMENDATIONS */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        Recommended For You
                    </h3>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >

                        {recommendations.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "20px",
                                    }}
                                >

                                    <h4>
                                        {item.title}
                                    </h4>

                                    <p
                                        style={{
                                            marginTop: "10px",
                                            minHeight: "60px",
                                        }}
                                    >
                                        {item.description}
                                    </p>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            navigate(
                                                item.path
                                            )
                                        }
                                    >
                                        {item.action}
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>


            </div>

        </Layout>

    );

}


function PerformanceItem({
    title,
    value,
}) {

    const score =
        Number(value || 0);


    return (

        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "15px",
            }}
        >

            <p
                style={{
                    marginBottom: "5px",
                }}
            >
                {title}
            </p>

            <h3>
                {score.toFixed(1)}/10
            </h3>

        </div>

    );

}


export default Recommended;