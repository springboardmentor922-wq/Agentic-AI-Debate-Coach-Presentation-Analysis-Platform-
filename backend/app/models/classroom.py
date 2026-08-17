from sqlalchemy import Column, Integer, String, ForeignKey

from app.database.database import Base


class Classroom(Base):

    __tablename__ = "classrooms"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    educator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )