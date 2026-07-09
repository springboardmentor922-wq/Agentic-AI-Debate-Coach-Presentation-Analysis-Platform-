from sqlalchemy import Column, Integer, String
from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

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

from sqlalchemy import DateTime
from datetime import datetime

class Debate(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    topic = Column(String)
    difficulty = Column(String)
    status = Column(String, default="Pending")

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")