-- ============================================================
-- AGENTIC AI DEBATE COACH & PRESENTATION ANALYSIS PLATFORM
-- Production Database Schema (PostgreSQL)
-- Milestone 1, 2, 3, & 4 Complete Database Architecture
-- ============================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Section 1: Core User Management & Role-Based Access Control
-- ============================================================

-- Table: roles
-- Stores user roles for Role-Based Access Control (RBAC)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
-- Stores authentication, identity, and active account status
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Table: user_profiles
-- Stores detailed profile information, domain interests, and coaching preferences
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    institution VARCHAR(150),
    location VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    bio TEXT,
    experience_level VARCHAR(50) DEFAULT 'Novice',
    learning_goals TEXT,
    preferred_debate_topics TEXT,
    presentation_domains TEXT,
    coaching_preferences TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_experience_level
        CHECK (experience_level IN ('Novice', 'Intermediate', 'Advanced', 'Master'))
);

-- Table: user_skills
-- Tracks communication, critical thinking, presentation, and argument skill progression
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    communication_score DECIMAL(5,2) DEFAULT 0.00 CHECK (communication_score >= 0.00 AND communication_score <= 100.00),
    critical_thinking_score DECIMAL(5,2) DEFAULT 0.00 CHECK (critical_thinking_score >= 0.00 AND critical_thinking_score <= 100.00),
    presentation_score DECIMAL(5,2) DEFAULT 0.00 CHECK (presentation_score >= 0.00 AND presentation_score <= 100.00),
    argument_score DECIMAL(5,2) DEFAULT 0.00 CHECK (argument_score >= 0.00 AND argument_score <= 100.00),
    confidence_score DECIMAL(5,2) DEFAULT 0.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 100.00),
    total_debates INTEGER DEFAULT 0 CHECK (total_debates >= 0),
    total_presentations INTEGER DEFAULT 0 CHECK (total_presentations >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_skills_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- Section 2: Debate Topics & Session Management
-- ============================================================

-- Table: debate_topics
-- Stores debate topics, difficulty levels, formats, and visibility
CREATE TABLE debate_topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate',
    topic_type VARCHAR(30) DEFAULT 'OFFICIAL',
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    estimated_duration INTEGER DEFAULT 20 CHECK (estimated_duration > 0),
    learning_goal VARCHAR(255),
    is_system_generated BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    updated_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_topic_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_debate_topic_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_topic_difficulty
        CHECK (difficulty_level IN ('Novice', 'Intermediate', 'Advanced', 'Master')),

    CONSTRAINT chk_topic_type
        CHECK (topic_type IN ('OFFICIAL', 'CUSTOM', 'COMMUNITY', 'PRACTICE')),

    CONSTRAINT chk_topic_visibility
        CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'CLASS_ONLY'))
);

