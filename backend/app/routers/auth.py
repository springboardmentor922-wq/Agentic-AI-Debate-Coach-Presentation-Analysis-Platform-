from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token

from app.services.auth_service import register_user, login_user

from app.utils.jwt_handler import get_current_user
from app.models.user import User


from app.utils.role_checker import RoleChecker
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
allow_admin = RoleChecker(["Administrator"])


@router.get("/")
def auth_home():
    return {"message": "Authentication Router Working"}


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    new_user = register_user(user, db)

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return new_user


from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    token = login_user(
        form_data.username,   # username field contains the email
        form_data.password,
        db
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return token


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user



@router.get("/admin")
def admin_dashboard(
    current_user=Depends(allow_admin)
):
    return {
        "message": f"Welcome Admin {current_user.full_name}"
    }