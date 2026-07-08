from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class SkillTracking(Base):
    __tablename__ = "skill_tracking"

    skill_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))

    communication_score = Column(Integer)

    critical_thinking_score = Column(Integer)

    confidence_score = Column(Integer)