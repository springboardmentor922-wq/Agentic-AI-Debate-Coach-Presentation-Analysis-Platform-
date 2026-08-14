"""
=========================================================
Authentication Service

Contains all business logic for authentication.

Responsibilities:
- User Registration
- User Login
- Swagger OAuth2 Login
- Role Validation
- Password Hashing
- Password Verification
- JWT Generation
=========================================================
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse
)

from app.schemas.user import UserResponse

from app.utils.password import (
    hash_password,
    verify_password
)

from app.utils.jwt import create_access_token


class AuthService:

    # =====================================================
    # Get Role
    # =====================================================

    @staticmethod
    def get_role_by_name(
        db: Session,
        role_name: str
    ):

        return (
            db.query(Role)
            .filter(Role.name == role_name)
            .first()
        )

    # =====================================================
    # Get User By Email
    # =====================================================

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str
    ):

        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    # =====================================================
    # Register User
    # =====================================================

    @staticmethod
    def register_user(
        db: Session,
        user_data: RegisterRequest
    ):

        existing_user = AuthService.get_user_by_email(
            db,
            user_data.email
        )

        if existing_user:

            raise ValueError(
                "Email is already registered."
            )

        requested_role = (user_data.role or "Learner").strip()
        if requested_role.lower() == "administrator":
            raise ValueError(
                "Administrator accounts cannot be created via public registration."
            )

        role = AuthService.get_role_by_name(
            db,
            requested_role
        )

        if role is None:

            raise ValueError(
                f"Invalid role '{requested_role}' selected."
            )

        hashed_password = hash_password(
            user_data.password
        )

        new_user = User(

            full_name=user_data.full_name,

            email=user_data.email,

            password_hash=hashed_password,

            role_id=role.id,

            is_active=True

        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        return UserResponse(

            id=new_user.id,

            full_name=new_user.full_name,

            email=new_user.email,

            role=role.name,

            is_active=new_user.is_active,

            created_at=new_user.created_at

        )

    # =====================================================
    # Authenticate User
    # =====================================================

    @staticmethod
    def authenticate_user(
        db: Session,
        login_data: LoginRequest
    ):

        user = AuthService.get_user_by_email(
            db,
            login_data.email
        )

        if user is None:

            raise ValueError(
                "Invalid email or password."
            )

        if not verify_password(

            login_data.password,

            user.password_hash

        ):

            raise ValueError(
                "Invalid email or password."
            )

        return user

    # =====================================================
    # React Frontend Login
    # =====================================================

    @staticmethod
    def login_user(
        db: Session,
        login_data: LoginRequest
    ) -> LoginResponse:

        user = AuthService.authenticate_user(
            db,
            login_data
        )

        role_name = user.role.name

        access_token = create_access_token(

            data={

                "sub": user.email,

                "role": role_name

            }

        )

        return LoginResponse(

            access_token=access_token,

            token_type="bearer",

            user=UserResponse(

                id=user.id,

                full_name=user.full_name,

                email=user.email,

                role=role_name,

                is_active=user.is_active,

                created_at=user.created_at

            )

        )

    # =====================================================
    # Swagger OAuth2 Login
    # =====================================================

    @staticmethod
    def oauth_login_user(
        db: Session,
        login_data: LoginRequest
    ) -> TokenResponse:

        user = AuthService.authenticate_user(
            db,
            login_data
        )

        access_token = create_access_token(

            data={

                "sub": user.email,

                "role": user.role.name

            }

        )

        return TokenResponse(

            access_token=access_token,

            token_type="bearer"

        )