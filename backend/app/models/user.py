from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String(255), nullable=False)

    role = Column(String(50), default="Learner")

    experience = Column(String(50), default="Beginner")

    # Relationships
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    sessions = relationship(
        "DebateSession",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    skills = relationship(
        "SkillTracking",
        back_populates="user",
        cascade="all, delete-orphan"
    )