/*
=========================================================
Speech Editor

Used In

- Debate Room
- AI Analysis
- Practice Mode

Milestone 1
------------
✔ Write Speech
✔ Word Count
✔ Character Count
✔ Submit
✔ Clear Draft

Milestone 2
------------
✔ AI Suggestions
✔ Grammar
✔ Logical Fallacies
✔ Argument Score
✔ Evidence Suggestions

=========================================================
*/

import React, { useMemo, useState } from "react";
import {

    FaPaperPlane,
    FaTrash,
    FaSave,
    FaKeyboard,
    FaFileAudio,
    FaVideo,

} from "react-icons/fa";

import "./SpeechEditor.css";

const SpeechEditor = ({
    value,
    onChange,
    onSubmit,
    onClear,
    onSaveDraft,
    onAudioUpload,
    onVideoUpload,
    hasUploadedAudio = false,
    hasUploadedVideo = false,
    disabled = false,
}) => {
    const wordCount = useMemo(() => {

        if (!value.trim()) return 0;

        return value.trim().split(/\s+/).length;

    }, [value]);

    const characterCount = value.length;
    const [audioName, setAudioName] = useState("");

const [videoName, setVideoName] = useState("");

    return (

        <div className="speech-editor">

            <div className="speech-editor-header">

                <div>

                    <h2>

                        Speech Editor

                    </h2>

                    <p>

                        Prepare and submit your arguments for the current round.

                    </p>

                </div>

                <div className="speech-stats">

                    <span>

                        Words : {wordCount}

                    </span>

                    <span>

                        Characters : {characterCount}

                    </span>

                </div>

            </div>

            <textarea

                className="speech-textarea"

                placeholder="Type your debate argument here..."

                value={value}

                onChange={(e) => onChange(e.target.value)}

                disabled={disabled}

            />

            <div className="upload-section">

    <label className="upload-btn">

        <FaFileAudio />

        Upload Audio

        <input
            type="file"
            accept=".mp3,.wav,.m4a"
            hidden
            onChange={(e) => {

                const file = e.target.files[0];

                if (!file) return;

                setAudioName(file.name);
                setVideoName("");

                onAudioUpload?.(file);

            }}
        />

    </label>

    <label className="upload-btn">

        <FaVideo />

        Upload Video

        <input
            type="file"
            accept=".mp4,.mov,.avi"
            hidden
            onChange={(e) => {

                const file = e.target.files[0];

                if (!file) return;

                setVideoName(file.name);
                setAudioName("");

                onVideoUpload?.(file);

            }}
        />

    </label>

</div>

{audioName && (

    <p className="selected-file">

        🎵 {audioName}

    </p>

)}

{videoName && (

    <p className="selected-file">

        🎥 {videoName}

    </p>

)}

            <div className="speech-editor-footer">

                <div className="typing-indicator">

                    <FaKeyboard />

                    <span>

                        Draft Mode

                    </span>

                </div>

                <div className="speech-actions">

                    <button

                        className="draft-btn"

                        onClick={onSaveDraft}

                    >

                        <FaSave />

                        Save Draft

                    </button>

                    <button

                        className="clear-btn"

                        onClick={onClear}

                    >

                        <FaTrash />

                        Clear

                    </button>

                    <button

                        className="submit-btn"

                        onClick={onSubmit}

                       disabled={
    disabled ||
    (
        !value.trim() &&
        !hasUploadedAudio &&
        !hasUploadedVideo
    )
}

                    >

                        <FaPaperPlane />

                        Analyze Debate

                    </button>

                </div>

            </div>

        </div>

    );

};

export default SpeechEditor;