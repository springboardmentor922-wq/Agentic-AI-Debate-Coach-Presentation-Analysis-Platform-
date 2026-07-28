import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { createSession } from "../services/sessionService";

export default function CreateSession() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [position, setPosition] = useState("For");

    async function handleSubmit(e) {

        e.preventDefault();

        const data = await createSession({
            title,
            topic,
            position,
        });

        console.log(data);

        if (data.id || data.message) {

            alert("Debate Session Created Successfully!");

            navigate("/sessions");

        } else {

            alert(data.detail || "Failed to create session.");

        }
    }

    return (
        <DashboardLayout>

            <h1>Create Debate Session</h1>

            <form onSubmit={handleSubmit}>

                <br />

                <input
                    type="text"
                    placeholder="Session Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <br /><br />

                <textarea
                    placeholder="Debate Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
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

                <button type="submit">
                    Create Session
                </button>

            </form>

        </DashboardLayout>
    );
}