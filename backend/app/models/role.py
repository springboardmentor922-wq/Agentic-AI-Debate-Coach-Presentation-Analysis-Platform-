import enum

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class RoleName(str, enum.Enum):
    LEARNER = "learner"
    DEBATE_COACH = "debate_coach"
    EDUCATOR = "educator"
    ADMINISTRATOR = "administrator"


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")
