from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func
from app.db.database import Base

class CoachAssignment(Base):
    """Relational ownership between a coach and a learner."""
    __tablename__ = "coach_assignments"
    __table_args__ = (UniqueConstraint("coach_id", "learner_id", name="uq_coach_learner"),)
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default="Active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
