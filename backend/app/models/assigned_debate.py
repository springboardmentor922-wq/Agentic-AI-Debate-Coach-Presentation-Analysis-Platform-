from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

from app.database.database import Base


class AssignedDebate(Base):

    __tablename__ = "assigned_debates"

    id = Column(Integer, primary_key=True)

    learner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    coach_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    topic = Column(String)

    category = Column(String)

    difficulty = Column(String)

    due_date = Column(String)

    status = Column(
        String,
        default="Assigned"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )