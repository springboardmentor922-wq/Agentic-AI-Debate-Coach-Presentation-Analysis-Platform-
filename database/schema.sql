-- ============================================================
-- Table: roles
-- Description: Stores all user roles in the platform
-- ============================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,

    name VARCHAR(50) NOT NULL UNIQUE, 
    
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- Table: users
-- Description: Stores authentication and identity information
-- ============================================================

CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role_id INTEGER NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    
);

-- ============================================================
-- Table: user_profiles
-- Description: Stores profile information for each user
-- ============================================================

CREATE TABLE user_profiles (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    phone_number VARCHAR(20),

    institution VARCHAR(150),

    location VARCHAR(100),

    date_of_birth DATE,

    gender VARCHAR(20),

    bio TEXT,

    experience_level VARCHAR(50),

    learning_goals TEXT,

    preferred_debate_topics TEXT,

    presentation_domains TEXT,

    coaching_preferences TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);


-- ============================================================
-- Table: user_skills
-- Description: Stores skill tracking information for each user
-- ============================================================

CREATE TABLE user_skills (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    communication_score DECIMAL(5,2) DEFAULT 0.00,

    critical_thinking_score DECIMAL(5,2) DEFAULT 0.00,

    presentation_score DECIMAL(5,2) DEFAULT 0.00,

    argument_score DECIMAL(5,2) DEFAULT 0.00,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_skills_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);



-- ============================================================
-- Table: debate_topics
-- Description: Stores all debate topics available on the platform
-- ============================================================

CREATE TABLE debate_topics (

    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    category VARCHAR(100),

    difficulty_level VARCHAR(30),

    topic_type VARCHAR(30) DEFAULT 'OFFICIAL',

    visibility VARCHAR(20) DEFAULT 'PUBLIC',

    estimated_duration INTEGER DEFAULT 20,

    learning_goal VARCHAR(255),

    is_system_generated BOOLEAN DEFAULT FALSE,

    created_by INTEGER,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_topic_creator
        FOREIGN KEY(created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================
-- Table: debate_sessions
-- Description: Stores debate sessions created by users
-- ============================================================

CREATE TABLE debate_sessions (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    topic_id INTEGER NOT NULL,

    debate_format VARCHAR(50) NOT NULL,

    debate_position VARCHAR(20) NOT NULL,

    scheduled_at TIMESTAMP NOT NULL,

    session_status VARCHAR(30) DEFAULT 'Scheduled',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debate_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_debate_session_topic
        FOREIGN KEY (topic_id)
        REFERENCES debate_topics(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =====================================================
-- Table: session_participants
-- Description: Stores participants of each debate session
-- =====================================================

CREATE TABLE session_participants (

    id SERIAL PRIMARY KEY,

    session_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    role_in_session VARCHAR(30) NOT NULL,

    position VARCHAR(20) NOT NULL,

    joined_at TIMESTAMP,

    left_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_participants_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_session_participants_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_position
        CHECK (
            position IN (
                'Affirmative',
                'Negative',
                'Observer'
            )
        )

);


-- =====================================================
-- Table: session_rounds
-- Description: Stores debate rounds for each session
-- =====================================================

CREATE TABLE session_rounds (

    id SERIAL PRIMARY KEY,

    session_id INTEGER NOT NULL,

    round_number INTEGER NOT NULL,

    round_name VARCHAR(50) NOT NULL,

    duration_minutes INTEGER NOT NULL,

    status VARCHAR(20) DEFAULT 'Pending',

    started_at TIMESTAMP,

    ended_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_rounds_session
        FOREIGN KEY (session_id)
        REFERENCES debate_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_round_status
        CHECK (
            status IN (
                'Pending',
                'In Progress',
                'Completed'
            )
        )

);