import { useState } from "react";

import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

import { getTranscript } from "../services/transcriptService";

function History() {

    const [sessionId, setSessionId] = useState("");

    const [history, setHistory] = useState([]);

    async function loadHistory() {

        try {

            const data = await getTranscript(sessionId);

            setHistory(data);

        }

        catch {

            alert("Transcript not found.");

        }

    }

    return (

        <AppShell>

            <h1>Debate History</h1>

            <br />

            <Panel title="Load Transcript">

                <input

                    placeholder="Enter Session ID"

                    value={sessionId}

                    onChange={(e) => setSessionId(e.target.value)}

                />

                <br /><br />

                <button onClick={loadHistory}>

                    Load History

                </button>

            </Panel>

            <br />

            <Panel title="Transcript">

                {

                    history.map((item, index) => (

                        <div
                            key={index}
                            style={{
                                marginBottom: "18px"
                            }}
                        >

                            <strong>

                                {item.speaker.toUpperCase()}

                            </strong>

                            <br />

                            {item.message}

                            <hr />

                        </div>

                    ))

                }

            </Panel>

        </AppShell>

    );

}

export default History;