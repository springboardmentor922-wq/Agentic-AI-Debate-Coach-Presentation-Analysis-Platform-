/*
=========================================================
Debate Header

Displays live debate information.

Used In

- Debate Room
- AI Analysis
- Recording
- Reports

=========================================================
*/

import React from "react";

import {

    FaComments,
    FaClock,
    FaPlayCircle,
    FaSignOutAlt,

} from "react-icons/fa";

import "./DebateHeader.css";

const DebateHeader = ({

    topic,

    debateFormat,

    round,

    status,

    timeRemaining,

    isConnected = true,

    onLeave,

}) => {

    return (

        <div className="debate-header">

            <div className="debate-header-left">

                <div className="debate-topic-icon">

                    <FaComments />

                </div>

                    <div>

                    <h2>{topic}</h2>

                    <p>

                        {debateFormat}

                    </p>

                </div>

            </div>

            <div className="debate-header-center">

                <div className="header-item">

                    <span>Current Round</span>

                    <strong>{round}</strong>

                </div>

                <div className="header-item">

                    <span>Status</span>

                    <strong className={`status ${status?.toLowerCase()}`}>

                        <FaPlayCircle />

                        {status}

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

                    <span>

                        Connection

                    </span>

                    <strong
                        className={isConnected ? "connected" : "disconnected"}
                    >

                        {isConnected ? "Connected" : "Disconnected"}

                    </strong>

                </div>

            </div>

            <div className="debate-header-right">

                <button

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