import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";

import {
    getOverview,
    getHistory
} from "../services/analyticsService";

function Analytics() {

    const [overview, setOverview] = useState(null);

    const [history, setHistory] = useState([]);

    useEffect(() => {

        load();

    }, []);

    async function load() {

        try {

            const overviewData = await getOverview();

            const historyData = await getHistory();

            setOverview(overviewData);

            setHistory(historyData);

        }

        catch {

            alert("Unable to load analytics");

        }

    }

    function Stat(title, value, color) {

        return (

            <div

                style={{

                    background:"#1f2937",

                    borderRadius:"18px",

                    padding:"28px",

                    borderLeft:`6px solid ${color}`,

                    minWidth:"220px",

                    flex:1

                }}

            >

                <p style={{color:"#9ca3af"}}>

                    {title}

                </p>

                <h1>

                    {value}

                </h1>

            </div>

        );

    }

    return (

        <AppShell>

            <h1>

                📊 Performance Analytics

            </h1>

            <p

                style={{

                    color:"#9ca3af",

                    marginBottom:"30px"

                }}

            >

                Track your debating journey and AI coaching insights.

            </p>

            {

                overview && (

                    <>

                        <div

                            style={{

                                display:"grid",

                                gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",

                                gap:"20px",

                                marginBottom:"30px"

                            }}

                        >

                            {Stat("Total Sessions",overview.total_sessions,"#7c3aed")}

                            {Stat("Average Score",overview.average_score,"#22c55e")}

                            {Stat("Wins",overview.wins,"#3b82f6")}

                            {Stat("Completed",overview.completed,"#f59e0b")}

                        </div>

                        <div

                            style={{

                                background:"#1f2937",

                                padding:"25px",

                                borderRadius:"18px",

                                marginBottom:"30px"

                            }}

                        >

                            <h2>

                                Overall Performance

                            </h2>

                            <br/>

                            <progress

                                value={overview.average_score}

                                max="100"

                                style={{

                                    width:"100%",

                                    height:"24px"

                                }}

                            />

                            <br/><br/>

                            <strong>

                                Average Duration :

                            </strong>

                            {" "}

                            {overview.average_duration} mins

                        </div>

                    </>

                )

            }

            <div

                style={{

                    display:"grid",

                    gap:"20px"

                }}

            >

                {

                    history.map((item)=>(

                        <div

                            key={item.session_id}

                            style={{

                                background:"#1f2937",

                                borderRadius:"18px",

                                padding:"24px"

                            }}

                        >

                            <h2>

                                {item.topic}

                            </h2>

                            <br/>

                            <p>

                                <strong>Score:</strong>

                                {" "}

                                {item.score}/100

                            </p>

                            <p>

                                <strong>Strengths:</strong>

                                {" "}

                                {item.strengths.join(", ")}

                            </p>

                            <p>

                                <strong>Weaknesses:</strong>

                                {" "}

                                {item.weaknesses.join(", ")}

                            </p>

                            <p>

                                <strong>AI Feedback:</strong>

                                {" "}

                                {item.feedback}

                            </p>

                        </div>

                    ))

                }

            </div>

        </AppShell>

    );

}

export default Analytics;