import { useState } from "react";
import AppShell from "../layouts/AppShell";
import { analyzePresentation } from "../services/presentationService";

function PresentationUpload() {

    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);

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
        recognition.interimResults = false;
        recognition.continuous = false;

        setRecording(true);

        recognition.start();

        recognition.onresult = (event) => {

            const text = event.results[0][0].transcript;

            setTranscript((prev) =>
                prev
                    ? prev + " " + text
                    : text
            );

        };

        recognition.onend = () => {

            setRecording(false);

        };

    }

    async function submit() {

        if (!transcript.trim()) {

            alert("Speak or paste your presentation first.");

            return;

        }

        try {

            setLoading(true);

            const result = await analyzePresentation(transcript);

            localStorage.setItem(
                "presentation_result",
                JSON.stringify(result)
            );

            window.location.href =
                "/presentation-analysis";

        }

        catch (error) {

            console.error(error);

            alert("Presentation analysis failed.");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>🎤 Presentation Upload</h1>

                    <p>

                        Speak into your microphone or paste your presentation transcript.

                    </p>

                </div>

            </div>

            <div
                className="panel"
                style={{ marginTop: "30px" }}
            >

                <textarea
                    rows={15}
                    value={transcript}
                    onChange={(e) =>
                        setTranscript(e.target.value)
                    }
                    placeholder="Paste your transcript or use the microphone..."
                    style={{
                        width: "100%",
                        padding: "15px"
                    }}
                />

                <br />
                <br />

                <button
                    onClick={startRecording}
                    disabled={recording}
                >

                    {recording
                        ? "🎙 Listening..."
                        : "🎙 Record"}

                </button>

                {" "}

                <button
                    onClick={submit}
                    disabled={loading}
                >

                    {loading
                        ? "Analyzing..."
                        : "Analyze Presentation"}

                </button>

            </div>

        </AppShell>

    );

}

export default PresentationUpload;