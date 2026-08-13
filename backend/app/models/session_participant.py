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
    Boolean,
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

    joined_at = Column(DateTime(timezone=True))

    left_at = Column(DateTime(timezone=True))

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