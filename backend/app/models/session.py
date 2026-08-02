from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class DebateSession(Base):

    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    topic_id = Column(Integer, ForeignKey("debate_topics.id"))

    session_type = Column(String)

    debate_format = Column(
        String,
        default="One-on-One Debate"
    )

    position = Column(
        String,
        default="For"
    )

    status = Column(String)

    duration = Column(Integer)

    user = relationship(
        "User",
        back_populates="sessions"
    )

    topic = relationship(
        "DebateTopic",
        back_populates="sessions"
    )

    record = relationship(
        "DebateRecord",
        uselist=False,
        back_populates="session",
        cascade="all, delete-orphan"
    )