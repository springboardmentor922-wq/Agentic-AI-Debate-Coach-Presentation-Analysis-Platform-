from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, text
from database import Base


class CoachAssignment(Base):
    __tablename__ = "coach_assignments"

    assignment_id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(Integer, ForeignKey("users.user_id"))

    learner_id = Column(Integer, ForeignKey("users.user_id"))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )