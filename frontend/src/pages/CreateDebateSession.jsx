import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { createDebateSession } from "../services/debateSessionService";

function CreateDebateSession() {
    const navigate = useNavigate();
    const location = useLocation();

    // If user came from Practice Topics, use that topic.
    // If user clicked "Create Your Own Debate", this will be empty.
    const [topic, setTopic] = useState(
        location.state?.topic || ""
    );

    const [position, setPosition] = useState(
        location.state?.position || "For"
    );

    const [difficulty, setDifficulty] = useState(
        location.state?.difficulty || "Easy"
    );

    const [duration, setDuration] = useState(
        String(location.state?.duration || "5")
    );

    const [loading, setLoading] = useState(false);

    const startDebate = async () => {
        // Validate topic
        if (!topic.trim()) {
            alert("Please enter a debate topic.");
            return;
        }

        try {
            setLoading(true);

            const sessionData = {
                topic: topic.trim(),
                category: "General",
                difficulty: difficulty,
                duration: Number(duration),
            };

            // Create session in backend
            const response = await createDebateSession(sessionData);

            console.log("Debate session created:", response);

            // Navigate to actual debate screen
            navigate("/sessions", {
                state: {
                    topic: topic.trim(),
                    position,
                    difficulty,
                    duration: Number(duration),
                    sessionId: response?.id,
                },
            });

        } catch (err) {
            console.error(
                "Failed to create debate session:",
                err
            );

            alert(
                err?.response?.data?.detail ||
                "Failed to create debate session. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>

            <div className="dashboard-page">

                <div
                    className="chart-card"
                    style={{
                        maxWidth: "800px",
                        margin: "0 auto",
                    }}
                >

                    <h2>Create New Debate Session</h2>

                    <p
                        style={{
                            color: "#64748b",
                            marginBottom: "25px",
                        }}
                    >
                        Choose a topic and customize your debate
                        before you begin.
                    </p>


                    {/* Debate Topic */}

                    <label>
                        <b>Debate Topic</b>
                    </label>

                    <input
                        className="form-control"
                        placeholder="Example: Should AI Replace Teachers?"
                        value={topic}
                        onChange={(e) =>
                            setTopic(e.target.value)
                        }
                    />

                    <small
                        style={{
                            color: "#64748b",
                            display: "block",
                            marginTop: "6px",
                        }}
                    >
                        You can use a suggested topic or create
                        your own debate topic.
                    </small>


                    <br />


                    {/* Position */}

                    <label>
                        <b>Your Position</b>
                    </label>

                    <select
                        className="form-control"
                        value={position}
                        onChange={(e) =>
                            setPosition(e.target.value)
                        }
                    >
                        <option value="For">
                            For
                        </option>

                        <option value="Against">
                            Against
                        </option>
                    </select>


                    <br />


                    {/* Difficulty */}

                    <label>
                        <b>Difficulty</b>
                    </label>

                    <select
                        className="form-control"
                        value={difficulty}
                        onChange={(e) =>
                            setDifficulty(e.target.value)
                        }
                    >
                        <option value="Easy">
                            Easy
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="Hard">
                            Hard
                        </option>
                    </select>


                    <br />


                    {/* Duration */}

                    <label>
                        <b>Duration</b>
                    </label>

                    <select
                        className="form-control"
                        value={duration}
                        onChange={(e) =>
                            setDuration(e.target.value)
                        }
                    >
                        <option value="3">
                            3 Minutes
                        </option>

                        <option value="5">
                            5 Minutes
                        </option>

                        <option value="10">
                            10 Minutes
                        </option>

                        <option value="15">
                            15 Minutes
                        </option>
                    </select>


                    <br />


                    {/* Start Debate */}

                    <button
                        className="btn btn-primary"
                        onClick={startDebate}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "16px",
                            fontWeight: "600",
                        }}
                    >
                        {loading
                            ? "Creating Session..."
                            : "🚀 Start Debate"}
                    </button>

                </div>

            </div>

        </Layout>
    );
}

export default CreateDebateSession;