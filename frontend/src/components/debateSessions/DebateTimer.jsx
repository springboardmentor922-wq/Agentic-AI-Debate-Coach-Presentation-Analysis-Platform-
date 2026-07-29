/*
=========================================================
Debate Timer Component

Reusable Countdown Timer

Used In

- Debate Room
- Session Details
- Round Management

Features

- Countdown Timer
- Start
- Pause
- Resume
- Reset
- Auto Complete Callback

=========================================================
*/

import React, {
    useEffect,
    useState,
} from "react";

import {

    FaPlay,
    FaPause,
    FaRedoAlt,
    FaClock,

} from "react-icons/fa";

import "./DebateTimer.css";

const DebateTimer = ({

    duration = 180,

    autoStart = false,

    onComplete,

}) => {

    const [timeLeft, setTimeLeft] = useState(duration);

    const [isRunning, setIsRunning] = useState(autoStart);

    useEffect(() => {

        if (!isRunning) return;

        if (timeLeft <= 0) {

            setIsRunning(false);

            if (onComplete) {

                onComplete();

            }

            return;

        }

        const timer = setInterval(() => {

            setTimeLeft((prev) => prev - 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [

        isRunning,

        timeLeft,

        onComplete,

    ]);

    useEffect(() => {

        setTimeLeft(duration);

    }, [duration]);

    const formatTime = () => {

        const minutes = Math.floor(timeLeft / 60);

        const seconds = timeLeft % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    };

    const startTimer = () => {

        setIsRunning(true);

    };

    const pauseTimer = () => {

        setIsRunning(false);

    };

    const resetTimer = () => {

        setIsRunning(false);

        setTimeLeft(duration);

    };

    return (

        <div className="debate-timer">

            <div className="timer-header">

                <FaClock />

                <h3>

                    Debate Timer

                </h3>

            </div>

            <div className="timer-display">

                {formatTime()}

            </div>

            <div className="timer-controls">

                {

                    !isRunning ? (

                        <button

                            className="timer-btn start-btn"

                            onClick={startTimer}

                        >

                            <FaPlay />

                            Start

                        </button>

                    ) : (

                        <button

                            className="timer-btn pause-btn"

                            onClick={pauseTimer}

                        >

                            <FaPause />

                            Pause

                        </button>

                    )

                }

                <button

                    className="timer-btn reset-btn"

                    onClick={resetTimer}

                >

                    <FaRedoAlt />

                    Reset

                </button>

            </div>

        </div>

    );

};

export default DebateTimer;