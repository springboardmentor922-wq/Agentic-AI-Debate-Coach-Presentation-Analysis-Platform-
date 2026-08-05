/*
=========================================================
Session Details

Pre-Debate Lobby

Milestone 1

- Session Information
- Participants
- Debate Rounds
- Debate Rules
- Timer Preview
- Action Panel

← Back to Debate Sessions

Dashboard / Debate Sessions / Session Details

Debate Session
Review the session details before entering the debate room.

Milestone 2

- AI Analysis
- Recording
- Live Transcript
- Recommendations

=========================================================
*/

import { useEffect, useMemo, useState } from "react";

import {
    useNavigate,
    useParams,
    useLocation,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import SessionHeader from "../../components/debateSessions/SessionHeader";
import SessionInfoCard from "../../components/debateSessions/SessionInfoCard";
import SessionParticipants from "../../components/debateSessions/SessionParticipants";
import DebateRounds from "../../components/debateSessions/DebateRounds";
import DebateRules from "../../components/debateSessions/DebateRules";
import SessionStatusBadge from "../../components/debateSessions/SessionStatusBadge";
import ActionPanel from "../../components/debateSessions/ActionPanel";
import Breadcrumb from "../../components/common/Breadcrumb";
import { FaArrowLeft } from "react-icons/fa";

import { useAuth } from "../../hooks/useAuth";
import { getSessionById, getParticipants, getRounds } from "../../services/debateSessionService";
import { getTopicById } from "../../services/debateTopicService";
import { formatDate, toArray } from "../../utils/learnerHelpers";

import "./SessionDetails.css";

const SessionDetails = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const location = useLocation();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [topic, setTopic] = useState(location.state?.selectedTopic || null);
    const [participants, setParticipants] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let active = true;

        const loadDetails = async () => {
            try {
                setLoading(true);

                const sessionData = await getSessionById(sessionId);
                const topicData = location.state?.selectedTopic || (sessionData?.topic_id ? await getTopicById(sessionData.topic_id).catch(() => null) : null);
                const [participantData, roundData] = await Promise.all([
                    getParticipants(sessionId).catch(() => []),
                    getRounds(sessionId).catch(() => []),
                ]);

                if (!active) return;

                setSession(sessionData);
                setTopic(topicData);
                setParticipants(toArray(participantData).map((participant) => ({
                    id: participant.id,
                    name: participant.role_in_session || `User ${participant.user_id}`,
                    position: participant.position,
                    ready: Boolean(participant.joined_at && !participant.left_at),
                })));
                setRounds(toArray(roundData).map((round) => ({
                    id: round.id,
                    name: round.round_name,
                    description: round.status || `Round ${round.round_number}`,
                    duration: `${round.duration_minutes} min`,
                })));
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load session details right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDetails();

        return () => {
            active = false;
        };
    }, [location.state?.selectedTopic, sessionId]);

    const mappedSession = useMemo(() => ({
        id: session?.id || sessionId,
        topic_title: topic?.title || `Session #${sessionId}`,
        category: topic?.category || "General",
        difficulty: topic?.difficulty_level || topic?.difficulty || "Beginner",
        debate_format: session?.debate_format || topic?.debate_format || "Oxford Debate",
        duration: topic?.estimated_duration ? `${topic.estimated_duration} Minutes` : "20 Minutes",
        speaking_time: "5 Minutes",
        max_participants: participants.length || session?.participant_count || 2,
        recording_enabled: false,
        ai_enabled: true,
        scheduled_date: formatDate(session?.scheduled_at || session?.created_at),
        status: session?.session_status || session?.status || "Scheduled",
        position_assignment: session?.debate_position || session?.position || "Learner Assigned",
    }), [participants.length, session, sessionId, topic]);

    const currentRound = useMemo(() => {
        const activeIndex = rounds.findIndex((round) => round.description.toLowerCase().includes("active"));
        return activeIndex >= 0 ? activeIndex : Math.max(0, rounds.length - 1);
    }, [rounds]);

    const handleJoin = () => {
        navigate(`/debate-room/${sessionId}`, {
            state: {
                selectedTopic: topic,
                selectedSession: session,
            },
        });
    };

    const handleEnterRoom = handleJoin;

    const handleReady = () => {
        setNotice("Ready status will be synced from the backend when the session opens.");
    };

    const handleAssign = handleJoin;
    const handleStart = handleJoin;
    const handleEdit = handleJoin;
    const handleCancel = () => setNotice("Cancellation is managed by session moderators.");

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="session-details-page">
                    <div className="empty-state">Loading session details...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="session-details-page">
                <Breadcrumb items={[
                    { label: "Debate Topics", path: "/topics" },
                    { label: "Debate Sessions", path: "/debate-sessions" },
                    { label: "Session Details" },
                ]} />

                <div className="back-navigation">
                    <button className="back-button" onClick={handleBack} type="button">
                        <FaArrowLeft />
                        Back to Debate Sessions
                    </button>
                </div>

                <SessionHeader
                    title="Debate Session"
                    subtitle="Review the session details before entering the debate room."
                />

                {error && <div className="empty-state">{error}</div>}
                {notice && <div className="success-message">{notice}</div>}

                <div className="session-status-section">
                    <SessionStatusBadge status={mappedSession.status} />
                </div>

                <SessionInfoCard session={mappedSession} />

                <SessionParticipants participants={participants} />

                <DebateRules session={mappedSession} />

                <DebateRounds rounds={rounds} currentRound={currentRound} />

                <ActionPanel
                    role={user?.role === "Debate Coach" ? "Coach" : user?.role}
                    session={mappedSession}
                    onJoin={handleJoin}
                    onReady={handleReady}
                    onAssign={handleAssign}
                    onStart={handleStart}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onEnterRoom={handleEnterRoom}
                />
            </div>
        </MainLayout>
    );
};

export default SessionDetails;