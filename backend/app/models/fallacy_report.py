from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime

from app.database.database import Base


class FallacyReport(Base):

    __tablename__ = "fallacy_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    learner_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    argument = Column(
        Text,
        nullable=False
    )

    detected_fallacies = Column(
        Text,
        nullable=True
    )

    explanations = Column(
        Text,
        nullable=True
    )

    suggestions = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )