import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import {
    getSession,
    updateSession,
} from "../services/sessionService";

export default function EditSession() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [position, setPosition] = useState("For");
    const [status, setStatus] = useState("Upcoming");

    useEffect(() => {

        async function loadSession() {

            const data = await getSession(id);

            setTitle(data.title);
            setTopic(data.topic);
            setPosition(data.position);
            setStatus(data.status);

        }

        loadSession();

    }, [id]);

    async function handleSubmit(e) {

        e.preventDefault();

        const result = await updateSession(id, {
            title,
            topic,
            position,
            status,
        });

        alert(result.message);

        navigate("/sessions");

    }

    return (

        <DashboardLayout>

            <h1>Edit Debate Session</h1>

            <br />

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Session Title"
                />

                <br /><br />

                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Debate Topic"
                />

                <br /><br />

                <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                >
                    <option>For</option>
                    <option>Against</option>
                </select>

                <br /><br />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                </select>

                <br /><br />

                <button type="submit">
                    Update Session
                </button>

            </form>

        </DashboardLayout>

    );

}