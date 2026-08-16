from sqlalchemy import Column, Integer, Text, Float

from ..database import Base
from sqlalchemy import DateTime
from datetime import datetime
class DebateAnalysis(Base):
    __tablename__ = "debate_analysis"

    id = Column(Integer, primary_key=True, index=True)

    argument = Column(Text, nullable=False)

    overall_score = Column(Float)

    fallacy_type = Column(Text)

    explanation = Column(Text)

    counter_argument = Column(Text)

    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)