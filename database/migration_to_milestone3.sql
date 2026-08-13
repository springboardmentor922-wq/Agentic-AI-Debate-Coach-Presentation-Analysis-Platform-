-- ============================================================
-- AGENTIC AI DEBATE COACH & PRESENTATION ANALYSIS PLATFORM
-- Database Migration Script: Milestone 1 to Milestone 3
-- 
-- Description: Safely upgrades the existing 14-table PostgreSQL
--              database to the target 26-table Milestone 3 architecture.
-- Safety: Zero data loss. Idempotent execution.
-- Created Date: August 9, 2026
-- Target DB: PostgreSQL 12+ (debate_coach_db)
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: PRE-MIGRATION DATA SANITIZATION & BACKFILLS
-- ============================================================
-- Ensure no NULL values exist in notifications.is_read before applying NOT NULL constraint
UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- ============================================================
-- SECTION 2: ALTER EXISTING 14 TABLES (ADD MISSING COLUMNS)
-- ============================================================

-- 2.1 Table: roles
ALTER TABLE roles ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE roles ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- 2.2 Table: users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2.3 Table: user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2.4 Table: user_skills
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.5 Table: debate_topics
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_topics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
-- NOTE: debate_topics.debate_format is PRESERVED for backward compatibility and zero data loss.

-- 2.6 Table: debate_sessions
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_sessions ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 2.7 Table: session_participants
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE session_participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.8 Table: session_rounds
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE session_rounds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.9 Table: coach_assignments
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2.10 Table: coach_feedback
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE coach_feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.11 Table: educator_classes
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE educator_classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.12 Table: class_enrollments
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE';
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.13 Table: debate_assignments
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE debate_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2.14 Table: notifications
ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT FALSE;
ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;


-- ============================================================
-- SECTION 3: CREATE 12 NEW TABLES FOR MILESTONE 3 ARCHITECTURE
-- ============================================================

-- 3.1 Table: coaching_sessions
CREATE TABLE IF NOT EXISTS coaching_sessions (
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

-- 3.2 Table: learner_practice_assignments
CREATE TABLE IF NOT EXISTS learner_practice_assignments (
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

-- 3.3 Table: coach_evaluations
CREATE TABLE IF NOT EXISTS coach_evaluations (
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

-- 3.4 Table: coach_notifications
CREATE TABLE IF NOT EXISTS coach_notifications (
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

-- 3.5 Table: debate_evaluations
CREATE TABLE IF NOT EXISTS debate_evaluations (
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

-- 3.6 Table: argument_analyses
CREATE TABLE IF NOT EXISTS argument_analyses (
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

-- 3.7 Table: logical_fallacies_detected
CREATE TABLE IF NOT EXISTS logical_fallacies_detected (
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

-- 3.8 Table: counterarguments_generated
CREATE TABLE IF NOT EXISTS counterarguments_generated (
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

-- 3.9 Table: presentation_analyses
CREATE TABLE IF NOT EXISTS presentation_analyses (
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

-- 3.10 Table: llm_usage_logs
CREATE TABLE IF NOT EXISTS llm_usage_logs (
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

-- 3.11 Table: reports_exports
CREATE TABLE IF NOT EXISTS reports_exports (
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

-- 3.12 Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
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
-- SECTION 4: CREATE PERFORMANCE INDEXES
-- ============================================================

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

COMMIT;

-- ============================================================
-- SECTION 5: POST-MIGRATION VERIFICATION QUERIES
-- (Run these queries manually in pgAdmin to verify migration)
-- ============================================================

-- V1. Verify total table count in public schema (Expected: 26 tables)
SELECT COUNT(*) AS total_table_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- V2. List all 26 tables to confirm presence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- V3. Verify all 12 NEW tables were created successfully
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'coaching_sessions', 'learner_practice_assignments', 'coach_evaluations',
    'coach_notifications', 'debate_evaluations', 'argument_analyses',
    'logical_fallacies_detected', 'counterarguments_generated',
    'presentation_analyses', 'llm_usage_logs', 'reports_exports', 'audit_logs'
  )
ORDER BY table_name;

-- V4. Verify notifications.is_read constraint (Expected: is_nullable = 'NO', column_default = 'false')
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'is_read';

-- V5. Verify debate_topics.debate_format column is preserved
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'debate_topics' AND column_name = 'debate_format';

-- V6. Check row counts of existing tables (Verify zero data loss)
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL SELECT 'user_skills', COUNT(*) FROM user_skills
UNION ALL SELECT 'debate_topics', COUNT(*) FROM debate_topics
UNION ALL SELECT 'debate_sessions', COUNT(*) FROM debate_sessions
UNION ALL SELECT 'session_participants', COUNT(*) FROM session_participants
UNION ALL SELECT 'session_rounds', COUNT(*) FROM session_rounds
UNION ALL SELECT 'coach_assignments', COUNT(*) FROM coach_assignments
UNION ALL SELECT 'coach_feedback', COUNT(*) FROM coach_feedback
UNION ALL SELECT 'educator_classes', COUNT(*) FROM educator_classes
UNION ALL SELECT 'class_enrollments', COUNT(*) FROM class_enrollments
UNION ALL SELECT 'debate_assignments', COUNT(*) FROM debate_assignments
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;
