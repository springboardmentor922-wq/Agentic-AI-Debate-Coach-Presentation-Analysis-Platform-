import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    FaArrowLeft,
    FaComments,
    FaClock,
    FaTrash,
    FaEye,
    FaSyncAlt,
    FaCheckCircle,
    FaHourglassHalf
} from "react-icons/fa";

import {
    getDebateSessions,
    deleteDebateSession,
    updateDebateSession
} from "../services/debateSessionService";


function DebateSessions() {

    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [deletingId, setDeletingId] =
        useState(null);


    // ==========================================
    // LOAD SESSIONS
    // ==========================================

    useEffect(() => {

        loadSessions();

    }, []);


    const loadSessions = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getDebateSessions();

            setSessions(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Debate sessions error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load debate sessions."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // DELETE SESSION
    // ==========================================

    const handleDelete = async (sessionId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this debate session?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(sessionId);

            await deleteDebateSession(
                sessionId
            );

            setSessions((previous) =>
                previous.filter(
                    (session) =>
                        session.id !== sessionId
                )
            );

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.detail ||
                "Unable to delete session."
            );

        } finally {

            setDeletingId(null);

        }

    };


    // ==========================================
    // STATUS UPDATE
    // ==========================================

    const handleStatusChange = async (
        sessionId,
        status
    ) => {

        try {

            const updated =
                await updateDebateSession(
                    sessionId,
                    status
                );

            setSessions((previous) =>
                previous.map(
                    (session) =>
                        session.id === sessionId
                            ? {
                                ...session,
                                ...updated
                            }
                            : session
                )
            );

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.detail ||
                "Unable to update session."
            );

        }

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        try {

            return new Date(date)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        } catch {

            return "N/A";

        }

    };


    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {

        if (
            status === "Completed" ||
            status === "Reviewed"
        ) {

            return {
                background: "#dcfce7",
                color: "#166534"
            };

        }

        if (
            status === "In Progress"
        ) {

            return {
                background: "#dbeafe",
                color: "#1d4ed8"
            };

        }

        return {
            background: "#fef3c7",
            color: "#92400e"
        };

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading debate sessions...
                    </h2>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div
                style={{
                    padding: "32px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}
                >

                    <div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            style={{
                                border: "none",
                                background:
                                    "transparent",
                                color:
                                    "#5b21b6",
                                fontWeight:
                                    "600",
                                cursor:
                                    "pointer",
                                marginBottom:
                                    "10px"
                            }}
                        >

                            <FaArrowLeft />

                            {" "}Back to Dashboard

                        </button>


                        <h1
                            style={{
                                margin:
                                    "0 0 8px"
                            }}
                        >
                            Debate Sessions
                        </h1>


                        <p
                            style={{
                                margin: 0,
                                color:
                                    "#64748b"
                            }}
                        >
                            View and manage debate
                            practice sessions.
                        </p>

                    </div>


                    <button
                        onClick={loadSessions}
                        style={{
                            border: "none",
                            background:
                                "#5b21b6",
                            color: "white",
                            padding:
                                "11px 18px",
                            borderRadius:
                                "10px",
                            cursor:
                                "pointer",
                            fontWeight:
                                "600",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap:
                                "8px"
                        }}
                    >

                        <FaSyncAlt />

                        Refresh

                    </button>

                </div>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#b91c1c",
                            padding:
                                "18px",
                            borderRadius:
                                "12px",
                            marginBottom:
                                "25px"
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* =====================================
                    SUMMARY
                ===================================== */}

                <div
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap:
                            "20px",
                        marginBottom:
                            "30px"
                    }}
                >

                    <SummaryCard
                        icon={
                            <FaComments />
                        }
                        title="Total Sessions"
                        value={
                            sessions.length
                        }
                    />


                    <SummaryCard
                        icon={
                            <FaHourglassHalf />
                        }
                        title="Pending Review"
                        value={
                            sessions.filter(
                                session =>
                                    session.status ===
                                    "Pending Review"
                            ).length
                        }
                    />


                    <SummaryCard
                        icon={
                            <FaCheckCircle />
                        }
                        title="Completed"
                        value={
                            sessions.filter(
                                session =>
                                    session.status ===
                                    "Completed" ||
                                    session.status ===
                                    "Reviewed"
                            ).length
                        }
                    />


                    <SummaryCard
                        icon={
                            <FaClock />
                        }
                        title="Total Minutes"
                        value={
                            sessions.reduce(
                                (sum, session) =>
                                    sum +
                                    Number(
                                        session.duration ||
                                        0
                                    ),
                                0
                            )
                        }
                    />

                </div>


                {/* =====================================
                    SESSION LIST
                ===================================== */}

                <div
                    style={{
                        background:
                            "white",
                        borderRadius:
                            "18px",
                        padding:
                            "28px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,0.06)"
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom:
                                "20px"
                        }}
                    >
                        All Debate Sessions
                    </h2>


                    {sessions.length === 0 ? (

                        <div
                            style={{
                                textAlign:
                                    "center",
                                padding:
                                    "60px 20px",
                                color:
                                    "#64748b"
                            }}
                        >

                            <FaComments
                                size={45}
                            />

                            <h3>
                                No debate sessions
                                found
                            </h3>

                            <p>
                                Create a debate session
                                to see it here.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                display:
                                    "grid",
                                gap:
                                    "15px"
                            }}
                        >

                            {sessions.map(
                                (session) => {

                                    const statusStyle =
                                        getStatusStyle(
                                            session.status
                                        );


                                    return (

                                        <div
                                            key={
                                                session.id
                                            }
                                            style={{
                                                border:
                                                    "1px solid #e2e8f0",
                                                borderRadius:
                                                    "14px",
                                                padding:
                                                    "20px",
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "20px",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >

                                            {/* SESSION INFO */}

                                            <div
                                                style={{
                                                    flex:
                                                        "1",
                                                    minWidth:
                                                        "250px"
                                                }}
                                            >

                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 8px"
                                                    }}
                                                >

                                                    {session.topic}

                                                </h3>


                                                <p
                                                    style={{
                                                        margin:
                                                            "4px 0",
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >

                                                    Category:{" "}

                                                    <strong>
                                                        {
                                                            session.category
                                                        }
                                                    </strong>

                                                </p>


                                                <p
                                                    style={{
                                                        margin:
                                                            "4px 0",
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >

                                                    Created by:{" "}

                                                    {
                                                        session.created_by
                                                    }

                                                </p>


                                                <p
                                                    style={{
                                                        margin:
                                                            "4px 0",
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >

                                                    Created:{" "}

                                                    {
                                                        formatDate(
                                                            session.created_at
                                                        )
                                                    }

                                                </p>

                                            </div>


                                            {/* DETAILS */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "20px",
                                                    flexWrap:
                                                        "wrap"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >

                                                    <strong>
                                                        {
                                                            session.difficulty
                                                        }
                                                    </strong>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Difficulty
                                                    </div>

                                                </div>


                                                <div
                                                    style={{
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >

                                                    <strong>
                                                        {
                                                            session.duration
                                                        }{" "}
                                                        min
                                                    </strong>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Duration
                                                    </div>

                                                </div>


                                                {/* STATUS */}

                                                <select
                                                    value={
                                                        session.status
                                                    }
                                                    onChange={
                                                        (e) =>
                                                            handleStatusChange(
                                                                session.id,
                                                                e.target.value
                                                            )
                                                    }
                                                    style={{
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "20px",
                                                        padding:
                                                            "8px 12px",
                                                        fontWeight:
                                                            "600",
                                                        cursor:
                                                            "pointer",
                                                        ...statusStyle
                                                    }}
                                                >

                                                    <option>
                                                        Pending Review
                                                    </option>

                                                    <option>
                                                        In Progress
                                                    </option>

                                                    <option>
                                                        Completed
                                                    </option>

                                                    <option>
                                                        Reviewed
                                                    </option>

                                                </select>


                                                {/* VIEW */}

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/debate-sessions/${session.id}`
                                                        )
                                                    }
                                                    style={{
                                                        border:
                                                            "none",
                                                        background:
                                                            "#ede9fe",
                                                        color:
                                                            "#5b21b6",
                                                        padding:
                                                            "10px 13px",
                                                        borderRadius:
                                                            "9px",
                                                        cursor:
                                                            "pointer"
                                                    }}
                                                    title="View Session"
                                                >

                                                    <FaEye />

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            session.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        session.id
                                                    }
                                                    style={{
                                                        border:
                                                            "none",
                                                        background:
                                                            "#fee2e2",
                                                        color:
                                                            "#b91c1c",
                                                        padding:
                                                            "10px 13px",
                                                        borderRadius:
                                                            "9px",
                                                        cursor:
                                                            "pointer"
                                                    }}
                                                    title="Delete Session"
                                                >

                                                    <FaTrash />

                                                </button>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

        </Layout>

    );

}


// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
    icon,
    title,
    value
}) {

    return (

        <div
            style={{
                background:
                    "white",
                borderRadius:
                    "16px",
                padding:
                    "22px",
                boxShadow:
                    "0 4px 20px rgba(0,0,0,0.06)"
            }}
        >

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "15px"
                }}
            >

                <div
                    style={{
                        width:
                            "50px",
                        height:
                            "50px",
                        borderRadius:
                            "12px",
                        background:
                            "#ede9fe",
                        color:
                            "#5b21b6",
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        fontSize:
                            "20px"
                    }}
                >

                    {icon}

                </div>


                <div>

                    <p
                        style={{
                            margin:
                                0,
                            color:
                                "#64748b"
                        }}
                    >
                        {title}
                    </p>


                    <h2
                        style={{
                            margin:
                                "5px 0 0"
                        }}
                    >
                        {value}
                    </h2>

                </div>

            </div>

        </div>

    );

}


export default DebateSessions;