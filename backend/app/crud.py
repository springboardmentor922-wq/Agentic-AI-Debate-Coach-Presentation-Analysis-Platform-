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

def create_default_admin(db: Session):
    admin = get_user_by_email(db, "admin@gmail.com")

    if admin:
        return admin

    admin_user = models.User(
        full_name="System Administrator",
        email="admin@gmail.com",
        password=hash_password("admin123"),
        role="Administrator"
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    return admin_user