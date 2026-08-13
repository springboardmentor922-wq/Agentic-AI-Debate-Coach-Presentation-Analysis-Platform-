"""
Debate Evaluation Model

SQLAlchemy model for PostgreSQL 'debate_evaluations' table.
Tracks weighted performance scores for debate turns.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Numeric, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class DebateEvaluation(Base):
    __tablename__ = "debate_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    round_id = Column(Integer, ForeignKey("session_rounds.id", ondelete="SET NULL"), nullable=True)
    turn_number = Column(Integer, default=1)
    
    argument_quality_score = Column(Numeric(5, 2), default=0.00)
    evidence_usage_score = Column(Numeric(5, 2), default=0.00)
    logical_consistency_score = Column(Numeric(5, 2), default=0.00)
    rebuttal_effectiveness_score = Column(Numeric(5, 2), default=0.00)
    communication_skills_score = Column(Numeric(5, 2), default=0.00)
    overall_performance_score = Column(Numeric(5, 2), default=0.00)
    critical_thinking_score = Column(Numeric(5, 2), default=0.00)
    
    feedback_summary = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession", backref="evaluations")
    user = relationship("User", backref="debate_evaluations")
