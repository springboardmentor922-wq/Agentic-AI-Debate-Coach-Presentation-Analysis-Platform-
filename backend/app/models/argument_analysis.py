"""
Argument Analysis & Logical Fallacy Models

SQLAlchemy models for PostgreSQL 'argument_analyses' and 'logical_fallacies_detected' tables.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class ArgumentAnalysis(Base):
    __tablename__ = "argument_analyses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    round_id = Column(Integer, ForeignKey("session_rounds.id", ondelete="SET NULL"), nullable=True)
    
    extracted_argument = Column(Text, nullable=False)
    claim_text = Column(Text, nullable=True)
    evidence_text = Column(Text, nullable=True)
    
    clarity_score = Column(Numeric(5, 2), default=0.00)
    relevance_score = Column(Numeric(5, 2), default=0.00)
    evidence_strength_score = Column(Numeric(5, 2), default=0.00)
    logical_consistency_score = Column(Numeric(5, 2), default=0.00)
    persuasiveness_score = Column(Numeric(5, 2), default=0.00)
    overall_argument_strength = Column(Numeric(5, 2), default=0.00)
    reasoning_quality_score = Column(Numeric(5, 2), default=0.00)
    
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession", backref="analyses")
    user = relationship("User", backref="argument_analyses")
    fallacies = relationship("LogicalFallacyDetected", backref="analysis", cascade="all, delete-orphan")


class LogicalFallacyDetected(Base):
    __tablename__ = "logical_fallacies_detected"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("argument_analyses.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    fallacy_type = Column(String(100), nullable=False)
    detected_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    correction_suggestion = Column(Text, nullable=True)
    severity_level = Column(String(20), default="Medium")
    credibility_impact = Column(Numeric(5, 2), default=0.00)
    
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession", backref="detected_fallacies")
    user = relationship("User", backref="detected_fallacies")
