import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import { getDebateSessions } from "../services/coachDebateSessionService";

function CoachDebateSessions() {

    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {

        try {

            const data = await getDebateSessions();

            setSessions(data || []);

        } catch (error) {

            console.error(error);

            setSessions([]);

        }
    }

    return (

        <CoachLayout>

            <div className="debate-sessions-page">

                <h1>Debate Sessions</h1>

                <br />

                <div className="coach-table-container">

                    <table className="debate-sessions-table">

                        <thead>

                            <tr>

                                <th>Learner</th>

                                <th>Topic</th>

                                <th>Difficulty</th>

                                <th>AI Score</th>

                                <th>Status</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {sessions.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}
                                    >
                                        No debate sessions available.
                                    </td>

                                </tr>

                            ) : (

                                sessions.map((session) => (

                                    <tr
                                        key={session.session_id}
                                    >

                                        <td>
                                            {session.learner_name}
                                        </td>

                                        <td>
                                            {session.topic}
                                        </td>

                                        <td>
                                            {session.difficulty}
                                        </td>

                                        <td>
                                            {Math.round(
                                                session.ai_score || 0
                                            )}%
                                        </td>

                                        <td>
                                            {session.status}
                                        </td>

                                        <td>

                                            <button
                                                className="coach-view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/coach/learner/${session.learner_id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </CoachLayout>

    );
}

export default CoachDebateSessions;