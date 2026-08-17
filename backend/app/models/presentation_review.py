from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime

from app.database.database import Base


class PresentationReview(Base):

    __tablename__ = "presentation_reviews"

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

    presentation = Column(
        Text,
        nullable=False
    )

    clarity = Column(
        Integer,
        nullable=True
    )

    confidence = Column(
        Integer,
        nullable=True
    )

    communication = Column(
        Integer,
        nullable=True
    )

    structure = Column(
        Integer,
        nullable=True
    )

    overall = Column(
        Integer,
        nullable=True
    )

    strengths = Column(
        Text,
        nullable=True
    )

    weaknesses = Column(
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