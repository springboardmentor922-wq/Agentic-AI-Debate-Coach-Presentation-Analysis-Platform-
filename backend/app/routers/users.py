from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud
from ..core.config import APP_ENV
from ..security import (
    ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    generate_totp_secret,
    get_totp_uri,
    verify_password,
    verify_token,
    verify_totp,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    if user.role == "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator accounts cannot be created through signup."
        )

    return crud.create_user(db, user)

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = crud.authenticate_user(
        db,
        user.email,
        user.password
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if db_user.role == "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator accounts must use the dedicated administrator login."
        )

    token = create_access_token(
    {
        "id": db_user.id,
        "sub": db_user.email,
        "role": db_user.role
    }
)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name
    }

@router.post("/admin-login")
def admin_login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if not db_user or db_user.role != "Administrator":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if crud.is_login_locked(db_user):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")

    if not verify_password(user.password, db_user.password):
        crud.record_login_failure(db, db_user)
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not db_user.mfa_secret:
        secret = generate_totp_secret()
        crud.create_admin_mfa_secret(db, db_user, secret)

    pending_token = create_access_token(
        {
            "id": db_user.id,
            "sub": db_user.email,
            "role": "Administrator",
            "token_type": "admin_mfa_pending",
        },
        expires_minutes=5,
    )

    return {
        "mfa_required": True,
        "mfa_setup_required": not db_user.mfa_enabled,
        "mfa_token": pending_token,
        "provisioning_uri": get_totp_uri(db_user.mfa_secret, db_user.email) if not db_user.mfa_enabled else None,
    }


@router.post("/admin-mfa/verify")
def verify_admin_mfa(
    request: schemas.AdminMfaVerify,
    response: Response,
    db: Session = Depends(get_db),
):
    payload = verify_token(request.mfa_token)
    if not payload or payload.get("token_type") != "admin_mfa_pending":
        raise HTTPException(status_code=401, detail="Administrator verification session expired. Sign in again.")

    db_user = crud.get_user_by_email(db, payload.get("sub", ""))
    if not db_user or db_user.id != payload.get("id") or db_user.role != "Administrator":
        raise HTTPException(status_code=401, detail="Administrator verification failed.")

    if crud.is_login_locked(db_user):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")

    if not verify_totp(db_user.mfa_secret, request.code):
        crud.record_login_failure(db, db_user)
        raise HTTPException(status_code=401, detail="Invalid authentication code.")

    if not db_user.mfa_enabled:
        crud.enable_admin_mfa(db, db_user)
    crud.clear_login_failures(db, db_user)

    token = create_access_token(
        {
            "id": db_user.id,
            "sub": db_user.email,
            "role": "Administrator",
            "token_type": "admin",
        },
        expires_minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    response.set_cookie(
        key="admin_session",
        value=token,
        max_age=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=APP_ENV == "production",
        samesite="lax",
        path="/",
    )
    return {"role": "Administrator", "expires_in_minutes": ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES}


@router.post("/admin-logout")
def admin_logout(response: Response):
    response.delete_cookie(key="admin_session", path="/")
    return {"message": "Administrator session closed."}
