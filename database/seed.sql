INSERT INTO roles (name, description)
VALUES
('Administrator', 'Full system access'),

('Educator', 'Manages students and classes'),

('Debate Coach', 'Provides coaching and evaluates debates'),

('Learner', 'Participates in debates and learning activities');

-- ============================================================
-- Sample Debate Topics
-- ============================================================

INSERT INTO debate_topics
(title, description, category, difficulty_level)
VALUES

(
'Artificial Intelligence in Education',
'Discuss whether AI should become an essential part of modern education.',
'Education',
'Medium'
),

(
'Renewable Energy vs Fossil Fuels',
'Debate the future of renewable energy compared to fossil fuels.',
'Environment',
'Easy'
),

(
'Social Media: Benefit or Harm',
'Discuss the positive and negative impacts of social media on society.',
'Technology',
'Easy'
),

(
'Remote Work vs Office Work',
'Compare the advantages and disadvantages of remote and office work.',
'Business',
'Medium'
),

(
'Should AI Replace Human Teachers?',
'Debate whether AI can completely replace human teachers.',
'Artificial Intelligence',
'Hard'
);


-- ============================================================
-- Sample Session particpants
-- ============================================================

INSERT INTO session_participants
(
    session_id,
    user_id,
    role_in_session,
    position,
    joined_at
)
VALUES
(
    1,
    4,
    'Learner',
    'Affirmative',
    CURRENT_TIMESTAMP
),
(
    1,
    5,
    'Learner',
    'Negative',
    CURRENT_TIMESTAMP
);


-- ============================================================
-- Sample session Rounds
-- ============================================================

INSERT INTO session_rounds
(
    session_id,
    round_number,
    round_name,
    duration_minutes,
    status
)
VALUES
(
    1,
    1,
    'Opening Statements',
    3,
    'Pending'
),
(
    1,
    2,
    'Rebuttal',
    5,
    'Pending'
),
(
    1,
    3,
    'Closing Statements',
    2,
    'Pending'
);