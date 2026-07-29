"""
=========================================================
User Profile Model

Stores additional learner profile information.

Table:
    user_profiles
=========================================================
"""

from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,
    DateTime,
    Date,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.database import Base


class UserProfile(Base):

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # =====================================================
# Personal Information
# =====================================================

    phone_number = Column(
        String(20)
    )

    institution = Column(
        String(150)
    )

    location = Column(
        String(100)
    )

    date_of_birth = Column(
        Date
    )

    gender = Column(
        String(20)
    )

    # =====================================================
    # Profile Information
    # =====================================================

    bio = Column(
        Text
    )

    experience_level = Column(
        String(50)
    )

    learning_goals = Column(
        Text
    )

    preferred_debate_topics = Column(
        Text
    )

    presentation_domains = Column(
        Text
    )

    coaching_preferences = Column(
        Text
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship

    user = relationship(
        "User",
        back_populates="profile"
    )