import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSessions } from "../services/sessionService";

export default function Recommendations() {

    const [stats, setStats] = useState({
        average: 0,
        total: 0,
    });

    useEffect(() => {

        async function loadRecommendations() {

            try {

                const data = await getSessions();

                if (data.sessions) {

                    const scores = data.sessions.map(
                        session => session.score || 0
                    );

                    const average =
                        scores.length > 0
                            ? (
                                scores.reduce((a, b) => a + b, 0) /
                                scores.length
                            ).toFixed(1)
                            : 0;

                    setStats({
                        average,
                        total: data.sessions.length,
                    });

                }

            }

            catch (error) {

                console.error(error);

            }

        }

        loadRecommendations();

    }, []);

    return (

        <DashboardLayout>

            <h1>AI Recommendations</h1>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>🤖 Personalized Recommendations</h2>

                <ul>

                    <li>Improve rebuttal strength.</li>

                    <li>Support arguments with statistics.</li>

                    <li>Reduce filler words.</li>

                    <li>Improve speaking confidence.</li>

                    <li>Maintain eye contact.</li>

                    <li>Practice stronger conclusions.</li>

                </ul>

            </div>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>Performance Summary</h2>

                <p>

                    <strong>Total Debates:</strong>

                    {" "}

                    {stats.total}

                </p>

                <p>

                    <strong>Average Score:</strong>

                    {" "}

                    {stats.average}%

                </p>

            </div>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>Recommended Practice</h2>

                <ul>

                    <li>📚 Rebuttal Practice</li>

                    <li>🎤 Voice Modulation</li>

                    <li>🧠 Critical Thinking Exercises</li>

                    <li>📖 Evidence Building</li>

                </ul>

            </div>

        </DashboardLayout>

    );

}