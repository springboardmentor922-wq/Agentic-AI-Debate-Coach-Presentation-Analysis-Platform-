from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database.database import Base


class CoachProfile(Base):

    __tablename__ = "coach_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    phone = Column(String)

    bio = Column(String)

    experience = Column(Integer)

    qualification = Column(String)

    organization = Column(String)

    specialization = Column(String)

    languages = Column(String)

    availability = Column(String)

    rating = Column(String, default="0")

    linkedin = Column(String)

    mentor_tagline = Column(String)

    students_mentored = Column(Integer, default=0)
    email_visible = Column(Boolean, default=True)

    user = relationship("User")