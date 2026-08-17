import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getEducatorClass,
    getAvailableLearners,
    assignLearnersToClass,
    removeLearnerFromClass,
    getClassAnalytics
} from "../services/educatorClassService";

import {
    FaArrowLeft,
    FaUsers,
    FaUserPlus,
    FaChartLine,
    FaTrophy,
    FaGraduationCap,
    FaSearch,
    FaTimes,
    FaCheckCircle,
    FaEye
} from "react-icons/fa";

import "../styles/classDetails.css";


function ClassDetails() {

    const { classId } = useParams();

    const navigate = useNavigate();

    const [classroom, setClassroom] =
        useState(null);

    const [availableLearners, setAvailableLearners] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showLearnerModal, setShowLearnerModal] =
        useState(false);

    const [selectedLearners, setSelectedLearners] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [assigning, setAssigning] =
        useState(false);
    
    const [analytics, setAnalytics] =
    useState(null);

const [analyticsLoading, setAnalyticsLoading] =
    useState(true);


    // ==========================================
    // LOAD CLASS
    // ==========================================

    useEffect(() => {

        loadClass();

    }, [classId]);
    
    useEffect(() => {

    loadAnalytics();

}, [classId]);

   const loadAnalytics = async () => {

    try {

        setAnalyticsLoading(true);

        const data =
            await getClassAnalytics(classId);

        setAnalytics(data);

    } catch (err) {

        console.error(
            "Class analytics error:",
            err
        );

    } finally {

        setAnalyticsLoading(false);

    }

};




    const loadClass = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getEducatorClass(classId);

            setClassroom(data);

        } catch (err) {

            console.error(
                "Class details error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load class."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // OPEN ADD LEARNER MODAL
    // ==========================================

    const openLearnerModal = async () => {

        try {

            setSearch("");

            setSelectedLearners([]);

            const learners =
                await getAvailableLearners(
                    classId
                );

            setAvailableLearners(
                learners || []
            );

            setShowLearnerModal(true);

        } catch (err) {

            console.error(
                "Available learners error:",
                err
            );

            alert(
                err?.response?.data?.detail ||
                "Unable to load available learners."
            );

        }

    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeLearnerModal = () => {

        if (assigning) {
            return;
        }

        setShowLearnerModal(false);

        setSelectedLearners([]);

        setSearch("");

    };


    // ==========================================
    // SELECT / UNSELECT LEARNER
    // ==========================================

    const toggleLearner = (learnerId) => {

        setSelectedLearners((previous) => {

            if (
                previous.includes(learnerId)
            ) {

                return previous.filter(
                    (id) =>
                        id !== learnerId
                );

            }

            return [
                ...previous,
                learnerId
            ];

        });

    };


    // ==========================================
    // ASSIGN LEARNERS
    // ==========================================

    const handleAssign = async () => {

        if (
            selectedLearners.length === 0
        ) {

            alert(
                "Please select at least one learner."
            );

            return;

        }


        try {

            setAssigning(true);

            await assignLearnersToClass(
                classId,
                selectedLearners
            );

            closeLearnerModal();

            await loadClass();

        } catch (err) {

            console.error(
                "Assign learners error:",
                err
            );

            alert(
                err?.response?.data?.detail ||
                "Unable to assign learners."
            );

        } finally {

            setAssigning(false);

        }

    };

    // ==========================================
// REMOVE LEARNER FROM CLASS
// ==========================================

const handleRemoveLearner = async (student) => {

    const confirmed = window.confirm(
        `Are you sure you want to remove ${student.name} from this class?`
    );

    if (!confirmed) {
        return;
    }


    try {

        await removeLearnerFromClass(
            classId,
            student.id
        );

        // Reload class data
        await loadClass();

        alert(
            `${student.name} has been removed from the class.`
        );

    } catch (err) {

        console.error(
            "Remove learner error:",
            err
        );

        alert(
            err?.response?.data?.detail ||
            "Unable to remove learner."
        );

    }

};
    // ==========================================
    // FILTER AVAILABLE LEARNERS
    // ==========================================

    const filteredLearners =
        availableLearners.filter(
            (learner) => {

                const text =
                    `${learner.name || ""} ${
                        learner.email || ""
                    }`.toLowerCase();

                return text.includes(
                    search.toLowerCase()
                );

            }
        );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <Layout>

                <div className="class-details-page">

                    <div className="class-details-loading">

                        <h2>
                            Loading class...
                        </h2>

                    </div>

                </div>

            </Layout>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error || !classroom) {

        return (

            <Layout>

                <div className="class-details-page">

                    <button
                        className="class-back-button"
                        onClick={() =>
                            navigate(
                                "/educator/classes"
                            )
                        }
                    >

                        <FaArrowLeft />

                        Back to Classes

                    </button>


                    <div className="class-details-error">

                        {error ||
                            "Class not found."}

                    </div>

                </div>

            </Layout>

        );

    }


    const students =
        classroom.students || [];


    return (

        <Layout>

            <div className="class-details-page">


                {/* ==================================
                    BACK
                ================================== */}

                <button
                    className="class-back-button"
                    onClick={() =>
                        navigate(
                            "/educator/classes"
                        )
                    }
                >

                    <FaArrowLeft />

                    Back to Classes

                </button>


                {/* ==================================
                    CLASS HEADER
                ================================== */}

                <div className="class-details-header">

                    <div className="class-header-left">

                        <div className="class-large-icon">

                            <FaGraduationCap />

                        </div>


                        <div>

                            <h1>
                                {classroom.name}
                            </h1>

                            <p>

                                {classroom.description ||
                                    "No description added."}

                            </p>

                        </div>

                    </div>


                    <button
                        className="add-learners-button"
                        onClick={
                            openLearnerModal
                        }
                    >

                        <FaUserPlus />

                        Add Learners

                    </button>

                </div>


                {/* ==================================
                    STATS
                ================================== */}

                <div className="class-stat-grid">


                    <StatCard
                        icon={<FaUsers />}
                        title="Total Learners"
                        value={
                            classroom.student_count ??
                            students.length
                        }
                    />


                    <StatCard
                        icon={<FaChartLine />}
                        title="Average Score"
                        value={`${classroom.average_score ?? 0}%`}
                    />


                    <StatCard
                        icon={<FaTrophy />}
                        title="Top Performer"
                        value={
                            classroom.top_performer?.name ||
                            "N/A"
                        }
                        extra={
                            classroom.top_performer?.score
                                ? `${classroom.top_performer.score}%`
                                : ""
                        }
                    />


                    <StatCard
                        icon={<FaGraduationCap />}
                        title="Class ID"
                        value={`#${classroom.id}`}
                    />

                </div>

                {/* ==================================
    CLASS ANALYTICS
================================== */}

<div className="class-analytics-section">

    <div className="analytics-header">

        <div>

            <h2>
                Class Performance
            </h2>

            <p>
                Overall performance of learners
                in this class.
            </p>

        </div>

    </div>


    {analyticsLoading ? (

        <div className="analytics-loading">

            Loading analytics...

        </div>

    ) : analytics ? (

        <>

            {/* SUMMARY */}

            <div className="analytics-summary">

                <AnalyticsCard
                    title="Average Score"
                    value={`${analytics.average_score}%`}
                />

                <AnalyticsCard
                    title="Highest Score"
                    value={`${analytics.highest_score}%`}
                />

                <AnalyticsCard
                    title="Lowest Score"
                    value={`${analytics.lowest_score}%`}
                />

                <AnalyticsCard
                    title="Evaluated Debates"
                    value={analytics.total_evaluations}
                />

            </div>


            {/* SKILLS */}

            <div className="skills-performance">

                <h3>
                    Skill Performance
                </h3>


                <SkillBar
                    name="Grammar"
                    value={
                        analytics.skills.grammar
                    }
                />


                <SkillBar
                    name="Logic"
                    value={
                        analytics.skills.logic
                    }
                />


                <SkillBar
                    name="Confidence"
                    value={
                        analytics.skills.confidence
                    }
                />


                <SkillBar
                    name="Relevance"
                    value={
                        analytics.skills.relevance
                    }
                />

            </div>


            {/* SCORE DISTRIBUTION */}

            <div className="score-distribution">

                <h3>
                    Score Distribution
                </h3>


                <DistributionRow
                    label="Excellent"
                    value={
                        analytics
                            .score_distribution
                            .excellent
                    }
                    className="excellent"
                />


                <DistributionRow
                    label="Good"
                    value={
                        analytics
                            .score_distribution
                            .good
                    }
                    className="good"
                />


                <DistributionRow
                    label="Average"
                    value={
                        analytics
                            .score_distribution
                            .average
                    }
                    className="average"
                />


                <DistributionRow
                    label="Needs Improvement"
                    value={
                        analytics
                            .score_distribution
                            .needs_improvement
                    }
                    className="needs-improvement"
                />

            </div>
                        {/* ==================================
                TOP LEARNERS
            ================================== */}

            <div className="top-learners-section">

                <div className="top-learners-header">

                    <div>

                        <h3>
                            Top Learners
                        </h3>

                        <p>
                            Highest performing learners
                            based on their average debate score.
                        </p>

                    </div>

                    <FaTrophy />

                </div>


                {analytics.top_learners &&
                analytics.top_learners.length > 0 ? (

                    <div className="top-learners-list">

                        {analytics.top_learners.map(
                            (learner, index) => (

                                <div
                                    className="top-learner-row"
                                    key={learner.id}
                                >

                                    <div className="learner-rank">

                                        {index === 0
                                            ? "🏆"
                                            : `#${index + 1}`}

                                    </div>


                                    <div className="top-learner-avatar">

                                        {getInitials(
                                            learner.name
                                        )}

                                    </div>


                                    <div className="top-learner-info">

                                        <strong>
                                            {learner.name}
                                        </strong>

                                        <span>
                                            {learner.evaluation_count}
                                            {" "}
                                            {learner.evaluation_count === 1
                                                ? "evaluation"
                                                : "evaluations"}
                                        </span>

                                    </div>


                                    <div className="top-learner-score">

                                        {learner.average_score}%

                                    </div>

                                </div>

                            )
                        )}

                    </div>
                    

                ) : (

                    <div className="analytics-empty">

                        No evaluated learners yet.

                    </div>

                )}

            </div>

            {/* ==================================
    RECENT EVALUATIONS
================================== */}

<div className="recent-evaluations-section">

    <div className="recent-evaluations-header">

        <div>

            <h3>
                Recent Debate Activity
            </h3>

            <p>
                Latest evaluations from learners
                in this class.
            </p>

        </div>

        <FaChartLine />

    </div>


    {analytics.recent_evaluations &&
    analytics.recent_evaluations.length > 0 ? (

        <div className="recent-evaluations-list">

            {analytics.recent_evaluations.map(
                (evaluation) => (

                    <div
                        className="recent-evaluation-row"
                        key={evaluation.id}
                    >

                        {/* LEARNER */}

                        <div className="recent-evaluation-learner">

                            <div className="top-learner-avatar">

                                {getInitials(
                                    evaluation.learner_name
                                )}

                            </div>

                            <div>

                                <strong>
                                    {evaluation.learner_name}
                                </strong>

                                <span>
                                    {formatEvaluationDate(
                                        evaluation.created_at
                                    )}
                                </span>

                            </div>

                        </div>


                        {/* TOPIC */}

                        <div className="recent-evaluation-topic">

                            <span>
                                Topic
                            </span>

                            <strong>
                                {evaluation.topic ||
                                    "Untitled Debate"}
                            </strong>

                        </div>


                        {/* SCORE */}

                        <div className="recent-evaluation-score">

                            <span>
                                Score
                            </span>

                            <strong>
                                {evaluation.score}%
                            </strong>

                        </div>


                        {/* GRADE */}

                        <div className="recent-evaluation-grade">

                            <span>
                                Grade
                            </span>

                            <strong>
                                {evaluation.grade}
                            </strong>

                        </div>


                        {/* VIEW */}

                        <button
                            className="view-evaluation-button"
                            onClick={() =>
                                navigate(
                                    `/educator/learners/${evaluation.learner_id}/evaluations/${evaluation.id}`
                                )
                            }
                        >
                            <FaEye />
                            View
                        </button>

                    </div>

                )
            )}

        </div>

    ) : (

        <div className="analytics-empty">

            No evaluations available yet.

        </div>

    )}

</div>

        </>

        

    ) : (

        <div className="analytics-empty">

            No analytics available yet.

        </div>

    )}

</div>




                {/* ==================================
                    LEARNERS
                ================================== */}

                <div className="learners-section">

                    <div className="learners-section-header">

                        <div>

                            <h2>
                                Learners
                            </h2>

                            <p>
                                Learners currently
                                assigned to this class.
                            </p>

                        </div>


                        <span className="learner-count">

                            {students.length}

                            {" "}Learners

                        </span>

                    </div>


                    {students.length === 0 ? (

                        <div className="no-learners">

                            <div className="no-learners-icon">

                                <FaUsers />

                            </div>

                            <h3>
                                No learners assigned
                            </h3>

                            <p>
                                Add learners to this
                                classroom to start
                                tracking their progress.
                            </p>

                            <button
                                className="add-learners-button"
                                onClick={
                                    openLearnerModal
                                }
                            >

                                <FaUserPlus />

                                Add Learners

                            </button>

                        </div>

                    ) : (

                        <div className="learners-table-wrapper">

                            <table className="learners-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Learner
                                        </th>

                                        <th>
                                            College
                                        </th>

                                        <th>
                                            Branch
                                        </th>

                                        <th>
                                            CGPA
                                        </th>

                                        <th>
                                            Average Score
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {students.map(
                                        (student) => (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>

                                                    <div className="learner-info">

                                                        <div className="learner-avatar">

                                                            {getInitials(
                                                                student.name
                                                            )}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    student.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    student.email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    {student.college ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    {student.branch ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    {student.cgpa ??
                                                        "—"}

                                                </td>


                                                <td>

                                                    <span className="score-badge">

                                                        {
                                                            student.average_score ??
                                                            0
                                                        }%

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="learner-actions">

    <button
        className="view-learner-button"
        onClick={() =>
            navigate(
                `/educator/learner/${student.id}`
            )
        }
    >

        <FaEye />

        View

    </button>


    <button
        className="remove-learner-button"
        onClick={() =>
            handleRemoveLearner(student)
        }
    >

        Remove

    </button>

</div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* ==================================
                    ADD LEARNERS MODAL
                ================================== */}

                {showLearnerModal && (

                    <div
                        className="learner-modal-overlay"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                closeLearnerModal();

                            }

                        }}
                    >

                        <div className="learner-modal">

                            <div className="learner-modal-header">

                                <div>

                                    <h2>
                                        Add Learners
                                    </h2>

                                    <p>
                                        Select learners to
                                        add to this class.
                                    </p>

                                </div>


                                <button
                                    className="learner-modal-close"
                                    onClick={
                                        closeLearnerModal
                                    }
                                >

                                    <FaTimes />

                                </button>

                            </div>


                            {/* SEARCH */}

                            <div className="learner-search">

                                <FaSearch />

                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* LEARNER LIST */}

                            <div className="available-learners">

                                {filteredLearners.length ===
                                0 ? (

                                    <div className="no-available-learners">

                                        <FaUsers />

                                        <p>
                                            No available
                                            learners found.
                                        </p>

                                    </div>

                                ) : (

                                    filteredLearners.map(
                                        (learner) => {

                                            const selected =
                                                selectedLearners.includes(
                                                    learner.id
                                                );


                                            return (

                                                <div
                                                    key={
                                                        learner.id
                                                    }
                                                    className={
                                                        selected
                                                            ? "available-learner selected"
                                                            : "available-learner"
                                                    }
                                                    onClick={() =>
                                                        toggleLearner(
                                                            learner.id
                                                        )
                                                    }
                                                >

                                                    <div className="available-avatar">

                                                        {getInitials(
                                                            learner.name
                                                        )}

                                                    </div>


                                                    <div className="available-info">

                                                        <strong>
                                                            {
                                                                learner.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                learner.email
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="learner-check">

                                                        {selected && (

                                                            <FaCheckCircle />

                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                            </div>


                            {/* MODAL FOOTER */}

                            <div className="learner-modal-footer">

                                <span>

                                    {selectedLearners.length}

                                    {" "}selected

                                </span>


                                <div>

                                    <button
                                        className="cancel-learner-button"
                                        onClick={
                                            closeLearnerModal
                                        }
                                        disabled={
                                            assigning
                                        }
                                    >

                                        Cancel

                                    </button>


                                    <button
                                        className="assign-button"
                                        onClick={
                                            handleAssign
                                        }
                                        disabled={
                                            assigning ||
                                            selectedLearners.length ===
                                            0
                                        }
                                    >

                                        {assigning
                                            ? "Adding..."
                                            : "Add Selected"}

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </Layout>

    );

}


/* ==========================================
   STAT CARD
========================================== */

function StatCard({
    icon,
    title,
    value,
    extra
}) {

    return (

        <div className="class-stat-card">

            <div className="class-stat-icon">

                {icon}

            </div>

            <div>

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

                {extra && (

                    <small>
                        {extra}
                    </small>

                )}

            </div>

        </div>

    );

}


/* ==========================================
   INITIALS
========================================== */

function getInitials(name) {

    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .map(
            (part) =>
                part.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}

function formatEvaluationDate(date) {

    if (!date) {
        return "Date unavailable";
    }

    try {

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return "Date unavailable";

    }

}

function AnalyticsCard({
    title,
    value
}) {

    return (

        <div className="analytics-card">

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>

    );

}


function SkillBar({
    name,
    value
}) {

    return (

        <div className="skill-row">

            <div className="skill-row-header">

                <span>
                    {name}
                </span>

                <strong>
                    {value}%
                </strong>

            </div>


            <div className="skill-bar">

                <div
                    className="skill-bar-fill"
                    style={{
                        width: `${Math.min(
                            Math.max(
                                value,
                                0
                            ),
                            100
                        )}%`
                    }}
                />

            </div>

        </div>

    );

}


function DistributionRow({
    label,
    value,
    className
}) {

    return (

        <div className="distribution-row">

            <span>
                {label}
            </span>

            <div className="distribution-track">

                <div
                    className={`distribution-fill ${className}`}
                    style={{
                        width:
                            value === 0
                                ? "0%"
                                : `${Math.min(
                                    value * 10,
                                    100
                                )}%`
                    }}
                />

            </div>

            <strong>
                {value}
            </strong>

        </div>

    );

}


export default ClassDetails;