"""
=========================================================
Database Initialization & Seeding Utility

Responsibilities:
1. Ensure database tables exist
2. Seed standard platform roles (Administrator, Educator, Debate Coach, Learner)
3. Seed/verify 4 real demo accounts with hashed passwords
=========================================================
"""

import logging
from sqlalchemy.orm import Session

from app.db.database import Base, engine, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.user_profile import UserProfile
from app.utils.password import hash_password

logger = logging.getLogger(__name__)

STANDARD_ROLES = [
    {"id": 1, "name": "Administrator", "description": "Full system access"},
    {"id": 2, "name": "Educator", "description": "Manages students and classes"},
    {"id": 3, "name": "Debate Coach", "description": "Provides coaching and evaluates debates"},
    {"id": 4, "name": "Learner", "description": "Participates in debates and learning activities"},
]

DEMO_ACCOUNTS = [
    {
        "email": "learner.demo@example.com",
        "full_name": "Demo Learner",
        "password": "Demo@Learner2026",
        "role_name": "Learner",
    },
    {
        "email": "coach.demo@example.com",
        "full_name": "Demo Coach",
        "password": "Demo@Coach2026",
        "role_name": "Debate Coach",
    },
    {
        "email": "educator.demo@example.com",
        "full_name": "Demo Educator",
        "password": "Demo@Educator2026",
        "role_name": "Educator",
    },
    {
        "email": "admin.demo@example.com",
        "full_name": "Demo Admin",
        "password": "Demo@Admin2026",
        "role_name": "Administrator",
    },
]


def init_db(db: Session = None) -> None:
    """
    Initializes tables, populates missing roles, and creates/verifies demo accounts.
    """
    close_db_when_done = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db_when_done = True

    try:
        # 1. Seed Roles
        role_map = {}
        for role_data in STANDARD_ROLES:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                # Also check by ID
                existing_role_by_id = db.query(Role).filter(Role.id == role_data["id"]).first()
                if existing_role_by_id:
                    existing_role_by_id.name = role_data["name"]
                    existing_role_by_id.description = role_data["description"]
                    existing_role = existing_role_by_id
                else:
                    existing_role = Role(
                        id=role_data["id"],
                        name=role_data["name"],
                        description=role_data["description"]
                    )
                    db.add(existing_role)
                db.commit()
                db.refresh(existing_role)
            role_map[role_data["name"]] = existing_role.id

        # 2. Seed Demo Accounts
        for acc in DEMO_ACCOUNTS:
            role_id = role_map.get(acc["role_name"])
            if not role_id:
                logger.error(f"Role '{acc['role_name']}' not found when seeding demo account {acc['email']}.")
                continue

            existing_user = db.query(User).filter(User.email == acc["email"]).first()
            hashed_pwd = hash_password(acc["password"])

            if existing_user:
                # Update demo user details to ensure accurate seed state
                existing_user.full_name = acc["full_name"]
                existing_user.password_hash = hashed_pwd
                existing_user.role_id = role_id
                existing_user.is_active = True
                db.commit()
                db.refresh(existing_user)
                user_obj = existing_user
            else:
                user_obj = User(
                    full_name=acc["full_name"],
                    email=acc["email"],
                    password_hash=hashed_pwd,
                    role_id=role_id,
                    is_active=True
                )
                db.add(user_obj)
                db.commit()
                db.refresh(user_obj)

            # Ensure profile exists
            existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user_obj.id).first()
            if not existing_profile:
                profile_obj = UserProfile(
                    user_id=user_obj.id,
                    institution="Global Academy",
                    experience_level="Intermediate"
                )
                db.add(profile_obj)
                db.commit()

    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        db.rollback()
        raise
    finally:
        if close_db_when_done:
            db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Initializing database and seeding demo accounts...")
    init_db()
    logger.info("Database initialization complete.")
