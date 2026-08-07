import { useState } from "react";
import AppShell from "../layouts/AppShell";
import { analyzePresentation } from "../services/presentationService";

function PresentationUpload() {

    const [file, setFile] = useState(null);

    const [transcript, setTranscript] = useState("");

    const [loading, setLoading] = useState(false);

    const [recording, setRecording] = useState(false);

    

    function startRecording() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert("Speech Recognition is not supported.");

            return;

        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.interimResults = false;

        recognition.continuous = false;

        setRecording(true);

        recognition.start();

        recognition.onresult = (event) => {

            const text =
                event.results[0][0].transcript;

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

        if (!file && !transcript.trim()) {

            alert(

                "Upload a file or enter a transcript."

            );

            return;

        }

        try {

            setLoading(true);

            const result = await analyzePresentation(

                transcript,

                file

            );

            localStorage.setItem(

                "presentation_result",

                JSON.stringify(result)

            );

            window.location.href =
                "/presentation-analysis";

        }

        catch (error) {

            console.error(error);

            alert(

                "Presentation analysis failed."

            );

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

                        Upload a presentation or use the microphone for AI analysis.

                    </p>

                </div>

            </div>

            <div
                className="panel"
                style={{ marginTop: "30px" }}
            >

                <h3>

                    Upload Presentation

                </h3>

                <br />

                <input

                    type="file"

                    accept=".pdf,.ppt,.pptx,.txt,.mp3,.wav,.mp4"

                    onChange={(e) =>

                        setFile(

                            e.target.files[0]

                        )

                    }

                />

                {

                    file &&

                    <p
                        style={{
                            marginTop: "15px",
                            color: "#8b5cf6"
                        }}
                    >

                        Selected:

                        {" "}

                        {file.name}

                    </p>

                }

                <br />

                <h3>

                    OR

                </h3>

                <br />
                <textarea

                    rows={12}

                    value={transcript}

                    onChange={(e) =>
                        setTranscript(e.target.value)
                    }

                    placeholder="Paste your presentation transcript..."

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

                    {

                        recording

                            ?

                            "🎙 Listening..."

                            :

                            "🎙 Record"

                    }

                </button>

                {" "}

                <button

                    onClick={submit}

                    disabled={loading}

                >

                    {

                        loading

                            ?

                            "Analyzing..."

                            :

                            "Analyze Presentation"

                    }

                </button>

            </div>

        </AppShell>

    );

}

export default PresentationUpload;