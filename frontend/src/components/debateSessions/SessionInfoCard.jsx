import React from "react";
import {
    FaCalendarAlt,
    FaClock,
    FaLayerGroup,
    FaUsers,
    FaVideo,
    FaTag,
    FaRobot,
    FaUserTie,
    FaChalkboardTeacher,
} from "react-icons/fa";

import "./SessionInfoCard.css";

const SessionInfoCard = ({ session }) => {
    return (
        <div className="session-info-card">
            <div className="session-info-header">
                <h2>Session Information</h2>
            </div>

            <div className="session-info-grid">
                <div className="info-item">
                    <FaTag />
                    <div>
                        <span>Topic</span>
                        <strong>{session.topic_title}</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaLayerGroup />
                    <div>
                        <span>Debate Format</span>
                        <strong>{session.debate_format}</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaCalendarAlt />
                    <div>
                        <span>Scheduled Date</span>
                        <strong>{session.scheduled_date}</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaClock />
                    <div>
                        <span>Duration & Speaking Time</span>
                        <strong>{session.duration} ({session.speaking_time || "5 mins / turn"})</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaUsers />
                    <div>
                        <span>Participants / Slots</span>
                        <strong>{session.max_participants || 4} Slots</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaRobot />
                    <div>
                        <span>AI Assistance</span>
                        <strong>{session.ai_enabled !== false ? "Enabled (LangGraph Brain)" : "Disabled"}</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaUserTie />
                    <div>
                        <span>Debate Coach</span>
                        <strong>{session.coach_name || session.coach || "AI Coach"}</strong>
                    </div>
                </div>

                <div className="info-item">
                    <FaChalkboardTeacher />
                    <div>
                        <span>Educator</span>
                        <strong>{session.educator_name || session.educator || "Platform Educator"}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionInfoCard;