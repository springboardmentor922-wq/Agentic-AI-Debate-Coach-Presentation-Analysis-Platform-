from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime

from app.database.database import Base


class ArgumentReview(Base):

    __tablename__ = "argument_reviews"

    id = Column(Integer, primary_key=True, index=True)

    learner_id = Column(Integer, nullable=False, index=True)

    argument = Column(Text, nullable=False)

    claim = Column(Text, nullable=True)

    supporting_points = Column(Text, nullable=True)

    strengths = Column(Text, nullable=True)

    weaknesses = Column(Text, nullable=True)

    suggestions = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )