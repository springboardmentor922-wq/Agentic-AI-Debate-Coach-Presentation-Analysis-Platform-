from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.user import UserCreate
from schemas.login import UserLogin
from crud.login import authenticate_user
from utils.jwt_handler import create_access_token
from fastapi import HTTPException
from crud.user import create_user
from utils.auth import verify_token
from utils.rbac import require_roles
from crud.user import get_user_by_email
from models.role import Role

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/")
def auth_home():
    return {
        "message": "Authentication Router Working"
    }


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    new_user = create_user(db, user)

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.user_id,
        "full_name": new_user.full_name,
        "email": new_user.email
    }
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = authenticate_user(db, user)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role_id": db_user.role_id
        }
    )

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "bearer"
    }
@router.get("/profile")
def profile(
    user=Depends(verify_token),
    db: Session = Depends(get_db)
):

    db_user = get_user_by_email(db, user["sub"])

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    role = db.query(Role).filter(
        Role.role_id == db_user.role_id
    ).first()

    return {
        "user_id": db_user.user_id,
        "full_name": db_user.full_name,
        "email": db_user.email,
        "role": role.role_name
    }
@router.get("/learner")
def learner_dashboard(user=Depends(require_roles([1]))):
    return {
        "message": "Welcome Learner",
        "user": user
    }


@router.get("/coach")
def coach_dashboard(user=Depends(require_roles([2]))):
    return {
        "message": "Welcome Debate Coach",
        "user": user
    }


@router.get("/educator")
def educator_dashboard(user=Depends(require_roles([3]))):
    return {
        "message": "Welcome Educator",
        "user": user
    }


@router.get("/admin")
def admin_dashboard(user=Depends(require_roles([4]))):
    return {
        "message": "Welcome Administrator",
        "user": user
    }