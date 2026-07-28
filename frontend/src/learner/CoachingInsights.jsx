import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSessions } from "../services/sessionService";

export default function CoachingInsights() {

    const [stats, setStats] = useState({
        total: 0,
        average: 0,
    });

    useEffect(() => {

        async function loadInsights() {

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
                        total: data.sessions.length,
                        average,
                    });

                }

            }

            catch (error) {

                console.error(error);

            }

        }

        loadInsights();

    }, []);

    return (

        <DashboardLayout>

            <h1>Coaching Insights</h1>

            <br />

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h2>Overall Rating</h2>

                <h1>⭐⭐⭐⭐☆</h1>

                <p>Average Score: {stats.average}%</p>

                <p>Total Debates: {stats.total}</p>

            </div>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                    gap: "20px"
                }}
            >

                <div
                    style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                    }}
                >

                    <h2>Strengths</h2>

                    <ul>

                        <li>Strong confidence</li>

                        <li>Good voice clarity</li>

                        <li>Logical arguments</li>

                        <li>Professional delivery</li>

                    </ul>

                </div>

                <div
                    style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                    }}
                >

                    <h2>Areas for Improvement</h2>

                    <ul>

                        <li>Improve rebuttals</li>

                        <li>Use more evidence</li>

                        <li>Improve conclusion quality</li>

                        <li>Reduce filler words</li>

                    </ul>

                </div>

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

                <h2>AI Coach Feedback</h2>

                <p>

                    You communicate confidently and present ideas clearly.
                    Continue improving your rebuttal techniques and support
                    your arguments with stronger evidence to increase your
                    overall debate performance.

                </p>

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

                <h2>Recommended Practice Plan</h2>

                <ul>

                    <li>🎤 Voice Modulation</li>

                    <li>📚 Evidence Building</li>

                    <li>🧠 Critical Thinking Exercises</li>

                    <li>⚔ Mock Debate Practice</li>

                </ul>

            </div>

        </DashboardLayout>

    );

}