from sqlalchemy import Column, Integer, String

from app.database.database import Base


class DebateTopic(Base):
    __tablename__ = "debate_topics"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(String)

    difficulty = Column(String)

    category = Column(String)