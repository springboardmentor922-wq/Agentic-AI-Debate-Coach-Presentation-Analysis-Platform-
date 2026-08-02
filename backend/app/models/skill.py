from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class SkillTracking(Base):
    __tablename__ = "skill_tracking"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    confidence_score = Column(Integer)

    logical_reasoning = Column(Integer)

    communication = Column(Integer)

    rebuttal_skill = Column(Integer)

    overall_score = Column(Integer)

    user = relationship(
        "User",
        back_populates="skills"
    )