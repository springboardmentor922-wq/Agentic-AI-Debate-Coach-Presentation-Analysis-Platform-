from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.auth.jwt_handler import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Expired Token"
        )

    email = payload.get("sub")

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
def get_staff_user(current_user: User = Depends(get_current_user)):

    if current_user.role not in ["Coach", "Educator", "Admin"]:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions."
        )

    return current_user

def get_current_educator(
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "educator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Educator access required"
        )

    return current_user


def get_current_coach(
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "coach":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required"
        )

    return current_user


def get_current_learner(
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "learner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Learner access required"
        )

    return current_user