from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)

    learner_id = Column(Integer, ForeignKey("users.id"))

    topic = Column(String, nullable=False)

    category = Column(String)

    difficulty = Column(String)

    duration = Column(Integer)

    recording_path = Column(String)

    created_by = Column(String)

    assigned_coach = Column(Integer, ForeignKey("users.id"), nullable=True)

    status = Column(
        String,
        default="Pending Review"
    )

    coach_reviewed = Column(
        String,
        default="No"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    learner = relationship(
        "User",
        foreign_keys=[learner_id]
    )

    coach = relationship(
        "User",
        foreign_keys=[assigned_coach]
    )