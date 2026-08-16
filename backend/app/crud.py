from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models, schemas
from .security import hash_password, verify_password

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = hash_password(user.password)

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):

    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


def is_login_locked(user):
    return bool(user.locked_until and user.locked_until > datetime.utcnow())


def record_login_failure(db: Session, user):
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= 5:
        user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        user.failed_login_attempts = 0
    db.commit()


def clear_login_failures(db: Session, user):
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()


def create_admin_mfa_secret(db: Session, user, secret: str):
    user.mfa_secret = secret
    user.mfa_enabled = False
    db.commit()


def enable_admin_mfa(db: Session, user):
    user.mfa_enabled = True
    db.commit()

def create_profile(db: Session, profile: schemas.ProfileCreate, user_id: int):

    db_profile = models.Profile(
        user_id=user_id,
        college=profile.college,
        department=profile.department,
        year=profile.year,
        language=profile.language,
        experience=profile.experience
    )

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_profile

def create_debate(db: Session, debate: schemas.DebateCreate, user_id: int):

    db_debate = models.Debate(
        user_id=user_id,
        topic=debate.topic,
        difficulty=debate.difficulty
    )

    db.add(db_debate)
    db.commit()
    db.refresh(db_debate)

    return db_debate

def get_profile(db: Session, user_id: int):
    return db.query(models.Profile).filter(
        models.Profile.user_id == user_id
    ).first()


def update_profile(db: Session, user_id: int, profile: schemas.ProfileCreate):

    db_profile = get_profile(db, user_id)

    if not db_profile:
        return None

    db_profile.college = profile.college
    db_profile.department = profile.department
    db_profile.year = profile.year
    db_profile.language = profile.language
    db_profile.experience = profile.experience

    db.commit()
    db.refresh(db_profile)

    return db_profile

