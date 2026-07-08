from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))

    learning_goals = Column(Text)

    preferred_topics = Column(Text)

    experience_level = Column(String(50))