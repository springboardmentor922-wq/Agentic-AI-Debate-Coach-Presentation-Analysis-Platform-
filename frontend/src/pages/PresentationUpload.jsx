import { useState } from "react";
import AppShell from "../layouts/AppShell";
import { analyzePresentation } from "../services/presentationService";

function PresentationUpload() {

    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit() {

        if (!transcript.trim()) {
            alert("Enter a transcript.");
            return;
        }

        try {

            setLoading(true);

            const result = await analyzePresentation(
                transcript
            );

            localStorage.setItem(
                "presentation_result",
                JSON.stringify(result)
            );

            window.location.href = "/presentation-analysis";

        }

        catch {

            alert("Analysis failed.");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <AppShell>

            <h1>Presentation Upload</h1>

            <br />

            <textarea

                rows={15}

                value={transcript}

                onChange={(e) => setTranscript(e.target.value)}

                placeholder="Paste your presentation transcript here..."

                style={{
                    width: "100%",
                    padding: "15px"
                }}

            />

            <br /><br />

            <button
                onClick={submit}
                disabled={loading}
            >

                {loading
                    ? "Analyzing..."
                    : "Analyze Presentation"}

            </button>

        </AppShell>

    );

}

export default PresentationUpload;