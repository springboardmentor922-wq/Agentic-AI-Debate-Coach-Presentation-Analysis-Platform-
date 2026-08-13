import React from "react";
import {
    FaCalendarAlt,
    FaClock,
    FaUsers,
    FaPlay,
    FaEye,
    FaEdit,
    FaTimesCircle,
    FaSignInAlt,
    FaUserTie,
    FaChalkboardTeacher,
} from "react-icons/fa";

import "./SessionCard.css";
import SessionStatusBadge from "./SessionStatusBadge";

const SessionCard = ({
    session,
    currentUserRole,
    onView,
    onJoin,
    onEdit,
    onStart,
    onCancel,
}) => {
    const formatDate = (date) => {
        const value = date || session.date;
        if (!value) return "--";
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (session.time) return session.time;
        if (!date) return "--";
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return "--";
        return parsed.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatClass = (session.debate_format || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    const participantCount = session.participant_count ?? session.participants ?? 1;
    const maxSlots = session.max_slots || session.max_participants || 4;
    const availableSlots = Math.max(0, maxSlots - participantCount);

    return (
        <div className="session-card">
            <div className="session-card-header">
                <div>
                    <h3 className="session-title">
                        {session.topic_title || session.title}
                    </h3>
                    <div className={`format-badge ${formatClass}`}>
                        {session.debate_format}
                    </div>
                </div>
                <SessionStatusBadge status={session.session_status || session.status} />
            </div>

            <div className="session-card-body">
                <div className="session-item">
                    <FaCalendarAlt />
                    <span>{formatDate(session.scheduled_at || session.date)}</span>
                </div>

                <div className="session-item">
                    <FaClock />
                    <span>{formatTime(session.scheduled_at)} ({session.duration || "20 mins"})</span>
                </div>

                <div className="session-item">
                    <FaUsers />
                    <span>{participantCount} / {maxSlots} Slots ({availableSlots} Available)</span>
                </div>

                <div className="session-item">
                    <FaUserTie />
                    <span>Coach: {session.coach_name || session.coach || "AI Coach"}</span>
                </div>

                <div className="session-item">
                    <FaChalkboardTeacher />
                    <span>Educator: {session.educator_name || session.educator || "Platform Educator"}</span>
                </div>
            </div>

            <div className="session-card-footer">
                <button
                    type="button"
                    className="btn-outline"
                    onClick={() => onView(session)}
                >
                    <FaEye /> View Details
                </button>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onJoin(session)}
                >
                    <FaSignInAlt /> Join Debate
                </button>

                {["Coach", "Educator", "Administrator"].includes(currentUserRole) && (
                    <>
                        <button
                            type="button"
                            className="btn-warning"
                            onClick={() => onEdit(session)}
                        >
                            <FaEdit /> Edit
                        </button>

                        {(session.session_status || session.status) === "Scheduled" && (
                            <button
                                type="button"
                                className="btn-success"
                                onClick={() => onStart(session)}
                            >
                                <FaPlay /> Start
                            </button>
                        )}

                        {(session.session_status || session.status) !== "Cancelled" &&
                            (session.session_status || session.status) !== "Completed" && (
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => onCancel(session)}
                                >
                                    <FaTimesCircle /> Cancel
                                </button>
                            )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SessionCard;
