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

import { useState } from "react";

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

import { FaArrowLeft } from "react-icons/fa";

import Breadcrumb from "../../components/common/Breadcrumb";

import "./SessionDetails.css";

const SessionDetails = () => {

    const navigate = useNavigate();

    const { sessionId } = useParams();

    const location = useLocation();

    const selectedTopic = location.state?.selectedTopic;

    const selectedSession = location.state?.selectedSession;

    // =====================================================
    // Mock Session
    // Replace with Backend API
    // =====================================================

    const session = {

    id: sessionId,

    topic_title:
        selectedTopic?.title ||
        "Debate Topic",

    category:
        selectedTopic?.category ||
        "General",

    difficulty:
        selectedTopic?.difficulty_level ||
        "Beginner",
    
    debate_format:
    selectedSession?.debate_format ||
    selectedTopic?.debate_format ||
    "Oxford Debate",

    duration:
        selectedTopic?.estimated_duration
            ? `${selectedTopic.estimated_duration} Minutes`
            : "20 Minutes",

    speaking_time:
        "5 Minutes",

    max_participants:
        selectedSession?.participant_count ||
        selectedSession?.participants ||
        2,

    recording_enabled:
        false,

    ai_enabled:
        false,

    scheduled_date:
        selectedSession?.date ||
        "20 July 2026",

    status:
        selectedSession?.session_status ||
        selectedSession?.status ||
        "Scheduled",

    position_assignment:
        selectedSession?.debate_position ||
        selectedSession?.position ||
        "Coach Assigned",

};
    // =====================================================
    // Mock Participants
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

            ready:false,

        }

    ]);

    // =====================================================
    // Mock Debate Rounds
    // =====================================================

    const [rounds] = useState([

        {

            id:1,

            name:"Opening Statement",

            description:"Present your opening argument.",

            duration:"5 min",

        },

        {

            id:2,

            name:"Rebuttal",

            description:"Respond to opponent arguments.",

            duration:"5 min",

        },

        {

            id:3,

            name:"Cross Examination",

            description:"Question the opponent.",

            duration:"5 min",

        },

        {

            id:4,

            name:"Closing Statement",

            description:"Summarize final argument.",

            duration:"5 min",

        }

    ]);

    // =====================================================
    // Current Round
    // =====================================================

    const currentRound = 0;

    // =====================================================
    // Logged User Role
    // Temporary
    // Backend Later
    // =====================================================

    const role = "Learner";

    // =====================================================
    // Event Handlers
    // =====================================================

    const handleJoin = () => {

        console.log("Join Session");

    };

    const handleReady = () => {

        console.log("Ready");

    };

    const handleAssign = () => {

        console.log("Assign Positions");

    };

    const handleStart = () => {

        console.log("Start Debate");

    };

    const handleEdit = () => {

        console.log("Edit Session");

    };

    const handleCancel = () => {

        console.log("Cancel Session");

    };

    const handleEnterRoom = () => {

        navigate(`/debate-room/${session.id}`, {

    state: {

        selectedTopic,

        selectedSession,

    },

});

    };

    const handleBack = () => {

       navigate(-1);

    };

        // =====================================================
    // Render
    // =====================================================

    return (

        <MainLayout>

            <div className="session-details-page">

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
                },
            ]}
        />
                <div className="back-navigation">

                    <button

                        className="back-button"

                        onClick={handleBack}

                    >

                        <FaArrowLeft />

                        Back to Debate Sessions

                    </button>

                </div>
                {/* ============================================
                    Header
                ============================================ */}

                <SessionHeader

                    title="Debate Session"

                    subtitle="Review the session details before entering the debate room."

                />

                {/* ============================================
                    Session Status
                ============================================ */}

                <div className="session-status-section">

                    <SessionStatusBadge

                        status={session.status}

                    />

                </div>

                {/* ============================================
                    Session Information
                ============================================ */}

                <SessionInfoCard

                    session={session}

                />

                {/* ============================================
                    Participants
                ============================================ */}

                <SessionParticipants

                    participants={participants}

                />

                {/* ============================================
                    Debate Rules
                ============================================ */}

                <DebateRules

                    session={session}

                />

                {/* ============================================
                    Debate Rounds
                ============================================ */}

                <DebateRounds

                    rounds={rounds}

                    currentRound={currentRound}

                />

               


                {/* ============================================
                    Session Actions
                ============================================ */}

                <ActionPanel

                    role={role}

                    session={session}

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