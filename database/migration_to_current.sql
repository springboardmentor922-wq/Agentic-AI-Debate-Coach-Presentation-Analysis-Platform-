-- ============================================================
-- AGENTIC AI DEBATE COACH & PRESENTATION ANALYSIS PLATFORM
-- Database Migration Script: Milestone 3 & 4 Catch-Up Migration
--
-- File: database/migration_to_current.sql
-- Target DB: PostgreSQL 15 (debate_coach_db)
-- Safety: 100% Data Preserving, Idempotent execution.
-- ============================================================

BEGIN;

-- 1. Upgrade debate_topics table
-- Add missing topic-level debate_format column
ALTER TABLE debate_topics
  ADD COLUMN IF NOT EXISTS debate_format VARCHAR(100) DEFAULT 'Oxford Debate';

-- 2. Upgrade learner_practice_assignments table
-- Add missing session_id and debate_format columns
ALTER TABLE learner_practice_assignments
  ADD COLUMN IF NOT EXISTS session_id INTEGER NULL,
  ADD COLUMN IF NOT EXISTS debate_format VARCHAR(50) DEFAULT 'Oxford Debate';

-- Idempotently add foreign key constraint fk_practice_assignments_session if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_practice_assignments_session'
          AND table_name = 'learner_practice_assignments'
    ) THEN
        ALTER TABLE learner_practice_assignments
          ADD CONSTRAINT fk_practice_assignments_session
          FOREIGN KEY (session_id) REFERENCES debate_sessions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update status CHECK constraint on learner_practice_assignments
ALTER TABLE learner_practice_assignments
  DROP CONSTRAINT IF EXISTS chk_practice_status;

ALTER TABLE learner_practice_assignments
  ADD CONSTRAINT chk_practice_status
  CHECK (status IN (
    'Assigned',
    'In Progress',
    'Submitted',
    'AI_Analyzed',
    'Coach_Review',
    'Evaluated',
    'Completed',
    'Overdue'
  ));

-- 3. Upgrade presentation_analyses table (Milestone 4 extensions)
ALTER TABLE presentation_analyses
  ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS gridfs_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS filename VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'CREATED',
  ADD COLUMN IF NOT EXISTS pause_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS energy_variance NUMERIC(6, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5, 2) DEFAULT 0.00;

-- 4. Create missing Milestone 4 performance indexes
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_status ON presentation_analyses(processing_status);
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_gridfs ON presentation_analyses(gridfs_id);
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_created ON presentation_analyses(created_at);

COMMIT;
