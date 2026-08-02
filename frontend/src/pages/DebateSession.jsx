import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../services/userService";
import { getTopics } from "../services/topicService";

import {
    getSessions,
    createSession
} from "../services/sessionService";

function DebateSession() {

    const [user, setUser] = useState(null);

    const [topics, setTopics] = useState([]);

    const [sessions, setSessions] = useState([]);

    const [topicId, setTopicId] = useState("");

    const [duration, setDuration] = useState(15);

    const [position, setPosition] = useState("For");

    const [debateFormat, setDebateFormat] = useState("One-on-One Debate");

    const navigate = useNavigate();

    async function loadData() {

        const currentUser = await getCurrentUser();

        setUser(currentUser);

        const topicData = await getTopics();

        setTopics(topicData);

        const sessionData = await getSessions();

        setSessions(sessionData);

    }

    useEffect(() => {

        loadData();

    }, []);

    async function handleCreate(e) {

        e.preventDefault();

        await createSession({

            topic_id: Number(topicId),

            session_type: "Practice",

            debate_format: debateFormat,

            status: "Scheduled",

            duration: Number(duration),

            position: position

        });

        loadData();

    }

    if (!user) {

        return <h2>Loading...</h2>;

    }

    return (

        <AppShell>

            <h1>Debate Sessions</h1>

            <br />

            {(user.role === "Coach" ||
                user.role === "Educator" ||
                user.role === "Admin") && (

                    <Panel title="Create Debate Session">

                        <form onSubmit={handleCreate}>

                            <label>

                                Debate Topic

                            </label>

                            <br /><br />

                            <select
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                            >

                                <option value="">

                                    Select Topic

                                </option>

                                {topics.map(topic => (

                                    <option
                                        key={topic.id}
                                        value={topic.id}
                                    >

                                        {topic.title}

                                    </option>

                                ))}

                            </select>

                            <br /><br />

                            <label>

                                Debate Position

                            </label>

                            <br /><br />

                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            >

                                <option>

                                    For

                                </option>

                                <option>

                                    Against

                                </option>

                            </select>

                            <br /><br />

                            <label>

                                Debate Format

                            </label>

                            <br /><br />

                            <select
                                value={debateFormat}
                                onChange={(e) => setDebateFormat(e.target.value)}
                            >

                                <option>

                                    One-on-One Debate

                                </option>

                                <option>

                                    Parliamentary Debate

                                </option>

                                <option>

                                    Oxford Debate

                                </option>

                                <option>

                                    Policy Debate

                                </option>

                                <option>

                                    Public Forum Debate

                                </option>

                                <option>

                                    AI Debate Simulation

                                </option>

                            </select>

                            <br /><br />

                            <label>

                                Duration

                            </label>

                            <br /><br />

                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            >

                                <option value="15">

                                    15 Minutes

                                </option>

                                <option value="30">

                                    30 Minutes

                                </option>

                                <option value="45">

                                    45 Minutes

                                </option>

                            </select>

                            <br /><br />

                            <button>

                                Create Session

                            </button>

                        </form>

                    </Panel>

                )}

            <br />

            <Panel title="Available Sessions">

                {

                    sessions.length === 0 &&

                    <p>

                        No sessions available.

                    </p>

                }

                {

                    sessions.map(session => (

                        <div
                            key={session.id}
                            style={{
                                padding: "15px",
                                borderBottom: "1px solid #374151"
                            }}
                        >

                            <h3>

                                Session #{session.id}

                            </h3>

                            <strong>

                                Topic ID:

                            </strong>

                            {" "}

                            {session.topic_id}

                            <br />

                            <strong>

                                Position:

                            </strong>

                            {" "}

                            {session.position}

                            <br />

                            <strong>

                                Duration:

                            </strong>

                            {" "}

                            {session.duration} mins

                            <br />

                            <strong>

                                Status:

                            </strong>

                            {" "}

                            {session.status}

                            <br /><br />

                            <button
                                onClick={() => navigate(`/debate/${session.id}`)}
                            >

                                Start Debate

                            </button>

                        </div>

                    ))

                }

            </Panel>

        </AppShell>

    );

}

export default DebateSession;