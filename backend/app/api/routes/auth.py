from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.db.postgres import get_db
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
) 
from app.schemas.user import UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def _issue_tokens(user: User) -> TokenResponse:
    access_token = create_access_token(subject=str(user.id), role=user.role.name)
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    role = db.query(Role).filter(Role.name == payload.role.value).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role_id=role.id,
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    return user


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    return _issue_tokens(user)


@router.post("/login-json", response_model=TokenResponse)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    return _issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return _issue_tokens(user)

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return the same generic message, whether or not the email exists —
    # this prevents leaking which emails are registered.
    generic_response = {"message": "If an account with that email exists, a reset link has been generated."}

    if not user or not user.is_active:
        return generic_response

    reset_token = create_password_reset_token(subject=str(user.id))
    reset_link = f"{settings.FRONTEND_ORIGIN}/reset-password?token={reset_token}"

    # Milestone 1: no email service is configured yet, so the reset link is
    # printed to the backend console instead of being emailed. Wire up a real
    # email provider (SMTP / SendGrid / SES) here in a later milestone.
    print(f"\n[PASSWORD RESET] For {user.email}:\n{reset_link}\n")

    return generic_response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.token)
    if not data or data.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password reset successful. You can now log in with your new password."}


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests

    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    full_name = idinfo.get("name", email)

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        learner_role = db.query(Role).filter(Role.name == RoleName.LEARNER.value).first()
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=None,
            role_id=learner_role.id,
            auth_provider="google",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    return _issue_tokens(user)