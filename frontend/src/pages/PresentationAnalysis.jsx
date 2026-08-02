import { useState } from "react";
import AppShell from "../layouts/AppShell";

function PresentationAnalysis() {
    const [file, setFile] = useState(null);

    function handleAnalyze() {
        if (!file) {
            alert("Please select a presentation file first.");
            return;
        }

        alert(
            "Presentation selected successfully. AI presentation analysis will be connected in Milestone 3."
        );
    }

    return (
        <AppShell>

            <div className="page-header">
                <div>
                    <h1>🎤 Presentation Analysis</h1>

                    <p>
                        Upload a presentation or speech recording to receive
                        AI-powered communication feedback.
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "25px",
                    marginTop: "30px"
                }}
            >

                <div className="panel">

                    <h2>Upload Presentation</h2>

                    <p style={{ color: "#9ca3af" }}>
                        Analyze clarity, confidence, engagement, pace and
                        presentation quality.
                    </p>

                    <div
                        style={{
                            marginTop: "25px",
                            padding: "45px",
                            border: "2px dashed #374151",
                            borderRadius: "16px",
                            textAlign: "center"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "45px",
                                marginBottom: "15px"
                            }}
                        >
                            📁
                        </div>

                        <h3>Select your presentation</h3>

                        <p style={{ color: "#9ca3af" }}>
                            Upload a video, audio or presentation file.
                        </p>

                        <input
                            type="file"
                            accept=".mp4,.mov,.avi,.mp3,.wav,.ppt,.pptx,.pdf"
                            onChange={(e) =>
                                setFile(e.target.files[0])
                            }
                            style={{
                                marginTop: "20px"
                            }}
                        />

                        {file && (
                            <p
                                style={{
                                    marginTop: "18px",
                                    color: "#a78bfa"
                                }}
                            >
                                Selected: {file.name}
                            </p>
                        )}

                    </div>

                    <button
                        onClick={handleAnalyze}
                        style={{
                            marginTop: "25px"
                        }}
                    >
                        ✦ Analyze Presentation
                    </button>

                </div>

                <div className="panel">

                    <h2>AI Analysis</h2>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            marginTop: "25px"
                        }}
                    >

                        <AnalysisItem
                            icon="🗣"
                            title="Clarity"
                            description="Speech clarity and explanation quality."
                        />

                        <AnalysisItem
                            icon="🎯"
                            title="Confidence"
                            description="Confidence and speaking consistency."
                        />

                        <AnalysisItem
                            icon="⚡"
                            title="Engagement"
                            description="Audience engagement and delivery."
                        />

                        <AnalysisItem
                            icon="⏱"
                            title="Pace"
                            description="Speaking speed and pauses."
                        />

                        <AnalysisItem
                            icon="💬"
                            title="Filler Words"
                            description="Detect unnecessary filler words."
                        />

                    </div>

                </div>

            </div>

        </AppShell>
    );
}

function AnalysisItem({ icon, title, description }) {
    return (
        <div
            style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                paddingBottom: "18px",
                borderBottom: "1px solid #374151"
            }}
        >

            <div
                style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "12px",
                    background: "#7c3aed22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                }}
            >
                {icon}
            </div>

            <div>
                <strong>{title}</strong>

                <p
                    style={{
                        color: "#9ca3af",
                        margin: "4px 0 0"
                    }}
                >
                    {description}
                </p>
            </div>

        </div>
    );
}

export default PresentationAnalysis;