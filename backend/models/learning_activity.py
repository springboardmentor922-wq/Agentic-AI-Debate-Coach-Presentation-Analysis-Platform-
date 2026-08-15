from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    activity_id = Column(Integer, primary_key=True, index=True)

    learner_id = Column(Integer, ForeignKey("users.user_id"))

    title = Column(String(200))

    activity_type = Column(String(100))

    status = Column(String(50))

    score = Column(Integer)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )