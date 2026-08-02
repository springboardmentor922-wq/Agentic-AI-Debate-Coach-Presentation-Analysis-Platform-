from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.security import hash_password
from app.auth.dependencies import get_current_admin
from app.auth.dependencies import get_staff_user
from app.schemas.user_response import UserResponse
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered."
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        experience=user.experience,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully.",
        "id": new_user.id,
    }
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
@router.get("/learners", response_model=list[UserResponse])
def get_learners(
    current_user: User = Depends(get_staff_user),
    db: Session = Depends(get_db)
):

    return db.query(User).filter(
        User.role == "Learner"
    ).all()
@router.get("/", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).all()