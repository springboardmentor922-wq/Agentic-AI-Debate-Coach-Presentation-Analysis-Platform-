"""
Presentation Analysis Model

SQLAlchemy model for PostgreSQL 'presentation_analyses' table.
Milestone 4 Presentation & Speech analytics preservation.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Numeric, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class PresentationAnalysis(Base):
    __tablename__ = "presentation_analyses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(Text, nullable=True)
    gridfs_id = Column(Text, nullable=True, index=True)
    filename = Column(Text, nullable=True)
    mime_type = Column(Text, nullable=True)
    processing_status = Column(Text, default="CREATED", index=True)
    
    speech_pace_wpm = Column(Numeric(6, 2), default=0.00)
    filler_words_count = Column(Integer, default=0)
    filler_words_details = Column(Text, nullable=True)
    confidence_score = Column(Numeric(5, 2), default=0.00)
    clarity_score = Column(Numeric(5, 2), default=0.00)
    audience_engagement_score = Column(Numeric(5, 2), default=0.00)
    prosody_pitch_variance = Column(Numeric(6, 2), default=0.00)
    energy_variance = Column(Numeric(6, 2), default=0.00)
    pause_count = Column(Integer, default=0)
    overall_score = Column(Numeric(5, 2), default=0.00)
    audio_duration_seconds = Column(Numeric(8, 2), default=0.00)
    transcription_text = Column(Text, nullable=True)
    
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession", backref="presentation_analyses")
    user = relationship("User", backref="presentation_analyses")

