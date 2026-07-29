/*
=========================================================
Session Info Card

Displays the complete information about a debate session.

Used In

- Session Details
- Debate Room
- Reports (Milestone 2)

=========================================================
*/

import React from "react";

import {

    FaCalendarAlt,
    FaClock,
    FaLayerGroup,
    FaUsers,
    FaVideo,
    FaTag,

} from "react-icons/fa";

import "./SessionInfoCard.css";

const SessionInfoCard = ({ session }) => {

    return (

        <div className="session-info-card">

            <div className="session-info-header">

                <h2>

                    Session Information

                </h2>

            </div>

            <div className="session-info-grid">

                <div className="info-item">

                    <FaTag />

                    <div>

                        <span>Topic</span>

                        <strong>

                            {session.topic_title}

                        </strong>

                    </div>

                </div>

                <div className="info-item">

                    <FaLayerGroup />

                    <div>

                        <span>Debate Format</span>

                        <strong>

                            {session.debate_format}

                        </strong>

                    </div>

                </div>

                <div className="info-item">

                    <FaCalendarAlt />

                    <div>

                        <span>Scheduled Date</span>

                        <strong>

                            {session.scheduled_date}

                        </strong>

                    </div>

                </div>

                <div className="info-item">

                    <FaClock />

                    <div>

                        <span>Duration</span>

                        <strong>

                            {session.duration}

                        </strong>

                    </div>

                </div>

                <div className="info-item">

                    <FaUsers />

                    <div>

                        <span>Maximum Participants</span>

                        <strong>

                            {session.max_participants}

                        </strong>

                    </div>

                </div>

                <div className="info-item">

                    <FaVideo />

                    <div>

                        <span>Recording</span>

                        <strong>

                            {session.recording_enabled

                                ? "Enabled"

                                : "Disabled"}

                        </strong>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default SessionInfoCard;