import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

import { getOverview } from "../services/analyticsService";

function SkillTracking() {

    const [overview, setOverview] = useState(null);

    useEffect(() => {

        load();

    }, []);

    async function load() {

        try {

            const data = await getOverview();

            setOverview(data);

        }

        catch (error) {

            console.error(error);

        }

    }

    if (!overview) {

        return (

            <AppShell>

                <h2>Loading Skill Progress...</h2>

            </AppShell>

        );

    }

    const confidence = Math.min(100, Math.round(overview.average_score));
    const communication = Math.min(100, Math.round((overview.completed / Math.max(overview.total_sessions, 1)) * 100));
    const logicalThinking = Math.min(100, Math.round((confidence + communication) / 2));

    return (

        <AppShell>

            <h1>🎯 Skill Tracking</h1>

            <br />

            <Panel title="Current Progress">

                <p>

                    <strong>Confidence</strong>

                </p>

                <progress value={confidence} max="100" style={{ width: "100%" }} />

                <p style={{ marginTop: "8px", color: "#9ca3af" }}>

                    {confidence}%

                </p>

                <br />

                <p>

                    <strong>Communication</strong>

                </p>

                <progress value={communication} max="100" style={{ width: "100%" }} />

                <p style={{ marginTop: "8px", color: "#9ca3af" }}>

                    {communication}%

                </p>

                <br />

                <p>

                    <strong>Logical Thinking</strong>

                </p>

                <progress value={logicalThinking} max="100" style={{ width: "100%" }} />

                <p style={{ marginTop: "8px", color: "#9ca3af" }}>

                    {logicalThinking}%

                </p>

            </Panel>

            <br />

            <Panel title="AI Summary">

                <p>

                    Total Debate Sessions:

                    <strong> {overview.total_sessions}</strong>

                </p>

                <br />

                <p>

                    Average Debate Score:

                    <strong> {overview.average_score}</strong>

                </p>

                <br />

                <p>

                    Completed Sessions:

                    <strong> {overview.completed}</strong>

                </p>

                <br />

                <p>

                    Average Duration:

                    <strong> {overview.average_duration} mins</strong>

                </p>

            </Panel>

        </AppShell>

    );

}

export default SkillTracking;