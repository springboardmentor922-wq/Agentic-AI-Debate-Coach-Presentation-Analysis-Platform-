"""
=========================================================
User Model

Represents all users in the platform.

Table:
    users

Used By:
    - Authentication
    - User Profile
    - Debate Sessions
    - Role-Based Access Control
=========================================================
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class User(Base):
    """
    SQLAlchemy model for the users table.
    """

    __tablename__ = "users"

    # -----------------------------------------------------
    # Primary Key
    # -----------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -----------------------------------------------------
    # User Information
    # -----------------------------------------------------

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    # -----------------------------------------------------
    # Role
    # -----------------------------------------------------

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False
    )

    # -----------------------------------------------------
    # Account Status
    # -----------------------------------------------------

    is_active = Column(
        Boolean,
        default=True
    )

    # -----------------------------------------------------
    # Timestamps
    # -----------------------------------------------------

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # -----------------------------------------------------
    # Relationships
    # -----------------------------------------------------

    role = relationship(
        "Role",
        back_populates="users"
    )

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False
    )

    skills = relationship(
        "UserSkill",
        back_populates="user",
        uselist=False
    )

    debate_sessions = relationship(
        "DebateSession",
        back_populates="user"
    )