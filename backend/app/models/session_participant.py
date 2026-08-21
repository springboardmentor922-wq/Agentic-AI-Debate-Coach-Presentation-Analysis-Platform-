"""
=========================================================
Session Participant Model

Stores all participants belonging to a debate session.

Table:
    session_participants
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


class SessionParticipant(Base):

    __tablename__ = "session_participants"

    # =====================================================
    # Primary Key
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # =====================================================
    # Foreign Keys
    # =====================================================

    session_id = Column(
        Integer,
        ForeignKey("debate_sessions.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # =====================================================
    # Participant Information
    # =====================================================

    role_in_session = Column(
        String(30),
        nullable=False
    )

    position = Column(
        String(20),
        nullable=False
    )

    joined_at = Column(DateTime)

    left_at = Column(DateTime)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # =====================================================
    # Relationships
    # =====================================================

    session = relationship(
        "DebateSession",
        back_populates="participants"
    )

    user = relationship(
        "User"
    )