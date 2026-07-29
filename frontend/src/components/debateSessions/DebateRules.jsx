/*
=========================================================
Debate Rules & Configuration

Displays the rules and configuration for the current
debate session.

Supported Formats

• One-on-One Debate
• Oxford Debate
• Parliamentary Debate
• Policy Debate
• Public Forum Debate
• AI Debate Simulation

=========================================================
*/

import React from "react";

import {

    FaGavel,
    FaClock,
    FaUsers,
    FaMicrophone,
    FaVideo,
    FaRobot,

} from "react-icons/fa";

import "./DebateRules.css";

const DebateRules = ({

    session,

}) => {

    return (

        <div className="debate-rules-card">

            <div className="debate-rules-header">

                <h2>

                    Debate Configuration

                </h2>

                <p>

                    Session rules and format configuration.

                </p>

            </div>

            <div className="rules-grid">

                <div className="rule-item">

                    <FaGavel />

                    <div>

                        <span>Debate Format</span>

                        <strong>

                            {session.debate_format}

                        </strong>

                    </div>

                </div>

                <div className="rule-item">

                    <FaClock />

                    <div>

                        <span>Speaking Time</span>

                        <strong>

                            {session.speaking_time}

                        </strong>

                    </div>

                </div>

                <div className="rule-item">

                    <FaUsers />

                    <div>

                        <span>Maximum Participants</span>

                        <strong>

                            {session.max_participants}

                        </strong>

                    </div>

                </div>

                <div className="rule-item">

                    <FaMicrophone />

                    <div>

                        <span>Position Assignment</span>

                        <strong>

                            {session.position_assignment}

                        </strong>

                    </div>

                </div>

                <div className="rule-item">

                    <FaVideo />

                    <div>

                        <span>Recording</span>

                        <strong>

                            {

                                session.recording_enabled

                                    ? "Enabled"

                                    : "Disabled"

                            }

                        </strong>

                    </div>

                </div>

                <div className="rule-item">

                    <FaRobot />

                    <div>

                        <span>AI Debate Assistant</span>

                        <strong>

                            {

                                session.ai_enabled

                                    ? "Enabled"

                                    : "Disabled"

                            }

                        </strong>

                    </div>

                </div>

            </div>

            <div className="debate-format-panel">

                <h3>

                    Debate Format Overview

                </h3>

                <ul>

                    <li>

                        One-on-One Debate

                    </li>

                    <li>

                        Oxford Debate

                    </li>

                    <li>

                        Parliamentary Debate

                    </li>

                    <li>

                        Policy Debate

                    </li>

                    <li>

                        Public Forum Debate

                    </li>

                    <li>

                        AI Debate Simulation

                    </li>

                </ul>

            </div>

        </div>

    );

};

export default DebateRules;