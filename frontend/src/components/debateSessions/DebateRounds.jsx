/*
=========================================================
Debate Rounds

Displays the debate flow for the current session.

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

    FaCheckCircle,
    FaRegCircle,
    FaPlayCircle,

} from "react-icons/fa";

import "./DebateRounds.css";

const DebateRounds = ({

    rounds = [],

    currentRound = 0,

}) => {

    return (

        <div className="debate-rounds">

            <div className="debate-rounds-header">

                <h2>

                    Debate Rounds

                </h2>

                <p>

                    Follow the progress of the debate session.

                </p>

            </div>

            <div className="rounds-list">

                {

                    rounds.map((round, index) => {

                        let icon = <FaRegCircle className="round-pending"/>;

                        let statusClass = "pending";

                        if(index < currentRound){

                            icon = <FaCheckCircle className="round-completed"/>;

                            statusClass = "completed";

                        }

                        else if(index === currentRound){

                            icon = <FaPlayCircle className="round-active"/>;

                            statusClass = "active";

                        }

                        return(

                            <div

                                key={round.id || index}

                                className={`round-card ${statusClass}`}

                            >

                                <div className="round-icon">

                                    {icon}

                                </div>

                                <div className="round-content">

                                    <h3>

                                        {round.name}

                                    </h3>

                                    <p>

                                        {round.description}

                                    </p>

                                </div>

                                <div className="round-duration">

                                    {round.duration}

                                </div>

                            </div>

                        );

                    })

                }

            </div>

        </div>

    );

};

export default DebateRounds;