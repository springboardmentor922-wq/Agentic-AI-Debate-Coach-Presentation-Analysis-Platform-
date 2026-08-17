from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class EducatorProfile(Base):

    __tablename__ = "educator_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    phone = Column(String)

    bio = Column(String)

    institution = Column(String)

    department = Column(String)

    designation = Column(String)

    experience = Column(Integer)

    subjects = Column(String)

    office_hours = Column(String)

    research_interests = Column(String)

    courses_handled = Column(String)

    user = relationship("User")