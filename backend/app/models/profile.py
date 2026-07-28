from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    college = Column(String)
    department = Column(String)
    year = Column(String)
    language = Column(String)
    experience = Column(String)

    user = relationship("User")