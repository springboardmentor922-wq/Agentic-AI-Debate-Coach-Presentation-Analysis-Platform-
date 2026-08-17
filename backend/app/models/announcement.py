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


class Announcement(Base):

    __tablename__ = "announcements"

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

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    priority = Column(
        String,
        default="Normal"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )