from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func

from app.database.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    topic = Column(Text)

    argument = Column(Text)

    recording_path = Column(String, nullable=True)

    # Scores
    grammar_score = Column(Integer)
    grammar_percentage = Column(Float)
    grammar_remark = Column(Text)

    logic_score = Column(Integer)
    logic_percentage = Column(Float)
    logic_remark = Column(Text)

    confidence_score = Column(Integer)
    confidence_percentage = Column(Float)
    confidence_remark = Column(Text)

    relevance_score = Column(Integer)
    relevance_percentage = Column(Float)
    relevance_remark = Column(Text)

    overall_score = Column(Integer)
    overall_percentage = Column(Float)

    grade = Column(Text)

    # Existing AI Data
    strengths = Column(Text)
    weaknesses = Column(Text)
    coach_tips = Column(Text)
    feedback = Column(Text)

    # NEW AI Data
    counter_arguments = Column(Text)

    logical_fallacies = Column(Text)

    rebuttals = Column(Text)

    opening_statement = Column(Text)

    closing_statement = Column(Text)

    improved_argument = Column(Text)

    real_world_examples = Column(Text)

    statistics = Column(Text)

    ai_insights = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )