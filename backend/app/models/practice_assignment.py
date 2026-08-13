from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.db.database import Base

class LearnerPracticeAssignment(Base):
    """Practice tasks and homework assigned by a coach to a learner."""
    __tablename__ = "learner_practice_assignments"

    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("debate_topics.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    debate_format = Column(String(50), default="Oxford Debate")
    difficulty = Column(String(30), default="Intermediate")
    due_date = Column(DateTime(timezone=True), nullable=True)

    status = Column(String(30), default="Assigned")
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


