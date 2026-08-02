import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";
import TopicCard from "../components/ui/TopicCard";

import {
    getTopics,
    createTopic,
} from "../services/topicService";

function DebateTopics() {

    const [topics, setTopics] = useState([]);

    const [title, setTitle] = useState("");

    const [level, setLevel] = useState("Beginner");

    async function loadTopics() {

        try {

            const data = await getTopics();

            setTopics(data);

        } catch (err) {

            console.error(err);

        }

    }

    useEffect(() => {

        loadTopics();

    }, []);

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            await createTopic({

                title: title,

                category: "General",

                difficulty: level,

                description: "Created from Frontend"

            });

            setTitle("");

            setLevel("Beginner");

            loadTopics();

        } catch (err) {

            console.error(err);

        }

    }

    return (

        <AppShell>

            <h1>Debate Topics</h1>

            <br />

            <form onSubmit={handleSubmit} className="panel">

                <h3>Create Topic</h3>

                <br />

                <input
                    value={title}
                    placeholder="Topic Title"
                    onChange={(e) => setTitle(e.target.value)}
                />

                <br /><br />

                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                >

                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>

                </select>

                <br /><br />

                <button type="submit">

                    Add Topic

                </button>

            </form>

            <br />

            <div className="topics-grid">

                {topics.map((topic) => (

                    <TopicCard
                        key={topic.id}
                        title={topic.title}
                        level={topic.difficulty}
                    />

                ))}

            </div>

        </AppShell>

    );

}

export default DebateTopics;