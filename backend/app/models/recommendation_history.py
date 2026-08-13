from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.postgres import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=True)

    priority_focus_summary = Column(String(500), nullable=True)  # short text, e.g. "evidence_usage,rebuttal_skills" — used to avoid repeating the same priorities next time
    coaching_status = Column(String(50), default="generated")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")