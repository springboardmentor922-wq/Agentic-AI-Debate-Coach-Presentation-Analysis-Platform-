import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaBook, FaClock, FaTags, FaPlay, FaGraduationCap, FaArrowRight } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import SessionCard from "../../components/debateSessions/SessionCard";
import { useAuth } from "../../hooks/useAuth";
import { getTopicById } from "../../services/debateTopicService";
import { getMySessions } from "../../services/debateSessionService";
import { formatDate, toArray } from "../../utils/learnerHelpers";

import "./TopicDetails.css";

const DEBATE_FORMATS = [
    {
        name: "Oxford Debate",
        description: "Formal motion-based debate with affirmative and negative teams arguing structured proposals.",
        icon: "🏛️"
    },
    {
        name: "Lincoln-Douglas Debate",
        description: "One-on-one value-driven debate focusing on philosophy, ethics, and moral principles.",
        icon: "⚖️"
    },
    {
        name: "Parliamentary Debate",
        description: "Dynamic parliamentary style emphasizing impromptu reasoning, points of information, and wit.",
        icon: "📜"
    },
    {
        name: "Public Forum Debate",
        description: "Accessible, fast-paced debate on current events and public interest policy topics.",
        icon: "🗣️"
    },
    {
        name: "Team Debate",
        description: "Collaborative multi-speaker debate emphasizing teamwork, cross-examination, and rebuttal.",
        icon: "👥"
    },
    {
        name: "One-to-One Debate",
        description: "Direct head-to-head debate against an opponent or AI Coach to sharpen personal skills.",
        icon: "⚔️"
    }
];

const TopicDetails = () => {
    const navigate = useNavigate();
    const { topicId } = useParams();
    const location = useLocation();
    const { user } = useAuth();

    const initialTopic = location.state?.selectedTopic || null;
    const [topic, setTopic] = useState(initialTopic);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(!initialTopic);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadTopic = async () => {
            try {
                if (!initialTopic) setLoading(true);
                const [topicData, sessionData] = await Promise.all([
                    getTopicById(topicId),
                    getMySessions().catch(() => []),
                ]);

                if (!active) return;

                setTopic(topicData);
                setSessions(toArray(sessionData));
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load topic details.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadTopic();
        return () => { active = false; };
    }, [topicId, initialTopic]);

    const relatedSessions = useMemo(() => {
        return sessions.filter((session) => Number(session.topic_id) === Number(topicId));
    }, [sessions, topicId]);

    const handleSelectFormat = async (formatName) => {
        const existingSession = relatedSessions.find(
            (s) => (s.debate_format || "").toLowerCase() === formatName.toLowerCase()
        );

        if (existingSession) {
            navigate(`/debate-room/${existingSession.id}`, {
                state: {
                    selectedTopic: topic,
                    selectedSession: existingSession,
                },
            });
            return;
        }

        try {
            const { createSession } = await import("../../services/debateSessionService");
            const newSession = await createSession({
                topic_id: Number(topic.id || topicId),
                debate_format: formatName,
                debate_position: "Affirmative",
                scheduled_at: new Date().toISOString(),
            });

            navigate(`/debate-room/${newSession.id}`, {
                state: {
                    selectedTopic: topic,
                    selectedSession: newSession,
                },
            });
        } catch (err) {
            console.error("Format selection session creation error:", err);
            navigate("/debate-sessions", {
                state: {
                    selectedTopic: topic,
                    selectedFormat: formatName,
                },
            });
        }
    };

    const handleViewSession = (session) => {
        navigate(`/debate-sessions/${session.id}`, {
            state: {
                selectedTopic: topic,
                selectedSession: session,
            },
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="topic-details-page"><div className="empty-state">Loading topic details...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="topic-details-page">
                <Breadcrumb items={[
                    { label: "Dashboard", path: "/learner/dashboard" },
                    { label: "Debate Topics", path: "/topics" },
                    { label: topic?.title || "Topic Details" }
                ]} />

                {error && <div className="empty-state">{error}</div>}

                <section className="topic-hero-card">
                    <div>
                        <span className="topic-pill">{topic?.topic_type || "Official"}</span>
                        <h1>{topic?.title}</h1>
                        <p>{topic?.learning_goal || topic?.description || "Backend provided topic details."}</p>
                    </div>
                    <button type="button" className="btn-primary" onClick={() => handleSelectFormat(topic?.debate_format || "Public Forum Debate")}>
                        <FaPlay /> Select Default Format
                    </button>
                </section>

                <div className="topic-meta-grid">
                    <div className="topic-meta-card"><FaTags /><span>Category</span><strong>{topic?.category || "General"}</strong></div>
                    <div className="topic-meta-card"><FaBook /><span>Difficulty</span><strong>{topic?.difficulty_level || "Beginner"}</strong></div>
                    <div className="topic-meta-card"><FaClock /><span>Duration</span><strong>{topic?.estimated_duration || 20} mins</strong></div>
                </div>

                {/* ===========================================
                    REQUIREMENT 2: Debate Format Selection
                ============================================ */}
                <section className="topic-card">
                    <div className="section-header">
                        <h2>Select Debate Format</h2>
                        <span className="section-subtitle">Choose a debate format to view or create sessions for this topic.</span>
                    </div>

                    <div className="formats-grid">
                        {DEBATE_FORMATS.map((fmt) => (
                            <div
                                key={fmt.name}
                                className={`format-option-card ${topic?.debate_format === fmt.name ? "recommended" : ""}`}
                                onClick={() => handleSelectFormat(fmt.name)}
                            >
                                <div className="format-icon">{fmt.icon}</div>
                                <div className="format-info">
                                    <h3>{fmt.name}</h3>
                                    <p>{fmt.description}</p>
                                </div>
                                <button type="button" className="format-btn">
                                    Select Format <FaArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="topic-card">
                    <div className="section-header"><h2>Topic Information</h2></div>
                    <p><strong>Recommended Format:</strong> {topic?.debate_format || "Public Forum Debate"}</p>
                    <p><strong>Visibility:</strong> {topic?.visibility || "Public"}</p>
                    <p><strong>Learning Goal:</strong> {topic?.learning_goal || "Build debate skill"}</p>
                    <p><strong>Updated:</strong> {formatDate(topic?.updated_at || topic?.created_at)}</p>
                </section>

                <section className="topic-card">
                    <div className="section-header"><h2>All Topic Sessions ({relatedSessions.length})</h2></div>
                    <div className="sessions-grid">
                        {relatedSessions.length > 0 ? relatedSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                currentUserRole={user?.role?.replace("Debate Coach", "Coach")}
                                onView={handleViewSession}
                                onJoin={handleViewSession}
                            />
                        )) : (
                            <div className="empty-state">No scheduled sessions for this topic yet. Select a debate format above to create one.</div>
                        )}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default TopicDetails;
