/*
=========================================================
AI Analysis Panel

Milestone 1
------------
Placeholder for upcoming AI features.

Milestone 2
------------
✔ Argument Strength
✔ Logical Fallacies
✔ Evidence Detection
✔ Persuasiveness Score
✔ Confidence Score
✔ AI Recommendations

=========================================================
*/

import React from "react";

import {

    FaRobot,
    FaBrain,
    FaBalanceScale,
    FaChartLine,
    FaLightbulb,
    FaCheckCircle,

} from "react-icons/fa";

import "./AIAnalysisPanel.css";

const AIAnalysisPanel = () => {

    return (

        <div className="ai-analysis-panel">

            <div className="ai-header">

                <div className="ai-title">

                    <FaRobot />

                    <div>

                        <h2>

                            AI Debate Analysis

                        </h2>

                        <p>

                            Available in Milestone 2

                        </p>

                    </div>

                </div>

                <span className="coming-soon">

                    Coming Soon

                </span>

            </div>

            <div className="ai-features">

                <div className="ai-feature">

                    <FaBrain />

                    <div>

                        <h4>

                            Argument Strength

                        </h4>

                        <p>

                            Evaluate the quality and effectiveness of arguments.

                        </p>

                    </div>

                </div>

                <div className="ai-feature">

                    <FaBalanceScale />

                    <div>

                        <h4>

                            Logical Fallacies

                        </h4>

                        <p>

                            Detect reasoning mistakes and weak arguments.

                        </p>

                    </div>

                </div>

                <div className="ai-feature">

                    <FaChartLine />

                    <div>

                        <h4>

                            Persuasiveness Score

                        </h4>

                        <p>

                            Measure confidence, clarity and impact.

                        </p>

                    </div>

                </div>

                <div className="ai-feature">

                    <FaLightbulb />

                    <div>

                        <h4>

                            AI Suggestions

                        </h4>

                        <p>

                            Receive real-time coaching and improvement tips.

                        </p>

                    </div>

                </div>

                <div className="ai-feature">

                    <FaCheckCircle />

                    <div>

                        <h4>

                            Evidence Analysis

                        </h4>

                        <p>

                            Validate supporting facts and references.

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default AIAnalysisPanel;