import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSessions } from "../services/sessionService";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function ImprovementTrends() {

    const [chartData, setChartData] = useState([]);
    const [latestSession, setLatestSession] = useState(null);

    useEffect(() => {

        async function loadData() {

            try {

                const data = await getSessions();

                if (data.sessions) {

                    const completed = data.sessions.filter(
                        session => session.status === "Completed"
                    );

                    const graph = completed.map((session, index) => ({
                        debate: `D${index + 1}`,
                        score: session.score || 0,
                    }));

                    setChartData(graph);

                    if (completed.length > 0) {
                        setLatestSession(completed[0]);
                    }

                }

            } catch (error) {

                console.error(error);

            }

        }

        loadData();

    }, []);

    return (

        <DashboardLayout>

            <h1>Improvement Trends</h1>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>Score Trend</h2>

                <ResponsiveContainer width="100%" height={300}>

                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="debate" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>Latest Debate</h2>

                {

                    latestSession ? (

                        <>

                            <p>

                                <strong>Title:</strong>

                                {" "}

                                {latestSession.title}

                            </p>

                            <p>

                                <strong>Score:</strong>

                                {" "}

                                {latestSession.score}%

                            </p>

                            <p>

                                <strong>Status:</strong>

                                {" "}

                                {latestSession.status}

                            </p>

                        </>

                    ) : (

                        <p>No completed debates yet.</p>

                    )

                }

            </div>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>AI Suggestions</h2>

                <ul>

                    <li>Improve rebuttal quality.</li>

                    <li>Use more supporting evidence.</li>

                    <li>Maintain confidence while speaking.</li>

                    <li>Reduce filler words.</li>

                </ul>

            </div>

        </DashboardLayout>

    );

}