-- Table: debate_sessions
-- Represents a single live or scheduled debate session
CREATE TABLE debate_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    debate_format VARCHAR(50) NOT NULL,
    debate_position VARCHAR(20) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    session_status VARCHAR(30) DEFAULT 'Scheduled',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_session_topic
        FOREIGN KEY (topic_id)
        REFERENCES debate_topics(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_debate_session_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_debate_session_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_session_status
        CHECK (session_status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Paused')),

    CONSTRAINT chk_debate_format
        CHECK (debate_format IN ('One-on-One', 'Parliamentary', 'Oxford', 'Policy', 'Public Forum', 'AI Simulation')),

    CONSTRAINT chk_debate_position
        CHECK (debate_position IN ('Affirmative', 'Negative', 'Pro', 'Con', 'Neutral'))
);

-- Table: session_participants
-- Tracks human and AI participants in a debate session
CREATE TABLE session_participants (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role_in_session VARCHAR(30) NOT NULL,
    position VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NULL,
    left_at TIMESTAMP WITH TIME ZONE NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_participants_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_session_participants_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_session_participant_user
        UNIQUE (session_id, user_id),

    CONSTRAINT chk_participant_role
        CHECK (role_in_session IN ('Learner', 'AI Opponent', 'Coach', 'Judge', 'Observer')),

    CONSTRAINT chk_participant_position
        CHECK (position IN ('Affirmative', 'Negative', 'Observer', 'Pro', 'Con', 'Neutral'))
);

-- Table: session_rounds
-- Tracks timed rounds within a multi-turn debate session
CREATE TABLE session_rounds (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    round_name VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    status VARCHAR(20) DEFAULT 'Pending',
    started_at TIMESTAMP WITH TIME ZONE NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_rounds_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_session_round_number
        UNIQUE (session_id, round_number),

    CONSTRAINT chk_round_status
        CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);


-- ============================================================
-- Section 3: Coaching, Classroom & Practice Management
-- ============================================================

-- Table: coach_assignments
-- Establishes direct relationship between a coach and a learner
CREATE TABLE coach_assignments (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    assigned_by INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coach_assignments_coach
        FOREIGN KEY (coach_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_assignments_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_assignments_assigner
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_coach_learner
        UNIQUE (coach_id, learner_id),

    CONSTRAINT chk_coach_assignment_status
        CHECK (status IN ('Active', 'Inactive', 'Pending', 'Terminated'))
);

-- Table: coach_feedback
-- Stores direct textual feedback provided by human coaches to learners
CREATE TABLE coach_feedback (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    session_id INTEGER,
    feedback TEXT NOT NULL,
    created_by INTEGER,
    updated_by INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coach_feedback_coach
        FOREIGN KEY (coach_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_feedback_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_feedback_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coach_feedback_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coach_feedback_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table: educator_classes
-- Classrooms created by educators to group learners and assign topics
CREATE TABLE educator_classes (
    id SERIAL PRIMARY KEY,
    educator_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_educator_classes_educator
        FOREIGN KEY (educator_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_educator_classes_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_educator_classes_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table: class_enrollments
-- Tracks student enrollments in educator classrooms
CREATE TABLE class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Enrolled',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_class_enrollments_class
        FOREIGN KEY (class_id)
        REFERENCES educator_classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_class_enrollments_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_class_learner
        UNIQUE (class_id, learner_id),

    CONSTRAINT chk_enrollment_status
        CHECK (status IN ('Enrolled', 'Completed', 'Dropped'))
);

-- Table: debate_assignments
-- Formal debate assignments created by educators or coaches for learners
CREATE TABLE debate_assignments (
    id SERIAL PRIMARY KEY,
    assigned_by INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    class_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'Assigned',
    due_at TIMESTAMP WITH TIME ZONE NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_assignments_assigner
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_assignments_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_assignments_topic
        FOREIGN KEY (topic_id)
        REFERENCES debate_topics(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_debate_assignments_class
        FOREIGN KEY (class_id)
        REFERENCES educator_classes(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_debate_assignments_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_debate_assignments_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_assignment_status
        CHECK (status IN ('Assigned', 'In Progress', 'Submitted', 'Graded', 'Overdue'))
);

-- Table: coaching_sessions
-- Scheduled 1-on-1 mentoring sessions between a coach and a learner
CREATE TABLE coaching_sessions (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    topic_title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coaching_sessions_coach
        FOREIGN KEY (coach_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coaching_sessions_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coaching_sessions_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coaching_sessions_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_coaching_session_status
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled'))
);

-- Table: learner_practice_assignments
-- Individual practice drills and homework assigned by coaches
CREATE TABLE learner_practice_assignments (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    topic_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(30) DEFAULT 'Intermediate',
    due_date TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(30) DEFAULT 'Assigned',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_practice_assignments_coach
        FOREIGN KEY (coach_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_practice_assignments_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_practice_assignments_topic
        FOREIGN KEY (topic_id)
        REFERENCES debate_topics(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_practice_assignments_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_practice_assignments_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_practice_status
        CHECK (status IN ('Assigned', 'In Progress', 'Completed', 'Overdue'))
);

-- Table: coach_evaluations
-- Manual numerical and qualitative evaluations submitted by coaches
CREATE TABLE coach_evaluations (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL,
    learner_id INTEGER NOT NULL,
    session_id INTEGER,
    communication_score DECIMAL(5,2) DEFAULT 0.00 CHECK (communication_score >= 0.00 AND communication_score <= 100.00),
    confidence_score DECIMAL(5,2) DEFAULT 0.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 100.00),
    logic_score DECIMAL(5,2) DEFAULT 0.00 CHECK (logic_score >= 0.00 AND logic_score <= 100.00),
    rebuttal_score DECIMAL(5,2) DEFAULT 0.00 CHECK (rebuttal_score >= 0.00 AND rebuttal_score <= 100.00),
    evidence_score DECIMAL(5,2) DEFAULT 0.00 CHECK (evidence_score >= 0.00 AND evidence_score <= 100.00),
    overall_score DECIMAL(5,2) DEFAULT 0.00 CHECK (overall_score >= 0.00 AND overall_score <= 100.00),
    comments TEXT,
    recommendations TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coach_evaluations_coach
        FOREIGN KEY (coach_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_evaluations_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_coach_evaluations_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coach_evaluations_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_coach_evaluations_updater
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table: notifications
-- In-app notifications for learners, coaches, educators, and admins
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table: coach_notifications
-- Specialized notifications targeted for coaches
CREATE TABLE coach_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coach_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- Section 4: Analytics, AI Evaluation & Performance Metrics
-- ============================================================

-- Table: debate_evaluations
-- Implements Milestone 3 formal weighted performance scoring model:
-- Overall Score = 30% Argument Quality + 20% Evidence Usage + 20% Logical Consistency + 15% Rebuttal Effectiveness + 15% Communication Skills
CREATE TABLE debate_evaluations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    round_id INTEGER,
    turn_number INTEGER DEFAULT 1 CHECK (turn_number > 0),
    argument_quality_score DECIMAL(5,2) DEFAULT 0.00 CHECK (argument_quality_score >= 0.00 AND argument_quality_score <= 100.00),
    evidence_usage_score DECIMAL(5,2) DEFAULT 0.00 CHECK (evidence_usage_score >= 0.00 AND evidence_usage_score <= 100.00),
    logical_consistency_score DECIMAL(5,2) DEFAULT 0.00 CHECK (logical_consistency_score >= 0.00 AND logical_consistency_score <= 100.00),
    rebuttal_effectiveness_score DECIMAL(5,2) DEFAULT 0.00 CHECK (rebuttal_effectiveness_score >= 0.00 AND rebuttal_effectiveness_score <= 100.00),
    communication_skills_score DECIMAL(5,2) DEFAULT 0.00 CHECK (communication_skills_score >= 0.00 AND communication_skills_score <= 100.00),
    overall_performance_score DECIMAL(5,2) DEFAULT 0.00 CHECK (overall_performance_score >= 0.00 AND overall_performance_score <= 100.00),
    critical_thinking_score DECIMAL(5,2) DEFAULT 0.00 CHECK (critical_thinking_score >= 0.00 AND critical_thinking_score <= 100.00),
    feedback_summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_evaluations_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_evaluations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_evaluations_round
        FOREIGN KEY (round_id)
        REFERENCES session_rounds(id)
        ON DELETE SET NULL
);

-- Table: argument_analyses
-- Stores granular argument extraction, claim, evidence, and reasoning evaluations (Milestone 2 & 3)
CREATE TABLE argument_analyses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    round_id INTEGER,
    extracted_argument TEXT NOT NULL,
    claim_text TEXT,
    evidence_text TEXT,
    clarity_score DECIMAL(5,2) DEFAULT 0.00 CHECK (clarity_score >= 0.00 AND clarity_score <= 100.00),
    relevance_score DECIMAL(5,2) DEFAULT 0.00 CHECK (relevance_score >= 0.00 AND relevance_score <= 100.00),
    evidence_strength_score DECIMAL(5,2) DEFAULT 0.00 CHECK (evidence_strength_score >= 0.00 AND evidence_strength_score <= 100.00),
    logical_consistency_score DECIMAL(5,2) DEFAULT 0.00 CHECK (logical_consistency_score >= 0.00 AND logical_consistency_score <= 100.00),
    persuasiveness_score DECIMAL(5,2) DEFAULT 0.00 CHECK (persuasiveness_score >= 0.00 AND persuasiveness_score <= 100.00),
    overall_argument_strength DECIMAL(5,2) DEFAULT 0.00 CHECK (overall_argument_strength >= 0.00 AND overall_argument_strength <= 100.00),
    reasoning_quality_score DECIMAL(5,2) DEFAULT 0.00 CHECK (reasoning_quality_score >= 0.00 AND reasoning_quality_score <= 100.00),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_argument_analyses_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_argument_analyses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_argument_analyses_round
        FOREIGN KEY (round_id)
        REFERENCES session_rounds(id)
        ON DELETE SET NULL
);

-- Table: logical_fallacies_detected
-- Stores detected fallacies (Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring)
CREATE TABLE logical_fallacies_detected (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    fallacy_type VARCHAR(100) NOT NULL,
    detected_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    correction_suggestion TEXT,
    severity_level VARCHAR(20) DEFAULT 'Medium',
    credibility_impact DECIMAL(5,2) DEFAULT 0.00,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fallacies_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES argument_analyses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fallacies_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fallacies_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_fallacy_severity
        CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical'))
);

-- Table: counterarguments_generated
-- Stores AI-generated rebuttals, counterpoints, alternative perspectives, challenge questions, and strategy suggestions
CREATE TABLE counterarguments_generated (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    original_claim TEXT NOT NULL,
    rebuttal_type VARCHAR(50) NOT NULL,
    rebuttal_text TEXT NOT NULL,
    counterpoint_text TEXT,
    alternative_perspective TEXT,
    challenge_question TEXT,
    strategy_suggestion TEXT,
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_counterarguments_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_counterarguments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_rebuttal_type
        CHECK (rebuttal_type IN ('Logical', 'Evidence-Based', 'Ethical', 'Practical', 'Policy'))
);

-- Table: presentation_analyses
-- Stores speech and presentation analytics (speech pace WPM, filler word count, confidence, clarity, audience engagement, prosody)
CREATE TABLE presentation_analyses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER,
    user_id INTEGER NOT NULL,
    speech_pace_wpm DECIMAL(6,2) DEFAULT 0.00,
    filler_words_count INTEGER DEFAULT 0 CHECK (filler_words_count >= 0),
    filler_words_details TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 0.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 100.00),
    clarity_score DECIMAL(5,2) DEFAULT 0.00 CHECK (clarity_score >= 0.00 AND clarity_score <= 100.00),
    audience_engagement_score DECIMAL(5,2) DEFAULT 0.00 CHECK (audience_engagement_score >= 0.00 AND audience_engagement_score <= 100.00),
    prosody_pitch_variance DECIMAL(6,2) DEFAULT 0.00,
    audio_duration_seconds DECIMAL(8,2) DEFAULT 0.00 CHECK (audio_duration_seconds >= 0.00),
    transcription_text TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_presentation_analyses_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_presentation_analyses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Table: llm_usage_logs
-- Observability & system monitoring for AI model latency, token counts, and cost tracking (Admin Dashboard)
CREATE TABLE llm_usage_logs (
    id SERIAL PRIMARY KEY,
    session_id INTEGER,
    user_id INTEGER,
    endpoint VARCHAR(150) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0 CHECK (prompt_tokens >= 0),
    completion_tokens INTEGER DEFAULT 0 CHECK (completion_tokens >= 0),
    total_tokens INTEGER DEFAULT 0 CHECK (total_tokens >= 0),
    latency_ms INTEGER DEFAULT 0 CHECK (latency_ms >= 0),
    estimated_cost DECIMAL(10,6) DEFAULT 0.000000 CHECK (estimated_cost >= 0.000000),
    status_code INTEGER DEFAULT 200,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_llm_usage_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_llm_usage_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table: reports_exports
-- Tracks generated reports and exports (PDF & Excel format for debate, presentation, coaching, and learning progress)
CREATE TABLE reports_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    report_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'Completed',
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_exports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_exports_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_reports_exports_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_report_type
        CHECK (report_type IN ('Debate', 'Presentation', 'Performance', 'Coaching', 'Learning Progress')),

    CONSTRAINT chk_report_format
        CHECK (file_format IN ('PDF', 'EXCEL', 'CSV', 'JSON')),

    CONSTRAINT chk_report_status
        CHECK (status IN ('Pending', 'Generating', 'Completed', 'Failed'))
);

-- Table: audit_logs
-- Security and platform event auditing
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================================
-- Section 5: Performance Indexes
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);

CREATE INDEX idx_debate_topics_category ON debate_topics(category);
CREATE INDEX idx_debate_topics_difficulty ON debate_topics(difficulty_level);
CREATE INDEX idx_debate_topics_is_active ON debate_topics(is_active, is_deleted);

CREATE INDEX idx_debate_sessions_user_id ON debate_sessions(user_id);
CREATE INDEX idx_debate_sessions_topic_id ON debate_sessions(topic_id);
CREATE INDEX idx_debate_sessions_status ON debate_sessions(session_status);

CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);

CREATE INDEX idx_session_rounds_session ON session_rounds(session_id);

CREATE INDEX idx_coach_assignments_coach ON coach_assignments(coach_id);
CREATE INDEX idx_coach_assignments_learner ON coach_assignments(learner_id);

CREATE INDEX idx_coach_feedback_learner ON coach_feedback(learner_id);
CREATE INDEX idx_coach_feedback_session ON coach_feedback(session_id);

CREATE INDEX idx_educator_classes_educator ON educator_classes(educator_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_learner ON class_enrollments(learner_id);

CREATE INDEX idx_debate_assignments_learner ON debate_assignments(learner_id);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE INDEX idx_coaching_sessions_coach ON coaching_sessions(coach_id);
CREATE INDEX idx_coaching_sessions_learner ON coaching_sessions(learner_id);

CREATE INDEX idx_learner_practice_learner ON learner_practice_assignments(learner_id);

CREATE INDEX idx_coach_evaluations_learner ON coach_evaluations(learner_id);

CREATE INDEX idx_debate_evaluations_session ON debate_evaluations(session_id);
CREATE INDEX idx_debate_evaluations_user ON debate_evaluations(user_id);

CREATE INDEX idx_argument_analyses_session ON argument_analyses(session_id);
CREATE INDEX idx_logical_fallacies_session ON logical_fallacies_detected(session_id);
CREATE INDEX idx_counterarguments_session ON counterarguments_generated(session_id);

CREATE INDEX idx_presentation_analyses_user ON presentation_analyses(user_id);
CREATE INDEX idx_llm_usage_logs_created_at ON llm_usage_logs(created_at);
CREATE INDEX idx_reports_exports_user ON reports_exports(user_id);


-- ============================================================
-- ALTER DATABASE MIGRATION
-- Use the statements below to upgrade an existing database
-- ============================================================

-- 1. Upgrade existing user_skills table
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS total_debates INTEGER DEFAULT 0;
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS total_presentations INTEGER DEFAULT 0;
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Upgrade existing debate_sessions table
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 3. Upgrade existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 4. Upgrade existing user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 5. Upgrade existing debate_topics table
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 6. Upgrade existing session_participants table
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 7. Upgrade existing session_rounds table
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 8. Upgrade existing coach_assignments table
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 9. Upgrade existing coach_feedback table
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 10. Upgrade existing educator_classes table
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 11. Upgrade existing class_enrollments table
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Enrolled';
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 12. Upgrade existing debate_assignments table
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 13. Upgrade existing notifications & coach_notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE coach_notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 14. Upgrade existing coaching_sessions table
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 15. Upgrade existing learner_practice_assignments table
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 16. Upgrade existing coach_evaluations table
ALTER TABLE coach_evaluations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE coach_evaluations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coach_evaluations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coach_evaluations ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_evaluations ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 17. Create missing analytics, evaluation, and logging tables if they do not exist
CREATE TABLE IF NOT EXISTS debate_evaluations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id INTEGER REFERENCES session_rounds(id) ON DELETE SET NULL,
    turn_number INTEGER DEFAULT 1,
    argument_quality_score DECIMAL(5,2) DEFAULT 0.00,
    evidence_usage_score DECIMAL(5,2) DEFAULT 0.00,
    logical_consistency_score DECIMAL(5,2) DEFAULT 0.00,
    rebuttal_effectiveness_score DECIMAL(5,2) DEFAULT 0.00,
    communication_skills_score DECIMAL(5,2) DEFAULT 0.00,
    overall_performance_score DECIMAL(5,2) DEFAULT 0.00,
    critical_thinking_score DECIMAL(5,2) DEFAULT 0.00,
    feedback_summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS argument_analyses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id INTEGER REFERENCES session_rounds(id) ON DELETE SET NULL,
    extracted_argument TEXT NOT NULL,
    claim_text TEXT,
    evidence_text TEXT,
    clarity_score DECIMAL(5,2) DEFAULT 0.00,
    relevance_score DECIMAL(5,2) DEFAULT 0.00,
    evidence_strength_score DECIMAL(5,2) DEFAULT 0.00,
    logical_consistency_score DECIMAL(5,2) DEFAULT 0.00,
    persuasiveness_score DECIMAL(5,2) DEFAULT 0.00,
    overall_argument_strength DECIMAL(5,2) DEFAULT 0.00,
    reasoning_quality_score DECIMAL(5,2) DEFAULT 0.00,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logical_fallacies_detected (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES argument_analyses(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fallacy_type VARCHAR(100) NOT NULL,
    detected_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    correction_suggestion TEXT,
    severity_level VARCHAR(20) DEFAULT 'Medium',
    credibility_impact DECIMAL(5,2) DEFAULT 0.00,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS counterarguments_generated (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_claim TEXT NOT NULL,
    rebuttal_type VARCHAR(50) NOT NULL,
    rebuttal_text TEXT NOT NULL,
    counterpoint_text TEXT,
    alternative_perspective TEXT,
    challenge_question TEXT,
    strategy_suggestion TEXT,
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presentation_analyses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES debate_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    speech_pace_wpm DECIMAL(6,2) DEFAULT 0.00,
    filler_words_count INTEGER DEFAULT 0,
    filler_words_details TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    clarity_score DECIMAL(5,2) DEFAULT 0.00,
    audience_engagement_score DECIMAL(5,2) DEFAULT 0.00,
    prosody_pitch_variance DECIMAL(6,2) DEFAULT 0.00,
    audio_duration_seconds DECIMAL(8,2) DEFAULT 0.00,
    transcription_text TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS llm_usage_logs (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES debate_sessions(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(150) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,6) DEFAULT 0.000000,
    status_code INTEGER DEFAULT 200,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES debate_sessions(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'Completed',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Create missing indexes if not existing
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_topics_category ON debate_topics(category);
CREATE INDEX IF NOT EXISTS idx_debate_topics_difficulty ON debate_topics(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_debate_topics_is_active ON debate_topics(is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_user_id ON debate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_topic_id ON debate_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_status ON debate_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_rounds_session ON session_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach ON coach_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_learner ON coach_assignments(learner_id);
CREATE INDEX IF NOT EXISTS idx_coach_feedback_learner ON coach_feedback(learner_id);
CREATE INDEX IF NOT EXISTS idx_coach_feedback_session ON coach_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_educator_classes_educator ON educator_classes(educator_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_learner ON class_enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_debate_assignments_learner ON debate_assignments(learner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON coaching_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_learner ON coaching_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_practice_learner ON learner_practice_assignments(learner_id);
CREATE INDEX IF NOT EXISTS idx_coach_evaluations_learner ON coach_evaluations(learner_id);
CREATE INDEX IF NOT EXISTS idx_debate_evaluations_session ON debate_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_debate_evaluations_user ON debate_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_argument_analyses_session ON argument_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_logical_fallacies_session ON logical_fallacies_detected(session_id);
CREATE INDEX IF NOT EXISTS idx_counterarguments_session ON counterarguments_generated(session_id);
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_user ON presentation_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_created_at ON llm_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_exports_user ON reports_exports(user_id);
