from sqlalchemy.orm import Session
from . import models, schemas
from .security import hash_password
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