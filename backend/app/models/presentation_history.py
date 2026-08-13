import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class PresentationDomain(str, enum.Enum):
    BUSINESS = "business"
    EDUCATION = "education"
    TECHNICAL = "technical"
    MARKETING = "marketing"
    INTERVIEW = "interview"
    OTHER = "other"


class PresentationStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class PresentationHistory(Base):
    __tablename__ = "presentation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    domain = Column(Enum(PresentationDomain), default=PresentationDomain.OTHER)
    duration = Column(Integer, nullable=True)  # seconds

    overall_score = Column(Float, nullable=True)
    ai_feedback_summary = Column(Text, nullable=True)
    communication_score = Column(Float, nullable=True)
    clarity_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    logical_consistency_score = Column(Float, nullable=True)
    fallacy_count = Column(Integer, default=0)

    status = Column(Enum(PresentationStatus), default=PresentationStatus.IN_PROGRESS)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")