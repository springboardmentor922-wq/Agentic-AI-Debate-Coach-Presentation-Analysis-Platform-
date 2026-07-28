import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSessions } from "../services/sessionService";

export default function DebateHistory() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadHistory() {

            try {

                const data = await getSessions();

                if (data.sessions && Array.isArray(data.sessions)) {
                    setSessions(data.sessions);
                }

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        }

        loadHistory();

    }, []);

    return (

        <DashboardLayout>

            <h1>Debate History</h1>

            <br />

            {loading ? (

                <h2>Loading...</h2>

            ) : sessions.length === 0 ? (

                <p>No debates found.</p>

            ) : (

                sessions.map((session) => (

                    <div
                        key={session.id}
                        style={{
                            border: "1px solid gray",
                            padding: "15px",
                            marginBottom: "20px",
                            borderRadius: "10px"
                        }}
                    >

                        <h2>{session.title}</h2>

                        <p>
                            <strong>Topic:</strong> {session.topic}
                        </p>

                        <p>
                            <strong>Position:</strong> {session.position}
                        </p>

                        <p>
                            <strong>Status:</strong> Completed
                        </p>

                    </div>

                ))

            )}

        </DashboardLayout>

    );

}