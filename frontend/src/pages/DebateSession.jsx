import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FaMicrophone,
    FaStop,
    FaRobot,
    FaClock,
    FaLightbulb,
    FaFlagCheckered,
} from "react-icons/fa";

import Layout from "../components/Layout";

import { debateWithAI } from "../services/debateChatService";
import { submitEvaluation } from "../services/debateService";

function DebateSession() {
    const location = useLocation();
    const navigate = useNavigate();

    const debateInfo = location.state || {};

    const topic = debateInfo.topic || "No Topic Selected";
    const position = debateInfo.position || "For";

    const [debateFormat, setDebateFormat] = useState(
        debateInfo.debateFormat || "One-on-One Debate"
    );
    const [interimText, setInterimText] = useState("");

    const [difficulty, setDifficulty] = useState(
        debateInfo.difficulty || "Easy"
    );

    const [duration, setDuration] = useState(
        Number(debateInfo.duration || 5)
    );

    const [argument, setArgument] = useState("");

    const [messages, setMessages] = useState([]);

    const [loadingAI, setLoadingAI] = useState(false);

    const [recording, setRecording] = useState(false);

    const [audioBlob, setAudioBlob] = useState(null);

    const [remainingSeconds, setRemainingSeconds] = useState(
        Number(debateInfo.duration || 5) * 60
    );

    const [debateFinished, setDebateFinished] = useState(false);

    const [evaluating, setEvaluating] = useState(false);

    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const recordingRef = useRef(false);

    /*
     * Store all arguments given by the learner.
     *
     * This is important because after sending an argument
     * to the AI, the input box is cleared.
     */
    const userArgumentsRef = useRef([]);

    const wordCount =
        argument.trim().length > 0
            ? argument.trim().split(/\s+/).length
            : 0;


    /* =====================================================
       TIMER
    ===================================================== */

    useEffect(() => {
        if (debateFinished) {
            return;
        }

        const timer = setInterval(() => {
            setRemainingSeconds((previous) => {
                if (previous <= 1) {
                    clearInterval(timer);

                    finishDebate();

                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [debateFinished]);


    /* =====================================================
       RESET TIMER WHEN DURATION CHANGES
    ===================================================== */

    useEffect(() => {
        if (!debateFinished) {
            setRemainingSeconds(duration * 60);
        }
    }, [duration]);


    /* =====================================================
       CURRENT TOPIC
    ===================================================== */

    useEffect(() => {
        localStorage.setItem("currentTopic", topic);

        return () => {
            localStorage.removeItem("currentTopic");
        };
    }, [topic]);


    /* =====================================================
       SPEECH RECOGNITION
    ===================================================== */

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {
        const transcript =
            event.results[i][0].transcript;

        if (event.results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interimTranscript += transcript;
        }
    }

    // Permanently save only finalized speech
    if (finalTranscript.trim()) {
        setArgument((previous) => {
            const previousText = previous.trim();

            return `${previousText} ${finalTranscript.trim()}`.trim();
        });
    }

    // Show currently spoken words live
    setInterimText(interimTranscript);
};

        recognition.onend = () => {
            if (recordingRef.current) {
                try {
                    recognition.start();
                } catch (error) {
                    console.log("Recognition restart:", error);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                // Ignore cleanup errors
            }
        };
    }, []);


    /* =====================================================
       FORMAT TIMER
    ===================================================== */

    const formatTime = (totalSeconds) => {
        const minutes = String(
            Math.floor(totalSeconds / 60)
        ).padStart(2, "0");

        const seconds = String(
            totalSeconds % 60
        ).padStart(2, "0");

        return `${minutes}:${seconds}`;
    };


    /* =====================================================
       SEND ARGUMENT TO AI
    ===================================================== */

    const askOpponent = async () => {
        if (!argument.trim()) {
            alert("Please enter your argument first.");
            return;
        }

        if (debateFinished) {
            return;
        }

        try {
            setLoadingAI(true);

            const currentArgument = argument.trim();

            /*
             * Save the learner's argument permanently
             * for final evaluation.
             */
            userArgumentsRef.current.push(
                currentArgument
            );

            const data = await debateWithAI(
                topic,
                position,
                currentArgument
            );

            setMessages((previous) => [
                ...previous,
                {
                    sender: "user",
                    text: currentArgument,
                },
                {
                    sender: "ai",
                    text:
                        data?.ai_response ||
                        "The AI opponent could not generate a response.",
                },
            ]);

            setArgument("");

        } catch (error) {
            console.error(
                "AI opponent error:",
                error
            );

            alert(
                "AI Opponent unavailable. Please try again."
            );

        } finally {
            setLoadingAI(false);
        }
    };


    /* =====================================================
       START MICROPHONE
    ===================================================== */

    const startRecording = async () => {
        if (!recognitionRef.current) {
            alert(
                "Speech Recognition is not supported in this browser."
            );
            return;
        }

        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            const recorder = new MediaRecorder(stream);

            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(
                        event.data
                    );
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(
                    audioChunksRef.current,
                    {
                        type: "audio/webm",
                    }
                );

                setAudioBlob(blob);

                stream
                    .getTracks()
                    .forEach((track) => track.stop());
            };

            mediaRecorderRef.current = recorder;

            recorder.start();

            recordingRef.current = true;
            setRecording(true);

            try {
                recognitionRef.current.start();
            } catch (error) {
                console.log(
                    "Recognition start:",
                    error
                );
            }

        } catch (error) {
            console.error(error);

            alert(
                "Microphone permission was denied."
            );
        }
    };


    /* =====================================================
       STOP MICROPHONE
    ===================================================== */

    const stopRecording = () => {
        recordingRef.current = false;

        setRecording(false);
        setInterimText("");
        try {
            recognitionRef.current?.stop();
        } catch (error) {
            // Ignore
        }

        try {
            mediaRecorderRef.current?.stop();
        } catch (error) {
            // Ignore
        }
    };


    /* =====================================================
       GET COMPLETE DEBATE ARGUMENT
    ===================================================== */

    const getCompleteArgument = () => {
        const savedArguments =
            userArgumentsRef.current;

        /*
         * If there is text currently in the box,
         * include it as well.
         */
        const currentArgument =
            argument.trim();

        const allArguments = [
            ...savedArguments,
            ...(currentArgument
                ? [currentArgument]
                : []),
        ];

        return allArguments.join("\n\n");
    };


    /* =====================================================
       FINISH DEBATE
    ===================================================== */

    const finishDebate = () => {
        if (debateFinished) {
            return;
        }

        if (recording) {
            stopRecording();
        }

        setDebateFinished(true);
    };


    /* =====================================================
       EVALUATE DEBATE
    ===================================================== */

    const handleSubmit = async () => {
        const completeArgument =
            getCompleteArgument();

        if (!completeArgument.trim()) {
            alert(
                "Please provide at least one argument before evaluating the debate."
            );

            return;
        }

        try {
            setEvaluating(true);

            if (recording) {
                stopRecording();
            }

            const token =
                localStorage.getItem("token");

            const formData = new FormData();

            formData.append(
                "topic",
                topic
            );

            formData.append(
                "argument",
                completeArgument
            );

            if (audioBlob) {
                formData.append(
                    "audio",
                    audioBlob,
                    "recording.webm"
                );
            }

            console.log(
                "Submitting debate evaluation..."
            );

            console.log(
                "Topic:",
                topic
            );

            console.log(
                "Argument:",
                completeArgument
            );

            console.log(
                "Audio:",
                audioBlob
            );

            const response =
                await submitEvaluation(
                    formData,
                    token
                );

            /*
             * Send the evaluation result to
             * the existing AI Feedback page.
             */
            navigate("/ai-feedback", {
                state: response.data,
            });

        } catch (error) {
            console.error(
                "Evaluation error:",
                error
            );

            alert(
                error?.response?.data?.detail ||
                "Evaluation Failed. Please try again."
            );

        } finally {
            setEvaluating(false);
        }
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <Layout>

            <div className="learner-dashboard">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="hero-card">

                    <div>
                        <h2>
                            Live Debate Session 🎤
                        </h2>

                        <p>
                            {topic}
                        </p>

                        <p>
                            <strong>
                                Your Position:
                            </strong>{" "}
                            {position}
                        </p>
                    </div>

                    <FaRobot size={60} />

                </div>


                {/* =========================================
                    STATS
                ========================================= */}

                <div className="stats-grid">

                    <div className="stat-card">

                        <FaClock />

                        <h4>
                            Time Remaining
                        </h4>

                        <h2
                            style={{
                                color:
                                    remainingSeconds <= 60
                                        ? "#ef4444"
                                        : undefined,
                            }}
                        >
                            {formatTime(
                                remainingSeconds
                            )}
                        </h2>

                    </div>


                    <div className="stat-card">

                        <FaMicrophone />

                        <h4>
                            Microphone
                        </h4>

                        <h2>
                            {recording
                                ? "🎙 Listening"
                                : "Off"}
                        </h2>

                    </div>


                    <div className="stat-card">

                        <FaMicrophone />

                        <h4>
                            Status
                        </h4>

                        <h2>
                            {debateFinished
                                ? "Finished"
                                : recording
                                ? "Recording"
                                : "Ready"}
                        </h2>

                    </div>


                    <div className="stat-card">

                        <FaLightbulb />

                        <h4>
                            AI Tip
                        </h4>

                        <p>
                            Support every argument
                            with evidence.
                        </p>

                    </div>

                </div>


                {/* =========================================
                    DEBATE CONFIGURATION
                ========================================= */}

                {!debateFinished && (
                    <div className="chart-card">

                        <h3>
                            Debate Configuration
                        </h3>

                        <div className="form-group">

                            <label>
                                Debate Format
                            </label>

                            <select
                                value={debateFormat}
                                onChange={(e) =>
                                    setDebateFormat(
                                        e.target.value
                                    )
                                }
                            >
                                <option>
                                    One-on-One Debate
                                </option>

                                <option>
                                    AI Debate Simulation
                                </option>

                                <option>
                                    Oxford Debate
                                </option>

                                <option>
                                    Public Forum Debate
                                </option>

                                <option>
                                    Policy Debate
                                </option>

                                <option>
                                    Parliamentary Debate
                                </option>
                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Difficulty
                            </label>

                            <select
                                value={difficulty}
                                onChange={(e) =>
                                    setDifficulty(
                                        e.target.value
                                    )
                                }
                            >
                                <option>
                                    Easy
                                </option>

                                <option>
                                    Medium
                                </option>

                                <option>
                                    Hard
                                </option>
                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Duration
                            </label>

                            <select
                                value={duration}
                                onChange={(e) =>
                                    setDuration(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                            >
                                <option value={5}>
                                    5 Minutes
                                </option>

                                <option value={10}>
                                    10 Minutes
                                </option>

                                <option value={15}>
                                    15 Minutes
                                </option>

                                <option value={30}>
                                    30 Minutes
                                </option>
                            </select>

                        </div>

                    </div>
                )}


                {/* =========================================
                    DEBATE AREA
                ========================================= */}

                <div className="dashboard-grid">

                    <div className="chart-card">

                        <h3>
                            Your Argument
                        </h3>

                        <textarea
    className="form-control"
    rows={8}
    value={
        recording && interimText
            ? `${argument}${
                argument ? " " : ""
              }${interimText}`
            : argument
    }
    disabled={debateFinished}
    onChange={(e) =>
        setArgument(e.target.value)
    }
    placeholder={
        recording
            ? "Listening..."
            : "Enter your argument here..."
    }
/>


                        <p
                            style={{
                                marginTop: 10,
                            }}
                        >
                            <strong>
                                Words:
                            </strong>{" "}
                            {wordCount}
                        </p>


                        <button
                            className="btn btn-primary mt-3"
                            onClick={askOpponent}
                            disabled={
                                loadingAI ||
                                debateFinished
                            }
                        >
                            {loadingAI
                                ? "🤖 AI Thinking..."
                                : "🤖 Challenge AI"}
                        </button>


                        {/* AI / USER CHAT */}

                        <div
                            className="chat-card"
                            style={{
                                marginTop: 25,
                            }}
                        >

                            {messages.length === 0 ? (

                                <p
                                    style={{
                                        color: "#64748b",
                                    }}
                                >
                                    Your debate conversation
                                    will appear here.
                                </p>

                            ) : (

                                messages.map(
                                    (msg, index) => (

                                        <div
                                            key={index}
                                            className={
                                                msg.sender ===
                                                "user"
                                                    ? "user-message"
                                                    : "ai-message"
                                            }
                                        >

                                            <strong>
                                                {msg.sender ===
                                                "user"
                                                    ? "👤 You"
                                                    : "🤖 AI"}
                                            </strong>

                                            <p>
                                                {msg.text}
                                            </p>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* =====================================
                        AI SIDE PANEL
                    ===================================== */}

                    <div className="recommendation-card">

                        <h3>
                            AI Live Suggestions
                        </h3>

                        <p>
                            ✔ Speak confidently
                        </p>

                        <p>
                            ✔ Avoid filler words
                        </p>

                        <p>
                            ✔ Add supporting evidence
                        </p>

                        <p>
                            ✔ Maintain logical flow
                        </p>

                        <hr />


                        {/* MICROPHONE */}

                        {!debateFinished && (
                            <>
                                {recording && (
                                    <div
                                        className="mic-live"
                                    >
                                        <div className="live-dot"></div>

                                        Listening...
                                    </div>
                                )}


                                <button
                                    onClick={() => {
                                        if (recording) {
                                            stopRecording();
                                        } else {
                                            startRecording();
                                        }
                                    }}
                                >
                                    {recording ? (
                                        <>
                                            <FaStop />{" "}
                                            Stop Microphone
                                        </>
                                    ) : (
                                        <>
                                            <FaMicrophone />{" "}
                                            Start Microphone
                                        </>
                                    )}
                                </button>
                            </>
                        )}


                        {audioBlob && (
                            <p
                                style={{
                                    color: "green",
                                    marginTop: 15,
                                    fontWeight: "bold",
                                }}
                            >
                                ✅ Voice Recording Ready
                            </p>
                        )}


                        {/* FINISH */}

                        {!debateFinished && (
                            <button
                                style={{
                                    marginTop: 15,
                                    background:
                                        "#ef4444",
                                    color: "white",
                                }}
                                onClick={finishDebate}
                            >
                                <FaFlagCheckered />{" "}
                                Finish Debate
                            </button>
                        )}


                        {/* EVALUATE */}

                        {debateFinished && (
                            <div
                                style={{
                                    marginTop: 20,
                                }}
                            >

                                <h4>
                                    🎉 Debate Completed
                                </h4>

                                <p>
                                    Your debate is ready
                                    for AI evaluation.
                                </p>

                                <button
                                    style={{
                                        marginTop: 15,
                                    }}
                                    onClick={handleSubmit}
                                    disabled={
                                        evaluating
                                    }
                                >
                                    <FaRobot />{" "}
                                    {evaluating
                                        ? "Evaluating..."
                                        : "Evaluate with AI"}
                                </button>

                            </div>
                        )}

                    </div>

                </div>

            </div>

        </Layout>
    );
}

export default DebateSession;