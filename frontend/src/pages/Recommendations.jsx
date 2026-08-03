import { useEffect, useState } from "react";
import AppShell from "../layouts/AppShell";

import { getSessions } from "../services/sessionService";
import { getRecommendations } from "../services/recommendationService";

function Recommendations() {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {

        async function loadRecommendations() {

            try {

                const sessions = await getSessions();

                if (sessions.length === 0) {

                    setLoading(false);
                    return;

                }

                const latestSession = sessions[sessions.length - 1];

                const response = await getRecommendations(latestSession.id);

                setData(response);

            }

            catch (error) {

                console.error(error);

            }

            finally {

                setLoading(false);

            }

        }

        loadRecommendations();

    }, []);

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>⭐ Recommended For You</h1>

                    <p>

                        Personalized AI recommendations generated from your latest debate.

                    </p>

                </div>

            </div>

            {loading &&

                <div className="panel" style={{ marginTop: "30px" }}>

                    <h2>Loading recommendations...</h2>
                </div>

            }

            {!loading && !data &&

                <div className="panel" style={{ marginTop: "30px" }}>

                    <h2>No recommendations available.</h2>

                    <p style={{ color: "#9ca3af" }}>

                        Complete a debate session to receive personalized AI recommendations.

                    </p>

                </div>

            }

            {!loading && data &&

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
                        gap: "22px",
                        marginTop: "30px"
                    }}
                >

                    <div className="panel">

                        <h2>💪 Strengths</h2>

                        <ul style={{ lineHeight: "2", marginTop: "15px" }}>

                            {data.strengths.map((item, index) => (

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                    </div>

                    <div className="panel">

                        <h2>⚠ Weaknesses</h2>

                        <ul style={{ lineHeight: "2", marginTop: "15px" }}>

                            {data.weaknesses.map((item, index) => (

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                    </div>

                    <div className="panel">

                        <h2>🤖 AI Recommendations</h2>

                        <ul style={{ lineHeight: "2", marginTop: "15px" }}>

                            {data.recommendations.map((item, index) => (

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                    </div>

                    <div className="panel">

                        <h2>🚀 Next Difficulty</h2>

                        <h1
                            style={{
                                color: "#8b5cf6",
                                marginTop: "20px"
                            }}
                        >
                            {data.next_difficulty}
                        </h1>

                    </div>

                </div>

                }

        </AppShell>

    );

}

export default Recommendations;