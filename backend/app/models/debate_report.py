from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class DebateReport(Base):
    __tablename__ = "debate_reports"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("debate_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ----------------------------
    # Overall Result
    # ----------------------------

    winner = Column(Text, nullable=False)

    overall_score = Column(Float, nullable=False)

    judge_summary = Column(Text, nullable=False)

    # ----------------------------
    # Strengths / Weaknesses
    # ----------------------------

    strengths = Column(JSON, nullable=False, default=list)

    weaknesses = Column(JSON, nullable=False, default=list)

    recommendations = Column(JSON, nullable=False, default=list)

    learning_plan = Column(JSON, nullable=False, default=list)

    # ----------------------------
    # Best Debate Moments
    # ----------------------------

    best_argument = Column(Text, nullable=True)

    best_rebuttal = Column(Text, nullable=True)

    closing_feedback = Column(Text, nullable=True)

    # ----------------------------
    # Performance Metrics
    # ----------------------------

    argument_quality = Column(Float, nullable=True)

    evidence_usage = Column(Float, nullable=True)

    logical_consistency = Column(Float, nullable=True)

    rebuttal_effectiveness = Column(Float, nullable=True)

    communication_skills = Column(Float, nullable=True)

    confidence_score = Column(Float, nullable=True)

    presentation_score = Column(Float, nullable=True)

    critical_thinking_score = Column(Float, nullable=True)

    # ----------------------------
    # Statistics
    # ----------------------------

    total_turns = Column(Integer, default=0)

    fallacies_detected = Column(Integer, default=0)

    average_response_time = Column(Float, nullable=True)

    total_words = Column(Integer, default=0)

    # ----------------------------
    # Timeline
    # ----------------------------

    timeline = Column(JSON, nullable=True)

    score_progression = Column(JSON, nullable=True)

    # ----------------------------
    # Metadata
    # ----------------------------

    generated_by = Column(Text, default="AI Judge")

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ----------------------------
    # Relationships
    # ----------------------------

    session = relationship(
        "DebateSession",
        backref="judge_report",
        lazy="joined",
    )

    user = relationship(
        "User",
        backref="debate_reports",
        lazy="joined",
    )