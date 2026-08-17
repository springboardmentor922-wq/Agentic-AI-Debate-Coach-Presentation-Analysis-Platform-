import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import DashboardStats from "../dashboards/DashboardStats";
import PerformanceChart from "../dashboards/PerformanceChart";

import { getTodayChallenge } from "../../services/challengeService";

import {
    getDashboardSummary,
    getEvaluationHistory,
} from "../../services/dashboardService";

import { getAssignedDebates } from "../../services/assignedDebateService";

import {
    FaCalendarAlt,
    FaFire,
    FaClock,
    FaBrain,
    FaMicrophone,
    FaRobot,
    FaArrowRight,
    FaBookOpen,
    FaChartLine,
} from "react-icons/fa";

import "../../styles/dashboard.css";


function LearnerDashboard() {

    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [assignedDebates, setAssignedDebates] = useState([]);
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadDashboard();

    }, []);


    async function loadDashboard() {

        try {

            const summaryData = await getDashboardSummary();

            const historyData = await getEvaluationHistory();

            const challengeResponse = await getTodayChallenge();

            let assignedData = [];

            try {

                assignedData = await getAssignedDebates();

            } catch (error) {

                console.log(
                    "Could not load assigned debates:",
                    error
                );

            }


            setSummary(summaryData);

            setHistory(
                Array.isArray(historyData)
                    ? historyData
                    : []
            );

            setAssignedDebates(
                Array.isArray(assignedData)
                    ? assignedData
                    : []
            );

            setChallenge(
                challengeResponse?.data || null
            );


        } catch (err) {

            console.error(
                "Failed to load learner dashboard:",
                err
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <div className="loading-dashboard">

                <h2>Loading Dashboard...</h2>

            </div>

        );

    }


    /*
     * ---------------------------------------------------------
     * REAL DATA CALCULATIONS
     * ---------------------------------------------------------
     */


    // ---------------------------------------------------------
    // Current Streak
    // ---------------------------------------------------------

    function calculateStreak() {

        if (!history.length) {
            return 0;
        }

        const dates = history

            .filter(item => item.created_at)

            .map(item => {

                const date =
                    new Date(item.created_at);

                return date.toISOString().split("T")[0];

            });


        const uniqueDates =
            [...new Set(dates)].sort().reverse();


        if (!uniqueDates.length) {
            return 0;
        }


        let streak = 1;


        for (
            let i = 0;
            i < uniqueDates.length - 1;
            i++
        ) {

            const current =
                new Date(uniqueDates[i]);

            const previous =
                new Date(uniqueDates[i + 1]);


            const difference =
                Math.round(
                    (
                        current - previous
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            if (difference === 1) {

                streak++;

            } else {

                break;

            }

        }


        return streak;

    }


    const currentStreak =
        calculateStreak();


    // ---------------------------------------------------------
    // Upcoming Assigned Debate
    // ---------------------------------------------------------

    const upcomingDebate =
        assignedDebates

            .filter(
                debate =>
                    debate.status !== "Completed" &&
                    debate.status !== "completed"
            )

            .sort(
                (a, b) =>
                    new Date(a.due_date || "9999-12-31") -
                    new Date(b.due_date || "9999-12-31")
            )[0];


    // ---------------------------------------------------------
    // Practice Time
    //
    // We do NOT display fake hours.
    // The current dashboard API does not provide practice
    // duration, so we show that it is unavailable.
    // We will implement this properly later using real
    // debate-session duration data.
    // ---------------------------------------------------------

    const practiceTime =
        "Not available";


    // ---------------------------------------------------------
    // Performance values
    // ---------------------------------------------------------

    const grammar =
        Number(summary?.average_grammar ?? 0);

    const logic =
        Number(summary?.average_logic ?? 0);

    const confidence =
        Number(summary?.average_confidence ?? 0);

    const relevance =
        Number(summary?.average_relevance ?? 0);


    // ---------------------------------------------------------
    // Find weakest skill
    // ---------------------------------------------------------

    const skills = [
        {
            name: "Grammar",
            value: grammar
        },
        {
            name: "Logic",
            value: logic
        },
        {
            name: "Confidence",
            value: confidence
        },
        {
            name: "Relevance",
            value: relevance
        }
    ];


    const weakestSkill =
        [...skills].sort(
            (a, b) =>
                a.value - b.value
        )[0];


    // ---------------------------------------------------------
    // AI Recommendation
    // ---------------------------------------------------------

    let recommendation;


    if (
        !summary ||
        Number(summary.total_debates) === 0
    ) {

        recommendation =
            "Complete your first debate session to receive personalized AI recommendations.";

    } else {

        recommendation =
            `Focus on improving your ${weakestSkill.name.toLowerCase()} skills. Your current average is ${weakestSkill.value}/10.`;

    }


    // ---------------------------------------------------------
    // Recent activity
    // ---------------------------------------------------------

    const recentDebates =
        history.slice(0, 5);


    return (

        <div className="learner-dashboard">


            {/* ------------------------------------------------ */}
            {/* HERO */}
            {/* ------------------------------------------------ */}

            <motion.div

                className="hero-card"

                initial={{
                    opacity: 0,
                    y: -20
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

            >

                <div>

                    <h2>
                        Keep Improving Your Debate Skills 🚀
                    </h2>

                    <p>
                        Practice consistently and let AI help
                        you become a confident speaker.
                    </p>

                </div>

                <FaBrain size={65} />

            </motion.div>



            {/* ------------------------------------------------ */}
            {/* REAL STATISTICS */}
            {/* ------------------------------------------------ */}

            <DashboardStats
                summary={summary}
            />



            {/* ------------------------------------------------ */}
            {/* REAL SUMMARY CARDS */}
            {/* ------------------------------------------------ */}

            <div className="ai-summary-grid">


                {/* Current Streak */}

                <div className="mini-card">

                    <FaFire />

                    <div>

                        <h5>
                            Current Streak
                        </h5>

                        <h3>
                            {currentStreak}{" "}
                            {currentStreak === 1
                                ? "Day"
                                : "Days"}
                        </h3>

                    </div>

                </div>



                {/* Upcoming Debate */}

                <div className="mini-card">

                    <FaCalendarAlt />

                    <div>

                        <h5>
                            Upcoming Debate
                        </h5>


                        {upcomingDebate ? (

                            <>

                                <p>
                                    {upcomingDebate.topic}
                                </p>

                                {upcomingDebate.due_date && (

                                    <small>

                                        Due:{" "}

                                        {new Date(
                                            upcomingDebate.due_date
                                        ).toLocaleDateString()}

                                    </small>

                                )}

                            </>

                        ) : (

                            <p>
                                No upcoming debate
                            </p>

                        )}

                    </div>

                </div>



                {/* Practice Time */}

                <div className="mini-card">

                    <FaClock />

                    <div>

                        <h5>
                            Practice Time
                        </h5>

                        <h3>
                            {practiceTime}
                        </h3>

                    </div>

                </div>


            </div>



            {/* ------------------------------------------------ */}
            {/* ANALYTICS + AI RECOMMENDATION */}
            {/* ------------------------------------------------ */}

            <div className="dashboard-grid dashboard-main-grid">


                <PerformanceChart
                    summary={summary}
                />


                <div className="recommendation-card upcoming-card">

                    <h3>
                        AI Recommendation
                    </h3>


                    <p>
                        {recommendation}
                    </p>


                    {summary &&
                        Number(summary.total_debates) > 0 && (

                            <>

                                <p>

                                    Average score:{" "}

                                    <strong>
                                        {summary.average_score}%
                                    </strong>

                                </p>


                                <p>

                                    Current grade:{" "}

                                    <strong>
                                        {summary.grade}
                                    </strong>

                                </p>

                            </>

                        )}


                    <button
                        onClick={() =>
                            navigate("/learning")
                        }
                    >

                        Learn More

                        <FaArrowRight />

                    </button>

                </div>


            </div>



            {/* ------------------------------------------------ */}
            {/* AI INSIGHTS - REAL DATA */}
            {/* ------------------------------------------------ */}

            <div className="insight-grid">


                <div className="ai-insights">

                    <h3>
                        AI Insights
                    </h3>


                    {history.length === 0 ? (

                        <p>
                            Complete a debate to receive
                            personalized insights.
                        </p>

                    ) : (

                        <ul>

                            <li>

                                Total debates completed:{" "}

                                {summary?.total_debates ?? 0}

                            </li>


                            <li>

                                Average score:{" "}

                                {summary?.average_score ?? 0}%

                            </li>


                            <li>

                                Strongest skill:{" "}

                                {
                                    [...skills].sort(
                                        (a, b) =>
                                            b.value - a.value
                                    )[0]?.name
                                }

                            </li>


                            <li>

                                Area to improve:{" "}

                                {weakestSkill.name}

                            </li>

                        </ul>

                    )}

                </div>



                {/* Today's Challenge */}

                <div className="challenge-card">

                    <h3>
                        Today's AI Challenge
                    </h3>


                    {challenge ? (

                        <>

                            <h4>
                                {challenge.topic}
                            </h4>


                            <p>

                                Position:{" "}

                                {challenge.position}

                            </p>


                            <p>

                                Difficulty:{" "}

                                {challenge.difficulty}

                            </p>


                            <p>

                                Estimated Time:{" "}

                                {challenge.estimated_time}

                            </p>


                            <p>

                                {challenge.reason}

                            </p>


                            <button

                                onClick={() =>

                                    navigate(
                                        "/create-session",
                                        {
                                            state: {
                                                topic:
                                                    challenge.topic,

                                                position:
                                                    challenge.position,

                                                difficulty:
                                                    challenge.difficulty
                                            }
                                        }
                                    )

                                }

                            >

                                Start Challenge

                                <FaArrowRight />

                            </button>

                        </>

                    ) : (

                        <p>
                            No challenge available today.
                        </p>

                    )}

                </div>


            </div>



            {/* ------------------------------------------------ */}
            {/* SKILL PROGRESS */}
            {/* ------------------------------------------------ */}

            <div className="progress-section skills-card">

                <h3>
                    Skill Progress
                </h3>


                <SkillBar
                    title="Grammar"
                    value={grammar}
                />


                <SkillBar
                    title="Logic"
                    value={logic}
                />


                <SkillBar
                    title="Confidence"
                    value={confidence}
                />


                <SkillBar
                    title="Relevance"
                    value={relevance}
                />

            </div>



            {/* ------------------------------------------------ */}
            {/* QUICK ACTIONS */}
            {/* ------------------------------------------------ */}

            <div className="quick-actions">


                <ActionCard
                    icon={<FaMicrophone />}
                    title="Start Debate"
                    onClick={() =>
                        navigate("/create-session")
                    }
                />


                <ActionCard
                    icon={<FaRobot />}
                    title="AI Analysis"
                    onClick={() =>
                        navigate("/ai-feedback")
                    }
                />


                <ActionCard
                    icon={<FaBookOpen />}
                    title="Learning"
                    onClick={() =>
                        navigate("/learning")
                    }
                />


                <ActionCard
                    icon={<FaChartLine />}
                    title="Reports"
                    onClick={() =>
                        navigate("/reports")
                    }
                />


            </div>



            {/* ------------------------------------------------ */}
            {/* RECENT DEBATES */}
            {/* ------------------------------------------------ */}

            <div className="history-card recent-card">

                <h3>
                    Recent Debate Sessions
                </h3>


                {recentDebates.length === 0 ? (

                    <p>
                        No debate sessions completed yet.
                    </p>

                ) : (

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Topic
                                </th>

                                <th>
                                    Score
                                </th>

                                <th>
                                    Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {recentDebates.map(
                                (item) => (

                                    <tr
                                        key={item.id}
                                    >

                                        <td>
                                            {item.topic ||
                                                "Debate"}
                                        </td>


                                        <td>
                                            {item.overall_score ??
                                                0}
                                        </td>


                                        <td>

                                            {item.created_at

                                                ? new Date(
                                                    item.created_at
                                                ).toLocaleDateString()

                                                : "-"
                                            }

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>



            {/* ------------------------------------------------ */}
            {/* RECENT ACTIVITY */}
            {/* ------------------------------------------------ */}

            <div className="recent-activity activity-card">

                <h3>
                    Recent Activity
                </h3>


                {recentDebates.length === 0 ? (

                    <p>
                        No recent activity.
                    </p>

                ) : (

                    recentDebates
                        .slice(0, 3)
                        .map((item) => (

                            <div
                                key={item.id}
                                className="activity-item"
                            >

                                <FaMicrophone />

                                <div>

                                    <strong>
                                        Completed Debate
                                    </strong>

                                    <p>
                                        {item.topic ||
                                            "Debate session completed"}
                                    </p>

                                    <small>

                                        Score:{" "}

                                        {item.overall_score ??
                                            0}

                                    </small>

                                </div>

                            </div>

                        ))

                )}

            </div>


        </div>

    );

}



/* ========================================================= */
/* SKILL BAR */
/* ========================================================= */

function SkillBar({
    title,
    value
}) {

    const safeValue =
        Number(value || 0);


    return (

        <div className="skill">

            <div className="skill-title">

                <span>
                    {title}
                </span>

                <span>
                    {safeValue}/10
                </span>

            </div>


            <div className="progress">

                <div

                    className="progress-fill"

                    style={{
                        width: `${Math.min(
                            safeValue * 10,
                            100
                        )}%`
                    }}

                />

            </div>

        </div>

    );

}



/* ========================================================= */
/* QUICK ACTION CARD */
/* ========================================================= */

function ActionCard({
    icon,
    title,
    onClick
}) {

    return (

        <motion.div

            whileHover={{
                y: -5
            }}

            className="action-card"

            onClick={onClick}

            style={{
                cursor: "pointer"
            }}

        >

            <div className="action-icon">
                {icon}
            </div>


            <h4>
                {title}
            </h4>

        </motion.div>

    );

}


export default LearnerDashboard;