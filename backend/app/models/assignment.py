from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from datetime import datetime

from app.database.database import Base


class Assignment(Base):

    __tablename__ = "assignments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    educator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    classroom_id = Column(
        Integer,
        ForeignKey("classrooms.id"),
        nullable=True
    )

    learner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    difficulty = Column(
        String,
        default="Medium"
    )

    due_date = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="Assigned"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )