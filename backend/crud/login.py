from sqlalchemy.orm import Session

from models.user import User
from schemas.login import UserLogin
from utils.security import verify_password


def authenticate_user(db: Session, user: UserLogin):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        return None

    if not verify_password(
        user.password,
        db_user.password
    ):
        return None

    return db_user