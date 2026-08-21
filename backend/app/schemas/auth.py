"""
=========================================================
Authentication Schemas

Defines request and response models for:

- User Registration
- User Login
- JWT Authentication

=========================================================
"""

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


# =========================================================
# Register Request
# =========================================================

class RegisterRequest(BaseModel):
    """
    Request schema for user registration.
    """

    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=50
    )

    role: str = Field(
        ...,
        description="Learner, Debate Coach, Educator"
    )


# =========================================================
# Login Request
# =========================================================

class LoginRequest(BaseModel):
    """
    Request schema for user login.
    """

    email: EmailStr

    password: str


# =========================================================
# Frontend Login Response
# =========================================================

class LoginResponse(BaseModel):
    """
    Response returned to the React frontend
    after successful login.
    """

    access_token: str

    token_type: str

    user: UserResponse


# =========================================================
# Swagger OAuth2 Token Response(previously JWT token respone)
# =========================================================

class TokenResponse(BaseModel):
    """
    Response used only by Swagger OAuth2.
    """

    access_token: str

    token_type: str = "bearer"


# =========================================================
# JWT Payload
# =========================================================

class TokenPayload(BaseModel):
    """
    Data stored inside the JWT token.
    """

    sub: str | None = None

    role: str | None = None