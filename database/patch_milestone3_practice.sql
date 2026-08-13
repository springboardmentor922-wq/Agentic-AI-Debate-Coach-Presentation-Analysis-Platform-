-- Patch Script: Add session_id and debate_format to learner_practice_assignments and update check constraints
BEGIN;

ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES debate_sessions(id) ON DELETE SET NULL;
ALTER TABLE learner_practice_assignments ADD COLUMN IF NOT EXISTS debate_format VARCHAR(50) DEFAULT 'Oxford Debate';

ALTER TABLE learner_practice_assignments DROP CONSTRAINT IF EXISTS chk_practice_status;

ALTER TABLE learner_practice_assignments ADD CONSTRAINT chk_practice_status CHECK (status IN ('Assigned', 'In Progress', 'Submitted', 'AI_Analyzed', 'Coach_Review', 'Evaluated', 'Completed', 'Overdue'));

COMMIT;
