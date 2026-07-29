"""
=========================================================
Authentication Dependencies

Provides:

- JWT Authentication
- Current User
- Role-Based Access Control (RBAC)

=========================================================
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.user import User

from app.utils.jwt import verify_access_token

# --------------------------------------------------------
# OAuth2 Bearer Token
# --------------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)
# --------------------------------------------------------
# Get Current User
# --------------------------------------------------------


def get_current_user(

    token: str = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    payload = verify_access_token(token)

    if payload is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired token"

        )

    email = payload.get("sub")

    if email is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid token payload"

        )

    user = (

        db.query(User)

        .filter(User.email == email)

        .first()

    )

    if user is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="User not found"

        )

    return user


# --------------------------------------------------------
# Role-Based Access Control
# --------------------------------------------------------

def require_role(required_role: str):

    def role_checker(

        current_user: User = Depends(get_current_user)

    ):

        if current_user.role.name != required_role:

            raise HTTPException(

                status_code=status.HTTP_403_FORBIDDEN,

                detail="You do not have permission to access this resource."

            )

        return current_user

    return role_checker


# --------------------------------------------------------
# Multiple Role-Based Access Control
# --------------------------------------------------------

def require_any_role(allowed_roles: list[str]):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):

        if current_user.role.name not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )

        return current_user

    return role_checker