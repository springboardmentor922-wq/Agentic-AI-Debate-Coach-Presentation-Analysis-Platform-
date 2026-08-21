"""
=========================================================
Role Model

Represents the roles available in the platform.

Table:
    roles

Used By:
    - Authentication
    - Role-Based Access Control (RBAC)
=========================================================
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Role(Base):
    """
    SQLAlchemy model for the roles table.
    """

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(50), unique=True, nullable=False)

    description = Column(Text)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship
    users = relationship(
        "User",
        back_populates="role"
    )