from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.sql import func
from app.db.database import Base

class CoachEvaluation(Base):
    """Detailed manual evaluations submitted by coaches for learners."""
    __tablename__ = "coach_evaluations"

    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=True)
    communication_score = Column(Numeric(5, 2), default=0.00)
    confidence_score = Column(Numeric(5, 2), default=0.00)
    logic_score = Column(Numeric(5, 2), default=0.00)
    rebuttal_score = Column(Numeric(5, 2), default=0.00)
    evidence_score = Column(Numeric(5, 2), default=0.00)
    overall_score = Column(Numeric(5, 2), default=0.00)
    comments = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

