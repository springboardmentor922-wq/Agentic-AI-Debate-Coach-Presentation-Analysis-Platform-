from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func
from app.db.database import Base

class EducatorClass(Base):
    __tablename__ = "educator_classes"
    id = Column(Integer, primary_key=True)
    educator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"
    __table_args__ = (UniqueConstraint("class_id", "learner_id", name="uq_class_learner"),)
    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("educator_classes.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    enrolled_at = Column(DateTime, server_default=func.now())
