from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base


class CoachNote(Base):
    __tablename__ = "coach_notes"

    note_id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(Integer, ForeignKey("users.user_id"))

    learner_id = Column(Integer, ForeignKey("users.user_id"))

    note = Column(String(1000))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )