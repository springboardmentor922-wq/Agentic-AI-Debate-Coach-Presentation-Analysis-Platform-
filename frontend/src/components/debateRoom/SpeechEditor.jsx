import React, { useMemo } from "react";
import {
    FaPaperPlane,
    FaTrash,
    FaSave,
    FaKeyboard,
    FaFileAudio,
    FaVideo,
    FaTimes,
} from "react-icons/fa";

import "./SpeechEditor.css";

const SpeechEditor = ({
    value,
    speechText,
    onChange,
    setSpeechText,
    onSubmit,
    onClear,
    onSaveDraft,
    onAudioUpload,
    onVideoUpload,
    uploadedAudio,
    uploadedVideo,
    onClearAudio,
    onClearVideo,
    disabled = false,
    analyzing = false,
}) => {
    const textValue = (value ?? speechText ?? "").toString();

    const wordCount = useMemo(() => {
        const trimmed = (textValue ?? "").trim();
        if (!trimmed) return 0;
        return trimmed.split(/\s+/).filter(Boolean).length;
    }, [textValue]);

    const characterCount = (textValue ?? "").length;

    const handleTextChange = (val) => {
        const safeVal = (val ?? "").toString();
        if (typeof onChange === "function") onChange(safeVal);
        if (typeof setSpeechText === "function") setSpeechText(safeVal);
    };

    return (
        <div className="speech-editor">
            <div className="speech-editor-header">
                <div>
                    <h2>Speech Editor</h2>
                    <p>Prepare and submit your arguments for the current round.</p>
                </div>

                <div className="speech-stats">
                    <span>Words : {wordCount}</span>
                    <span>Characters : {characterCount}</span>
                </div>
            </div>

            <textarea
                className="speech-textarea"
                placeholder="Type your debate argument here..."
                value={textValue}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={disabled || analyzing}
            />

            <div className="upload-section">
                <label className="upload-btn">
                    <FaFileAudio /> {uploadedAudio ? "Change Audio" : "Upload Audio"}
                    <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            onAudioUpload?.(file);
                        }}
                        disabled={disabled || analyzing}
                    />
                </label>

                <label className="upload-btn">
                    <FaVideo /> {uploadedVideo ? "Change Video" : "Upload Video"}
                    <input
                        type="file"
                        accept="video/*,.mp4,.webm,.mov,.avi"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            onVideoUpload?.(file);
                        }}
                        disabled={disabled || analyzing}
                    />
                </label>
            </div>

            {uploadedAudio && (
                <div className="selected-file" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontSize: "14px" }}>
                    <span>🎵 <strong>Audio Attached:</strong> {uploadedAudio.name} ({(uploadedAudio.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    <button type="button" onClick={onClearAudio} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "auto" }}>
                        <FaTimes />
                    </button>
                </div>
            )}

            {uploadedVideo && (
                <div className="selected-file" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontSize: "14px" }}>
                    <span>🎥 <strong>Video Attached:</strong> {uploadedVideo.name} ({(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    <button type="button" onClick={onClearVideo} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "auto" }}>
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className="speech-editor-footer">
                <div className="typing-indicator">
                    <FaKeyboard />
                    <span>Draft Mode</span>
                </div>

                <div className="speech-actions">
                    <button
                        type="button"
                        className="draft-btn"
                        onClick={onSaveDraft}
                        disabled={disabled || analyzing}
                    >
                        <FaSave /> Save Draft
                    </button>

                    <button
                        type="button"
                        className="clear-btn"
                        onClick={() => {
                            handleTextChange("");
                            onClear?.();
                        }}
                        disabled={disabled || analyzing}
                    >
                        <FaTrash /> Clear Text
                    </button>

                    <button
                        type="button"
                        className="submit-btn"
                        onClick={onSubmit}
                        disabled={
                            disabled ||
                            analyzing ||
                            (!textValue.trim() && !uploadedAudio && !uploadedVideo)
                        }
                    >
                        <FaPaperPlane /> {analyzing ? "Analyzing..." : "Analyze Debate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeechEditor;