from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
    DateTime
)

from datetime import datetime

from app.database.database import Base


class CoachReview(Base):

    __tablename__ = "coach_reviews"

    id = Column(Integer, primary_key=True)

    session_id = Column(
        Integer,
        ForeignKey("debate_sessions.id")
    )

    coach_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    grammar = Column(Integer)

    logic = Column(Integer)

    confidence = Column(Integer)

    communication = Column(Integer)

    overall = Column(Integer)

    strengths = Column(Text)

    improvements = Column(Text)

    feedback = Column(Text)

    reviewed_at = Column(
        DateTime,
        default=datetime.utcnow
    )