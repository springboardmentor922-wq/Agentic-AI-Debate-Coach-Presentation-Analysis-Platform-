from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.postgres import Base


class DebateTurnScore(Base):
    __tablename__ = "debate_turn_scores"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=False)

    clarity = Column(Float, nullable=True)
    evidence_strength = Column(Float, nullable=True)
    rebuttal_quality = Column(Float, nullable=True)
    logical_consistency = Column(Float, nullable=True)

    wpm = Column(Float, nullable=True)          # speech analysis — nullable until an audio turn provides it
    filler_count = Column(Integer, nullable=True)
    speech_duration = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession")

    argument_strength_score = Column(Float, nullable=True)  
    relevance = Column(Float, nullable=True)                
    persuasiveness = Column(Float, nullable=True) 

    argument_quality_score = Column(Float, nullable=True)
    evidence_usage_score = Column(Float, nullable=True)
    logical_consistency_composite = Column(Float, nullable=True)  # distinct from existing logical_consistency (raw)
    rebuttal_effectiveness_score = Column(Float, nullable=True)
    communication_skills_score = Column(Float, nullable=True)
    debate_performance_score = Column(Float, nullable=True)  # this turn's 0-100 composite
    critical_thinking_score = Column(Float, nullable=True)   # this turn's 0-100 composite