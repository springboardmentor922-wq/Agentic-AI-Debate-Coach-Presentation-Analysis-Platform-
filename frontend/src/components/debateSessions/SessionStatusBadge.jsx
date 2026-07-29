/*
=========================================================
Session Status Badge Component

Reusable Status Badge

Used In

- SessionCard
- SessionDetails
- DebateRoom
- Dashboard

=========================================================
*/

import React from "react";

import "./SessionStatusBadge.css";

const SessionStatusBadge = ({ status }) => {

    const getStatusClass = () => {

        switch (status) {

            case "Scheduled":
                return "status-scheduled";

            case "In Progress":
                return "status-active";

            case "Completed":
                return "status-completed";

            case "Cancelled":
                return "status-cancelled";

            default:
                return "status-default";

        }

    };

    return (

        <span

            className={`session-status-badge ${getStatusClass()}`}

        >

            {status}

        </span>

    );

};

export default SessionStatusBadge;