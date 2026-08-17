import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getEducatorLearnerDetail
} from "../services/educatorClassService";
import "../styles/educatorLearnerDetails.css";
import {
    FaArrowLeft,
    FaUser,
    FaGraduationCap,
    FaChartLine,
    FaTrophy,
    FaBook,
    FaGithub,
    FaLinkedin,
    FaGlobe,
    FaEye
} from "react-icons/fa";

function EducatorLearnerDetails() {

    const { learnerId } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadLearner();

    }, [learnerId]);


    const loadLearner = async () => {

        try {

            setLoading(true);

            setError("");

            const result =
                await getEducatorLearnerDetail(
                    learnerId
                );

            setData(result);

        } catch (err) {

            console.error(
                "Learner details error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load learner details."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <Layout>

                <div className="educator-details-page">

                    <div className="details-loading">

                        <h2>
                            Loading learner details...
                        </h2>

                    </div>

                </div>

            </Layout>

        );

    }


    /* =========================
       ERROR
    ========================= */

    if (error || !data) {

        return (

            <Layout>

                <div className="educator-details-page">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/educator/learners")
                        }
                    >

                        <FaArrowLeft />

                        Back to Learners

                    </button>


                    <div className="details-error">

                        {error ||
                            "Learner details not found."}

                    </div>

                </div>

            </Layout>

        );

    }


    const profile = data.profile || {};

    const performance =
        data.performance || {};

    const skills =
        data.skills || {};

    const history =
        data.debate_history || [];


    return (

        <Layout>

            <div className="educator-details-page">


                {/* =========================
                    BACK BUTTON
                ========================= */}

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/educator/learners")
                    }
                >

                    <FaArrowLeft />

                    Back to Learners

                </button>


                {/* =========================
                    PROFILE HEADER
                ========================= */}

                <div className="learner-profile-header">

                    <div className="learner-avatar">

                        <FaUser />

                    </div>


                    <div className="learner-header-info">

                        <h1>
                            {profile.name ||
                                "Learner"}
                        </h1>

                        <p>
                            {profile.email ||
                                "No email available"}
                        </p>

                        <span className="learner-role">

                            Learner

                        </span>

                    </div>

                </div>


                {/* =========================
                    PERSONAL + ACADEMIC
                ========================= */}

                <div className="details-grid">


                    <div className="details-card">

                        <div className="card-title">

                            <FaUser />

                            <h2>
                                Personal Information
                            </h2>

                        </div>


                        <div className="info-grid">

                            <InfoItem
                                label="Full Name"
                                value={
                                    profile.name
                                }
                            />

                            <InfoItem
                                label="Email"
                                value={
                                    profile.email
                                }
                            />

                            <InfoItem
                                label="Experience Level"
                                value={
                                    profile.experience_level
                                }
                            />

                            <InfoItem
                                label="Learning Goal"
                                value={
                                    profile.learning_goal
                                }
                            />

                        </div>

                    </div>


                    <div className="details-card">

                        <div className="card-title">

                            <FaGraduationCap />

                            <h2>
                                Academic Information
                            </h2>

                        </div>


                        <div className="info-grid">

                            <InfoItem
                                label="College"
                                value={
                                    profile.college
                                }
                            />

                            <InfoItem
                                label="Branch"
                                value={
                                    profile.branch
                                }
                            />

                            <InfoItem
                                label="Graduation Year"
                                value={
                                    profile.graduation_year
                                }
                            />

                            <InfoItem
                                label="CGPA"
                                value={
                                    profile.cgpa
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* =========================
                    LINKS
                ========================= */}

                {(profile.github ||
                    profile.linkedin ||
                    profile.portfolio) && (

                    <div className="details-card">

                        <div className="card-title">

                            <FaGlobe />

                            <h2>
                                Professional Links
                            </h2>

                        </div>


                        <div className="profile-links">

                            {profile.github && (

                                <a
                                    href={
                                        profile.github
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >

                                    <FaGithub />

                                    GitHub

                                </a>

                            )}


                            {profile.linkedin && (

                                <a
                                    href={
                                        profile.linkedin
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >

                                    <FaLinkedin />

                                    LinkedIn

                                </a>

                            )}


                            {profile.portfolio && (

                                <a
                                    href={
                                        profile.portfolio
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >

                                    <FaGlobe />

                                    Portfolio

                                </a>

                            )}

                        </div>

                    </div>

                )}


                {/* =========================
                    PERFORMANCE
                ========================= */}

                <div className="section-heading">

                    <FaChartLine />

                    <h2>
                        Performance Overview
                    </h2>

                </div>


                <div className="performance-grid">


                    <PerformanceCard
                        title="Total Debates"
                        value={
                            performance.total_debates ??
                            0
                        }
                        icon={<FaBook />}
                    />


                    <PerformanceCard
                        title="Average Score"
                        value={`${performance.average_score ?? 0}%`}
                        icon={<FaChartLine />}
                    />


                    <PerformanceCard
                        title="Highest Score"
                        value={`${performance.highest_score ?? 0}%`}
                        icon={<FaTrophy />}
                    />


                    <PerformanceCard
                        title="Lowest Score"
                        value={`${performance.lowest_score ?? 0}%`}
                        icon={<FaBook />}
                    />

                </div>


                {/* =========================
                    SKILLS
                ========================= */}

                <div className="section-heading">

                    <FaChartLine />

                    <h2>
                        Skill Performance
                    </h2>

                </div>


                <div className="skills-card">


                    <SkillBar
                        name="Grammar"
                        value={
                            skills.grammar ?? 0
                        }
                    />


                    <SkillBar
                        name="Logic"
                        value={
                            skills.logic ?? 0
                        }
                    />


                    <SkillBar
                        name="Confidence"
                        value={
                            skills.confidence ?? 0
                        }
                    />


                    <SkillBar
                        name="Relevance"
                        value={
                            skills.relevance ?? 0
                        }
                    />

                </div>


                {/* =========================
                    DEBATE HISTORY
                ========================= */}

                <div className="section-heading">

                    <FaBook />

                    <h2>
                        Debate History
                    </h2>

                </div>


                <div className="history-card">

                    {history.length === 0 ? (

                        <div className="empty-history">

                            <p>
                                No debate evaluations
                                available.
                            </p>

                        </div>

                    ) : (

                        <div className="history-table-wrapper">

                            <table className="history-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Topic
                                        </th>

                                        <th>
                                            Score
                                        </th>

                                        <th>
                                            Grade
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {history.map(
                                        (evaluation) => (

                                            <tr
                                                key={
                                                    evaluation.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            evaluation.topic ||
                                                            "Untitled Debate"
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getScoreClass(
                                                                evaluation.score
                                                            )
                                                        }
                                                    >

                                                        {
                                                            evaluation.score
                                                        }%

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="grade-badge">

                                                        {
                                                            evaluation.grade ||
                                                            "N/A"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        formatDate(
                                                            evaluation.created_at
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <button
                                                        className="view-evaluation-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/educator/learners/${learnerId}/evaluations/${evaluation.id}`
                                                            )
                                                        }
                                                    >

                                                        <FaEye />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </Layout>

    );

}


/* ==========================================
   INFO ITEM
========================================== */

function InfoItem({
    label,
    value
}) {

    return (

        <div className="info-item">

            <span>
                {label}
            </span>

            <strong>
                {value ||
                    "Not added"}
            </strong>

        </div>

    );

}


/* ==========================================
   PERFORMANCE CARD
========================================== */

function PerformanceCard({
    title,
    value,
    icon
}) {

    return (

        <div className="performance-card">

            <div className="performance-icon">

                {icon}

            </div>

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>

    );

}


/* ==========================================
   SKILL BAR
========================================== */

function SkillBar({
    name,
    value
}) {

    const percentage =
        Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            100
        );


    return (

        <div className="skill-row">

            <div className="skill-header">

                <span>
                    {name}
                </span>

                <strong>
                    {percentage}%
                </strong>

            </div>


            <div className="skill-track">

                <div
                    className="skill-progress"
                    style={{
                        width:
                            `${percentage}%`
                    }}
                />

            </div>

        </div>

    );

}


/* ==========================================
   SCORE COLOR
========================================== */

function getScoreClass(score) {

    const value =
        Number(score) || 0;

    if (value >= 80) {
        return "score-high";
    }

    if (value >= 60) {
        return "score-medium";
    }

    return "score-low";

}


/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }

    const date =
        new Date(dateString);

    if (Number.isNaN(
        date.getTime()
    )) {
        return "N/A";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


export default EducatorLearnerDetails;