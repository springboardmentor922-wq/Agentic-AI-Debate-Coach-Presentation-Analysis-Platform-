from sqlalchemy import Column, Integer, String
from database import Base


class DebateTopic(Base):
    __tablename__ = "debate_topics"

    topic_id = Column(Integer, primary_key=True, index=True)

    topic_name = Column(String(255), nullable=False)

    category = Column(String(100))