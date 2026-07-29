"""
=========================================================
Database Configuration

Creates:
1. SQLAlchemy Engine
2. Session Factory
3. Base Class
4. Database Dependency

Used throughout the application.
=========================================================
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# --------------------------------------------------------
# SQLAlchemy Engine
# --------------------------------------------------------

engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)


# --------------------------------------------------------
# Session Factory
# --------------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# --------------------------------------------------------
# Base Class
# --------------------------------------------------------

Base = declarative_base()


# --------------------------------------------------------
# Dependency
# --------------------------------------------------------

def get_db():
    """
    Creates a new database session for every request
    and automatically closes it afterwards.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()