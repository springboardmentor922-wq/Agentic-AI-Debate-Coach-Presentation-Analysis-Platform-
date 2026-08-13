import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaRedo } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import SessionHeader from "../../components/debateSessions/SessionHeader";
import SessionFilters from "../../components/debateSessions/SessionFilters";
import SessionCard from "../../components/debateSessions/SessionCard";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { getMySessions, createSession } from "../../services/debateSessionService";
import { getTopicById } from "../../services/debateTopicService";
import { formatDate, toArray } from "../../utils/learnerHelpers";

import "./DebateSessions.css";

const mapSession = (session) => ({
    ...session,
    title: session.topic_title || session.title || `Session #${session.id}`,
    status: session.session_status || session.status || "Scheduled",
    date: session.scheduled_at || session.date,
    time: session.scheduled_at || session.time,
    participants: session.participant_count ?? session.participants ?? 1,
    position: session.debate_position || session.position || "Affirmative",
});

export default function DebateSessions() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    const initialFormat = location.state?.selectedFormat || "ALL";
    const initialTopic = location.state?.selectedTopic || null;

    const [selectedTopic, setSelectedTopic] = useState(initialTopic);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingSession, setCreatingSession] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [formatFilter, setFormatFilter] = useState(initialFormat);
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            try {
                setLoading(true);

                const [sessionData, topicData] = await Promise.all([
                    getMySessions().catch(() => []),
                    params.topicId ? getTopicById(params.topicId).catch(() => null) : Promise.resolve(initialTopic),
                ]);

                if (!active) return;

                setSessions(toArray(sessionData).map(mapSession));
                setSelectedTopic(topicData || initialTopic);
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load debate sessions right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadData();

        return () => {
            active = false;
        };
    }, [initialTopic, params.topicId]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => {
            const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;
            const matchesFormat = formatFilter === "ALL" || session.debate_format?.toLowerCase() === formatFilter?.toLowerCase();
            const matchesDate = !dateFilter || formatDate(session.date) === formatDate(dateFilter);

            if (selectedTopic?.id && Number(session.topic_id) !== Number(selectedTopic.id)) {
                return false;
            }

            return matchesSearch && matchesStatus && matchesFormat && matchesDate;
        });
    }, [dateFilter, formatFilter, searchTerm, selectedTopic, sessions, statusFilter]);

    const handleCreatePracticeSession = async () => {
        if (!selectedTopic?.id) {
            showToast("Please select a debate topic first.", "warning");
            navigate("/topics");
            return;
        }

        try {
            setCreatingSession(true);
            showToast("Creating practice session...", "info");

            const activeFormat = formatFilter !== "ALL" ? formatFilter : (selectedTopic.debate_format || "Public Forum Debate");
            const newSessionData = await createSession({
                topic_id: Number(selectedTopic.id),
                debate_format: activeFormat,
                debate_position: "Affirmative",
                scheduled_at: new Date().toISOString(),
            });

            showToast("Practice session created successfully!", "success");

            navigate(`/debate-sessions/${newSessionData.id}`, {
                state: {
                    selectedTopic,
                    selectedSession: mapSession(newSessionData),
                },
            });
        } catch (err) {
            console.error("Error creating practice session:", err);
            showToast("Unable to create practice session.", "error");
        } finally {
            setCreatingSession(false);
        }
    };

    const handleBrowseOtherFormats = () => {
        setFormatFilter("ALL");
        if (selectedTopic?.id) {
            navigate(`/topics/${selectedTopic.id}`, { state: { selectedTopic } });
        }
    };

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

    if (loading) {
        return (
            <MainLayout>
                <div className="debate-sessions-page">
                    <div className="empty-state">Loading debate sessions...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="debate-sessions-page">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", path: "/learner/dashboard" },
                        { label: "Debate Topics", path: "/topics" },
                        { label: "Debate Sessions" },
                    ]}
                />

                <SessionHeader
                    title="Debate Sessions"
                    subtitle="Browse available sessions for the selected topic and format."
                />

                {error && <div className="empty-state">{error}</div>}

                {selectedTopic && (
                    <div className="selected-topic-card">
                        <div className="selected-topic-left">
                            <span className="topic-label">Selected Topic</span>
                            <h2>{selectedTopic.title}</h2>
                            <p>{selectedTopic.learning_goal || selectedTopic.description || "Backend provided debate topic."}</p>
                        </div>

                        <div className="selected-topic-right">
                            <div className="topic-info">
                                <span>Category</span>
                                <strong>{selectedTopic.category || "General"}</strong>
                            </div>

                            <div className="topic-info">
                                <span>Selected Format</span>
                                <strong>{formatFilter !== "ALL" ? formatFilter : "All Formats"}</strong>
                            </div>

                            <div className="topic-info">
                                <span>Difficulty</span>
                                <strong>{selectedTopic.difficulty_level || selectedTopic.difficulty || "Beginner"}</strong>
                            </div>
                        </div>
                    </div>
                )}

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

                <div className="sessions-section">
                    <div className="sessions-top">
                        <h2>Available Sessions</h2>
                        <span className="session-count">
                            {filteredSessions.length} Session{filteredSessions.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="sessions-grid">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    currentUserRole={user?.role?.replace("Debate Coach", "Coach")}
                                    onView={handleView}
                                    onJoin={handleJoin}
                                />
                            ))
                        ) : (
                            /* ===========================================
                                REQUIREMENT 5: Empty Format State
                            ============================================ */
                            <div className="empty-state-card">
                                <h3>No sessions scheduled for this format.</h3>
                                <p>
                                    There are currently no active or scheduled sessions for {formatFilter !== "ALL" ? `the ${formatFilter} format` : "this criteria"}. You can create an instant practice session or explore other formats.
                                </p>
                                <div className="empty-state-actions">
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={handleCreatePracticeSession}
                                        disabled={creatingSession}
                                    >
                                        <FaPlus /> {creatingSession ? "Creating..." : "Create Practice Session"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleBrowseOtherFormats}
                                    >
                                        <FaRedo /> Browse Other Formats
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {filteredSessions.length > 0 && (
                    <div className="pagination-wrapper">
                        <button className="pagination-btn" type="button">Previous</button>
                        <button className="pagination-btn active" type="button">1</button>
                        <button className="pagination-btn" type="button">Next</button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}