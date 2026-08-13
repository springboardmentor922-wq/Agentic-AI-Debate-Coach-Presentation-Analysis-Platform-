"""
Counterargument Model

SQLAlchemy model for PostgreSQL 'counterarguments_generated' table.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class CounterargumentGenerated(Base):
    __tablename__ = "counterarguments_generated"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    original_claim = Column(Text, nullable=False)
    rebuttal_type = Column(String(50), nullable=False)
    rebuttal_text = Column(Text, nullable=False)
    counterpoint_text = Column(Text, nullable=True)
    alternative_perspective = Column(Text, nullable=True)
    challenge_question = Column(Text, nullable=True)
    strategy_suggestion = Column(Text, nullable=True)
    difficulty_level = Column(String(30), default="Intermediate")
    
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession", backref="counterarguments")
    user = relationship("User", backref="counterarguments")
