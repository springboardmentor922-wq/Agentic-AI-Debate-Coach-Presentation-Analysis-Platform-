from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True
    )

    learning_goal = Column(String)

    preferred_topics = Column(String)

    bio = Column(String)

    experience_level = Column(String)

    user = relationship(
        "User",
        back_populates="profile"
    )