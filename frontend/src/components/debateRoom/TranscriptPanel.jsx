/*
=========================================================
Transcript Panel

Displays the live transcript of the debate.

Milestone 1
------------
✔ Submitted speeches
✔ Speaker information
✔ Timestamp

Milestone 2
------------
✔ Speech-to-Text
✔ Live transcription
✔ AI Highlights
✔ Search Transcript

=========================================================
*/

import React from "react";

import {

    FaComments,
    FaUserCircle,
    FaClock,

} from "react-icons/fa";

import "./TranscriptPanel.css";

const TranscriptPanel = ({

    transcripts = [],

}) => {

    return (

        <div className="transcript-panel">

            <div className="transcript-header">

                <div>

                    <h2>

                        Debate Transcript

                    </h2>

                    <p>

                        Live debate conversation and submitted speeches.

                    </p>

                </div>

                <FaComments className="transcript-icon"/>

            </div>

            {

                transcripts.length === 0 ? (

                    <div className="empty-transcript">

                        <FaComments />

                        <p>

                            No speeches submitted yet.

                        </p>

                    </div>

                ) : (

                    <div className="transcript-list">

                        {

                            transcripts.map((item,index)=>(

                                <div

                                    className="transcript-card"

                                    key={item.id || index}

                                >

                                    <div className="transcript-meta">

                                        <div className="speaker">

                                            <FaUserCircle />

                                            <span>

                                                {item.speaker}

                                            </span>

                                        </div>

                                        <div className="time">

                                            <FaClock />

                                            <span>

                                                {item.time}

                                            </span>

                                        </div>

                                    </div>

                                    <div className="transcript-content">

                                        {item.message}

                                    </div>

                                </div>

                            ))

                        }

                    </div>

                )

            }

        </div>

    );

};

export default TranscriptPanel;