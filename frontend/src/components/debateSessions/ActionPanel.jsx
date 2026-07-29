/*
=========================================================
Action Panel

Role Based Session Actions

Learner
--------
Join
Ready
Enter Debate Room

Coach
------
Assign Position
Start Debate
Cancel Session

Educator
---------
Manage Session
Start Debate

Administrator
--------------
Full Session Control

=========================================================
*/

import React from "react";

import {

    FaPlay,
    FaDoorOpen,
    FaUserCheck,
    FaUserFriends,
    FaTimesCircle,
    FaEdit,

} from "react-icons/fa";

import "./ActionPanel.css";

const ActionPanel = ({

    role,

    session,

    onJoin,

    onReady,

    onAssign,

    onStart,

    onEdit,

    onCancel,

    onEnterRoom,

}) => {

    return (

        <div className="action-panel">

            <div className="action-panel-header">

                <h2>

                    Session Actions

                </h2>

                <p>

                    Available actions based on your role.

                </p>

            </div>

            <div className="action-buttons">

                {

                    role === "Learner" && (

                        <>

                            <button

                                className="primary-btn"

                                onClick={() => onJoin(session)}

                            >

                                <FaUserFriends />

                                Join Session

                            </button>

                            <button

                                className="secondary-btn"

                                onClick={() => onReady(session)}

                            >

                                <FaUserCheck />

                                Ready

                            </button>

                            <button

                                className="success-btn"

                                onClick={() => onEnterRoom(session)}

                            >

                                <FaDoorOpen />

                                Enter Debate Room

                            </button>

                        </>

                    )

                }

                {

                    (role === "Coach" ||

                    role === "Educator" ||

                    role === "Administrator") && (

                        <>

                            <button

                                className="primary-btn"

                                onClick={() => onAssign(session)}

                            >

                                <FaUserFriends />

                                Assign Positions

                            </button>

                            <button

                                className="warning-btn"

                                onClick={() => onEdit(session)}

                            >

                                <FaEdit />

                                Edit Session

                            </button>

                            <button

                                className="success-btn"

                                onClick={() => onStart(session)}

                            >

                                <FaPlay />

                                Start Debate

                            </button>

                            <button

                                className="danger-btn"

                                onClick={() => onCancel(session)}

                            >

                                <FaTimesCircle />

                                Cancel Session

                            </button>

                        </>

                    )

                }

            </div>

        </div>

    );

};

export default ActionPanel;