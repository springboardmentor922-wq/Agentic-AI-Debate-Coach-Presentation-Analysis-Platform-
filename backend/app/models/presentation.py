from sqlalchemy import Column, Integer, String, ForeignKey

from app.database.base import Base


class Presentation(Base):

    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    filename = Column(String)

    status = Column(String, default="Completed")