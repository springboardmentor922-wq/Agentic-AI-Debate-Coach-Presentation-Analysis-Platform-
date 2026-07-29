/*
=========================================================
Recording Panel

Milestone 1
------------
✔ Recording UI
✔ Recording Timer
✔ Microphone Status
✔ Start / Pause / Resume / Stop
✔ Waveform Placeholder

Milestone 2
------------
✔ Browser MediaRecorder
✔ Upload Audio
✔ Speech To Text
✔ AI Analysis

=========================================================
*/

import React, { useEffect, useState } from "react";

import {

    FaMicrophone,
    FaPlay,
    FaPause,
    FaStop,
    FaCircle,
    FaCheckCircle,
    FaSignal,

} from "react-icons/fa";

import "./RecordingPanel.css";

const RecordingPanel = ({

    // onStart,
    // onPause,
    // onStop,
    onAnalyze,

}) => {

    const [isRecording, setIsRecording] = useState(false);

    const [isPaused, setIsPaused] = useState(false);

    const [seconds, setSeconds] = useState(0);

    const [completed, setCompleted] = useState(false);

    useEffect(() => {

        let interval;

        if (isRecording && !isPaused) {

            interval = setInterval(() => {

                setSeconds((prev) => prev + 1);

            }, 1000);

        }

        return () => clearInterval(interval);

    }, [isRecording, isPaused]);

    const formatTime = () => {

        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");

        const secs = String(seconds % 60).padStart(2, "0");

        return `${mins}:${secs}`;

    };

    const handleStart = () => {

        setCompleted(false);

        setIsRecording(true);

        setIsPaused(false);

        

    };

    const handlePause = () => {

        setIsPaused(true);

    

    };

    const handleResume = () => {

        setIsPaused(false);

    };

    const handleStop = () => {

        setCompleted(true);

        setIsRecording(false);

        setIsPaused(false);

    

    };

    return (

        <div className="recording-panel">

            <div className="recording-top">

                <div>

                    <h2>

                        <FaMicrophone />

                        Speech Recording

                    </h2>

                    <p>

                        Record your debate speech for AI evaluation and
                        transcript generation.

                    </p>

                </div>

                <div
                    className={`recording-badge
                    ${isRecording ? "live" : ""}
                    ${completed ? "completed" : ""}`}
                >

                    {

                        completed

                            ?

                            <>

                                <FaCheckCircle />

                                Completed

                            </>

                            :

                            isRecording

                                ?

                                isPaused

                                    ?

                                    "Paused"

                                    :

                                    <>

                                        <FaCircle />

                                        Recording

                                    </>

                                :

                                "Ready"

                    }

                </div>

            </div>

            <div className="recording-center">

                <div className="mic-circle">

                    <FaMicrophone />

                </div>

                <h4>

                    <FaSignal />

                    Microphone Connected

                </h4>

                <div className="recording-time">

                    {formatTime()}

                </div>

            </div>

            <div className="wave-container">

                {

                    Array.from({ length: 30 }).map((_, index) => (

                        <span

                            key={index}

                            className={`wave-bar
                            ${isRecording && !isPaused
                                ? "active"
                                : ""
                            }`}

                            style={{

                                height:

                                    `${20 + (index % 6) * 8}px`

                            }}

                        />

                    ))

                }

            </div>

            <div className="recording-buttons">

                {

                    !isRecording && (

                        <button

                            className="record-btn"

                            onClick={handleStart}

                        >

                            <FaPlay />

                            Start Recording

                        </button>

                    )

                }

                {

                    isRecording && !isPaused && (

                        <button

                            className="pause-btn"

                            onClick={handlePause}

                        >

                            <FaPause />

                            Pause

                        </button>

                    )

                }

                {

                    isRecording && isPaused && (

                        <button

                            className="resume-btn"

                            onClick={handleResume}

                        >

                            <FaPlay />

                            Resume

                        </button>

                    )

                }

                {

                    isRecording && (

                        <button

                            className="stop-btn"

                            onClick={handleStop}

                        >

                            <FaStop />

                            Stop

                        </button>

                    )

                }
                {
    completed && (

        <button
            className="analyze-btn"
            onClick={onAnalyze}
        >
            Analyze Recording
        </button>

    )
}
            </div>

            <div className="recording-footer">

                <div>

                    <strong>Recording Status</strong>

                    <p>

                        {

                            completed

                                ?

                                "Speech recorded successfully."

                                :

                                "Waiting for recording."

                        }

                    </p>

                </div>

                <div>

                    <strong>AI Analysis</strong>

                    <p>

                        Available after recording submission.

                    </p>

                </div>

            </div>

        </div>

    );

};

export default RecordingPanel;