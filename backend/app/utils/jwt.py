"""
=========================================================
JWT Utility

Provides helper functions for:

- Creating JWT Access Tokens
- Verifying JWT Tokens

Used By:
- Login API
- Protected APIs
- Role-Based Access Control (RBAC)
=========================================================
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

from app.core.config import settings


# ---------------------------------------------------------
# Create Access Token
# ---------------------------------------------------------

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:
    """
    Creates a JWT access token.
    """

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


# ---------------------------------------------------------
# Verify Access Token
# ---------------------------------------------------------

def verify_access_token(token: str):
    """
    Verifies a JWT token.

    Returns:
        Token payload if valid.

    Raises:
        JWTError if invalid or expired.
    """

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        return payload

    except JWTError:

        return None