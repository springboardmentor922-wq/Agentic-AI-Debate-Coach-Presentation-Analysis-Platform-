from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.user import UserProfile,UpdateProfile
from app.utils.jwt_handler import get_current_user
from app.database.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/", response_model=UserProfile)
def update_profile(
    profile: UpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if profile.full_name is not None:
        current_user.full_name = profile.full_name

    if profile.experience_level is not None:
        current_user.experience_level = profile.experience_level

    if profile.learning_goal is not None:
        current_user.learning_goal = profile.learning_goal


    if profile.college is not None:
        current_user.college = profile.college
    
    if profile.branch is not None:
       current_user.branch = profile.branch

    if profile.graduation_year is not None:
      current_user.graduation_year = profile.graduation_year

    if profile.cgpa is not None:
       current_user.cgpa = profile.cgpa

    if profile.github is not None:
       current_user.github = profile.github

    if profile.linkedin is not None:
       current_user.linkedin = profile.linkedin

    if profile.portfolio is not None:
       current_user.portfolio = profile.portfolio




    db.commit()
    db.refresh(current_user)

    return current_user