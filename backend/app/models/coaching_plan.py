from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime


from app.database.database import Base


class CoachingPlan(Base):

    __tablename__ = "coaching_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    coach_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    learner_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    goal = Column(
        Text,
        nullable=False
    )

    focus_area = Column(
        String(200),
        nullable=True
    )

    activities = Column(
        Text,
        nullable=True
    )

    due_date = Column(
        String(50),
        nullable=True
    )

    status = Column(
        String(50),
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )