from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.sql import func
from app.db.database import Base

class CoachFeedback(Base):
    """Human-authored feedback, deliberately separate from AI-generated Mongo documents."""
    __tablename__ = "coach_feedback"
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=True)
    feedback = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
