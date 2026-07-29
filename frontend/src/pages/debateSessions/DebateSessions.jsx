import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import SessionHeader from "../../components/debateSessions/SessionHeader";
import SessionFilters from "../../components/debateSessions/SessionFilters";
import SessionCard from "../../components/debateSessions/SessionCard";

import "./DebateSessions.css";

export default function DebateSessions() {
    const navigate = useNavigate();
    const location = useLocation();

    const selectedTopic = location.state?.selectedTopic || null;

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [formatFilter, setFormatFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    const [sessions] = useState([
        {
            id: 1,
            title: "Oxford Debate Practice",
            debate_format: "Oxford Debate",
            difficulty: "Beginner",
            participants: 2,
            duration: "20 mins",
            status: "Scheduled",
            date: "2026-07-27",
            time: "06:00 PM",
            position: "Affirmative",
        },
        {
            id: 2,
            title: "Public Forum Challenge",
            debate_format: "Public Forum",
            difficulty: "Intermediate",
            participants: 4,
            duration: "30 mins",
            status: "Scheduled",
            date: "2026-07-28",
            time: "04:30 PM",
            position: "Negative",
        },
        {
            id: 3,
            title: "Lincoln-Douglas Debate",
            debate_format: "Lincoln-Douglas",
            difficulty: "Advanced",
            participants: 2,
            duration: "25 mins",
            status: "Completed",
            date: "2026-07-22",
            time: "02:00 PM",
            position: "Affirmative",
        },
        {
            id: 4,
            title: "Parliamentary Debate",
            debate_format: "Parliamentary",
            difficulty: "Intermediate",
            participants: 6,
            duration: "40 mins",
            status: "Scheduled",
            date: "2026-07-30",
            time: "11:00 AM",
            position: "Government",
        },

        {
    id: 5,
    title: "One-on-One Practice",
    debate_format: "One-on-One",
    difficulty: "Beginner",
    participants: 2,
    duration: "20 mins",
    status: "Scheduled",
    date: "2026-07-31",
    time: "05:30 PM",
    position: "Affirmative",
},

{
    id: 6,
    title: "Team Debate Challenge",
    debate_format: "Team Debate",
    difficulty: "Advanced",
    participants: 6,
    duration: "45 mins",
    status: "Scheduled",
    date: "2026-08-01",
    time: "10:00 AM",
    position: "Government",
},
    ]);

    const filteredSessions = useMemo(() => {

        return sessions.filter((session) => {

            const matchesSearch =
                session.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                session.status === statusFilter;

            const matchesFormat =
                formatFilter === "ALL" ||
                session.debate_format === formatFilter;

            const matchesDate =
                !dateFilter ||
                session.date === dateFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesFormat &&
                matchesDate
            );

        });

    }, [
        sessions,
        searchTerm,
        statusFilter,
        formatFilter,
        dateFilter,
    ]);

    const handleView = (session) => {

        navigate(`/debate-sessions/${session.id}`, {
            state: {
                selectedTopic,
                selectedSession: session,
            },
        });

    };

    const handleJoin = (session) => {

        navigate(`/debate-room/${session.id}`, {
            state: {
                selectedTopic,
                selectedSession: session,
            },
        });

    };

        return (
        <MainLayout>
            <div className="debate-sessions-page">

                <Breadcrumb
                    items={[
                        { label: "Dashboard", path: "/dashboard" },
                        { label: "Debate Topics", path: "/debate-topics" },
                        { label: "Debate Sessions" },
                    ]}
                />

                <SessionHeader
                    title="Debate Sessions"
                    subtitle="Browse available sessions for the selected topic."
                />

                {/* Selected Topic */}

                {selectedTopic && (
                    <div className="selected-topic-card">

                        <div className="selected-topic-left">

                            <span className="topic-label">
                                Selected Topic
                            </span>

                            <h2>
                                {selectedTopic.title}
                            </h2>

                            <p>
                                {selectedTopic.description}
                            </p>

                        </div>

                        <div className="selected-topic-right">

                            <div className="topic-info">

                                <span>Category</span>

                                <strong>
                                    {selectedTopic.category}
                                </strong>

                            </div>

                            <div className="topic-info">

                                <span>Difficulty</span>

                                <strong>
                                    {selectedTopic.difficulty_level}
                                </strong>

                            </div>

                            <div className="topic-info">

                                <span>Duration</span>

                                <strong>
                                    {selectedTopic.estimated_duration}
                                    {" "}mins
                                </strong>

                            </div>

                        </div>

                    </div>
                )}

                {/* Filters */}

                <SessionFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    formatFilter={formatFilter}
                    setFormatFilter={setFormatFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />

                {/* Sessions */}

                <div className="sessions-section">

                    <div className="sessions-top">

                        <h2>
                            Available Sessions
                        </h2>

                        <span className="session-count">
                            {filteredSessions.length} Session
                            {filteredSessions.length !== 1 ? "s" : ""}
                        </span>

                    </div>

                    <div className="sessions-grid">

                        {filteredSessions.length > 0 ? (

                            filteredSessions.map((session) => (

                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onView={() =>
                                        handleView(session)
                                    }
                                    onJoin={() =>
                                        handleJoin(session)
                                    }
                                />

                            ))

                        ) : (

                            <div className="empty-state">

                                <h3>
                                    No Sessions Found
                                </h3>

                                <p>
                                    No debate sessions match your
                                    selected filters. Try changing
                                    the Format, Status or Search.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

                            {/* Pagination */}

                {filteredSessions.length > 0 && (
                    <div className="pagination-wrapper">

                        <button className="pagination-btn">
                            Previous
                        </button>

                        <button className="pagination-btn active">
                            1
                        </button>

                        <button className="pagination-btn">
                            Next
                        </button>

                    </div>
                )}

            </div>
        </MainLayout>
    );
}