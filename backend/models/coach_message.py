from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base

class CoachMessage(Base):
    __tablename__ = "coach_messages"

    message_id = Column(Integer, primary_key=True, index=True)

    learner_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    coach_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    message = Column(String(1000))

    status = Column(String(50))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    reply = Column(String(2000), nullable=True)

    reply_status = Column(
        String(50),
        default="Pending"
    )