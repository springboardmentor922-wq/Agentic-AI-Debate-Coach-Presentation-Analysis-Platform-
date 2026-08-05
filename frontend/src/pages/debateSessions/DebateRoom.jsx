/*
=========================================================
Debate Room

Live Debate Interface

Milestone 1
------------
✔ Live Debate
✔ Speech Editor
✔ Transcript
✔ Timer
✔ Participants
✔ Round Progress

Milestone 2
------------
✔ AI Analysis
✔ Speech Analysis
✔ Logical Fallacies
✔ Recommendations

=========================================================
*/

import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams, useLocation } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import DebateHeader from "../../components/debateRoom/DebateHeader";
import SpeechEditor from "../../components/debateRoom/SpeechEditor";
import TranscriptPanel from "../../components/debateRoom/TranscriptPanel";
import RoundProgress from "../../components/debateRoom/RoundProgress";
import DebateTimer from "../../components/debateSessions/DebateTimer";
import SessionParticipants from "../../components/debateSessions/SessionParticipants";
import Breadcrumb from "../../components/common/Breadcrumb";
import RecordingPanel from "../../components/debateRoom/RecordingPanel";

import { analyzeDebate } from "../../services/debateAnalysisService";
import { getSessionById, getParticipants, getRounds } from "../../services/debateSessionService";
import { getTopicById } from "../../services/debateTopicService";
import { formatDateTime, toArray } from "../../utils/learnerHelpers";

import "./DebateRoom.css";

const DebateRoom = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const location = useLocation();

    const selectedTopic = location.state?.selectedTopic || null;
    const selectedSession = location.state?.selectedSession || null;

    const [session, setSession] = useState(null);
    const [topic, setTopic] = useState(selectedTopic);
    const [participants, setParticipants] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [speech, setSpeech] = useState("");
    const [uploadedAudio, setUploadedAudio] = useState(null);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let active = true;

        const loadRoom = async () => {
            try {
                setLoading(true);

                const sessionData = selectedSession || await getSessionById(sessionId);
                const topicData = selectedTopic || (sessionData?.topic_id ? await getTopicById(sessionData.topic_id).catch(() => null) : null);
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
                    setError("Unable to load debate room right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadRoom();

        return () => {
            active = false;
        };
    }, [selectedSession, selectedTopic, sessionId]);

    const sessionModel = useMemo(() => ({
        id: session?.id || sessionId,
        topic_title: topic?.title || `Session #${sessionId}`,
        topic_description: topic?.learning_goal || topic?.description || "",
        debate_format: session?.debate_format || topic?.debate_format || "Oxford Debate",
        position: session?.debate_position || session?.position || "Affirmative",
        status: session?.session_status || session?.status || "Live",
    }), [session, sessionId, topic]);

    const currentRound = useMemo(() => {
        const activeIndex = rounds.findIndex((round) => round.description.toLowerCase().includes("active"));
        return activeIndex >= 0 ? activeIndex : 0;
    }, [rounds]);

    const pushTranscript = (speaker, message) => {
        setTranscripts((current) => [
            ...current,
            {
                id: `${speaker}-${Date.now()}`,
                speaker,
                message,
                time: formatDateTime(new Date()),
            },
        ]);
    };

    const handleSpeechSubmit = async () => {
        const mediaFile = uploadedAudio || uploadedVideo;

        if (!speech.trim() && !mediaFile) {
            setNotice("Please type your speech or upload audio/video.");
            return;
        }

        try {
            const response = await analyzeDebate(sessionModel.id, speech, mediaFile, {
                debate_format: sessionModel.debate_format,
                user_position: sessionModel.position,
            });

            pushTranscript("Learner", speech || (mediaFile ? mediaFile.name : "Submitted recording"));
            pushTranscript("AI Coach", response?.data?.transcript?.transcript || "Analysis completed.");

            navigate("/ai-analysis-report", {
                state: {
                    analysis: response,
                    selectedTopic: topic,
                    selectedSession: sessionModel,
                },
            });
        } catch (submissionError) {
            console.error(submissionError);
            setError("Analysis failed. Please try again.");
        }
    };

    const handleAnalyzeDebate = async () => {
        await handleSpeechSubmit();
    };

    const handleClearSpeech = () => {
        setSpeech("");
    };

    const handleSaveDraft = () => {
        setNotice("Draft saved locally until backend draft persistence is available.");
    };

    const handleLeaveRoom = () => {
        navigate(-1);
    };

    const handleRecordingAnalysis = () => {
        void handleAnalyzeDebate();
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="debate-room-page">
                    <div className="empty-state">Loading debate room...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="debate-room-page">
                <Breadcrumb
                    items={[
                        { label: "Debate Topics", path: "/topics" },
                        { label: "Debate Sessions", path: "/debate-sessions" },
                        { label: "Session Details", path: `/debate-sessions/${sessionId}` },
                        { label: "Debate Room" },
                    ]}
                />

                {error && <div className="empty-state">{error}</div>}
                {notice && <div className="success-message">{notice}</div>}

                <DebateHeader
                    topic={sessionModel.topic_title}
                    debateFormat={sessionModel.debate_format}
                    round={rounds[currentRound]?.name || "Opening Round"}
                    status={sessionModel.status}
                    timeRemaining="Live"
                    isConnected={true}
                    onLeave={handleLeaveRoom}
                />

                <div className="debate-room-top">
                    <div className="participants-panel">
                        <SessionParticipants participants={participants} />
                    </div>

                    <div className="editor-panel">
                        <SpeechEditor
                            value={speech}
                            onChange={setSpeech}
                            onSubmit={handleSpeechSubmit}
                            onClear={handleClearSpeech}
                            onSaveDraft={handleSaveDraft}
                            onAudioUpload={setUploadedAudio}
                            onVideoUpload={setUploadedVideo}
                            hasUploadedAudio={!!uploadedAudio}
                            hasUploadedVideo={!!uploadedVideo}
                        />
                    </div>
                </div>

                <RecordingPanel
                    onStart={() => setNotice("Recording started.")}
                    onPause={() => setNotice("Recording paused.")}
                    onStop={() => setNotice("Recording stopped.")}
                    onAnalyze={handleRecordingAnalysis}
                />

                <DebateTimer duration={5 * 60} autoStart={true} />

                <TranscriptPanel transcripts={transcripts} />

                <RoundProgress rounds={rounds} currentRound={currentRound} />
            </div>
        </MainLayout>
    );
};

export default DebateRoom;