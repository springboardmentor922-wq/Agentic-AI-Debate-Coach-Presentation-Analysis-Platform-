import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBook, FaClock, FaTags, FaPlay } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import SessionCard from "../../components/debateSessions/SessionCard";
import { useAuth } from "../../hooks/useAuth";
import { getTopicById } from "../../services/debateTopicService";
import { getMySessions } from "../../services/debateSessionService";
import { formatDate, toArray } from "../../utils/learnerHelpers";

import "./TopicDetails.css";

const TopicDetails = () => {
    const navigate = useNavigate();
    const { topicId } = useParams();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadTopic = async () => {
            try {
                setLoading(true);
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
    }, [topicId]);

    const relatedSessions = useMemo(() => {
        return sessions.filter((session) => Number(session.topic_id) === Number(topicId));
    }, [sessions, topicId]);

    const handleViewSession = (session) => {
        navigate(`/debate-sessions/${session.id}`, {
            state: {
                selectedTopic: topic,
                selectedSession: session,
            },
        });
    };

    const handleJoinDebate = () => {
        navigate(`/debate-sessions/topic/${topicId}`, { state: { selectedTopic: topic } });
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
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "Debate Topics", path: "/topics" }, { label: topic?.title || "Topic Details" }]} />

                {error && <div className="empty-state">{error}</div>}

                <section className="topic-hero-card">
                    <div>
                        <span className="topic-pill">{topic?.topic_type || "Official"}</span>
                        <h1>{topic?.title}</h1>
                        <p>{topic?.learning_goal || "Backend provided topic details."}</p>
                    </div>
                    <button type="button" className="btn-primary" onClick={handleJoinDebate}>
                        <FaPlay /> Browse Sessions
                    </button>
                </section>

                <div className="topic-meta-grid">
                    <div className="topic-meta-card"><FaTags /><span>Category</span><strong>{topic?.category || "General"}</strong></div>
                    <div className="topic-meta-card"><FaBook /><span>Difficulty</span><strong>{topic?.difficulty_level || "Beginner"}</strong></div>
                    <div className="topic-meta-card"><FaClock /><span>Duration</span><strong>{topic?.estimated_duration || 20} mins</strong></div>
                </div>

                <section className="topic-card">
                    <div className="section-header"><h2>Topic Details</h2></div>
                    <p><strong>Debate Format:</strong> {topic?.debate_format || "Oxford Debate"}</p>
                    <p><strong>Visibility:</strong> {topic?.visibility || "Public"}</p>
                    <p><strong>Learning Goal:</strong> {topic?.learning_goal || "Build debate skill"}</p>
                    <p><strong>Updated:</strong> {formatDate(topic?.updated_at || topic?.created_at)}</p>
                </section>

                <section className="topic-card">
                    <div className="section-header"><h2>Available Sessions</h2></div>
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
                            <div className="empty-state">No sessions have been scheduled for this topic yet.</div>
                        )}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default TopicDetails;
