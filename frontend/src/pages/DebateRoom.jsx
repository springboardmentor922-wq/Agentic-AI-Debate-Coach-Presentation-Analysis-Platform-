import { useState } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

import { debateWithAI } from "../services/sessionService";

function DebateRoom() {

    const { id } = useParams();

    const [argument, setArgument] = useState("");

    const [loading, setLoading] = useState(false);

    const [recording, setRecording] = useState(false);

    const [result, setResult] = useState(null);

    function startRecording() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert("Speech Recognition is not supported in this browser.");

            return;

        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.continuous = true;

        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        setRecording(true);

        recognition.start();

        let finalTranscript = "";

        recognition.onresult = (event) => {

            let interimTranscript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {

                    finalTranscript += transcript + " ";

                }

                else {

                    interimTranscript += transcript;

                }

            }

            setArgument((prev) =>
                prev
                    ? prev + " " + finalTranscript + interimTranscript
                    : finalTranscript + interimTranscript
            );

        };

        recognition.onend = () => {

            setRecording(false);

        };

    }

    async function handleSubmit(e) {

        e.preventDefault();

        if (!argument.trim()) return;

        setLoading(true);

        try {

            const data = await debateWithAI(id, argument);

            setResult(data);

            setArgument("");

        }

        catch (err) {

            console.error(err);

            alert("Unable to contact AI.");

        }

        setLoading(false);

    }

    return (

        <AppShell>

            <h1>AI Debate Room</h1>

            <br />

            <Panel title="Submit Your Argument">

                <form onSubmit={handleSubmit}>

                    <textarea

                        rows="7"

                        value={argument}

                        onChange={(e) => setArgument(e.target.value)}

                        placeholder="Enter your debate argument here..."

                        style={{

                            width: "100%",

                            padding: "15px",

                            fontSize: "15px"

                        }}

                    />

                    <br /><br />

                    <div
                        style={{
                            display: "flex",
                            gap: "15px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={recording}
                        >

                            {

                                recording

                                    ?

                                    "🎙 Listening..."

                                    :

                                    "🎙 Record"

                            }

                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {

                                loading

                                    ?

                                    "Analyzing..."

                                    :

                                    "Submit Argument"

                            }

                        </button>

                    </div>

                </form>

            </Panel>

            {

                result && (

                    <>

                        <br />

                        <Panel title="🤖 AI Opponent Response">

                            <div

                                style={{

                                    whiteSpace: "pre-wrap",

                                    lineHeight: "1.8"

                                }}

                            >

                                {result.opponent}

                            </div>

                        </Panel>

                        <br />

                        <div

                            style={{

                                display: "grid",

                                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",

                                gap: "20px"

                            }}

                        >

                            <Panel title="Main Claim">

                                {result.analysis.main_claim}

                            </Panel>

                            <Panel title="Supporting Evidence">

                                {result.analysis.supporting_evidence}

                            </Panel>

                        </div>

                        <br />

                        <div

                            style={{

                                display: "grid",

                                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",

                                gap: "20px"

                            }}

                        >

                            <Panel title="Strengths">

                                <ul>

                                    {

                                        result.analysis.strengths.map((item, index) => (

                                            <li key={index}>

                                                {item}

                                            </li>

                                        ))

                                    }

                                </ul>

                            </Panel>

                            <Panel title="Weaknesses">

                                <ul>

                                    {

                                        result.analysis.weaknesses.map((item, index) => (

                                            <li key={index}>

                                                {item}

                                            </li>

                                        ))

                                    }

                                </ul>

                            </Panel>

                        </div>

                        <br />

                        <Panel title="Overall Analysis">

                            {result.analysis.overall_analysis}

                        </Panel>

                        <br />

                        <Panel title="Logical Fallacies">

                            {result.analysis.fallacies}

                        </Panel>

                        <br />

                        <Panel title="Counterargument">

                            {result.feedback.counterargument}

                        </Panel>

                        <br />

                        <Panel title="AI Coaching Feedback">

                            {result.feedback.coaching}

                        </Panel>

                        {

                            result.feedback.score && (

                                <>

                                    <br />

                                    <Panel title="Debate Score">

                                        <h2>

                                            {result.feedback.score}/100

                                        </h2>

                                        <progress

                                            value={result.feedback.score}

                                            max="100"

                                            style={{

                                                width: "100%",

                                                height: "24px"

                                            }}

                                        />

                                    </Panel>

                                </>

                            )

                        }

                    </>

                )

            }

        </AppShell>

    );

}

export default DebateRoom;