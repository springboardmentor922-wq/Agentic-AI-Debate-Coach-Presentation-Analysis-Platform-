from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func
from app.db.database import Base

class DebateAssignment(Base):
    __tablename__ = "debate_assignments"
    id = Column(Integer, primary_key=True)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("debate_topics.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("educator_classes.id"), nullable=True)
    status = Column(String(20), nullable=False, default="Assigned")
    due_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
