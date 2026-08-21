/*
=========================================================
Round Progress

Displays the debate timeline and current round.

Milestone 1
------------
✔ Round Progress
✔ Current Round
✔ Completed Rounds

Milestone 2
------------
✔ AI Score per Round
✔ Round Analytics
✔ Speaking Duration
✔ Performance Summary

=========================================================
*/

import React from "react";

import {

    FaCheckCircle,
    FaPlayCircle,
    FaRegCircle,

} from "react-icons/fa";

import "./RoundProgress.css";

const RoundProgress = ({

    rounds = [],

    currentRound = 0,

}) => {

    return (

        <div className="round-progress">

            <div className="round-progress-header">

                <div>

                    <h2>

                        Debate Progress

                    </h2>

                    <p>

                        Track the current stage of the debate.

                    </p>

                </div>

                <span className="progress-counter">

                    Round {currentRound + 1} / {rounds.length}

                </span>

            </div>

            <div className="round-progress-list">

                {

                    rounds.map((round,index)=>{

                        let icon=<FaRegCircle className="pending"/>;

                        let status="pending";

                        if(index<currentRound){

                            icon=<FaCheckCircle className="completed"/>;

                            status="completed";

                        }

                        else if(index===currentRound){

                            icon=<FaPlayCircle className="active"/>;

                            status="active";

                        }

                        return(

                            <div

                                key={round.id || index}

                                className={`progress-item ${status}`}

                            >

                                <div className="progress-icon">

                                    {icon}

                                </div>

                                <div className="progress-content">

                                    <h3>

                                        {round.name}

                                    </h3>

                                    <p>

                                        {round.description}

                                    </p>

                                </div>

                                <div className="progress-duration">

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

export default RoundProgress;