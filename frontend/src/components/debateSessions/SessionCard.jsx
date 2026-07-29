/*
=========================================================
Session Card Component
=========================================================
*/

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

        if (isNaN(parsed.getTime())) {

            return value;

        }

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    };

    const formatTime = (date) => {

        if (session.time) {

            return session.time;

        }

        if (!date) return "--";

        const parsed = new Date(date);

        if (isNaN(parsed.getTime())) {

            return "--";

        }

        return parsed.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    };

    const formatClass = (session.debate_format || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

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

                <SessionStatusBadge
                    status={session.session_status || session.status}
                />

            </div>

            <div className="session-card-body">

                <div className="session-item">

                    <FaCalendarAlt />

                    <span>

                        {formatDate(
                            session.scheduled_at || session.date
                        )}

                    </span>

                </div>

                <div className="session-item">

                    <FaClock />

                    <span>

                        {formatTime(
                            session.scheduled_at
                        )}

                    </span>

                </div>

                <div className="session-item">

                    <FaUsers />

                    <span>

                        {
                            session.participant_count ??
                            session.participants ??
                            0
                        } Participants

                    </span>

                </div>

                <div className="session-item">

                    <strong>

                        Position:

                    </strong>

                    <span>

                        {
                            session.debate_position ||
                            session.position ||
                            "--"
                        }

                    </span>

                </div>

            </div>

            <div className="session-card-footer">

                <button
                    className="btn-outline"
                    onClick={() => onView(session)}
                >

                    <FaEye />

                    View Details

                </button>

                <button
                    className="btn-primary"
                    onClick={() => onJoin(session)}
                >

                    <FaSignInAlt />

                    Join Debate

                </button>


                {
                    ["Coach", "Educator", "Administrator"].includes(
                        currentUserRole
                    ) && (
                        <>

                            <button
                                className="btn-warning"
                                onClick={() => onEdit(session)}
                            >
                                <FaEdit />
                                Edit
                            </button>

                            {(session.session_status || session.status) ===
                                "Scheduled" && (
                                <button
                                    className="btn-success"
                                    onClick={() => onStart(session)}
                                >
                                    <FaPlay />
                                    Start
                                </button>
                            )}

                            {(session.session_status || session.status) !==
                                "Cancelled" &&
                                (session.session_status || session.status) !==
                                    "Completed" && (
                                    <button
                                        className="btn-danger"
                                        onClick={() => onCancel(session)}
                                    >
                                        <FaTimesCircle />
                                        Cancel
                                    </button>
                                )}

                        </>
                    )
                }

            </div>

        </div>

    );

};

export default SessionCard;
