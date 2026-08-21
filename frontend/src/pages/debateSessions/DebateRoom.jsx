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

import { useState } from "react";

import { useNavigate, useParams,useLocation, } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import DebateHeader from "../../components/debateRoom/DebateHeader";

import SpeechEditor from "../../components/debateRoom/SpeechEditor";

import TranscriptPanel from "../../components/debateRoom/TranscriptPanel";

import RoundProgress from "../../components/debateRoom/RoundProgress";


import DebateTimer from "../../components/debateSessions/DebateTimer";

import SessionParticipants from "../../components/debateSessions/SessionParticipants";

import "./DebateRoom.css";

import Breadcrumb from "../../components/common/Breadcrumb";
import { analyzeDebate } from "../../services/debateAnalysisService";

import RecordingPanel from "../../components/debateRoom/RecordingPanel";
const DebateRoom = () => {

    const navigate = useNavigate();

    const { sessionId } = useParams();

    const location = useLocation();

const selectedTopic = location.state?.selectedTopic;

const selectedSession = location.state?.selectedSession;

const [uploadedAudio, setUploadedAudio] = useState(null);

const [uploadedVideo, setUploadedVideo] = useState(null);

const [transcript, setTranscript] = useState("");

    // =====================================================
    // 
    // =====================================================

   const [session] = useState({

    id: sessionId,

    topic_title:
        selectedTopic?.title ||
        "Debate Topic",

    topic_description:
        selectedTopic?.description || "",

    debate_format:
        selectedSession?.debate_format ||
        "Oxford Debate",

    position:
        selectedSession?.position ||
        selectedSession?.debate_position ||
        "Affirmative",

    status:
        selectedSession?.status ||
        selectedSession?.session_status ||
        "Live",

});
    // =====================================================
    // Participants
    // =====================================================

    const [participants] = useState([

        {

            id:1,

            name:"Rahul",

            position:"Affirmative",

            ready:true,

        },

        {

            id:2,

            name:"Kiran",

            position:"Negative",

            ready:true,

        }

    ]);

    // =====================================================
    // Debate Rounds
    // =====================================================

    const [rounds] = useState([

        {

            id:1,

            name:"Opening Statement",

            description:"Present opening arguments.",

            duration:"5 min",

        },

        {

            id:2,

            name:"Rebuttal",

            description:"Respond to opponent.",

            duration:"5 min",

        },

        {

            id:3,

            name:"Cross Examination",

            description:"Question opponent.",

            duration:"5 min",

        },

        {

            id:4,

            name:"Closing Statement",

            description:"Final summary.",

            duration:"5 min",

        }

    ]);

    const currentRound = 0;

    // =====================================================
    // Speech Editor
    // =====================================================

    const [speech,setSpeech]=useState("");


    // =====================================================
    // Transcript
    // =====================================================

    const [transcripts,setTranscripts]=useState([]);

    // =====================================================
    // Event Handlers
    // =====================================================
    const handleSpeechSubmit = async () => {

    console.log("STEP 1: handleSpeechSubmit called");

    if (!uploadedAudio && !uploadedVideo) {
        console.log("STEP 2: No media selected");
        return;
    }

    try {
        const mediaFile = uploadedAudio || uploadedVideo;

        console.log("STEP 3: Calling backend");

        const response = await analyzeDebate(
            session.id,
            mediaFile
        );

        console.log("STEP 4: Backend response", response);

        navigate("/ai-analysis-report", {
            state: {
                analysis: response.data,
                selectedTopic,
                selectedSession,
            },
        });

        console.log("STEP 5: Navigation called");

    } catch (error) {
        console.error("API ERROR:", error);
    }
};

const handleAnalyzeDebate = async () => {

    try {

        const mediaFile = uploadedAudio || uploadedVideo;

        if (!mediaFile) {

            alert("Please upload an audio or video.");

            return;

        }


        console.log("Calling backend...");
        const response = await analyzeDebate(
            session.id,
            mediaFile
        );

        console.log(response);

        console.log("Backend response:", response);

        navigate("/ai-analysis-report", {

            state: {

                analysis: response.data,

                selectedTopic,

                selectedSession,

            },

        });

    }

    catch (error) {

        console.error(error);

        alert("Analysis failed.");

    }

};

    const handleClearSpeech=()=>{

        setSpeech("");

    };

    const handleSaveDraft=()=>{

        console.log("Draft Saved");

    };

   const handleLeaveRoom = () => {

    navigate(-1);

};

    const handleAudioUpload = (e) => {

        const file = e.target.files[0];

        if (file) {

            setUploadedAudio(file);
            setUploadedVideo(null);

        }

    };

    const handleVideoUpload = (e) => {

        const file = e.target.files[0];

        if (file) {

            setUploadedVideo(file);
            setUploadedAudio(null);

        }

    };

    const handleRecordingAnalysis = () => {

    navigate("/ai-analysis-report", {
        state: {
            selectedTopic,
            selectedSession,
        },
    });

};

        // =====================================================
    // Render
    // =====================================================

    return (

        <MainLayout>

            <div className="debate-room-page">

                <Breadcrumb
    items={[
        {
            label: "Debate Topics",
            path: "/debate-topics",
        },
        {
            label: "Debate Sessions",
            path: "/debate-sessions",
        },
        {
            label: "Session Details",
            path: `/debate-sessions/${sessionId}`,
        },
        {
            label: "Debate Room",
        },
    ]}
/>

                {/* ============================================
                    Debate Header
                ============================================ */}

                <DebateHeader

                    topic={session.topic_title}

                    debateFormat={session.debate_format}

                    round={rounds[currentRound].name}

                    status={session.status}

                    timeRemaining="04:58"

                    isConnected={true}

                    onLeave={handleLeaveRoom}

                />

                {/* ============================================
                    Top Section
                ============================================ */}

                <div className="debate-room-top">

                    <div className="participants-panel">

                        <SessionParticipants
                            participants={participants}
                        />

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
    onStart={() => console.log("Recording Started")}
    onPause={() => console.log("Recording Paused")}
    onStop={() => console.log("Recording Stopped")}
    onAnalyze={handleAnalyzeDebate}
/>

                {/* ============================================
                    Timer
                ============================================ */}

                <DebateTimer

                    duration={5 * 60}

                    autoStart={true}

                />

                {/* ============================================
                    Transcript
                ============================================ */}

                <TranscriptPanel

                    transcripts={transcripts}

                />

                {/* ============================================
                    Debate Progress
                ============================================ */}

                <RoundProgress

                    rounds={rounds}

                    currentRound={currentRound}

                />

                

            </div>

        </MainLayout>

    );

};

export default DebateRoom;