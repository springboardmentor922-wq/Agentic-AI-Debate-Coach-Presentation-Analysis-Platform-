import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";

import { getSessions, debateWithAI } from "../services/sessionService";

function Reports() {

    const [loading, setLoading] = useState(true);

    const [report, setReport] = useState(null);

    useEffect(() => {

        async function loadReport() {

            try {

                const sessions = await getSessions();

                if (sessions.length === 0) {

                    setLoading(false);

                    return;

                }

                const latestSession = sessions[sessions.length - 1];

                /*
                    Generates a fresh AI report using your
                    existing debate engine.
                */

                const response = await debateWithAI(

                    latestSession.id,

                    "Generate a performance report for my latest debate."

                );

                setReport(response);

            }

            catch (error) {

                console.error(error);

            }

            finally {

                setLoading(false);

            }

        }

        loadReport();

    }, []);

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>💬 Feedback & Coaching</h1>

                    <p>

                        AI-generated coaching report from your latest debate.

                    </p>

                </div>

            </div>

            {

                loading &&

                <div className="panel" style={{ marginTop: "30px" }}>

                    <h2>Generating report...</h2>

                </div>

            }

            {

                !loading && !report &&

                <div className="panel" style={{ marginTop: "30px" }}>

                    <h2>No debate report available.</h2>

                    <p style={{ color: "#9ca3af" }}>

                        Complete a debate session first.

                    </p>

                </div>

            }

            {

                report &&

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "24px",
                        marginTop: "30px"
                    }}
                >

                    <div>

                        <div className="panel">

                            <h2>Overall Score</h2>

                            <h1
                                style={{
                                    color: "#8b5cf6",
                                    marginTop: "15px"
                                }}
                            >

                                {report.feedback.score.score}/100

                            </h1>

                            <p
                                style={{
                                    color: "#9ca3af"
                                }}
                            >

                                Grade :

                                {" "}

                                {report.feedback.score.grade}

                            </p>

                        </div>

                        <div
                            className="panel"
                            style={{ marginTop: "20px" }}
                        >

                            <h2>Strengths</h2>

                            <ul
                                style={{
                                    lineHeight: "2",
                                    marginTop: "15px"
                                }}
                            >

                                {

                                    report.analysis.strengths.map(

                                        (item, index) => (

                                            <li key={index}>

                                                {item}

                                            </li>

                                        )

                                    )

                                }

                            </ul>

                        </div>

                        <div
                            className="panel"
                            style={{ marginTop: "20px" }}
                        >

                            <h2>Weaknesses</h2>

                            <ul
                                style={{
                                    lineHeight: "2",
                                    marginTop: "15px"
                                }}
                            >

                                {

                                    report.analysis.weaknesses.map(

                                        (item, index) => (

                                            <li key={index}>

                                                {item}

                                            </li>

                                        )

                                    )

                                }

                            </ul>

                        </div>

                    </div>

                    <div>

                        <div className="panel">

                            <h2>🎯 AI Coaching</h2>

                            <p
                                style={{
                                    color: "#9ca3af",
                                    lineHeight: "1.8",
                                    marginTop: "20px"
                                }}
                            >

                                {report.feedback.coaching}

                            </p>

                        </div>

                        <div
                            className="panel"
                            style={{ marginTop: "20px" }}
                        >

                            <h2>⚔ Counterargument</h2>

                            <p
                                style={{
                                    color: "#9ca3af",
                                    lineHeight: "1.8",
                                    marginTop: "20px"
                                }}
                            >

                                {report.feedback.counterargument}

                            </p>

                        </div>

                    </div>

                </div>

            }

        </AppShell>

    );

}

export default Reports;