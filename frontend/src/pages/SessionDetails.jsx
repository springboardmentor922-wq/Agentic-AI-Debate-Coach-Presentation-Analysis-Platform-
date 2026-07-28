import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import { getSession } from "../services/sessionService";

export default function SessionDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);

    useEffect(() => {

        async function loadSession() {

            const data = await getSession(id);

            setSession(data);
        }

        loadSession();

    }, [id]);

    if (!session) {

        return (

            <DashboardLayout>

                <h2>Loading...</h2>

            </DashboardLayout>

        );

    }

    return (

        <DashboardLayout>

            <h1>{session.title}</h1>

            <br />

            <p>
                <strong>Topic:</strong> {session.topic}
            </p>

            <p>
                <strong>Position:</strong> {session.position}
            </p>

            <p>
                <strong>Status:</strong> {session.status}
            </p>

            <p>
                <strong>Score:</strong> {session.score}
            </p>

            <p>
                <strong>Duration:</strong> {session.duration} minutes
            </p>

            <br />

            <button
                onClick={() => navigate("/sessions")}
            >
                ← Back
            </button>

        </DashboardLayout>

    );

}