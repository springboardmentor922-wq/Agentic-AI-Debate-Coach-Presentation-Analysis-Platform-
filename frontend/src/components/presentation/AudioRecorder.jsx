import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaPause, FaPlay, FaStop, FaRedo, FaUpload, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "./AudioRecorder.css";

const AudioRecorder = ({ onUploadSuccess }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [presentationTitle, setPresentationTitle] = useState("");
    const [permissionError, setPermissionError] = useState(null);
    const [uploadState, setUploadState] = useState("idle"); // idle, uploading, success, error
    const [uploadMessage, setUploadMessage] = useState("");

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const startRecording = async () => {
        setPermissionError(null);
        setUploadState("idle");
        setUploadMessage("");
        audioChunksRef.current = [];

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPermissionError("Your browser does not support audio recording.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : MediaRecorder.isTypeSupported("audio/mp4")
                ? "audio/mp4"
                : "audio/wav";

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                // Stop all mic tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start(250); // Collect data every 250ms
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access error:", err);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setPermissionError("Microphone permission was denied. Please allow access in your browser settings.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setPermissionError("No microphone hardware found on your device.");
            } else {
                setPermissionError(`Microphone error: ${err.message || "Failed to initialize mic."}`);
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resetRecording = () => {
        if (isRecording) stopRecording();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setUploadState("idle");
        setUploadMessage("");
        setPermissionError(null);
    };

    const handleUpload = async () => {
        if (!audioBlob) {
            setUploadState("error");
            setUploadMessage("No recorded audio available to upload.");
            return;
        }

        setUploadState("uploading");
        setUploadMessage("Uploading presentation recording to MongoDB GridFS...");

        const formData = new FormData();
        const extension = audioBlob.type.includes("webm")
            ? "webm"
            : audioBlob.type.includes("mp4")
            ? "mp4"
            : "wav";
        const filename = `presentation_${Date.now()}.${extension}`;

        formData.append("audio_file", audioBlob, filename);
        formData.append("title", presentationTitle.trim() || "Live Speech Presentation");

        try {
            if (onUploadSuccess) {
                await onUploadSuccess(formData);
            }
            setUploadState("success");
            setUploadMessage("Presentation stored successfully in GridFS!");
        } catch (err) {
            console.error("Upload error:", err);
            setUploadState("error");
            setUploadMessage(err.response?.data?.detail || "Failed to upload recording.");
        }
    };

    return (
        <div className="audio-recorder-card">
            <div className="recorder-header">
                <h3><FaMicrophone className="icon-mic" /> Presentation Studio</h3>
                <p>Record your speech directly from your browser to store and analyze.</p>
            </div>

            {permissionError && (
                <div className="recorder-alert error">
                    <FaExclamationTriangle /> <span>{permissionError}</span>
                </div>
            )}

            <div className="form-group title-group">
                <label htmlFor="presentation-title">Presentation Title / Topic</label>
                <input
                    id="presentation-title"
                    type="text"
                    placeholder="e.g. Climate Action & Economic Growth Keynote"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                    disabled={isRecording || uploadState === "uploading"}
                />
            </div>

            {/* Timer & Status Display */}
            <div className="recorder-display">
                <div className={`status-indicator ${isRecording ? (isPaused ? "paused" : "recording") : ""}`}>
                    <span className="dot"></span>
                    <span>
                        {isRecording
                            ? isPaused
                                ? "RECORDING PAUSED"
                                : "LIVE RECORDING IN PROGRESS"
                            : audioBlob
                            ? "RECORDING COMPLETE"
                            : "READY TO RECORD"}
                    </span>
                </div>
                <div className="timer-value">{formatTime(recordingTime)}</div>
            </div>

            {/* Recording Controls */}
            <div className="recorder-controls">
                {!isRecording && !audioBlob && (
                    <button className="btn btn-primary record-btn" onClick={startRecording}>
                        <FaMicrophone /> Start Recording
                    </button>
                )}

                {isRecording && (
                    <>
                        {isPaused ? (
                            <button className="btn btn-secondary" onClick={resumeRecording}>
                                <FaPlay /> Resume
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={pauseRecording}>
                                <FaPause /> Pause
                            </button>
                        )}
                        <button className="btn btn-danger stop-btn" onClick={stopRecording}>
                            <FaStop /> Stop Recording
                        </button>
                    </>
                )}

                {audioBlob && (
                    <div className="preview-controls">
                        <button className="btn btn-outline" onClick={resetRecording} disabled={uploadState === "uploading"}>
                            <FaRedo /> Re-record
                        </button>
                        <button
                            className="btn btn-success upload-btn"
                            onClick={handleUpload}
                            disabled={uploadState === "uploading" || uploadState === "success"}
                        >
                            <FaUpload /> {uploadState === "uploading" ? "Uploading..." : "Upload Recording"}
                        </button>
                    </div>
                )}
            </div>

            {/* Audio Preview */}
            {audioUrl && (
                <div className="audio-preview-container">
                    <label>Audio Preview:</label>
                    <audio controls src={audioUrl} className="audio-player"></audio>
                </div>
            )}

            {/* Upload Feedback State */}
            {uploadState !== "idle" && (
                <div className={`recorder-alert ${uploadState}`}>
                    {uploadState === "success" && <FaCheckCircle />}
                    {uploadState === "error" && <FaExclamationTriangle />}
                    <span>{uploadMessage}</span>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
