from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base

class DailyMission(Base):
    __tablename__ = "daily_missions"

    mission_id = Column(Integer, primary_key=True, index=True)

    learner_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    title = Column(String(200))

    status = Column(String(50))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )