"""
=========================================================
Session Round Model

Stores all rounds of a debate session.

Table:
    session_rounds
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


class SessionRound(Base):

    __tablename__ = "session_rounds"

    # =====================================================
    # Primary Key
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # =====================================================
    # Foreign Key
    # =====================================================

    session_id = Column(
        Integer,
        ForeignKey("debate_sessions.id"),
        nullable=False
    )

    # =====================================================
    # Round Information
    # =====================================================

    round_number = Column(
        Integer,
        nullable=False
    )

    round_name = Column(
        String(50),
        nullable=False
    )

    duration_minutes = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String(20),
        default="Pending"
    )

    started_at = Column(DateTime)

    ended_at = Column(DateTime)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # =====================================================
    # Relationship
    # =====================================================

    session = relationship(
        "DebateSession",
        back_populates="rounds"
    )