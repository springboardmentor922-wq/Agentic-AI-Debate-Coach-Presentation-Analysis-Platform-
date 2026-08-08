import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from backend.app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Learner")  # Learner, Debate Coach, Educator, Administrator
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    coach_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    educator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    debate_sessions = relationship("DebateSession", back_populates="user", cascade="all, delete-orphan", foreign_keys="[DebateSession.user_id]")
    speech_analyses = relationship("SpeechAnalysis", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String, nullable=False)
    experience_level = Column(String, default="Beginner")  # Beginner, Intermediate, Advanced
    preferred_topics = Column(JSON, default=list)  # list of strings
    presentation_domains = Column(JSON, default=list)  # list of strings
    learning_goals = Column(JSON, default=list)  # list of strings
    coaching_preferences = Column(JSON, default=dict)  # dict for preferences
    skills_json = Column(JSON, default=lambda: {
        "argumentation": 50,
        "evidence_usage": 50,
        "logical_consistency": 50,
        "rebuttal_effectiveness": 50,
        "communication_skills": 50,
        "speech_pace": 50,
        "confidence": 50
    })
    current_streak = Column(Integer, default=1)
    last_active_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    topic = Column(String, nullable=False)
    format = Column(String, default="One-on-One Debate")  # One-on-One, Parliamentary, Oxford, Policy, Public Forum, AI Debate Simulation
    user_position = Column(String, default="Pro")  # Pro, Con, Government, Opposition, Affirmative, Negative
    position_role = Column(String, default="Pro")
    ai_personality = Column(String, default="Socrates")  # Socrates, Pragmatist, Aggressor
    provider = Column(String, default="Local Simulation Engine")
    status = Column(String, default="active")  # scheduled, active, completed, cancelled
    score = Column(Float, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=30)
    current_round = Column(Integer, default=1)
    round_structure = Column(String, default="Standard")
    recording_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_challenge = Column(Boolean, default=False)
    deadline = Column(DateTime, nullable=True)
    challenge_type = Column(String, nullable=True)

    user = relationship("User", back_populates="debate_sessions", foreign_keys=[user_id])
    turns = relationship("DebateTurn", back_populates="session", cascade="all, delete-orphan")

class DebateTurn(Base):
    __tablename__ = "debate_turns"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    speaker = Column(String, nullable=False)  # User or AI
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Stores analysis results for this specific turn
    # { "scores": { "clarity": 80, ... }, "fallacies": [...], "rebuttals": [...] }
    analysis_json = Column(JSON, default=dict)

    session = relationship("DebateSession", back_populates="turns")

class SpeechAnalysis(Base):
    __tablename__ = "speech_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="Speech Rehearsal")
    duration = Column(Float, default=0.0)  # in seconds
    transcript = Column(Text, nullable=False)
    pace = Column(Integer, default=0)  # words per minute
    filler_word_count = Column(JSON, default=dict)  # {"um": 3, "like": 5}
    clarity_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    audience_engagement_score = Column(Float, default=0.0)
    fallacies_json = Column(JSON, default=list)  # fallacies found in this speech
    overall_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="speech_analyses")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, milestone, reminder, feedback
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")

class DebateTopic(Base):
    __tablename__ = "debate_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    category = Column(String, default="General")
    description = Column(Text, nullable=True)
    target_format = Column(String, default="One-on-One Debate")
    difficulty = Column(String, default="Intermediate")
    tags = Column(JSON, default=list)
    is_predefined = Column(Boolean, default=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

