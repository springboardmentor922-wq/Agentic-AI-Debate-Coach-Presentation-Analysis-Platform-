from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.user import User
from schemas.user import UserCreate
from utils.security import hash_password


def create_user(db: Session, user: UserCreate):
    try:
        hashed_password = hash_password(user.password)

        new_user = User(
            full_name=user.full_name,
            email=user.email,
            password=hashed_password,
            role_id=user.role_id
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(str(e))
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()