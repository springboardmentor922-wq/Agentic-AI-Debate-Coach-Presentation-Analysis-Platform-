from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    session_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))

    topic_id = Column(Integer, ForeignKey("debate_topics.topic_id"))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    status = Column(String(50))