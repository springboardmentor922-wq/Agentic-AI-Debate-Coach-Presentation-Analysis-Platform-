"""
=========================================================
Authentication API

Endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/token

=========================================================
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse
)

from app.schemas.user import UserResponse

from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# Register
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    try:

        return AuthService.register_user(
            db=db,
            user_data=user_data
        )

    except ValueError as e:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail=str(e)

        )


# =========================================================
# React Frontend Login
# =========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    try:

        return AuthService.login_user(
            db=db,
            login_data=login_data
        )

    except ValueError as e:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail=str(e)

        )


# =========================================================
# Swagger OAuth2 Login
# =========================================================

@router.post(
    "/token",
    response_model=TokenResponse,
    summary="OAuth2 Token Login"
)
def oauth2_login(

    form_data: OAuth2PasswordRequestForm = Depends(),

    db: Session = Depends(get_db)

):
    """
    OAuth2 endpoint used by Swagger UI.

    Username = Email
    """

    login_data = LoginRequest(

        email=form_data.username,

        password=form_data.password

    )

    try:

        return AuthService.oauth_login_user(

            db=db,

            login_data=login_data

        )

    except ValueError as e:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail=str(e)

        )