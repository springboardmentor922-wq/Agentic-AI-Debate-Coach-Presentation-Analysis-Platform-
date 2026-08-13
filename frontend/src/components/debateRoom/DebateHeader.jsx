import React from "react";
import {
    FaComments,
    FaClock,
    FaPlayCircle,
    FaSignOutAlt,
} from "react-icons/fa";

import "./DebateHeader.css";

const DebateHeader = ({
    session,
    topic,
    debateFormat,
    round,
    status,
    timeRemaining = "05:00",
    isConnected = true,
    onLeave,
}) => {
    const topicText = (topic ?? session?.topic_title ?? "Debate Topic").toString();
    const formatText = (debateFormat ?? session?.debate_format ?? "Oxford Debate").toString();
    const roundText = (round ?? `Round 1`).toString();
    const statusText = (status ?? session?.status ?? "Live").toString();
    const safeStatusLower = (statusText || "live").toLowerCase();

    return (
        <div className="debate-header">
            <div className="debate-header-left">
                <div className="debate-topic-icon">
                    <FaComments />
                </div>
                <div>
                    <h2>{topicText}</h2>
                    <p>{formatText}</p>
                </div>
            </div>

            <div className="debate-header-center">
                <div className="header-item">
                    <span>Current Round</span>
                    <strong>{roundText}</strong>
                </div>

                <div className="header-item">
                    <span>Status</span>
                    <strong className={`status ${safeStatusLower}`}>
                        <FaPlayCircle />
                        {statusText}
                    </strong>
                </div>

                <div className="header-item">
                    <span>Time Remaining</span>
                    <strong>
                        <FaClock />
                        {timeRemaining}
                    </strong>
                </div>

                <div className="header-item">
                    <span>Connection</span>
                    <strong className={isConnected ? "connected" : "disconnected"}>
                        {isConnected ? "Connected" : "Disconnected"}
                    </strong>
                </div>
            </div>

            <div className="debate-header-right">
                <button
                    type="button"
                    className="leave-room-btn"
                    onClick={onLeave}
                >
                    <FaSignOutAlt />
                    Leave Debate
                </button>
            </div>
        </div>
    );
};

export default DebateHeader;