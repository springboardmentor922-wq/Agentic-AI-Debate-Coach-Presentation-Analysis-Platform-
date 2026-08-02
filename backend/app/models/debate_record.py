from sqlalchemy import Column, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class DebateRecord(Base):
    __tablename__ = "debate_records"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("debate_sessions.id")
    )

    transcript = Column(Text)

    session = relationship(
        "DebateSession",
        back_populates="record"
    )