/*
=========================================================
Session Participants Component

Displays all participants of a debate session.

Used In

- Session Details
- Debate Room
- Coach Dashboard
- Educator Dashboard

Milestone 2 Ready

- Speaking Indicator
- AI Score
- Live Status

=========================================================
*/

import React from "react";

import {

    FaUserCircle,
    FaCircle,
    FaMicrophone,
    FaStar,

} from "react-icons/fa";

import "./SessionParticipants.css";

const SessionParticipants = ({

    participants = [],

}) => {

    return (

        <div className="participants-container">

            <div className="participants-header">

                <h3>

                    Participants

                </h3>

                <span>

                    {participants.length}

                </span>

            </div>

            {

                participants.length === 0 ? (

                    <div className="participants-empty">

                        No Participants Yet

                    </div>

                ) : (

                    participants.map((participant) => (

                        <div

                            key={participant.id}

                            className="participant-card"

                        >

                            <div className="participant-left">

                                <FaUserCircle className="participant-avatar" />

                                <div>

                                    <h4>

                                        {participant.full_name}

                                    </h4>

                                    <p>

                                        {participant.position}

                                    </p>

                                </div>

                            </div>

                            <div className="participant-right">

                                {/* Online */}

                                <span className="participant-online">

                                    <FaCircle />

                                    Online

                                </span>

                                {/* Speaking */}

                                <span className="participant-speaking">

                                    <FaMicrophone />

                                    --

                                </span>

                                {/* AI Score */}

                                <span className="participant-score">

                                    <FaStar />

                                    --

                                </span>

                            </div>

                        </div>

                    ))

                )

            }

        </div>

    );

};

export default SessionParticipants;