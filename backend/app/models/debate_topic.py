import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text, DateTime, JSON, Interval
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.postgres import Base


class TopicDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class DebateTopic(Base):
    __tablename__ = "debate_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    difficulty = Column(Enum(TopicDifficulty), default=TopicDifficulty.MEDIUM)

    compatible_formats = Column(JSON, default=list)
    estimated_duration = Column(Interval, nullable=True)
    background_notes = Column(Text, nullable=True)
    scope = Column(String(20), default="global")  # global | class | coach_learners
    assigned_class_id = Column(Integer, nullable=True)
    assigned_coach_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = relationship("User", foreign_keys=[created_by_id])

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sessions = relationship("DebateSession", back_populates="topic")