"""
=========================================================
Debate Topic Model

Stores available debate topics.

Table:
    debate_topics
=========================================================
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.database import Base


class DebateTopic(Base):

    __tablename__ = "debate_topics"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text, nullable=True)

    category = Column(String(100))

    difficulty_level = Column(String(30))

    topic_type = Column(
        String(30),
        default="OFFICIAL"
    )

    visibility = Column(
        String(20),
        default="PUBLIC"
    )

    estimated_duration = Column(
        Integer,
        default=20
    )

    learning_goal = Column(
        String(255),
        nullable=True
    )

    debate_format = Column(
        String(100),
        default="Oxford Debate"
    )

    is_system_generated = Column(
        Boolean,
        default=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    updated_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    is_active = Column(Boolean, default=True)

    is_deleted = Column(Boolean, default=False)

    deleted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship

    debate_sessions = relationship(
        "DebateSession",
        back_populates="topic"
    )