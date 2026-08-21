"""
=========================================================
User Skill Model

Stores learner skill scores.

Table:
    user_skills
=========================================================
"""

from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.database import Base


class UserSkill(Base):

    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    communication_score = Column(DECIMAL(5, 2), default=0)

    critical_thinking_score = Column(DECIMAL(5, 2), default=0)

    presentation_score = Column(DECIMAL(5, 2), default=0)

    argument_score = Column(DECIMAL(5, 2), default=0)

    confidence_score = Column(DECIMAL(5, 2), default=0)

    total_debates = Column(Integer, default=0)

    total_presentations = Column(Integer, default=0)
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship

    user = relationship(
        "User",
        back_populates="skills"
    )