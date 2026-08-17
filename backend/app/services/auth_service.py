from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password

from app.utils.security import verify_password
from app.utils.jwt_handler import create_access_token


def register_user(user: UserCreate, db: Session):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return None

    # Create new user
    new_user = User(
    full_name=user.full_name,
    email=user.email,
    password=hash_password(user.password),
    role=user.role,
    profile_completed=False
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def login_user(email: str, password: str, db: Session):

    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    # Verify password
    if not verify_password(password, user.password):
        return None

    # Generate JWT Token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }