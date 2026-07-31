from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class DebateHistory(Base):
    __tablename__ = "debate_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    topic = Column(String(255))
    debate_format = Column(String(100))
    experience_level = Column(String(100))

    user_argument = Column(Text)

    ai_response = Column(Text)

    fallacy_report = Column(Text)

    argument_score = Column(Text)

    coaching_feedback = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())