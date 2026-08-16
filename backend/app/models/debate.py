from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


class Debate(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    topic = Column(String)
    difficulty = Column(String)
    status = Column(String, default="Pending")

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")