import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Upload() {

    const [file, setFile] = useState(null);

    function handleFileChange(event) {
        setFile(event.target.files[0]);
    }

    function handleUpload() {

        if (!file) {
            alert("Please select a file first.");
            return;
        }

        alert(`"${file.name}" selected successfully.\n\nBackend integration will be added in the next milestone.`);
    }

    return (

        <DashboardLayout>

            <h1>Upload Debate Recording</h1>

            <hr />

            <h3>Select Audio / Video File</h3>

            <input
                type="file"
                accept=".mp3,.wav,.mp4,.mov"
                onChange={handleFileChange}
            />

            <br /><br />

            {file && (
                <>
                    <h3>Selected File</h3>
                    <p>{file.name}</p>
                </>
            )}

            <br />

            <button onClick={handleUpload}>
                Upload
            </button>

            <hr />

            <h2>Supported Formats</h2>

            <ul>
                <li>MP3</li>
                <li>WAV</li>
                <li>MP4</li>
                <li>MOV</li>
            </ul>

        </DashboardLayout>

    );

}