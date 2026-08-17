from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    ForeignKey
)
from datetime import datetime

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    experience_level = Column(String, nullable=True)

    learning_goal = Column(String, nullable=True)
    

    profile_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


    # Academic Information
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    portfolio = Column(String, nullable=True)

    
    classroom_id = Column(
    Integer,
    ForeignKey("classrooms.id"),
    nullable=True
    )