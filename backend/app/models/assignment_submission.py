from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Float,
    String
)

from datetime import datetime

from app.database.database import Base


class AssignmentSubmission(Base):

    __tablename__ = "assignment_submissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assignment_id = Column(
        Integer,
        ForeignKey("assignments.id"),
        nullable=False
    )

    learner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    response = Column(
        Text,
        nullable=False
    )

    score = Column(
        Float,
        nullable=True
    )

    educator_feedback = Column(
        Text,
        nullable=True
    )

    status = Column(
        String,
        default="Submitted"
    )

    submitted_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    reviewed_at = Column(
        DateTime,
        nullable=True
    )