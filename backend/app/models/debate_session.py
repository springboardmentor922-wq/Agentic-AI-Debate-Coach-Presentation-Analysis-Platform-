"""
=========================================================
Debate Session Model

Stores learner debate sessions.

Table:
    debate_sessions
=========================================================
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.database import Base


class DebateSession(Base):

    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    topic_id = Column(
        Integer,
        ForeignKey("debate_topics.id"),
        nullable=False
    )

    debate_format = Column(String(50))

    debate_position = Column(String(20))

    scheduled_at = Column(DateTime(timezone=True))

    session_status = Column(String(30))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    started_at = Column(DateTime)

    ended_at = Column(DateTime)

    # Relationships

    user = relationship(
        "User",
        back_populates="debate_sessions"
    )

    topic = relationship(
        "DebateTopic",
        back_populates="debate_sessions"
    )

    participants = relationship(
    "SessionParticipant",
    back_populates="session",
    cascade="all, delete-orphan"
    )

    rounds = relationship(
        "SessionRound",
        back_populates="session",
        cascade="all, delete-orphan"
    )