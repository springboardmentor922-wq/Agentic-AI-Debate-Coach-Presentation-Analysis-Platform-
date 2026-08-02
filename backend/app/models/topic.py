from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class DebateTopic(Base):
    __tablename__ = "debate_topics"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, unique=True, nullable=False)

    category = Column(String, nullable=False)

    difficulty = Column(String, nullable=False)

    description = Column(Text)

    sessions = relationship(
        "DebateSession",
        back_populates="topic"
    )