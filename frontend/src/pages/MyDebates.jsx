import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getMyDebates,
} from "../services/debateService";


function MyDebates() {

    const navigate = useNavigate();

    const [debates, setDebates] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ---------------------------------------------
    // LOAD DEBATES
    // ---------------------------------------------

    useEffect(() => {

        loadDebates();

    }, []);


    async function loadDebates() {

        try {

            setLoading(true);

            setError("");

            const data = await getMyDebates();

            setDebates(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load debates:",
                err
            );

            setError(
                "Unable to load your debate history."
            );

        } finally {

            setLoading(false);

        }

    }


    // ---------------------------------------------
    // LOADING
    // ---------------------------------------------

    if (loading) {

        return (

            <Layout>

                <div className="dashboard-page">

                    <div className="chart-card">

                        <h2>
                            My Debates
                        </h2>

                        <p>
                            Loading your debate history...
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    // ---------------------------------------------
    // PAGE
    // ---------------------------------------------

    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="hero-card">

                    <div>

                        <h2>
                            My Debates
                        </h2>

                        <p>
                            View your previous debate sessions and AI evaluations.
                        </p>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="chart-card">

                        <p>
                            {error}
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={loadDebates}
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* NO DEBATES */}

                {!error && debates.length === 0 && (

                    <div className="chart-card">

                        <h3>
                            No Debates Yet
                        </h3>

                        <p>
                            Complete your first debate to see your evaluation history here.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate("/topics")
                            }
                        >
                            Start Your First Debate
                        </button>

                    </div>

                )}


                {/* DEBATE HISTORY */}

                {!error && debates.length > 0 && (

                    <div className="chart-card">

                        <h3>
                            Debate History
                        </h3>

                        <div
                            style={{
                                overflowX: "auto",
                                marginTop: "20px",
                            }}
                        >

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >

                                <thead>

                                    <tr>

                                        <th
                                            style={{
                                                textAlign: "left",
                                                padding: "12px",
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            Topic
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "center",
                                                padding: "12px",
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            Score
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "center",
                                                padding: "12px",
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            Grade
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "center",
                                                padding: "12px",
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            Date
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "center",
                                                padding: "12px",
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {debates.map(
                                        (debate) => (

                                            <tr
                                                key={debate.id}
                                            >

                                                <td
                                                    style={{
                                                        padding: "14px 12px",
                                                        borderBottom: "1px solid #eee",
                                                    }}
                                                >

                                                    <strong>
                                                        {debate.topic}
                                                    </strong>

                                                </td>


                                                <td
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "14px 12px",
                                                        borderBottom: "1px solid #eee",
                                                    }}
                                                >

                                                    {debate.overall_percentage ?? 0}%

                                                </td>


                                                <td
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "14px 12px",
                                                        borderBottom: "1px solid #eee",
                                                        fontWeight: "bold",
                                                    }}
                                                >

                                                    {debate.grade || "N/A"}

                                                </td>


                                                <td
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "14px 12px",
                                                        borderBottom: "1px solid #eee",
                                                    }}
                                                >

                                                    {debate.created_at
                                                        ? new Date(
                                                            debate.created_at
                                                        ).toLocaleDateString()
                                                        : "-"
                                                    }

                                                </td>


                                                <td
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "14px 12px",
                                                        borderBottom: "1px solid #eee",
                                                    }}
                                                >

                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() =>
                                                            navigate(
                                                                "/ai-feedback",
                                                                {
                                                                    state: {
                                                                        grammar: {
                                                                            score:
                                                                                debate.grammar_score,
                                                                            percentage:
                                                                                debate.grammar_percentage,
                                                                            remark:
                                                                                debate.grammar_remark,
                                                                        },

                                                                        logic: {
                                                                            score:
                                                                                debate.logic_score,
                                                                            percentage:
                                                                                debate.logic_percentage,
                                                                            remark:
                                                                                debate.logic_remark,
                                                                        },

                                                                        confidence: {
                                                                            score:
                                                                                debate.confidence_score,
                                                                            percentage:
                                                                                debate.confidence_percentage,
                                                                            remark:
                                                                                debate.confidence_remark,
                                                                        },

                                                                        relevance: {
                                                                            score:
                                                                                debate.relevance_score,
                                                                            percentage:
                                                                                debate.relevance_percentage,
                                                                            remark:
                                                                                debate.relevance_remark,
                                                                        },

                                                                        overall: {
                                                                            score:
                                                                                `${debate.overall_score}/40`,
                                                                            percentage:
                                                                                `${debate.overall_percentage}%`,
                                                                            grade:
                                                                                debate.grade,
                                                                        },

                                                                        feedback:
                                                                            debate.feedback,

                                                                        strengths:
                                                                            parseJSON(
                                                                                debate.strengths
                                                                            ),

                                                                        weaknesses:
                                                                            parseJSON(
                                                                                debate.weaknesses
                                                                            ),

                                                                        coach_tips:
                                                                            parseJSON(
                                                                                debate.coach_tips
                                                                            ),

                                                                        logical_fallacies:
                                                                            parseJSON(
                                                                                debate.logical_fallacies
                                                                            ),

                                                                        counter_arguments:
                                                                            parseJSON(
                                                                                debate.counter_arguments
                                                                            ),

                                                                        rebuttals:
                                                                            parseJSON(
                                                                                debate.rebuttals
                                                                            ),

                                                                        improved_argument:
                                                                            debate.improved_argument,

                                                                        opening_statement:
                                                                            debate.opening_statement,

                                                                        closing_statement:
                                                                            debate.closing_statement,

                                                                        real_world_examples:
                                                                            parseJSON(
                                                                                debate.real_world_examples
                                                                            ),

                                                                        statistics:
                                                                            parseJSON(
                                                                                debate.statistics
                                                                            ),

                                                                        ai_insights:
                                                                            parseJSON(
                                                                                debate.ai_insights
                                                                            ),

                                                                        topic:
                                                                            debate.topic,

                                                                        argument:
                                                                            debate.argument,
                                                                    },
                                                                }
                                                            )
                                                        }
                                                    >
                                                        View Report
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


            </div>

        </Layout>

    );

}


// ---------------------------------------------
// SAFE JSON PARSER
// ---------------------------------------------

function parseJSON(value) {

    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {
        return value;
    }


    try {

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "JSON parse error:",
            error
        );

        return [];

    }

}


export default MyDebates;