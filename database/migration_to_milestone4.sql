-- ============================================================
-- AGENTIC AI DEBATE COACH & PRESENTATION ANALYSIS PLATFORM
-- Database Migration Script: Milestone 3 to Milestone 4
-- 
-- Description: Idempotently extends the existing presentation_analyses table
--              to support presentation recording metadata, processing status,
--              audio storage GridFS references, and overall scores.
-- Safety: Zero data loss. Idempotent execution.
-- ============================================================

BEGIN;

-- Extend presentation_analyses table with Milestone 4 columns
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS gridfs_id VARCHAR(100) NULL;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS filename VARCHAR(255) NULL;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) NULL;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'CREATED';
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS pause_count INTEGER DEFAULT 0;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS energy_variance NUMERIC(6, 2) DEFAULT 0.00;
ALTER TABLE presentation_analyses ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5, 2) DEFAULT 0.00;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_status ON presentation_analyses(processing_status);
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_gridfs ON presentation_analyses(gridfs_id);
CREATE INDEX IF NOT EXISTS idx_presentation_analyses_created ON presentation_analyses(created_at);

COMMIT;
