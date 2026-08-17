import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
    getPerformanceHistory,
    getPerformanceSummary,
} from "../services/reportService";


function Reports() {

    const [summary, setSummary] = useState(null);

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadPerformance();

    }, []);


    async function loadPerformance() {

        try {

            const summaryData =
                await getPerformanceSummary();

            const historyData =
                await getPerformanceHistory();


            setSummary(summaryData);

            setHistory(
                Array.isArray(historyData)
                    ? historyData
                    : []
            );


        } catch (error) {

            console.error(
                "Failed to load performance scores:",
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
                            Performance Scores
                        </h2>

                        <p>
                            Loading your performance...
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="hero-card">

                    <div>

                        <h2>
                            📈 Performance Scores
                        </h2>

                        <p>
                            Track your debate performance using your actual AI evaluations.
                        </p>

                    </div>

                </div>


                {/* SUMMARY */}

                <div className="stats-grid">


                    <div className="stat-card">

                        <h4>
                            Total Debates
                        </h4>

                        <h2>
                            {summary?.total_debates ?? 0}
                        </h2>

                    </div>


                    <div className="stat-card">

                        <h4>
                            Average Score
                        </h4>

                        <h2>
                            {summary?.average_score ?? 0}%
                        </h2>

                    </div>


                    <div className="stat-card">

                        <h4>
                            Highest Score
                        </h4>

                        <h2>
                            {summary?.highest_score ?? 0}%
                        </h2>

                    </div>


                    <div className="stat-card">

                        <h4>
                            Current Grade
                        </h4>

                        <h2>
                            {summary?.grade ?? "N/A"}
                        </h2>

                    </div>


                </div>


                {/* SKILL SCORES */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        Skill Performance
                    </h3>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >

                        <SkillCard
                            title="Grammar"
                            value={summary?.average_grammar}
                        />

                        <SkillCard
                            title="Logic"
                            value={summary?.average_logic}
                        />

                        <SkillCard
                            title="Confidence"
                            value={summary?.average_confidence}
                        />

                        <SkillCard
                            title="Relevance"
                            value={summary?.average_relevance}
                        />

                    </div>

                </div>


                {/* HISTORY */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        Debate Performance History
                    </h3>


                    {history.length === 0 ? (

                        <div
                            style={{
                                marginTop: "20px",
                            }}
                        >

                            <p>
                                No completed debates yet.
                            </p>

                            <p>
                                Complete a debate to see your performance scores here.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                overflowX: "auto",
                                marginTop: "20px",
                            }}
                        >

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >

                                <thead>

                                    <tr>

                                        <th
                                            style={headerStyle}
                                        >
                                            Topic
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Score
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Grade
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Grammar
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Logic
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Confidence
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Relevance
                                        </th>

                                        <th
                                            style={headerStyle}
                                        >
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {history.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {item.topic}
                                                </td>


                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        fontWeight:
                                                            "bold",
                                                    }}
                                                >
                                                    {item.overall_percentage ?? 0}%
                                                </td>


                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        fontWeight:
                                                            "bold",
                                                    }}
                                                >
                                                    {item.grade ||
                                                        "N/A"}
                                                </td>


                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {item.grammar_score ?? 0}/10
                                                </td>


                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {item.logic_score ?? 0}/10
                                                </td>


                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {item.confidence_score ?? 0}/10
                                                </td>


                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >
                                                    {item.relevance_score ?? 0}/10
                                                </td>


                                                <td
                                                    style={
                                                        cellStyle
                                                    }
                                                >

                                                    {item.created_at
                                                        ? new Date(
                                                            item.created_at
                                                        ).toLocaleDateString()
                                                        : "-"
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


            </div>

        </Layout>

    );

}


function SkillCard({
    title,
    value,
}) {

    const score =
        Number(value || 0);


    return (

        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
            }}
        >

            <h4>
                {title}
            </h4>

            <h2>
                {score.toFixed(1)}/10
            </h2>


            <div
                style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginTop: "10px",
                }}
            >

                <div
                    style={{
                        width: `${Math.min(
                            score * 10,
                            100
                        )}%`,
                        height: "100%",
                        background: "#4F46E5",
                    }}
                />

            </div>

        </div>

    );

}


const headerStyle = {

    textAlign: "left",

    padding: "12px",

    borderBottom:
        "1px solid #ddd",

};


const cellStyle = {

    padding: "14px 12px",

    borderBottom:
        "1px solid #eee",

};


export default Reports;