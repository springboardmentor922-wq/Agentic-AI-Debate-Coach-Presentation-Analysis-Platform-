/*
=========================================================
Session Header Component

Displays:

- Page Title
- Breadcrumb
- Session Statistics
- Refresh Button
- Create Session Button (Role Based)

Used In

- Debate Sessions Page
- Session Management

=========================================================
*/

import React from "react";

import {

    FaPlus,

    FaSyncAlt,

    FaCalendarCheck,

    FaPlayCircle,

    FaCheckCircle,

} from "react-icons/fa";

import "./SessionHeader.css";

const SessionHeader = ({

    currentUserRole,

    totalSessions,

    activeSessions,

    completedSessions,

    onRefresh,

    onCreateSession,

}) => {

    const canCreateSession = [

        "Coach",

        "Educator",

        "Administrator",

    ].includes(currentUserRole);

    return (

        <div className="session-header">

            {/* Left Section */}

            <div className="session-header-left">


                <h1>

                    Debate Sessions

                </h1>

                <p>

                    Schedule, manage and participate in debate sessions.

                </p>

            </div>

            {/* Right Section */}

            <div className="session-header-right">

                <div className="session-stat-card">

                    <FaCalendarCheck />

                    <div>

                        <h4>

                            {totalSessions}

                        </h4>

                        <span>

                            Total

                        </span>

                    </div>

                </div>

                <div className="session-stat-card">

                    <FaPlayCircle />

                    <div>

                        <h4>

                            {activeSessions}

                        </h4>

                        <span>

                            Active

                        </span>

                    </div>

                </div>

                <div className="session-stat-card">

                    <FaCheckCircle />

                    <div>

                        <h4>

                            {completedSessions}

                        </h4>

                        <span>

                            Completed

                        </span>

                    </div>

                </div>

                <button

                    className="refresh-session-btn"

                    onClick={onRefresh}

                >

                    <FaSyncAlt />

                    Refresh

                </button>

                {

                    canCreateSession && (

                        <button

                            className="create-session-btn"

                            onClick={onCreateSession}

                        >

                            <FaPlus />

                            Create Session

                        </button>

                    )

                }

            </div>

        </div>

    );

};

export default SessionHeader;